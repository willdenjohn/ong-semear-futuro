/**
 * router.js - roteamento da SPA baseado em hash (#/rota).
 * Troca o conteúdo do <main> sem recarregar a página e mantém
 * título, menu ativo e foco coerentes para acessibilidade.
 */

import { marcarRotaAtiva } from './ui.js';

export function criarRouter({ rotas, rotaPadrao, naoEncontrada, container }) {
  function caminhoAtual() {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || rotaPadrao;
  }

  function renderizar(opcoes = {}) {
    const caminho = caminhoAtual();
    const rota = rotas[caminho] || naoEncontrada;

    container.innerHTML = rota.template();
    document.title = `${rota.titulo} | ONG Semear Futuro`;
    marcarRotaAtiva(caminho);

    // Liga os eventos específicos da tela recém-renderizada
    if (typeof rota.montar === 'function') {
      rota.montar(container);
    }

    window.scrollTo({ top: 0 });

    // No carregamento inicial o foco fica no topo do documento, para o primeiro Tab
    // cair no link "Pular para o conteúdo". Nas trocas de rota, o foco vai para o
    // título da tela nova (WCAG 2.4.3) e a troca é anunciada numa região aria-live
    // curta, em vez de fazer o leitor de tela reler o <main> inteiro
    if (opcoes.inicial) return;
    const titulo = container.querySelector('h1');
    if (titulo) titulo.setAttribute('tabindex', '-1');
    (titulo || container).focus({ preventScroll: true });

    const anuncio = document.getElementById('anuncio-rota');
    if (anuncio) anuncio.textContent = `Página ${rota.titulo} carregada.`;
  }

  return {
    iniciar() {
      window.addEventListener('hashchange', renderizar);
      if (!window.location.hash) {
        window.location.replace(`#${rotaPadrao}`);
      }
      renderizar({ inicial: true });
    },
    navegar(caminho) {
      window.location.hash = caminho;
    },
  };
}
