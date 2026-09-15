/**
 * validacao.js - regras de consistência do formulário de cadastro.
 * Complementa a validação nativa do HTML5 com regras que o atributo
 * pattern não cobre (dígitos verificadores do CPF, idade mínima etc.).
 */

const apenasDigitos = (valor) => valor.replace(/\D/g, '');

/** Valida CPF pelos dois dígitos verificadores. */
export function cpfValido(valor) {
  const cpf = apenasDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  const calcularDigito = (base, pesoInicial) => {
    const soma = [...base].reduce((total, digito, i) => total + Number(digito) * (pesoInicial - i), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  const d1 = calcularDigito(cpf.slice(0, 9), 10);
  const d2 = calcularDigito(cpf.slice(0, 10), 11);
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
}

export function idadeEmAnos(dataIso) {
  const nascimento = new Date(`${dataIso}T00:00:00`);
  if (Number.isNaN(nascimento.getTime())) {
    return -1;
  }
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) {
    idade -= 1;
  }
  return idade;
}

/** Cada regra devolve a mensagem de erro ou string vazia quando o valor é válido. */
const regras = {
  nome: (v) => (v.trim().split(/\s+/).length < 2 ? 'Informe nome e sobrenome.' : ''),
  cpf: (v) => (!cpfValido(v) ? 'CPF inválido. Confira os números digitados.' : ''),
  email: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? 'Informe um e-mail válido, como nome@provedor.com.br.' : ''),
  telefone: (v) => (apenasDigitos(v).length !== 11 ? 'Informe o celular com DDD: (11) 90000-0000.' : ''),
  cep: (v) => (apenasDigitos(v).length !== 8 ? 'Informe o CEP com 8 dígitos: 00000-000.' : ''),
  nascimento: (v) => {
    const idade = idadeEmAnos(v);
    if (idade < 0) return 'Informe a data de nascimento.';
    if (idade < 16) return 'O cadastro é permitido a partir de 16 anos.';
    return '';
  },
};

/**
 * Valida um campo: primeiro a validação nativa (required, type, pattern),
 * depois a regra de negócio específica, se existir.
 */
export function validarCampo(campo) {
  if (campo.validity.valueMissing) {
    return 'Este campo é obrigatório.';
  }
  if (!campo.value) {
    return '';
  }
  const regra = regras[campo.name];
  if (regra) {
    return regra(campo.value);
  }
  if (!campo.checkValidity()) {
    return campo.validationMessage;
  }
  return '';
}

/** Mostra ou limpa a mensagem de erro associada ao campo, com atributos ARIA. */
export function exibirErro(campo, mensagem) {
  const idErro = `erro-${campo.name}`;
  let elemento = document.getElementById(idErro);

  if (!elemento) {
    elemento = document.createElement('span');
    elemento.id = idErro;
    elemento.className = 'erro-campo';
    campo.closest('.campo, .campo-inline, fieldset')?.append(elemento);
  }

  elemento.textContent = mensagem;
  campo.setAttribute('aria-invalid', String(Boolean(mensagem)));

  const descricoes = new Set((campo.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
  if (mensagem) {
    descricoes.add(idErro);
  } else {
    descricoes.delete(idErro);
  }
  campo.setAttribute('aria-describedby', [...descricoes].join(' '));
}

/** Valida o formulário inteiro e devolve a lista de campos inválidos. */
export function validarFormulario(formulario) {
  const invalidos = [];
  formulario.querySelectorAll('input, select, textarea').forEach((campo) => {
    if (!campo.name) return;
    const mensagem = validarCampo(campo);
    exibirErro(campo, mensagem);
    if (mensagem) invalidos.push(campo);
  });
  return invalidos;
}
