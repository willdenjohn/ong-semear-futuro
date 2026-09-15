/**
 * ui.js - componentes de interface reutilizáveis: toast, modal e menu.
 */

let temporizadorToast;

export function mostrarToast(mensagem, duracao = 4000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = mensagem;
  toast.hidden = false;
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => {
    toast.hidden = true;
  }, duracao);
}

export function abrirModal(titulo, texto) {
  const modal = document.getElementById('modal');
  if (!modal) return;
  document.getElementById('modal-titulo').textContent = titulo;
  document.getElementById('modal-texto').textContent = texto;
  modal.showModal();
}

export function iniciarModal() {
  const modal = document.getElementById('modal');
  document.getElementById('modal-fechar')?.addEventListener('click', () => modal.close());
}

export function iniciarMenu() {
  const botao = document.querySelector('.botao-menu');
  const navegacao = document.getElementById('menu-principal');
  if (!botao || !navegacao) return;

  const alternar = (abrir) => {
    botao.setAttribute('aria-expanded', String(abrir));
    navegacao.classList.toggle('aberta', abrir);
  };

  botao.addEventListener('click', () => alternar(botao.getAttribute('aria-expanded') !== 'true'));

  // Fecha o menu mobile ao escolher uma rota
  navegacao.addEventListener('click', (evento) => {
    if (evento.target.closest('a')) alternar(false);
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') {
      alternar(false);
      botao.focus();
    }
  });
}

/** Destaca no menu o link da rota ativa. */
export function marcarRotaAtiva(caminho) {
  document.querySelectorAll('[data-rota]').forEach((link) => {
    if (link.dataset.rota === caminho) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}
