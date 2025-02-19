// Sistema de sincronização em tempo real
const SyncManager = {
    // Canal de comunicação entre abas
    channel: new BroadcastChannel('mila-doces-sync'),

    // Inicializar listeners
    init() {
        this.channel.onmessage = (event) => {
            const { type, data } = event.data;
            
            switch(type) {
                case 'PRODUTO_ATUALIZADO':
                    this.handleProdutoAtualizado(data);
                    break;
                case 'ESTOQUE_ATUALIZADO':
                    this.handleEstoqueAtualizado(data);
                    break;
                case 'PRODUTO_REMOVIDO':
                    this.handleProdutoRemovido(data);
                    break;
                case 'PRODUTO_ADICIONADO':
                    this.handleProdutoAdicionado(data);
                    break;
            }

            // Disparar evento de atualização
            window.dispatchEvent(new CustomEvent('produtosAlterados'));
        };

        window.addEventListener('storage', this.handleStorageChange.bind(this));
        window.addEventListener('estoqueAtualizado', this.handleEstoqueAtualizado.bind(this));
    },

    // Handlers para cada tipo de atualização
    handleProdutoAtualizado(data) {
        const produtos = JSON.parse(localStorage.getItem('PRODUTOS'));
        if (produtos) {
            // Atualizar produto
            Object.keys(produtos).forEach(categoria => {
                const index = produtos[categoria].items.findIndex(p => p.id === data.id);
                if (index !== -1) {
                    produtos[categoria].items[index] = { ...produtos[categoria].items[index], ...data };
                }
            });
            localStorage.setItem('PRODUTOS', JSON.stringify(produtos));
            
            // Atualizar UI
            if (window.atualizarVisualProdutos) {
                window.atualizarVisualProdutos();
            }
        }
    },

    handleEstoqueAtualizado(data) {
        const { produtoId, novoEstoque } = data;
        const produtos = JSON.parse(localStorage.getItem('PRODUTOS'));
        if (produtos) {
            Object.keys(produtos).forEach(categoria => {
                const produto = produtos[categoria].items.find(p => p.id === produtoId);
                if (produto) {
                    produto.estoque = novoEstoque;
                }
            });
            localStorage.setItem('PRODUTOS', JSON.stringify(produtos));
            
            // Atualizar UI
            if (window.atualizarVisualProduto) {
                window.atualizarVisualProduto(produtoId);
            }
        }
    },

    handleProdutoRemovido(data) {
        const produtos = JSON.parse(localStorage.getItem('PRODUTOS'));
        if (produtos) {
            Object.keys(produtos).forEach(categoria => {
                produtos[categoria].items = produtos[categoria].items.filter(p => p.id !== data.produtoId);
            });
            localStorage.setItem('PRODUTOS', JSON.stringify(produtos));
            
            // Atualizar UI
            if (window.atualizarVisualProdutos) {
                window.atualizarVisualProdutos();
            }
        }
    },

    handleProdutoAdicionado(data) {
        const produtos = JSON.parse(localStorage.getItem('PRODUTOS'));
        if (produtos) {
            if (!produtos[data.categoria]) {
                produtos[data.categoria] = {
                    titulo: data.categoria.charAt(0).toUpperCase() + data.categoria.slice(1),
                    items: []
                };
            }
            
            // Verificar se o produto já existe para evitar duplicação
            const produtoExiste = produtos[data.categoria].items.some(p => p.id === data.produto.id);
            if (!produtoExiste) {
                produtos[data.categoria].items.push(data.produto);
                localStorage.setItem('PRODUTOS', JSON.stringify(produtos));
            }
            
            // Disparar único evento de atualização
            window.dispatchEvent(new CustomEvent('produtosAlterados'));
        }
    },

    handleStorageChange(event) {
        if (event.key === 'PRODUTOS') {
            window.PRODUTOS = JSON.parse(event.newValue);
            this.atualizarInterface();
        }
    },

    atualizarInterface() {
        // Atualizar displays de produtos
        if (typeof window.atualizarTodosDisplaysEstoque === 'function') {
            window.atualizarTodosDisplaysEstoque();
        }

        // Atualizar carrinho se existir
        if (typeof window.atualizarCarrinho === 'function') {
            window.atualizarCarrinho();
        }

        // Atualizar alertas de estoque no admin
        if (typeof window.atualizarAlertasEstoque === 'function') {
            window.atualizarAlertasEstoque();
        }
    },

    // Métodos para disparar atualizações
    notifyProdutoAtualizado(produto) {
        this.channel.postMessage({
            type: 'PRODUTO_ATUALIZADO',
            data: produto
        });
    },

    notifyEstoqueAtualizado(produtoId, novoEstoque) {
        this.channel.postMessage({
            type: 'ESTOQUE_ATUALIZADO',
            data: { produtoId, novoEstoque }
        });
    },

    notifyProdutoRemovido(produtoId) {
        this.channel.postMessage({
            type: 'PRODUTO_REMOVIDO',
            data: { produtoId }
        });
    },

    notifyProdutoAdicionado(categoria, produto) {
        this.channel.postMessage({
            type: 'PRODUTO_ADICIONADO',
            data: { categoria, produto }
        });
    }
};

// Inicializar sistema de sincronização
document.addEventListener('DOMContentLoaded', () => {
    SyncManager.init();
});

// Exportar para uso global
window.SyncManager = SyncManager;
