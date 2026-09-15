/**
 * templates.js - templates HTML de cada tela da SPA.
 * Todo dado vindo do usuário passa por escaparHTML antes de ir para o DOM,
 * evitando injeção de script (XSS) via localStorage.
 */

export const projetos = [
  {
    id: 'reforco-escolar',
    titulo: 'Reforço escolar Semear',
    categoria: 'educacao',
    rotuloCategoria: 'Educação',
    status: { classe: 'badge-status', texto: 'Vagas abertas' },
    descricao: 'Aulas de apoio em português e matemática para estudantes do 3º ao 9º ano.',
    publico: '180 estudantes por semestre',
    necessidade: '10 voluntários com 4 horas semanais',
  },
  {
    id: 'cozinha-solidaria',
    titulo: 'Cozinha Solidária',
    categoria: 'alimentacao',
    rotuloCategoria: 'Alimentação',
    status: { classe: 'badge-urgente', texto: 'Doação urgente' },
    descricao: 'Produção e distribuição de refeições e cestas básicas para famílias do território.',
    publico: '120 famílias por mês',
    necessidade: 'Alimentos não perecíveis e gás de cozinha',
  },
  {
    id: 'inclusao-digital',
    titulo: 'Inclusão Digital',
    categoria: 'tecnologia',
    rotuloCategoria: 'Tecnologia',
    status: { classe: 'badge-status', texto: 'Vagas abertas' },
    descricao: 'Oficinas de informática básica e introdução à programação para jovens e adultos.',
    publico: '90 pessoas por semestre',
    necessidade: 'Notebooks e monitores em funcionamento',
  },
];

export function escaparHTML(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

export function templateInicio() {
  return `
    <section class="layout-inicio">
      <section>
        <h1>ONG Semear Futuro</h1>
        <p>Educação, alimentação e inclusão digital para famílias do Itaim Paulista, em São Paulo, desde 2014.</p>
        <p><a class="botao" href="#/cadastro">Quero apoiar</a></p>
      </section>
      <section aria-labelledby="titulo-grafico">
        <h2 id="titulo-grafico">Voluntários por projeto</h2>
        <figure class="grafico">
          <canvas id="grafico-voluntarios" role="img"
            aria-label="Gráfico de barras de voluntários ativos por projeto em 2025: Reforço escolar 40, Cozinha Solidária 28, Inclusão Digital 18."></canvas>
          <figcaption>Distribuição dos 86 voluntários ativos em 2025.</figcaption>
        </figure>
      </section>
      <aside aria-labelledby="titulo-numeros">
        <h2 id="titulo-numeros">Nossos números em 2025</h2>
        <ul>
          <li>430 crianças e adolescentes atendidos</li>
          <li>12.500 refeições distribuídas</li>
          <li>86 voluntários ativos</li>
        </ul>
      </aside>
    </section>`;
}

export function templateCard(projeto) {
  return `
    <article class="card" id="${projeto.id}" data-categoria="${projeto.categoria}">
      <h2>${escaparHTML(projeto.titulo)}</h2>
      <ul class="badges" aria-label="Categorias do projeto">
        <li class="badge badge-${projeto.categoria}">${escaparHTML(projeto.rotuloCategoria)}</li>
        <li class="badge ${projeto.status.classe}">${escaparHTML(projeto.status.texto)}</li>
      </ul>
      <p>${escaparHTML(projeto.descricao)}</p>
      <ul>
        <li>Público atendido: ${escaparHTML(projeto.publico)}</li>
        <li>Necessidade atual: ${escaparHTML(projeto.necessidade)}</li>
      </ul>
    </article>`;
}

export function templateProjetos() {
  return `
    <h1>Projetos sociais</h1>
    <div class="filtros" role="group" aria-label="Filtrar projetos por categoria">
      <button type="button" class="filtro" data-filtro="todos" aria-pressed="true">Todos</button>
      <button type="button" class="filtro" data-filtro="educacao" aria-pressed="false">Educação</button>
      <button type="button" class="filtro" data-filtro="alimentacao" aria-pressed="false">Alimentação</button>
      <button type="button" class="filtro" data-filtro="tecnologia" aria-pressed="false">Tecnologia</button>
    </div>
    <p class="contador" id="contador-projetos" aria-live="polite"></p>
    <div class="grade-cards" id="lista-projetos">
      ${projetos.map(templateCard).join('')}
    </div>`;
}

export function templateCadastro() {
  const opcoesProjeto = projetos
    .map((p) => `<option value="${p.id}">${escaparHTML(p.titulo)}</option>`)
    .join('');

  return `
    <h1>Cadastro de doadores e voluntários</h1>
    <p class="intro">Campos com asterisco (*) são obrigatórios. O que você digita é salvo como rascunho neste navegador.</p>

    <form id="form-cadastro" novalidate>
      <p class="alerta alerta-erro" id="alerta-form" role="alert" hidden></p>

      <fieldset>
        <legend>Dados pessoais</legend>
        <p class="campo">
          <label for="nome">Nome completo *</label>
          <input type="text" id="nome" name="nome" required minlength="5" maxlength="80" autocomplete="name">
        </p>
        <p class="campo">
          <label for="cpf">CPF *</label>
          <input type="text" id="cpf" name="cpf" required inputmode="numeric" maxlength="14" placeholder="000.000.000-00">
        </p>
        <p class="campo">
          <label for="nascimento">Data de nascimento *</label>
          <input type="date" id="nascimento" name="nascimento" required>
        </p>
        <p class="campo">
          <label for="email">E-mail *</label>
          <input type="email" id="email" name="email" required maxlength="100" autocomplete="email">
        </p>
        <p class="campo">
          <label for="telefone">Celular *</label>
          <input type="tel" id="telefone" name="telefone" required inputmode="numeric" maxlength="15" placeholder="(11) 90000-0000">
        </p>
        <p class="campo">
          <label for="cep">CEP *</label>
          <input type="text" id="cep" name="cep" required inputmode="numeric" maxlength="9" placeholder="00000-000">
        </p>
      </fieldset>

      <fieldset>
        <legend>Forma de participação</legend>
        <fieldset class="grupo-radio">
          <legend>Como você quer apoiar? *</legend>
          <p class="campo-inline"><input type="radio" id="tipo-doador" name="tipo" value="doador" required><label for="tipo-doador">Quero doar</label></p>
          <p class="campo-inline"><input type="radio" id="tipo-voluntario" name="tipo" value="voluntario"><label for="tipo-voluntario">Quero ser voluntário</label></p>
        </fieldset>
        <p class="campo">
          <label for="projeto">Projeto de interesse *</label>
          <select id="projeto" name="projeto" required>
            <option value="">Selecione um projeto</option>
            ${opcoesProjeto}
          </select>
        </p>
        <p class="campo-inline">
          <input type="checkbox" id="lgpd" name="lgpd" value="aceito" required>
          <label for="lgpd">Autorizo o uso dos meus dados para contato, conforme a LGPD *</label>
        </p>
      </fieldset>

      <p class="acoes">
        <button type="submit">Enviar cadastro</button>
        <button type="reset">Limpar formulário</button>
      </p>
    </form>`;
}

export function templateMeusCadastros(lista) {
  if (lista.length === 0) {
    return `
      <h1>Meus cadastros</h1>
      <p class="alerta alerta-aviso">Nenhum cadastro salvo neste navegador ainda.</p>
      <p><a class="botao" href="#/cadastro">Fazer cadastro</a></p>`;
  }

  const nomeProjeto = (id) => projetos.find((p) => p.id === id)?.titulo || id;

  const linhas = lista
    .map((c) => `
      <tr>
        <td>${escaparHTML(c.nome)}</td>
        <td>${c.tipo === 'doador' ? 'Doador' : 'Voluntário'}</td>
        <td>${escaparHTML(nomeProjeto(c.projeto))}</td>
        <td>${new Date(c.criadoEm).toLocaleDateString('pt-BR')}</td>
        <td><button type="button" class="botao-remover" data-id="${escaparHTML(c.id)}">Remover<span class="sr-only"> cadastro de ${escaparHTML(c.nome)}</span></button></td>
      </tr>`)
    .join('');

  return `
    <h1>Meus cadastros</h1>
    <section id="lista-cadastros" aria-labelledby="resumo-cadastros">
      <p id="resumo-cadastros">${lista.length} cadastro(s) salvo(s) neste navegador.</p>
      <div class="tabela-rolagem">
        <table>
          <caption>Cadastros armazenados no localStorage</caption>
          <thead>
            <tr><th scope="col">Nome</th><th scope="col">Tipo</th><th scope="col">Projeto</th><th scope="col">Data</th><th scope="col">Ações</th></tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    </section>`;
}

export function templateNaoEncontrado() {
  return `
    <h1>Página não encontrada</h1>
    <p class="alerta alerta-aviso">O endereço acessado não existe.</p>
    <p><a class="botao" href="#/inicio">Voltar ao início</a></p>`;
}
