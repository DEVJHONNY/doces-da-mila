// Funções utilitárias globais
window.encontrarProdutoPorId = function(produtoId) {
    for (const categoria in window.PRODUTOS) {
        const produto = window.PRODUTOS[categoria].items.find(p => p.id === produtoId);
        if (produto) return produto;
    }
    return null;
};

window.alterarQuantidade = function(produtoId, delta) {
    const input = document.getElementById(`quantidade-${produtoId}`);
    if (!input) return;

    const produto = window.encontrarProdutoPorId(produtoId);
    if (!produto) return;

    const novoValor = Math.max(1, parseInt(input.value) + delta);
    if (novoValor <= produto.estoque) {
        input.value = novoValor;
    }
};

window.mostrarFeedback = function(mensagem, tipo = 'success') {
    Swal.fire({
        title: tipo === 'success' ? 'Sucesso!' : 'Erro',
        text: mensagem,
        icon: tipo,
        timer: 3000,
        position: 'top-end',
        toast: true,
        showConfirmButton: false
    });
};
