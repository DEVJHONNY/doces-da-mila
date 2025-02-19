// Definição global dos produtos
window.PRODUTOS = {
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

// Carregar produtos do localStorage se existirem
const produtosSalvos = localStorage.getItem('PRODUTOS');
if (produtosSalvos) {
    window.PRODUTOS = JSON.parse(produtosSalvos);
} else {
    // Se não existir no localStorage, salvar os produtos padrão
    localStorage.setItem('PRODUTOS', JSON.stringify(window.PRODUTOS));
}

// Função helper para encontrar produto por ID
window.encontrarProdutoPorId = function(id) {
    for (const categoria in window.PRODUTOS) {
        const produto = window.PRODUTOS[categoria].items.find(p => p.id === id);
        if (produto) return produto;
    }
    return null;
};
