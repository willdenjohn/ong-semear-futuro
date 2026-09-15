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

  function renderizar() {
    const caminho = caminhoAtual();
    const rota = rotas[caminho] || naoEncontrada;

    container.innerHTML = rota.template();
    document.title = `${rota.titulo} | ONG Semear Futuro`;
    marcarRotaAtiva(caminho);

    // Liga os eventos específicos da tela recém-renderizada
    if (typeof rota.montar === 'function') {
      rota.montar(container);
    }

    // Leva o foco ao conteúdo novo, como aconteceria numa troca de página
    container.focus();
    window.scrollTo({ top: 0 });
  }

  return {
    iniciar() {
      window.addEventListener('hashchange', renderizar);
      if (!window.location.hash) {
        window.location.replace(`#${rotaPadrao}`);
      }
      renderizar();
    },
    navegar(caminho) {
      window.location.hash = caminho;
    },
  };
}
