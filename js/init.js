document.addEventListener('DOMContentLoaded', () => {
    // Verificar se todas as dependências foram carregadas
    const requiredDependencies = [
        'mostrarSucesso',
        'mostrarErro',
        'alterarQuantidade',
        'encontrarProdutoPorId'
    ];

    const missingDependencies = requiredDependencies.filter(dep => !window[dep]);
    
    if (missingDependencies.length > 0) {
        console.error('Dependências faltando:', missingDependencies);
        return;
    }

    // Inicializar elementos
    if (window.atualizarVisualProdutos) {
        window.atualizarVisualProdutos();
    }
    
    if (window.atualizarCarrinho) {
        window.atualizarCarrinho();
    }

    // Inicializar eventos
    const botoesQuantidade = document.querySelectorAll('.quantidade-controle button');
    botoesQuantidade.forEach(botao => {
        botao.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir comportamento padrão
            const produtoId = botao.closest('[data-produto-id]').dataset.produtoId;
            const delta = botao.textContent === '+' ? 1 : -1;
            window.alterarQuantidade(produtoId, delta);
        });
    });
});
