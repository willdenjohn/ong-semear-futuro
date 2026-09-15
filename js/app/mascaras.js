/**
 * mascaras.js - formatação de CPF, telefone e CEP durante a digitação.
 */

const apenasDigitos = (valor) => valor.replace(/\D/g, '');

const mascaras = {
  cpf: (v) =>
    apenasDigitos(v)
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2'),
  telefone: (v) =>
    apenasDigitos(v)
      .slice(0, 11)
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2'),
  cep: (v) =>
    apenasDigitos(v)
      .slice(0, 8)
      .replace(/^(\d{5})(\d{1,3})$/, '$1-$2'),
};

export function aplicarMascara(nome, valor) {
  return mascaras[nome] ? mascaras[nome](valor) : valor;
}

/** Usa delegação: um único listener no formulário atende todos os campos mascarados. */
export function ativarMascaras(formulario) {
  formulario.addEventListener('input', (evento) => {
    const campo = evento.target;
    if (mascaras[campo.name]) {
      campo.value = aplicarMascara(campo.name, campo.value);
    }
  });
}
