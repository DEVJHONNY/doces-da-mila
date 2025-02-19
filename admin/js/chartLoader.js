const ChartLoader = {
    initialized: false,

    async ensure() {
        if (this.initialized) return;

        if (typeof Chart === 'undefined') {
            console.log('Carregando Chart.js...');
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                script.onload = () => {
                    console.log('Chart.js carregado com sucesso');
                    this.initialized = true;
                    resolve();
                };
                script.onerror = () => reject(new Error('Falha ao carregar Chart.js'));
                document.head.appendChild(script);
            });
        } else {
            this.initialized = true;
        }
    },

    async createChart(canvas, config) {
        await this.ensure();
        return new Chart(canvas, config);
    }
};

// Garantir que o ChartLoader está disponível globalmente
window.ChartLoader = ChartLoader;

// Log para debug
console.log('ChartLoader inicializado');
