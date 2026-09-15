# Changelog

Todas as mudanças relevantes do projeto são registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2026-09-15

Primeira versão publicada em produção (GitHub Pages).

### Adicionado
- Modo alto contraste: botão no cabeçalho (`aria-pressed`), preferência salva, suporte a `prefers-contrast: more` e `forced-colors: active` (#7).
- Auditoria automatizada WCAG 2.1 A/AA com axe-core em 13 telas, 3 delas em alto contraste (`npm run test:a11y`).
- Região `aria-live` que anuncia a troca de rota na SPA.
- Build de produção com esbuild: SPA empacotada em um único módulo, CSS, JS e HTML minificados (`npm run build`).
- Imagens WebP com `<picture>`, `srcset` e `loading="lazy"` (`npm run imagens`).
- Workflows do GitHub Actions: CI em pull requests e deploy automático no GitHub Pages.
- README com instalação, scripts, acessibilidade, GitFlow e manutenção.

### Corrigido
- Ordem de títulos nos cards de projetos (h3 logo após h1).
- Foco na troca de rota vai para o `h1`, e o carregamento inicial não pula o link "Pular para o conteúdo".
- Foco entra no modal e volta ao elemento de origem ao fechar.
- Contraste da borda dos campos de formulário de 1.45:1 para 4.83:1 (WCAG 1.4.11).
- CI: Chrome headless iniciado com `--no-sandbox` no runner Ubuntu do GitHub Actions.

### Removido
- `imagens/oficina-informatica.png` (93.6 KB), duplicata não utilizada da foto em JPG.

## [0.3.0] - Experiência Prática 3

### Adicionado
- SPA com roteamento por hash, templates dinâmicos, validação em tempo real, máscaras e `localStorage`.
- Gráfico com Chart.js e testes unitários e ponta a ponta.

[1.0.0]: https://github.com/willdenjohn/ong-semear-futuro/compare/v0.3.0...v1.0.0
[0.3.0]: https://github.com/willdenjohn/ong-semear-futuro/releases/tag/v0.3.0
