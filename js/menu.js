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
