const ESTOQUE = {
    // Trufas
    'trufa-chocolate': { quantidade: 20, alerta: 5, nome: 'Trufa de Chocolate' },
    'trufa-morango': { quantidade: 15, alerta: 5, nome: 'Trufa de Morango' },
    'trufa-maracuja': { quantidade: 15, alerta: 5, nome: 'Trufa de Maracujá' },
    'trufa-limao': { quantidade: 15, alerta: 5, nome: 'Trufa de Limão' },
    'trufa-cafe': { quantidade: 15, alerta: 5, nome: 'Trufa de Café' },
    'trufa-amendoim': { quantidade: 15, alerta: 5, nome: 'Trufa de Amendoim' },
    
    // Brownies
    'brownie-tradicional': { quantidade: 12, alerta: 3, nome: 'Brownie Tradicional' },
    'brownie-nutella': { quantidade: 10, alerta: 3, nome: 'Brownie de Nutella' },
    'brownie-doce-leite': { quantidade: 10, alerta: 3, nome: 'Brownie de Doce de Leite' },
    'brownie-oreo': { quantidade: 10, alerta: 3, nome: 'Brownie de Oreo' },
    
    // Mousses
    'mousse-chocolate': { quantidade: 8, alerta: 2, nome: 'Mousse de Chocolate' },
    'mousse-maracuja': { quantidade: 8, alerta: 2, nome: 'Mousse de Maracujá' },
    'mousse-morango': { quantidade: 8, alerta: 2, nome: 'Mousse de Morango' },
    'mousse-limao': { quantidade: 8, alerta: 2, nome: 'Mousse de Limão' }
};

// Gerenciar estoque
const EstoqueManager = {
    verificar: function(produtoId, quantidade) {
        const produto = ESTOQUE[produtoId];
        if (!produto) return { disponivel: false, mensagem: "Produto não encontrado" };

        if (produto.quantidade < quantidade) {
            return {
                disponivel: false,
                mensagem: `Desculpe, temos apenas ${produto.quantidade} unidades de ${produto.nome} em estoque.`
            };
        }
        return { disponivel: true };
    },

    atualizar: function(produtoId, quantidade) {
        if (ESTOQUE[produtoId]) {
            ESTOQUE[produtoId].quantidade = quantidade;
            this.atualizarExibicao(produtoId);
        }
    },

    atualizarExibicao: function(produtoId) {
        const display = document.getElementById(`estoque-${produtoId}`);
        const produto = ESTOQUE[produtoId];
        
        if (display && produto) {
            display.textContent = `${produto.quantidade} unidades disponíveis`;
            display.classList.toggle('estoque-baixo', produto.quantidade <= produto.alerta);
        }
    },

    baixar: function(produtoId, quantidade) {
        if (ESTOQUE[produtoId]) {
            const novaQuantidade = ESTOQUE[produtoId].quantidade - quantidade;
            if (novaQuantidade < 0) return false;
            
            ESTOQUE[produtoId].quantidade = novaQuantidade;
            this.atualizarExibicao(produtoId);
            return true;
        }
        return false;
    },

    restaurar: function(produtoId, quantidade) {
        if (ESTOQUE[produtoId]) {
            ESTOQUE[produtoId].quantidade += quantidade;
            this.atualizarExibicao(produtoId);
            return true;
        }
        return false;
    },

    // Adicionar método para validar quantidade
    validarQuantidade: function(produtoId, quantidade) {
        return quantidade > 0 && this.verificar(produtoId, quantidade).disponivel;
    }
};

// Adicionar função de inicialização
function inicializarEstoque() {
    // Sincronizar estoque inicial com produtos
    Object.keys(PRODUTOS).forEach(categoria => {
        PRODUTOS[categoria].items.forEach(produto => {
            if (!ESTOQUE[produto.id]) {
                ESTOQUE[produto.id] = {
                    quantidade: produto.estoque || 0,
                    alerta: CONFIG.estoque.alertaBaixo[categoria] || 5,
                    nome: produto.nome
                };
            }
        });
    });

    // Atualizar exibição inicial
    Object.keys(ESTOQUE).forEach(produtoId => {
        EstoqueManager.atualizarExibicao(produtoId);
    });
}

// Adicionar ao DOM Content Loaded
document.addEventListener('DOMContentLoaded', inicializarEstoque);

// Expor EstoqueManager globalmente
window.EstoqueManager = EstoqueManager;

function atualizarEstoqueDisplay(produtoId) {
    const produto = encontrarProdutoPorId(produtoId);
    if (!produto) return;

    const estoqueInfo = document.getElementById(`estoque-${produtoId}`);
    if (!estoqueInfo) return;

    // Verificar quantidade no carrinho
    const quantidadeNoCarrinho = carrinho.filter(item => item.id === produtoId).length;
    const estoqueDisponivel = produto.estoque - quantidadeNoCarrinho;

    // Atualizar display do estoque
    if (estoqueDisponivel <= 0) {
        estoqueInfo.textContent = 'Produto Esgotado';
        estoqueInfo.classList.add('estoque-esgotado');
        desabilitarControles(produtoId);
    } else {
        estoqueInfo.textContent = `${estoqueDisponivel} unidades disponíveis`;
        if (estoqueDisponivel <= CONFIG.estoque.alertaBaixo[produto.categoria]) {
            estoqueInfo.classList.add('estoque-baixo');
        }
    }
}

function desabilitarControles(produtoId) {
    const addButton = document.querySelector(`[data-produto-id="${produtoId}"] .button-adicionar`);
    const quantidadeInput = document.getElementById(`quantidade-${produtoId}`);
    
    if (addButton) addButton.disabled = true;
    if (quantidadeInput) quantidadeInput.disabled = true;
}

// Criar arquivo de controle de estoque centralizado
const EstoqueController = {
    verificarDisponibilidade: function(produtoId, quantidadeDesejada) {
        const produto = window.encontrarProdutoPorId(produtoId);
        if (!produto) return { disponivel: false, mensagem: 'Produto não encontrado' };

        const quantidadeNoCarrinho = (window.carrinho || [])
            .filter(item => item.id === produtoId)
            .length;

        const estoqueDisponivel = produto.estoque - quantidadeNoCarrinho;

        return {
            disponivel: estoqueDisponivel >= quantidadeDesejada,
            estoqueDisponivel,
            quantidadeNoCarrinho,
            mensagem: estoqueDisponivel < quantidadeDesejada 
                ? `Apenas ${estoqueDisponivel} unidade(s) disponível(is)`
                : 'Estoque disponível'
        };
    },

    atualizarVisualEstoque: function(produtoId) {
        const produto = window.encontrarProdutoPorId(produtoId);
        if (!produto) return;

        const elementos = document.querySelectorAll(`[data-produto-id="${produtoId}"]`);
        elementos.forEach(elemento => {
            const verificacao = this.verificarDisponibilidade(produtoId, 1);
            
            // Atualizar informação de estoque
            const estoqueInfo = elemento.querySelector('.estoque-info');
            if (estoqueInfo) {
                estoqueInfo.textContent = verificacao.disponivel 
                    ? `${verificacao.estoqueDisponivel} unidades disponíveis`
                    : 'Produto Esgotado';
                estoqueInfo.classList.toggle('estoque-baixo', verificacao.estoqueDisponivel < 5);
            }

            // Atualizar controles de quantidade
            const quantidadeInput = elemento.querySelector(`input[type="number"]`);
            if (quantidadeInput) {
                quantidadeInput.max = verificacao.estoqueDisponivel;
                if (parseInt(quantidadeInput.value) > verificacao.estoqueDisponivel) {
                    quantidadeInput.value = verificacao.estoqueDisponivel;
                }
            }

            // Atualizar botão de adicionar
            const botaoAdicionar = elemento.querySelector('.button-adicionar');
            if (botaoAdicionar) {
                botaoAdicionar.disabled = !verificacao.disponivel;
                botaoAdicionar.textContent = verificacao.disponivel 
                    ? 'Adicionar ao Carrinho'
                    : 'Produto Esgotado';
            }
        });
    },

    atualizarTodosVisuais: function() {
        const produtos = document.querySelectorAll('.produto');
        produtos.forEach(produto => {
            const produtoId = produto.dataset.produtoId;
            if (produtoId) {
                this.atualizarVisualEstoque(produtoId);
            }
        });
    }
};

// Exportar para uso global
window.EstoqueController = EstoqueController;

// Atualizar visualização quando o carrinho mudar
window.addEventListener('carrinhoAtualizado', () => {
    EstoqueController.atualizarTodosVisuais();
});

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    EstoqueController.atualizarTodosVisuais();
});
