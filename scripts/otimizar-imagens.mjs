/**
 * Gera versões WebP otimizadas das imagens usadas no site.
 * As saídas ficam em /imagens e são versionadas, assim o build de produção
 * não depende do sharp (biblioteca nativa) no servidor de CI.
 * Uso: npm run imagens
 */
import { statSync } from 'node:fs';
import sharp from 'sharp';

const tarefas = [
  // Logo exibido a 56px: gera 1x e 2x (telas de alta densidade)
  { origem: 'imagens/logo-semear-futuro.png', destino: 'imagens/logo-semear-futuro-56.webp', largura: 56 },
  { origem: 'imagens/logo-semear-futuro.png', destino: 'imagens/logo-semear-futuro-112.webp', largura: 112 },
  // Foto da oficina: versão mobile e desktop para o srcset
  { origem: 'imagens/oficina-informatica.jpg', destino: 'imagens/oficina-informatica-320.webp', largura: 320 },
  { origem: 'imagens/oficina-informatica.jpg', destino: 'imagens/oficina-informatica-640.webp', largura: 640 },
];

const kb = (caminho) => (statSync(caminho).size / 1024).toFixed(1);

for (const { origem, destino, largura } of tarefas) {
  await sharp(origem)
    .resize({ width: largura, withoutEnlargement: true })
    .webp({ quality: 78, effort: 6 })
    .toFile(destino);
  console.log(`${origem} (${kb(origem)} KB) -> ${destino} (${kb(destino)} KB)`);
}
