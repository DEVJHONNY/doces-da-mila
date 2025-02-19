const GerenciadorProdutos = {
    init() {
        // Carregar produtos iniciais se não existirem
        if (!localStorage.getItem('PRODUTOS')) {
            const produtosIniciais = {
                trufas: {
                    titulo: "Trufas",
                    items: [
                        {
                            id: 'trufa-chocolate',
                            nome: 'Trufa de Chocolate',
                            preco: 3.00,
                            estoque: 20,
                            descricao: 'Trufa artesanal de chocolate'
                        },
                        {
                            id: 'trufa-ninho',
                            nome: 'Trufa de Ninho',
                            preco: 3.00,
                            estoque: 20,
                            descricao: 'Trufa artesanal de leite ninho'
                        }
                    ]
                },
                mousses: {
                    titulo: "Mousses",
                    items: [
                        {
                            id: 'mousse-chocolate',
                            nome: 'Mousse de Chocolate',
                            preco: 3.50,
                            estoque: 15,
                            descricao: 'Mousse artesanal de chocolate'
                        },
                        {
                            id: 'mousse-limao',
                            nome: 'Mousse de Limão',
                            preco: 3.50,
                            estoque: 15,
                            descricao: 'Mousse artesanal de limão'
                        }
                    ]
                }
            };
            localStorage.setItem('PRODUTOS', JSON.stringify(produtosIniciais));
        }

        // Carregar produtos para a memória
        window.PRODUTOS = JSON.parse(localStorage.getItem('PRODUTOS'));

        // Adicionar listener para mudanças no localStorage
        window.addEventListener('storage', this.handleStorageChange.bind(this));
    },

    handleStorageChange(event) {
        if (event.key === 'PRODUTOS') {
            window.PRODUTOS = JSON.parse(event.newValue);
            this.atualizarInterface();
        }
    },

    atualizarInterface() {
        // Atualizar exibição de produtos
        const containers = document.querySelectorAll('.produtos-grid');
        containers.forEach(container => {
            if (container) this.renderizarProdutos(container);
        });

        // Atualizar carrinho se existir
        if (typeof window.atualizarCarrinho === 'function') {
            window.atualizarCarrinho();
        }

        // Atualizar estoque se estiver no admin
        if (typeof window.atualizarAlertasEstoque === 'function') {
            window.atualizarAlertasEstoque();
        }
    },

    renderizarProdutos(container) {
        if (!window.PRODUTOS) return;

        let html = '';
        Object.entries(window.PRODUTOS).forEach(([categoria, dados]) => {
            dados.items.forEach(produto => {
                html += `
                    <div class="produto" data-produto-id="${produto.id}">
                        <div class="produto-info">
                            <h3>${produto.nome}</h3>
                            <p class="descricao">${produto.descricao}</p>
                            <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
                            <p class="estoque-info">${produto.estoque} unidades disponíveis</p>
                        </div>
                        <div class="produto-acoes">
                            <div class="quantidade-controle">
                                <button onclick="alterarQuantidade('${produto.id}', -1)">-</button>
                                <input type="number" id="quantidade-${produto.id}" value="1" min="1" max="${produto.estoque}">
                                <button onclick="alterarQuantidade('${produto.id}', 1)">+</button>
                            </div>
                            <button class="button-adicionar" onclick="adicionarAoCarrinho('${produto.id}')"
                                    ${produto.estoque <= 0 ? 'disabled' : ''}>
                                ${produto.estoque <= 0 ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
                            </button>
                        </div>
                    </div>
                `;
            });
        });

        container.innerHTML = html;
    }
};

// Inicializar quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
    GerenciadorProdutos.init();
});

// Exportar para uso global
window.GerenciadorProdutos = GerenciadorProdutos;
