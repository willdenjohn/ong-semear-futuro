/**
 * Teste ponta a ponta da SPA no Chrome real, via Chrome DevTools Protocol.
 * Pré-requisito: servidor local em http://127.0.0.1:5500 (npm start).
 * Uso: node tests/e2e.mjs
 * Para testar o build: BASE_URL=http://127.0.0.1:5500/dist/html/app.html node tests/e2e.mjs
 */
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:5500/html/app.html';
const PORTA = 9333;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const perfil = mkdtempSync(join(tmpdir(), 'semear-e2e-'));
// No runner Ubuntu do GitHub Actions o sandbox do Chrome é bloqueado pelo AppArmor
const flagsCI = process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : [];
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', ...flagsCI,
  `--remote-debugging-port=${PORTA}`, `--user-data-dir=${perfil}`, 'about:blank',
]);
chrome.on('exit', (codigo) => {
  if (codigo) console.error(`Chrome encerrou com código ${codigo}`);
});

async function conectar() {
  for (let i = 0; i < 100; i += 1) {
    try {
      const alvos = await (await fetch(`http://127.0.0.1:${PORTA}/json`)).json();
      const pagina = alvos.find((a) => a.type === 'page');
      if (pagina) return pagina.webSocketDebuggerUrl;
    } catch { /* Chrome ainda iniciando */ }
    await esperar(300);
  }
  throw new Error('Chrome não respondeu');
}

const ws = new WebSocket(await conectar());
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let proximoId = 0;
const pendentes = new Map();
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (pendentes.has(msg.id)) {
    pendentes.get(msg.id)(msg);
    pendentes.delete(msg.id);
  }
});
const cdp = (method, params = {}) => new Promise((resolve) => {
  proximoId += 1;
  pendentes.set(proximoId, resolve);
  ws.send(JSON.stringify({ id: proximoId, method, params }));
});
const avaliar = async (expressao) => {
  const r = await cdp('Runtime.evaluate', { expression: expressao, awaitPromise: true, returnByValue: true });
  if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.text);
  return r.result.result.value;
};
const ir = async (hash) => {
  await avaliar(`location.hash = '${hash}'`);
  await esperar(400);
};

const resultados = [];
const verificar = (nome, condicao, detalhe = '') => {
  resultados.push({ nome, ok: Boolean(condicao) });
  console.log(`${condicao ? 'ok  ' : 'FALHA'} - ${nome}${detalhe ? ` (${detalhe})` : ''}`);
};

try {
  await cdp('Page.enable');
  await cdp('Page.navigate', { url: `${BASE}#/inicio` });
  await esperar(1500);
  await avaliar('localStorage.clear()');

  // 0. Biblioteca externa: Chart.js desenha o gráfico da tela inicial
  await esperar(2500);
  const estadoGrafico = await avaliar('document.querySelector("#grafico-voluntarios")?.dataset.estado || "sem-canvas"');
  verificar('Chart.js carregado via CDN e gráfico renderizado', estadoGrafico === 'renderizado', estadoGrafico);

  // 1. Navegação SPA sem recarregar
  await avaliar('window.__marcador = 42');
  await ir('#/projetos');
  verificar('navegação por hash não recarrega a página', await avaliar('window.__marcador === 42'));
  verificar('rota de projetos renderiza 3 cards', (await avaliar('document.querySelectorAll(".card").length')) === 3);
  verificar('troca de rota move o foco para o h1 da tela', await avaliar('document.activeElement === document.querySelector("#app h1")'));
  verificar('troca de rota é anunciada para leitor de tela', /Projetos sociais/.test(await avaliar('document.querySelector("#anuncio-rota").textContent')));

  // 2. Filtro por categoria
  await avaliar('document.querySelector(\'[data-filtro="tecnologia"]\').click()');
  const visiveis = await avaliar('[...document.querySelectorAll(".card")].filter(c => !c.hidden).length');
  verificar('filtro Tecnologia deixa 1 card visível', visiveis === 1, `${visiveis} visível`);

  // 3. Envio inválido
  await ir('#/cadastro');
  await avaliar('document.querySelector("#form-cadastro").requestSubmit()');
  await esperar(200);
  const alerta = await avaliar('!document.querySelector("#alerta-form").hidden');
  const invalidos = await avaliar('document.querySelectorAll(\'[aria-invalid="true"]\').length');
  verificar('envio vazio exibe alerta e marca campos', alerta && invalidos > 0, `${invalidos} campos inválidos`);

  // 4. CPF com dígito verificador errado
  await avaliar(`(() => { const c = document.querySelector('#cpf'); c.value = '529.982.247-26'; c.dispatchEvent(new Event('focusout', { bubbles: true })); })()`);
  const msgCpf = await avaliar('document.querySelector("#erro-cpf")?.textContent || ""');
  verificar('CPF inválido gera mensagem específica', /CPF inválido/.test(msgCpf), msgCpf);

  // 5. Máscara durante a digitação
  await avaliar(`(() => { const c = document.querySelector('#telefone'); c.value = '11987654321'; c.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  verificar('máscara de telefone aplicada', (await avaliar('document.querySelector("#telefone").value')) === '(11) 98765-4321');

  // 6. Envio válido grava no localStorage
  await avaliar(`(() => {
    const f = document.querySelector('#form-cadastro');
    const set = (id, v) => { const c = f.querySelector('#' + id); c.value = v; c.dispatchEvent(new Event('input', { bubbles: true })); };
    set('nome', 'Maria Aparecida Souza'); set('cpf', '52998224725'); set('nascimento', '1990-05-10');
    set('email', 'maria@exemplo.com.br'); set('telefone', '11987654321'); set('cep', '08110000');
    f.querySelector('#tipo-voluntario').checked = true;
    f.querySelector('#projeto').value = 'inclusao-digital';
    f.querySelector('#lgpd').checked = true;
    f.requestSubmit();
  })()`);
  await esperar(600);
  const salvos = await avaliar('JSON.parse(localStorage.getItem("semear:cadastros") || "[]").length');
  verificar('cadastro válido salvo no localStorage', salvos === 1, `${salvos} registro`);
  verificar('após salvar, navega para Meus cadastros', (await avaliar('location.hash')) === '#/meus-cadastros');
  verificar('modal de confirmação aberto', await avaliar('document.querySelector("#modal").open'));
  verificar('foco vai para o botão Fechar do modal', await avaliar('document.activeElement.id === "modal-fechar"'));
  await avaliar('document.querySelector("#modal").close()');
  verificar('ao fechar o modal o foco volta para a tela', await avaliar('document.activeElement === document.querySelector("#app h1")'));
  // 7. Persistência após recarregar
  await cdp('Page.reload');
  await esperar(1500);
  verificar('dado continua listado após recarregar', (await avaliar('document.querySelectorAll(".botao-remover").length')) === 1);

  // Teclado: no carregamento, o primeiro Tab cai no link "Pular para o conteúdo"
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  verificar('primeiro Tab após carregar foca o link Pular para o conteúdo', await avaliar('document.activeElement.classList.contains("pular-link")'));

  // Alto contraste: botão alterna o modo, troca os tokens e a escolha persiste
  await avaliar('document.querySelector("#botao-contraste").click()');
  verificar('botão Alto contraste ativa o modo e marca aria-pressed', await avaliar(
    'document.documentElement.dataset.contraste === "alto" && document.querySelector("#botao-contraste").getAttribute("aria-pressed") === "true"',
  ));
  const corTexto = await avaliar('getComputedStyle(document.body).color');
  verificar('alto contraste troca os tokens (texto preto)', corTexto === 'rgb(0, 0, 0)', corTexto);
  await cdp('Page.reload');
  await esperar(1500);
  verificar('preferência de alto contraste persiste após recarregar', await avaliar('document.documentElement.dataset.contraste === "alto"'));
  await avaliar('document.querySelector("#botao-contraste").click()');

  // 8. Regressão: listener não pode duplicar ao visitar a tela várias vezes
  await avaliar(`localStorage.setItem('semear:cadastros', JSON.stringify([
    { id: 'a', nome: 'A', tipo: 'doador', projeto: 'reforco-escolar', criadoEm: new Date().toISOString() },
    { id: 'b', nome: 'B', tipo: 'doador', projeto: 'reforco-escolar', criadoEm: new Date().toISOString() },
    { id: 'c', nome: 'C', tipo: 'doador', projeto: 'reforco-escolar', criadoEm: new Date().toISOString() }
  ]))`);
  await ir('#/inicio'); await ir('#/meus-cadastros');
  await ir('#/inicio'); await ir('#/meus-cadastros');
  await ir('#/inicio'); await ir('#/meus-cadastros');
  await avaliar('document.querySelector(".botao-remover").click()');
  await esperar(300);
  const restantes = await avaliar('JSON.parse(localStorage.getItem("semear:cadastros")).length');
  verificar('um clique remove exatamente 1 cadastro após 3 visitas', restantes === 2, `${restantes} restantes`);

  // 9. XSS: nome malicioso não vira HTML
  await avaliar(`localStorage.setItem('semear:cadastros', JSON.stringify([{ id: 'x', nome: '<img src=x onerror="window.__xss=1">', tipo: 'doador', projeto: 'reforco-escolar', criadoEm: new Date().toISOString() }]))`);
  await ir('#/inicio'); await ir('#/meus-cadastros');
  await esperar(300);
  verificar('nome com HTML é exibido como texto (sem XSS)', await avaliar('!window.__xss && !document.querySelector("#lista-cadastros img")'));

  // 10. Rota inexistente
  await ir('#/nao-existe');
  verificar('rota inexistente mostra página não encontrada', /não encontrada/i.test(await avaliar('document.querySelector("h1").textContent')));
} finally {
  ws.close();
  chrome.kill();
}

const falhas = resultados.filter((r) => !r.ok).length;
console.log(`\n${resultados.length - falhas}/${resultados.length} verificações passaram.`);
process.exitCode = falhas ? 1 : 0;
