/**
 * Testes unitários da SPA com o test runner nativo do Node (node --test).
 * Cobrem as regras puras: validação, máscaras, escape de HTML e storage.
 */
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// localStorage simulado em memória para rodar fora do navegador
class StorageMemoria {
  constructor() { this.dados = new Map(); }
  getItem(chave) { return this.dados.has(chave) ? this.dados.get(chave) : null; }
  setItem(chave, valor) { this.dados.set(chave, String(valor)); }
  removeItem(chave) { this.dados.delete(chave); }
  clear() { this.dados.clear(); }
}
globalThis.localStorage = new StorageMemoria();

const { cpfValido, idadeEmAnos } = await import('../js/app/validacao.js');
const { aplicarMascara } = await import('../js/app/mascaras.js');
const { escaparHTML, templateCard, projetos } = await import('../js/app/templates.js');
const storage = await import('../js/app/storage.js');

describe('cpfValido', () => {
  test('aceita CPF com dígitos verificadores corretos', () => {
    assert.equal(cpfValido('529.982.247-25'), true);
    assert.equal(cpfValido('52998224725'), true);
  });

  test('rejeita dígito verificador errado', () => {
    assert.equal(cpfValido('529.982.247-26'), false);
  });

  test('rejeita sequência repetida e tamanho incorreto', () => {
    assert.equal(cpfValido('111.111.111-11'), false);
    assert.equal(cpfValido('123'), false);
  });
});

describe('idadeEmAnos', () => {
  test('calcula a idade considerando se já fez aniversário no ano', () => {
    const hoje = new Date();
    const ano = hoje.getFullYear() - 20;
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    assert.equal(idadeEmAnos(`${ano}-${mes}-${dia}`), 20);
  });

  test('retorna -1 para data inválida', () => {
    assert.equal(idadeEmAnos('data-invalida'), -1);
  });
});

describe('aplicarMascara', () => {
  test('formata CPF', () => {
    assert.equal(aplicarMascara('cpf', '52998224725'), '529.982.247-25');
  });

  test('formata celular com DDD', () => {
    assert.equal(aplicarMascara('telefone', '11987654321'), '(11) 98765-4321');
  });

  test('formata CEP e descarta excesso de dígitos', () => {
    assert.equal(aplicarMascara('cep', '081100009999'), '08110-000');
  });

  test('não altera campos sem máscara', () => {
    assert.equal(aplicarMascara('nome', 'Maria'), 'Maria');
  });
});

describe('escaparHTML e templates', () => {
  test('neutraliza tags e aspas', () => {
    assert.equal(escaparHTML('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  });

  test('card renderiza título e categoria do projeto', () => {
    const html = templateCard(projetos[0]);
    assert.match(html, /Reforço escolar Semear/);
    assert.match(html, /data-categoria="educacao"/);
  });
});

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  test('salva, lista e remove cadastros', () => {
    const salvo = storage.salvarCadastro({ nome: 'Maria Souza', tipo: 'doador' });
    assert.ok(salvo.id);
    assert.equal(storage.listarCadastros().length, 1);

    storage.removerCadastro(salvo.id);
    assert.equal(storage.listarCadastros().length, 0);
  });

  test('retorna lista vazia quando o JSON está corrompido', () => {
    localStorage.setItem('semear:cadastros', '{quebrado');
    assert.deepEqual(storage.listarCadastros(), []);
  });

  test('guarda e limpa rascunho', () => {
    storage.salvarRascunho({ nome: 'João' });
    assert.deepEqual(storage.carregarRascunho(), { nome: 'João' });
    storage.limparRascunho();
    assert.equal(storage.carregarRascunho(), null);
  });
});
