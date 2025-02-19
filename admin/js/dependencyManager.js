const DependencyManager = {
    dependencies: {
        chart: false,
        sweetalert: false
    },

    async loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    async init() {
        try {
            // Carregar Chart.js primeiro
            await this.loadScript('https://cdn.jsdelivr.net/npm/chart.js');
            this.dependencies.chart = true;
            console.log('Chart.js carregado com sucesso');

            // Carregar SweetAlert2
            await this.loadScript('https://cdn.jsdelivr.net/npm/sweetalert2@11');
            this.dependencies.sweetalert = true;

            return true;
        } catch (error) {
            console.error('Erro ao carregar dependências:', error);
            return false;
        }
    },

    waitForDependencies(timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const check = () => {
                if (this.dependencies.chart && typeof Chart !== 'undefined') {
                    resolve(true);
                    return;
                }

                if (Date.now() - startTime > timeout) {
                    reject(new Error('Timeout esperando dependências'));
                    return;
                }

                setTimeout(check, 100);
            };

            check();
        });
    }
};

window.DependencyManager = DependencyManager;
