/**
 * Build de produção: gera a pasta /dist com HTML, CSS e JS minificados,
 * o JavaScript da SPA empacotado em um único módulo e só as imagens usadas.
 * Uso: npm run build
 */
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import * as esbuild from 'esbuild';

const DIST = 'dist';
const alvoNavegadores = ['chrome100', 'firefox100', 'safari15', 'edge100'];

rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, 'html'), { recursive: true });

// 1. JavaScript: a SPA vira um único arquivo (menos requisições); os scripts
//    das páginas estáticas são apenas minificados. Chart.js continua vindo do CDN.
await esbuild.build({
  entryPoints: ['js/app/main.js'],
  outfile: join(DIST, 'js/app/main.js'),
  bundle: true,
  format: 'esm',
  minify: true,
  sourcemap: true,
  target: alvoNavegadores,
  logLevel: 'warning',
});
await esbuild.build({
  entryPoints: ['js/menu.js', 'js/mascaras.js'],
  outdir: join(DIST, 'js'),
  minify: true,
  target: alvoNavegadores,
  logLevel: 'warning',
});

// 2. CSS minificado (esbuild também remove comentários e encurta cores)
await esbuild.build({
  entryPoints: ['css/estilo.css'],
  outfile: join(DIST, 'css/estilo.css'),
  minify: true,
  target: alvoNavegadores,
  logLevel: 'warning',
});

// 3. HTML: remove comentários e indentação sem alterar o conteúdo
const minificarHTML = (html) => html
  .replace(/<!--(?!\s*\[if)[\s\S]*?-->/g, '')
  .replace(/^\s+/gm, '')
  .replace(/>\s*\n\s*</g, '>\n<')
  .trim();

for (const arquivo of readdirSync('html').filter((a) => a.endsWith('.html'))) {
  writeFileSync(join(DIST, 'html', arquivo), minificarHTML(readFileSync(join('html', arquivo), 'utf8')));
}
writeFileSync(join(DIST, 'index.html'), minificarHTML(readFileSync('index.html', 'utf8')));

// 4. Imagens: copia só as versões otimizadas e os fallbacks referenciados no HTML
mkdirSync(join(DIST, 'imagens'), { recursive: true });
const htmlFinal = readdirSync(join(DIST, 'html')).map((a) => readFileSync(join(DIST, 'html', a), 'utf8')).join('');
for (const imagem of readdirSync('imagens')) {
  if (htmlFinal.includes(`imagens/${imagem}`)) cpSync(join('imagens', imagem), join(DIST, 'imagens', imagem));
}

// GitHub Pages: sem processamento Jekyll
writeFileSync(join(DIST, '.nojekyll'), '');

// 5. Relatório de tamanhos (original x produção, com gzip)
const pares = [
  ['css/estilo.css', 'css/estilo.css'],
  ['js/app/*.js (8 módulos)', 'js/app/main.js'],
  ['js/menu.js', 'js/menu.js'],
  ['js/mascaras.js', 'js/mascaras.js'],
  ['html/app.html', 'html/app.html'],
  ['html/cadastro.html', 'html/cadastro.html'],
];
const tamanho = (caminho) => {
  if (caminho.includes('*')) {
    return readdirSync('js/app').reduce((soma, a) => soma + statSync(join('js/app', a)).size, 0);
  }
  return statSync(caminho).size;
};
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

console.log('\nArquivo                    Original    Produção    Gzip');
for (const [origem, destino] of pares) {
  const saida = join(DIST, destino);
  const antes = tamanho(origem);
  const depois = statSync(saida).size;
  const gzip = gzipSync(readFileSync(saida)).length;
  console.log(`${origem.padEnd(26)} ${kb(antes).padStart(9)} ${kb(depois).padStart(11)} ${kb(gzip).padStart(9)}  (-${Math.round((1 - depois / antes) * 100)}%)`);
}
console.log('\nBuild gerado em /dist');
