window.CONFIG_ADMIN = {
    vendas: JSON.parse(localStorage.getItem('vendas')) || [],
    produtos: JSON.parse(localStorage.getItem('PRODUTOS')) || null,
    initialized: false
};

function initializeAdmin() {
    if (window.CONFIG_ADMIN.initialized) return;

    // Carregar produtos se não existirem
    if (!window.CONFIG_ADMIN.produtos) {
        window.CONFIG_ADMIN.produtos = {
            trufas: {
                titulo: "Trufas",
                items: [
                    {
                        id: 'trufa-chocolate',
                        nome: 'Trufa de Chocolate',
                        preco: 3.00,
                        estoque: 20
                    },
                    {
                        id: 'trufa-morango',
                        nome: 'Trufa de Morango',
                        preco: 3.00,
                        estoque: 15
                    }
                ]
            },
            brownies: {
                titulo: "Brownies",
                items: [
                    {
                        id: 'brownie-tradicional',
                        nome: 'Brownie Tradicional',
                        preco: 7.00,
                        estoque: 12
                    }
                ]
            },
            mousses: {
                titulo: "Mousses",
                items: [
                    {
                        id: 'mousse-chocolate',
                        nome: 'Mousse de Chocolate',
                        preco: 6.00,
                        estoque: 8
                    }
                ]
            }
        };
        localStorage.setItem('PRODUTOS', JSON.stringify(window.CONFIG_ADMIN.produtos));
    }

    window.CONFIG_ADMIN.initialized = true;
}

// Expor funções globais
window.initializeAdmin = initializeAdmin;
window.PRODUTOS = window.CONFIG_ADMIN.produtos;
