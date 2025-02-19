const EstadoLoja = {
    init() {
        // Carregar produtos do localStorage ou inicializar com padrões
        if (!localStorage.getItem('PRODUTOS')) {
            const produtosIniciais = {
                trufas: {
                    titulo: "Trufas",
                    items: [
                        {
                            id: 'trufa-ninho',
                            nome: 'Trufa de Ninho',
                            preco: 3.00,
                            estoque: 20,
                            descricao: 'Trufa artesanal de leite ninho'
                        },
                        {
                            id: 'trufa-chocolate',
                            nome: 'Trufa de Chocolate',
                            preco: 3.00,
                            estoque: 20,
                            descricao: 'Trufa artesanal de chocolate'
                        }
                    ]
                },
                mousses: {
                    titulo: "Mousses",
                    items: [
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

        // Carregar produtos para a memória global
        window.PRODUTOS = JSON.parse(localStorage.getItem('PRODUTOS'));

        // Adicionar listener para mudanças no localStorage
        window.addEventListener('storage', this.handleStorageChange.bind(this));
    },

    handleStorageChange(event) {
        if (event.key === 'PRODUTOS') {
            window.PRODUTOS = JSON.parse(event.newValue);
            this.atualizarTodasInterfaces();
        }
    },

    atualizarTodasInterfaces() {
        // Atualizar produtos na página inicial
        const containerDestaques = document.querySelector('#destaques .produtos-grid');
        if (containerDestaques) {
            this.renderizarDestaques(containerDestaques);
        }

        // Atualizar produtos na página de produtos
        const containerProdutos = document.querySelector('#produtos .produtos-grid');
        if (containerProdutos) {
            this.renderizarProdutos(containerProdutos);
        }

        // Atualizar carrinho se existir
        if (typeof window.atualizarCarrinho === 'function') {
            window.atualizarCarrinho();
        }
    },

    renderizarDestaques(container) {
        const destaques = [];
        Object.entries(window.PRODUTOS).forEach(([categoria, dados]) => {
            if (dados.items && dados.items.length > 0) {
                destaques.push(dados.items[0]); // Pegar primeiro item de cada categoria
            }
        });

        this.renderizarProdutos(container, destaques);
    },

    renderizarProdutos(container, produtos = null) {
        // Se produtos não for fornecido, usar todos os produtos
        if (!produtos) {
            produtos = [];
            Object.values(window.PRODUTOS).forEach(categoria => {
                produtos.push(...categoria.items);
            });
        }

        container.innerHTML = produtos.map(produto => `
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
                    <button class="button-adicionar" 
                            onclick="adicionarAoCarrinho('${produto.id}')"
                            ${produto.estoque <= 0 ? 'disabled' : ''}>
                        ${produto.estoque <= 0 ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
                    </button>
                </div>
            </div>
        `).join('');
    }
};

// Inicializar quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
    EstadoLoja.init();
});

// Exportar para uso global
window.EstadoLoja = EstadoLoja;
