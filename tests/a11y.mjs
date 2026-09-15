/**
 * Auditoria automática de acessibilidade (WCAG 2.1 A/AA) com axe-core
 * rodando no Chrome headless, via Chrome DevTools Protocol.
 * Pré-requisito: servidor local em http://127.0.0.1:5500 (npm start).
 * Uso: node tests/a11y.mjs [urlBase]
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.argv[2] || 'http://127.0.0.1:5500';
const PORTA = 9334;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const paginas = [
  { nome: 'SPA - início', url: `${BASE}/html/app.html#/inicio` },
  { nome: 'SPA - projetos', url: `${BASE}/html/app.html#/projetos` },
  { nome: 'SPA - cadastro', url: `${BASE}/html/app.html#/cadastro` },
  {
    nome: 'SPA - cadastro com erros exibidos',
    url: `${BASE}/html/app.html#/cadastro`,
    preparar: 'document.querySelector("#form-cadastro").requestSubmit()',
  },
  { nome: 'SPA - meus cadastros (vazio)', url: `${BASE}/html/app.html#/meus-cadastros` },
  {
    nome: 'SPA - meus cadastros (com tabela)',
    url: `${BASE}/html/app.html#/meus-cadastros`,
    preparar: `(() => {
      localStorage.setItem('semear:cadastros', JSON.stringify([
        { id: 'a1', nome: 'Maria Souza', tipo: 'voluntario', projeto: 'inclusao-digital', criadoEm: new Date().toISOString() }
      ]));
      location.hash = '#/inicio';
      location.hash = '#/meus-cadastros';
      return new Promise((r) => setTimeout(r, 400));
    })()`,
  },
  { nome: 'Estática - index', url: `${BASE}/html/index.html` },
  { nome: 'Estática - projetos', url: `${BASE}/html/projetos.html` },
  { nome: 'Estática - cadastro', url: `${BASE}/html/cadastro.html` },
  { nome: 'Estática - componentes', url: `${BASE}/html/componentes.html` },
];

const perfil = mkdtempSync(join(tmpdir(), 'semear-a11y-'));
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

let totalViolacoes = 0;
try {
  await cdp('Page.enable');
  for (const pagina of paginas) {
    await cdp('Page.navigate', { url: pagina.url });
    await esperar(2500);
    if (pagina.preparar) {
      await avaliar(pagina.preparar);
      await esperar(300);
    }
    await avaliar(AXE);
    const violacoes = await avaliar(`axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }
    }).then((r) => r.violations.map((v) => ({
      id: v.id, impacto: v.impact, ajuda: v.help,
      alvos: v.nodes.slice(0, 3).map((n) => n.target.join(' '))
    })))`);
    totalViolacoes += violacoes.length;
    console.log(`${violacoes.length ? 'FALHA' : 'ok  '} - ${pagina.nome}: ${violacoes.length} violação(ões)`);
    violacoes.forEach((v) => console.log(`       [${v.impacto}] ${v.id}: ${v.ajuda} -> ${v.alvos.join(' | ')}`));
  }
} finally {
  ws.close();
  chrome.kill();
}

console.log(`\nTotal: ${totalViolacoes} violação(ões) em ${paginas.length} páginas.`);
process.exitCode = totalViolacoes ? 1 : 0;
