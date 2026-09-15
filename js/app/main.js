/**
 * main.js - ponto de entrada da SPA.
 * Registra as rotas e liga os eventos de cada tela.
 */

import { criarRouter } from './router.js';
import {
  templateInicio,
  templateProjetos,
  templateCadastro,
  templateMeusCadastros,
  templateNaoEncontrado,
} from './templates.js';
import { ativarMascaras } from './mascaras.js';
import { validarCampo, exibirErro, validarFormulario } from './validacao.js';
import {
  listarCadastros,
  salvarCadastro,
  removerCadastro,
  salvarRascunho,
  carregarRascunho,
  limparRascunho,
  lerPreferenciaContraste,
  salvarPreferenciaContraste,
} from './storage.js';
import { mostrarToast, abrirModal, iniciarModal, iniciarMenu, iniciarAltoContraste } from './ui.js';
import { renderizarGraficoBarras } from './grafico.js';

/* ---------- Tela: início (gráfico com biblioteca externa) ---------- */
function montarInicio(container) {
  const canvas = container.querySelector('#grafico-voluntarios');
  if (!canvas) return;
  renderizarGraficoBarras(canvas, {
    legenda: 'Voluntários ativos',
    rotulos: ['Reforço escolar', 'Cozinha Solidária', 'Inclusão Digital'],
    valores: [40, 28, 18],
  });
}

/* ---------- Tela: projetos (filtro por categoria) ---------- */
function montarProjetos(container) {
  const filtros = container.querySelector('.filtros');
  const cards = [...container.querySelectorAll('.card')];
  const contador = container.querySelector('#contador-projetos');

  const aplicarFiltro = (categoria) => {
    let visiveis = 0;
    cards.forEach((card) => {
      const mostrar = categoria === 'todos' || card.dataset.categoria === categoria;
      card.hidden = !mostrar;
      if (mostrar) visiveis += 1;
    });
    contador.textContent = `${visiveis} projeto(s) exibido(s).`;
  };

  filtros.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-filtro]');
    if (!botao) return;
    filtros.querySelectorAll('[data-filtro]').forEach((b) => b.setAttribute('aria-pressed', String(b === botao)));
    aplicarFiltro(botao.dataset.filtro);
  });

  aplicarFiltro('todos');
}

/* ---------- Tela: cadastro (validação, rascunho e envio) ---------- */
function lerDadosFormulario(formulario) {
  return Object.fromEntries(new FormData(formulario).entries());
}

function preencherFormulario(formulario, dados) {
  Object.entries(dados).forEach(([nome, valor]) => {
    const campos = formulario.querySelectorAll(`[name="${CSS.escape(nome)}"]`);
    campos.forEach((campo) => {
      if (campo.type === 'radio' || campo.type === 'checkbox') {
        campo.checked = campo.value === valor;
      } else {
        campo.value = valor;
      }
    });
  });
}

function montarCadastro(container) {
  const formulario = container.querySelector('#form-cadastro');
  const alerta = container.querySelector('#alerta-form');
  let temporizadorRascunho;

  ativarMascaras(formulario);

  const rascunho = carregarRascunho();
  if (rascunho) {
    preencherFormulario(formulario, rascunho);
    mostrarToast('Recuperamos o rascunho que você começou.');
  }

  // Valida ao sair do campo; revalida enquanto digita se já estava com erro
  formulario.addEventListener('focusout', (evento) => {
    const campo = evento.target;
    if (campo.name) exibirErro(campo, validarCampo(campo));
  });

  formulario.addEventListener('input', (evento) => {
    const campo = evento.target;
    if (campo.getAttribute('aria-invalid') === 'true') {
      exibirErro(campo, validarCampo(campo));
    }
    // Salva rascunho com debounce para não gravar a cada tecla
    clearTimeout(temporizadorRascunho);
    temporizadorRascunho = setTimeout(() => salvarRascunho(lerDadosFormulario(formulario)), 500);
  });

  formulario.addEventListener('reset', () => {
    limparRascunho();
    formulario.querySelectorAll('[aria-invalid]').forEach((campo) => exibirErro(campo, ''));
    alerta.hidden = true;
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const invalidos = validarFormulario(formulario);

    if (invalidos.length > 0) {
      alerta.textContent = `Há ${invalidos.length} campo(s) com problema. Corrija e envie novamente.`;
      alerta.hidden = false;
      invalidos[0].focus();
      return;
    }

    const salvo = salvarCadastro(lerDadosFormulario(formulario));
    if (!salvo) {
      abrirModal('Não foi possível salvar', 'O armazenamento do navegador está indisponível. Tente novamente em outra janela.');
      return;
    }

    limparRascunho();
    formulario.reset();
    mostrarToast('Cadastro salvo com sucesso.');
    abrirModal('Cadastro recebido', `Obrigado, ${salvo.nome.split(' ')[0]}! Nossa equipe entrará em contato em até três dias úteis.`);
    router.navegar('/meus-cadastros');
  });
}

/* ---------- Tela: meus cadastros (listagem e remoção) ---------- */
function montarMeusCadastros(container) {
  // O listener fica na <section> gerada pelo template, e não no <main> fixo:
  // ela é descartada a cada renderização, então nenhum listener se acumula.
  const lista = container.querySelector('#lista-cadastros');
  if (!lista) return;

  lista.addEventListener('click', (evento) => {
    const botao = evento.target.closest('.botao-remover');
    if (!botao) return;
    removerCadastro(botao.dataset.id);
    mostrarToast('Cadastro removido.');
    container.innerHTML = templateMeusCadastros(listarCadastros());
    montarMeusCadastros(container);
  });
}

/* ---------- Registro das rotas ---------- */
const rotas = {
  '/inicio': { titulo: 'Início', template: templateInicio, montar: montarInicio },
  '/projetos': { titulo: 'Projetos sociais', template: templateProjetos, montar: montarProjetos },
  '/cadastro': { titulo: 'Cadastro', template: templateCadastro, montar: montarCadastro },
  '/meus-cadastros': {
    titulo: 'Meus cadastros',
    template: () => templateMeusCadastros(listarCadastros()),
    montar: montarMeusCadastros,
  },
};

const router = criarRouter({
  rotas,
  rotaPadrao: '/inicio',
  naoEncontrada: { titulo: 'Página não encontrada', template: templateNaoEncontrado },
  container: document.getElementById('app'),
});

iniciarAltoContraste({
  preferenciaSalva: lerPreferenciaContraste(),
  aoAlterar: salvarPreferenciaContraste,
});
iniciarMenu();
iniciarModal();
router.iniciar();
