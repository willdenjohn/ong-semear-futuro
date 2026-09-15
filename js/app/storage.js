/**
 * storage.js - persistência no localStorage.
 * Toda leitura é protegida contra JSON corrompido e contra navegador
 * sem acesso ao storage (modo privado, cota cheia).
 */

const CHAVE_CADASTROS = 'semear:cadastros';
const CHAVE_RASCUNHO = 'semear:rascunho-cadastro';
const CHAVE_CONTRASTE = 'semear:contraste';

function ler(chave, padrao) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch (erro) {
    console.warn(`[storage] Não foi possível ler "${chave}":`, erro);
    return padrao;
  }
}

function gravar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (erro) {
    console.warn(`[storage] Não foi possível gravar "${chave}":`, erro);
    return false;
  }
}

function gerarId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function listarCadastros() {
  return ler(CHAVE_CADASTROS, []);
}

export function salvarCadastro(dados) {
  const cadastro = { ...dados, id: gerarId(), criadoEm: new Date().toISOString() };
  const lista = listarCadastros();
  lista.push(cadastro);
  const ok = gravar(CHAVE_CADASTROS, lista);
  return ok ? cadastro : null;
}

export function removerCadastro(id) {
  const lista = listarCadastros().filter((item) => item.id !== id);
  return gravar(CHAVE_CADASTROS, lista);
}

export function salvarRascunho(dados) {
  return gravar(CHAVE_RASCUNHO, dados);
}

export function carregarRascunho() {
  return ler(CHAVE_RASCUNHO, null);
}

/** Preferência de contraste escolhida pelo usuário: 'alto', 'normal' ou null (seguir o sistema). */
export function lerPreferenciaContraste() {
  return ler(CHAVE_CONTRASTE, null);
}

export function salvarPreferenciaContraste(valor) {
  return gravar(CHAVE_CONTRASTE, valor);
}

export function limparRascunho() {
  try {
    localStorage.removeItem(CHAVE_RASCUNHO);
  } catch (erro) {
    console.warn('[storage] Não foi possível limpar o rascunho:', erro);
  }
}
