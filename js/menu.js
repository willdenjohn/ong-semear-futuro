/*
  menu.js - ONG Semear Futuro
  Menu hamburguer (mobile) e submenu dropdown de projetos,
  com aria-expanded sincronizado, fechamento com Esc e clique fora.
*/
(function () {
  'use strict';

  var botaoMenu = document.querySelector('.botao-menu');
  var navegacao = document.getElementById('menu-principal');
  var botaoSubmenu = document.querySelector('.botao-submenu');
  var submenu = document.getElementById('submenu-projetos');
  var botaoContraste = document.getElementById('botao-contraste');
  var CHAVE_CONTRASTE = 'semear:contraste';

  // Alto contraste: mesma chave do localStorage usada pela SPA
  function aplicarContraste(alto) {
    document.documentElement.setAttribute('data-contraste', alto ? 'alto' : 'normal');
    if (botaoContraste) {
      botaoContraste.setAttribute('aria-pressed', String(alto));
    }
  }

  if (botaoContraste) {
    var salvo = null;
    try {
      salvo = JSON.parse(localStorage.getItem(CHAVE_CONTRASTE));
    } catch (erro) { /* storage indisponível: segue o sistema */ }
    aplicarContraste(salvo ? salvo === 'alto' : window.matchMedia('(prefers-contrast: more)').matches);

    botaoContraste.addEventListener('click', function () {
      var alto = document.documentElement.getAttribute('data-contraste') !== 'alto';
      aplicarContraste(alto);
      try {
        localStorage.setItem(CHAVE_CONTRASTE, JSON.stringify(alto ? 'alto' : 'normal'));
      } catch (erro) { /* preferência vale só nesta visita */ }
    });
  }

  function alternarMenu(abrir) {
    if (!botaoMenu || !navegacao) {
      return;
    }
    botaoMenu.setAttribute('aria-expanded', String(abrir));
    navegacao.classList.toggle('aberta', abrir);
  }

  function alternarSubmenu(abrir) {
    if (!botaoSubmenu || !submenu) {
      return;
    }
    botaoSubmenu.setAttribute('aria-expanded', String(abrir));
    submenu.classList.toggle('aberto', abrir);
  }

  if (botaoMenu) {
    botaoMenu.addEventListener('click', function () {
      alternarMenu(botaoMenu.getAttribute('aria-expanded') !== 'true');
    });
  }

  if (botaoSubmenu) {
    botaoSubmenu.addEventListener('click', function () {
      alternarSubmenu(botaoSubmenu.getAttribute('aria-expanded') !== 'true');
    });
  }

  document.addEventListener('keydown', function (evento) {
    if (evento.key !== 'Escape') {
      return;
    }
    if (botaoSubmenu && botaoSubmenu.getAttribute('aria-expanded') === 'true') {
      alternarSubmenu(false);
      botaoSubmenu.focus();
    } else if (botaoMenu && botaoMenu.getAttribute('aria-expanded') === 'true') {
      alternarMenu(false);
      botaoMenu.focus();
    }
  });

  document.addEventListener('click', function (evento) {
    if (submenu && botaoSubmenu && !evento.target.closest('.menu-item-sub')) {
      alternarSubmenu(false);
    }
  });
}());
