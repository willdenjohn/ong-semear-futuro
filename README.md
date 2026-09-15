# ONG Semear Futuro

Plataforma web da **ONG Semear Futuro** (Itaim Paulista, São Paulo/SP). O site apresenta os projetos sociais da organização e permite que doadores e voluntários façam cadastro. É uma Single Page Application em JavaScript puro, acessível (WCAG 2.1 AA) e publicada no GitHub Pages.

- **Aplicação em produção:** https://willdenjohn.github.io/ong-semear-futuro/
- **Repositório:** https://github.com/willdenjohn/ong-semear-futuro

> Projeto desenvolvido nas Experiências Práticas da disciplina Desenvolvimento Front-End Web (Análise e Desenvolvimento de Sistemas).

---

## Sumário

1. [Funcionalidades](#funcionalidades)
2. [Tecnologias](#tecnologias)
3. [Estrutura de pastas](#estrutura-de-pastas)
4. [Como rodar localmente](#como-rodar-localmente)
5. [Scripts disponíveis](#scripts-disponíveis)
6. [Testes](#testes)
7. [Acessibilidade](#acessibilidade)
8. [Build e deploy](#build-e-deploy)
9. [Fluxo de trabalho com Git (GitFlow)](#fluxo-de-trabalho-com-git-gitflow)
10. [Padrão de commits e versionamento](#padrão-de-commits-e-versionamento)
11. [Manutenção](#manutenção)
12. [Autor](#autor)

---

## Funcionalidades

| Tela | O que faz |
| --- | --- |
| **Início** | Apresentação da ONG e gráfico de voluntários por projeto (Chart.js), com texto alternativo e fallback se o CDN falhar |
| **Projetos sociais** | Cards gerados por template com filtro por categoria (`aria-pressed`) e contador anunciado para leitores de tela |
| **Cadastro** | Formulário com máscaras (CPF, celular, CEP), validação em tempo real (CPF com dígito verificador, idade mínima de 16 anos) e rascunho salvo automaticamente |
| **Meus cadastros** | Lista os cadastros salvos no `localStorage`, com remoção individual |
| **Versão estática** | Páginas HTML sem JavaScript obrigatório (`html/index.html`, `projetos.html`, `cadastro.html`) e guia do design system (`componentes.html`) |

## Tecnologias

- HTML5 semântico e CSS3 (custom properties, Grid de 12 colunas, Flexbox, `:user-invalid`)
- JavaScript ES2020+ com **ES Modules** nativos, sem framework
- [Chart.js 4.4.1](https://www.chartjs.org/) via CDN jsDelivr (import dinâmico)
- [esbuild](https://esbuild.github.io/) para empacotar e minificar
- [sharp](https://sharp.pixelplumbing.com/) para gerar imagens WebP
- [axe-core](https://github.com/dequelabs/axe-core) para auditoria de acessibilidade
- `node:test` + Chrome DevTools Protocol para testes
- GitHub Actions + GitHub Pages para CI e deploy

## Estrutura de pastas

```
ong-semear-futuro/
├── .github/workflows/   # ci.yml (pull requests) e deploy.yml (GitHub Pages)
├── css/estilo.css       # design system: tokens, layout e componentes
├── html/                # app.html (SPA) + páginas estáticas
├── imagens/             # originais (PNG/JPG) e versões WebP otimizadas
├── js/
│   ├── app/             # módulos da SPA
│   │   ├── main.js      # ponto de entrada: registra rotas e eventos
│   │   ├── router.js    # roteamento por hash, foco e anúncio de rota
│   │   ├── templates.js # HTML de cada tela + escaparHTML (anti-XSS)
│   │   ├── validacao.js # regras de validação e mensagens de erro
│   │   ├── mascaras.js  # máscaras de CPF, celular e CEP
│   │   ├── storage.js   # único módulo que acessa o localStorage
│   │   ├── ui.js        # toast, modal e menu
│   │   └── grafico.js   # integração isolada com o Chart.js
│   ├── menu.js          # menu das páginas estáticas
│   └── mascaras.js      # máscaras das páginas estáticas
├── scripts/             # build.mjs e otimizar-imagens.mjs
├── tests/               # app.test.mjs, e2e.mjs e a11y.mjs
├── index.html           # redireciona para html/app.html
└── package.json
```

## Como rodar localmente

**Pré-requisitos:** [Node.js 22+](https://nodejs.org/), [Git](https://git-scm.com/) e Google Chrome (para os testes e2e e de acessibilidade).

```bash
git clone https://github.com/willdenjohn/ong-semear-futuro.git
cd ong-semear-futuro
npm install
npm start
```

Abra http://127.0.0.1:5500 no navegador.

> A SPA usa ES Modules, então precisa de um servidor HTTP. Abrir o arquivo direto (`file://`) não funciona.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm start` | Servidor local em `http://127.0.0.1:5500` sem cache |
| `npm test` | Testes unitários (validação, máscaras, templates, storage) |
| `npm run test:e2e` | Teste ponta a ponta no Chrome headless (precisa do `npm start` rodando) |
| `npm run test:a11y` | Auditoria WCAG 2.1 A/AA com axe-core em 10 telas (precisa do `npm start` rodando) |
| `npm run imagens` | Gera as versões WebP das imagens |
| `npm run build` | Gera a pasta `dist/` minificada para produção |
| `npm run preview` | Serve a pasta `dist/` em `http://127.0.0.1:5600` |

No Windows, se o Chrome não estiver no caminho padrão, defina `CHROME_PATH`. Para testar o build com o e2e, use `BASE_URL=http://127.0.0.1:5500/dist/html/app.html`.

## Testes

| Suíte | Ferramenta | Cobertura |
| --- | --- | --- |
| Unitários | `node:test` | CPF, idade, máscaras, escape de HTML, persistência (14 testes) |
| Ponta a ponta | Chrome + CDP | Navegação SPA, filtro, validação, máscara, gravação, modal, foco, teclado, XSS, rota 404 (19 verificações) |
| Acessibilidade | axe-core | 10 telas, incluindo formulário com erros e tabela preenchida (0 violações) |

## Acessibilidade

O projeto segue a **WCAG 2.1 nível AA**:

- **Estrutura:** landmarks (`header`, `nav`, `main`, `footer`), um `h1` por tela e títulos sem pular níveis.
- **Teclado:** link "Pular para o conteúdo" é o primeiro item do Tab. O foco é sempre visível (`outline` de 3px). O menu fecha com Esc. O modal usa `<dialog>` e devolve o foco ao fechar.
- **SPA e leitores de tela:** na troca de rota, o foco vai para o `h1` da tela nova e uma região `aria-live` anuncia "Página X carregada".
- **Formulários:** `label` em todos os campos, `fieldset`/`legend` nos grupos. Erros usam `aria-invalid` e `aria-describedby`, e o resumo usa `role="alert"`.
- **Imagens e gráfico:** `alt` descritivo. O `canvas` tem `role="img"` e `aria-label` com os valores, que também aparecem em texto.
- **Movimento:** animações desligadas com `prefers-reduced-motion`.
- **Alto contraste:** botão "Alto contraste" no cabeçalho (`aria-pressed`) que troca os tokens de cor, sublinha links e engrossa bordas e foco. A escolha fica salva no `localStorage`. Sem escolha salva, o site segue `prefers-contrast: more` do sistema. Um script no `<head>` aplica a preferência antes da pintura, e o modo de cores forçadas do Windows (`forced-colors: active`) é tratado com cores de sistema.

| Modo alto contraste | Contraste |
| --- | --- |
| Texto `#000000` sobre branco | 21.00:1 |
| Link e botão `#0a4225` / branco | 11.55:1 |
| Botão principal (branco sobre `#7a2e00`) | 9.47:1 |
| Erro `#8a1712` sobre branco | 9.49:1 |
| Indicador de foco `#0033cc` (4px) | 8.95:1 |

Contraste medido nos tokens do design system:

| Combinação | Contraste | Critério |
| --- | --- | --- |
| Texto `#1a1a1a` sobre branco | 17.40:1 | 1.4.3 (mín. 4.5:1) |
| Texto secundário `#4b5563` sobre branco | 7.56:1 | 1.4.3 |
| Link e botão `#1f6f45` / branco | 6.14:1 | 1.4.3 |
| Mensagem de erro `#b3261e` sobre branco | 6.54:1 | 1.4.3 |
| Badge "Vagas abertas" (branco sobre `#1e7a3c`) | 5.38:1 | 1.4.3 |
| Borda dos campos `#6b7280` sobre branco | 4.83:1 | 1.4.11 (mín. 3:1) |
| Indicador de foco `#0b5fff` sobre branco | 5.13:1 | 1.4.11 |

## Build e deploy

`npm run build` gera a pasta `dist/`:

- Os 8 módulos da SPA viram um único `main.js` minificado, com source map.
- CSS, scripts estáticos e HTML são minificados.
- Só as imagens referenciadas no HTML são copiadas. As fotos são servidas em WebP via `<picture>`, com fallback JPG/PNG, `srcset` e `loading="lazy"`.

| Recurso | Original | Produção | Gzip |
| --- | --- | --- | --- |
| CSS | 18.3 KB | 13.1 KB | 3.2 KB |
| JS da SPA (8 módulos) | 26.6 KB | 15.9 KB | 5.9 KB |
| Foto da oficina | 16.0 KB (JPG) | 3.0 a 8.0 KB (WebP) | — |
| Logo | 6.7 KB (PNG) | 0.7 a 1.2 KB (WebP) | — |

**Deploy automático:** todo push na `main` dispara o workflow `deploy.yml`. Ele instala as dependências, roda os testes unitários, gera o build e publica `dist/` no GitHub Pages. Pull requests para `develop` e `main` passam pelo `ci.yml` (testes, build e auditoria axe-core).

## Fluxo de trabalho com Git (GitFlow)

| Branch | Uso |
| --- | --- |
| `main` | Código em produção. Só recebe merge de `release/*` e `hotfix/*`, e cada merge gera uma tag |
| `develop` | Integração contínua das funcionalidades prontas |
| `feature/*` | Uma funcionalidade por branch, criada a partir de `develop` e integrada por pull request |
| `release/*` | Preparação de versão (changelog, versão no `package.json`) |
| `hotfix/*` | Correção urgente criada a partir de `main`, com merge em `main` e `develop` |

Passo a passo para contribuir:

```bash
git checkout develop && git pull
git checkout -b feature/nome-da-funcionalidade
# ... commits pequenos e semânticos ...
git push -u origin feature/nome-da-funcionalidade
# abrir pull request para develop e aguardar o CI passar
```

## Padrão de commits e versionamento

Commits seguem o [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

```
<tipo>(<escopo opcional>): <descrição no imperativo>
```

| Tipo | Quando usar |
| --- | --- |
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação |
| `style` | Formatação, sem mudar comportamento |
| `refactor` | Mudança de código sem alterar comportamento |
| `perf` | Melhoria de desempenho |
| `test` | Testes |
| `build` / `ci` | Build, dependências e pipelines |
| `chore` | Tarefas de manutenção |

As versões seguem o [Versionamento Semântico](https://semver.org/lang/pt-BR/) (`MAJOR.MINOR.PATCH`) e são registradas no [CHANGELOG.md](CHANGELOG.md) e nas releases do GitHub.

## Manutenção

- **Adicionar um projeto social:** inclua um objeto no array `projetos` em `js/app/templates.js`. O card, o filtro e o `select` do cadastro são atualizados automaticamente.
- **Nova rota:** crie o template em `templates.js`, a função `montar` em `main.js` e registre no objeto `rotas`.
- **Trocar o armazenamento por uma API:** altere só `js/app/storage.js`, mantendo os mesmos nomes de função.
- **Nova imagem:** coloque o original em `imagens/`, adicione a tarefa em `scripts/otimizar-imagens.mjs`, rode `npm run imagens` e use `<picture>` no HTML.
- **Antes de abrir um pull request:** rode `npm test`, `npm run test:e2e` e `npm run test:a11y`.

## Autor

**Willden John Lopes de Aguiar**, estudante de Análise e Desenvolvimento de Sistemas e desenvolvedor front-end.
GitHub: [@willdenjohn](https://github.com/willdenjohn)
