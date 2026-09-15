/**
 * ui.js - componentes de interface reutilizáveis: toast, modal e menu.
 */

let temporizadorToast;
let focoAntesDoModal = null;

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
  focoAntesDoModal = document.activeElement;
  modal.showModal();
  document.getElementById('modal-fechar')?.focus();
}

export function iniciarModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  document.getElementById('modal-fechar')?.addEventListener('click', () => modal.close());

  // Fechando pelo botão ou pela tecla Esc, o foco volta para onde o usuário estava
  // (ou para o título da tela atual, se aquele elemento saiu do DOM)
  modal.addEventListener('close', () => {
    const destino = focoAntesDoModal?.isConnected ? focoAntesDoModal : document.querySelector('#app h1');
    destino?.focus();
    focoAntesDoModal = null;
  });
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

/**
 * Botão "Alto contraste". Sem escolha salva, segue a preferência do sistema
 * (prefers-contrast: more). O estado fica em <html data-contraste> e o CSS troca os tokens.
 * @param {{ preferenciaSalva: string|null, aoAlterar: (valor: string) => void }} opcoes
 */
export function iniciarAltoContraste({ preferenciaSalva, aoAlterar }) {
  const botao = document.getElementById('botao-contraste');
  const raiz = document.documentElement;
  const sistemaPedeContraste = window.matchMedia('(prefers-contrast: more)').matches;

  const aplicar = (alto) => {
    raiz.dataset.contraste = alto ? 'alto' : 'normal';
    botao?.setAttribute('aria-pressed', String(alto));
  };

  aplicar(preferenciaSalva ? preferenciaSalva === 'alto' : sistemaPedeContraste);

  botao?.addEventListener('click', () => {
    const alto = raiz.dataset.contraste !== 'alto';
    aplicar(alto);
    aoAlterar(alto ? 'alto' : 'normal');
    mostrarToast(alto ? 'Alto contraste ativado.' : 'Alto contraste desativado.');
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
