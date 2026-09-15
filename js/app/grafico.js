/**
 * grafico.js - integração com a biblioteca externa Chart.js.
 * A biblioteca é carregada sob demanda (import dinâmico via CDN), só quando
 * a tela inicial é exibida. Se o CDN falhar, a página segue funcionando
 * e o gráfico é substituído por uma mensagem.
 */

// Versão fixada para evitar quebra por atualização automática da biblioteca
const URL_CHARTJS = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/+esm';

let graficoAtual = null;
let carregamento = null;

function carregarChartJs() {
  if (!carregamento) {
    carregamento = import(URL_CHARTJS).then(({ Chart, registerables }) => {
      Chart.register(...registerables);
      return Chart;
    });
  }
  return carregamento;
}

/**
 * Desenha um gráfico de barras no canvas informado.
 * @param {HTMLCanvasElement} canvas
 * @param {{ rotulos: string[], valores: number[], legenda: string }} dados
 */
export async function renderizarGraficoBarras(canvas, dados) {
  try {
    const Chart = await carregarChartJs();

    // Ao voltar para a rota, o canvas antigo foi descartado: destrói a instância anterior
    graficoAtual?.destroy();

    const estilo = getComputedStyle(document.documentElement);
    const corPrimaria = estilo.getPropertyValue('--cor-primaria-700').trim() || '#1f6f45';
    const corTexto = estilo.getPropertyValue('--cor-neutra-900').trim() || '#1a1a1a';

    graficoAtual = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: dados.rotulos,
        datasets: [{
          label: dados.legenda,
          data: dados.valores,
          backgroundColor: corPrimaria,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { duration: 600 },
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: corTexto } },
          y: { beginAtZero: true, ticks: { color: corTexto, precision: 0 } },
        },
      },
    });

    canvas.dataset.estado = 'renderizado';
    return graficoAtual;
  } catch (erro) {
    console.warn('[grafico] Chart.js indisponível:', erro);
    carregamento = null;
    canvas.dataset.estado = 'indisponivel';
    const aviso = document.createElement('p');
    aviso.className = 'alerta alerta-aviso';
    aviso.textContent = 'Não foi possível carregar o gráfico agora. Os números estão listados ao lado.';
    canvas.replaceWith(aviso);
    return null;
  }
}
