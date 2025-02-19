// Sistema de inicialização centralizado
const SISTEMA = {
    initialized: false,
    chartJsLoaded: false,
    adminLoaded: false
};

function inicializarSistema() {
    return new Promise((resolve, reject) => {
        // Carregar Chart.js primeiro
        const chartScript = document.createElement('script');
        chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
        chartScript.onload = () => {
            SISTEMA.chartJsLoaded = true;
            carregarOutrosScripts();
        };
        chartScript.onerror = () => reject(new Error('Falha ao carregar Chart.js'));
        document.head.appendChild(chartScript);

        function carregarOutrosScripts() {
            const scripts = [
                { src: '../js/config.js', global: 'CONFIG' },
                { src: '../js/produtos.js', global: 'PRODUTOS' },
                { src: 'js/admin.js', global: 'initializeAdmin' }
            ];

            let loaded = 0;
            scripts.forEach(script => {
                const el = document.createElement('script');
                el.src = script.src;
                el.onload = () => {
                    loaded++;
                    if (loaded === scripts.length) {
                        SISTEMA.initialized = true;
                        resolve();
                    }
                };
                el.onerror = () => reject(new Error(`Falha ao carregar ${script.src}`));
                document.body.appendChild(el);
            });
        }
    });
}

// Expor função globalmente
window.SISTEMA = SISTEMA;
window.inicializarSistema = inicializarSistema;
