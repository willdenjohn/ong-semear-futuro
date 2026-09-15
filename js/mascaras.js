/*
  mascaras.js - ONG Semear Futuro
  Mascaras de CPF, telefone e CEP, mensagens da validacao nativa
  e feedback visual (alerta, toast e modal) no envio do cadastro.
*/
(function () {
  'use strict';

  function apenasDigitos(valor) {
    return valor.replace(/\D/g, '');
  }

  /** 000.000.000-00 */
  function mascaraCpf(valor) {
    return apenasDigitos(valor)
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  /** (11) 90000-0000 */
  function mascaraTelefone(valor) {
    return apenasDigitos(valor)
      .slice(0, 11)
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }

  /** 00000-000 */
  function mascaraCep(valor) {
    return apenasDigitos(valor)
      .slice(0, 8)
      .replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
  }

  function aplicarMascara(id, funcao) {
    var campo = document.getElementById(id);
    if (!campo) {
      return;
    }
    campo.addEventListener('input', function () {
      campo.value = funcao(campo.value);
      campo.setCustomValidity('');
    });
  }

  aplicarMascara('cpf', mascaraCpf);
  aplicarMascara('telefone', mascaraTelefone);
  aplicarMascara('cep', mascaraCep);

  var mensagens = {
    cpf: 'Informe o CPF no formato 000.000.000-00.',
    telefone: 'Informe o telefone no formato (11) 90000-0000.',
    cep: 'Informe o CEP no formato 00000-000.',
    email: 'Informe um e-mail valido, como nome@provedor.com.br.'
  };

  var formulario = document.getElementById('form-cadastro');
  var alerta = document.getElementById('alerta-form');
  var toast = document.getElementById('toast');
  var modal = document.getElementById('modal-sucesso');
  var fecharModal = document.getElementById('fechar-modal');
  var temporizadorToast;

  if (!formulario) {
    return;
  }

  /** Mostra uma notificacao temporaria, lida por leitor de tela via aria-live. */
  function mostrarToast(texto) {
    if (!toast) {
      return;
    }
    toast.textContent = texto;
    toast.hidden = false;
    clearTimeout(temporizadorToast);
    temporizadorToast = setTimeout(function () {
      toast.hidden = true;
    }, 4000);
  }

  function mostrarAlerta(tipo, texto) {
    if (!alerta) {
      return;
    }
    alerta.className = 'alerta alerta-' + tipo;
    alerta.textContent = texto;
    alerta.hidden = false;
  }

  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    var campos = formulario.querySelectorAll('input, select, textarea');
    var primeiroInvalido = null;

    Array.prototype.forEach.call(campos, function (campo) {
      campo.setCustomValidity('');
      if (!campo.checkValidity() && mensagens[campo.id]) {
        campo.setCustomValidity(mensagens[campo.id]);
      }
      if (!primeiroInvalido && !campo.checkValidity()) {
        primeiroInvalido = campo;
      }
    });

    if (primeiroInvalido) {
      mostrarAlerta('erro', 'Revise os campos destacados antes de enviar o cadastro.');
      formulario.reportValidity();
      primeiroInvalido.focus();
      return;
    }

    if (alerta) {
      alerta.hidden = true;
    }

    formulario.reset();
    mostrarToast('Cadastro enviado com sucesso.');

    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
    }
  });

  if (fecharModal && modal) {
    fecharModal.addEventListener('click', function () {
      modal.close();
    });
  }
}());
