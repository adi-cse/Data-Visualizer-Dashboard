let chartInstance = null;

const ChartManager = {
  destroy() {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  },

  render(canvasId, type, data, xKey, yKey) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !data?.length) return;

    ChartManager.destroy();

    const labels = data.map((row) => String(row[xKey] ?? ''));
    const values = data.map((row) => {
      const v = row[yKey];
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    });

    const isPieLike = type === 'pie' || type === 'doughnut';
    const config = {
      type,
      data: isPieLike
        ? { labels, datasets: [{ data: values, backgroundColor: getColors(values.length) }] }
        : {
            labels,
            datasets: [
              {
                label: yKey,
                data: values,
                borderColor: 'rgb(88, 166, 255)',
                backgroundColor: 'rgba(88, 166, 255, 0.2)',
                fill: type === 'line' || type === 'radar',
                tension: 0.3,
              },
            ],
          },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
        },
        scales: type !== 'pie' && type !== 'doughnut' && type !== 'radar'
          ? {
              x: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: '#8b949e', maxTicksLimit: 12 } },
              y: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: '#8b949e' } },
            }
          : undefined,
      },
    };

    const ctx = canvas.getContext('2d');
    chartInstance = new Chart(ctx, config);
  },

  exportAsPng() {
    if (!chartInstance?.canvas) return false;
    const link = document.createElement('a');
    link.download = `chart-${Date.now()}.png`;
    link.href = chartInstance.canvas.toDataURL('image/png');
    link.click();
    return true;
  },
};

function getColors(n) {
  const palette = [
    'rgba(88, 166, 255, 0.8)',
    'rgba(63, 185, 80, 0.8)',
    'rgba(248, 81, 73, 0.8)',
    'rgba(210, 153, 34, 0.8)',
    'rgba(163, 113, 247, 0.8)',
    'rgba(126, 231, 135, 0.8)',
  ];
  return Array.from({ length: n }, (_, i) => palette[i % palette.length]);
}
