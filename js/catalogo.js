// ...existing code...

// Função para atualizar o catálogo quando os preços mudarem
window.atualizarCatalogo = function() {
    const produtos = JSON.parse(localStorage.getItem('PRODUTOS'));
    if (!produtos) return;

    // Atualizar preços no catálogo
    Object.entries(produtos).forEach(([categoria, dados]) => {
        dados.items.forEach(produto => {
            const produtoEl = document.querySelector(`[data-produto-id="${produto.id}"]`);
            if (produtoEl) {
                const precoEl = produtoEl.querySelector('.preco');
                if (precoEl) {
                    precoEl.textContent = `R$ ${produto.preco.toFixed(2)}`;
                }
            }
        });
    });
};

// Listener para mudanças nos produtos
window.addEventListener('produtosAtualizados', window.atualizarCatalogo);

// ...rest of existing code...
