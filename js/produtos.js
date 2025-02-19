// Verificar se já existe no localStorage
const produtosSalvos = localStorage.getItem('PRODUTOS');

// Função para obter a URL da imagem
function getImagemUrl(produtoId) {
    const imagens = {
        'trufa-chocolate': 'img/icons/produto-indisponivel.jpg',
        'trufa-morango': 'img/trufa-morango.jpg',
        'trufa-maracuja': 'img/trufa-maracuja.jpg',
        'trufa-limao': 'img/trufa-limao.jpg',
        'brownie-tradicional': 'img/produtos/brownie-tradicional.jpg',
        'brownie-nutella': 'img/produtos/brownie-nutella.jpg',
        'brownie-doce-leite': 'img/produtos/brownie-doce-leite.jpg',
        'mousse-chocolate': 'img/produtos/mousse-chocolate.jpg',
        'mousse-maracuja': 'img/produtos/mousse-maracuja.jpg',
        'mousse-limao': 'img/produtos/mousse-limao.jpg'
    };
    return imagens[produtoId] || 'img/icons/produto-indisponivel.jpg';
}

// Definição global dos produtos
window.PRODUTOS = produtosSalvos ? JSON.parse(produtosSalvos) : {
    trufas: {
        titulo: "Trufas",
        items: [
            {
                id: 'trufa-chocolate',
                nome: 'Trufa de Chocolate',
                descricao: 'Deliciosa trufa de chocolate belga',
                preco: 3.00, // Make sure prices are numbers
                estoque: 20,  // ← Você ajusta estes valores
                imagem: getImagemUrl('trufa-chocolate')
            },
            {
                id: 'trufa-morango',
                nome: 'Trufa de Morango',
                descricao: 'Trufa com recheio de morango',
                preco: 3.00,
                estoque: 15,  // ← Você ajusta estes valores
                imagem: getImagemUrl('trufa-morango')
            },
            {
                id: 'trufa-maracuja',
                nome: 'Trufa de Maracujá',
                descricao: 'Trufa com recheio de maracujá',
                preco: 3.00,
                estoque: 0, // Exemplo de produto esgotado
                imagem: getImagemUrl('trufa-maracuja')
            },
            {
                id: 'trufa-limao',
                nome: 'Trufa de Limão',
                descricao: 'Trufa com recheio de limão',
                preco: 3.00,
                estoque: 10,
                imagem: getImagemUrl('trufa-limao')
            },
            {
                id: 'trufa-castanha',
                nome: 'Trufa de Castanha',
                descricao: 'Trufa com castanhas selecionadas',
                preco: 3.00,
                estoque: 15,
                imagem: getImagemUrl('trufa-castanha')
            },
            {
                id: 'trufa-oreo',
                nome: 'Trufa de Oreo',
                descricao: 'Trufa com pedaços de Oreo',
                preco: 3.00,
                estoque: 15,
                imagem: getImagemUrl('trufa-oreo')
            },
            {
                id: 'trufa-chocoball',
                nome: 'Trufa de Chocoball',
                descricao: 'Trufa com Chocoball',
                preco: 3.00,
                estoque: 15,
                imagem: getImagemUrl('trufa-chocoball')
            },
            {
                id: 'trufa-ninho',
                nome: 'Trufa de Ninho',
                descricao: 'Trufa com leite Ninho',
                preco: 3.00,
                estoque: 15,
                imagem: getImagemUrl('trufa-ninho')
            }
        ]
    },
    brownies: {
        titulo: "Brownies",
        items: [
            {
                id: 'brownie-tradicional',
                nome: 'Brownie Tradicional',
                descricao: 'Brownie de chocolate tradicional',
                preco: 7.00,
                estoque: 12,
                imagem: getImagemUrl('brownie-tradicional')
            },
            {
                id: 'brownie-nutella',
                nome: 'Brownie de Nutella',
                descricao: 'Brownie recheado com Nutella',
                preco: 8.00,
                estoque: 0, // Exemplo de produto esgotado
                imagem: getImagemUrl('brownie-nutella')
            },
            {
                id: 'brownie-doce-leite',
                nome: 'Brownie de Doce de Leite',
                descricao: 'Brownie recheado com doce de leite',
                preco: 8.00,
                estoque: 8,
                imagem: getImagemUrl('brownie-doce-leite')
            }
        ]
    },
    mousses: {
        titulo: "Mousses",
        items: [
            {
                id: 'mousse-chocolate',
                nome: 'Mousse de Chocolate',
                descricao: 'Mousse de chocolate cremoso',
                preco: 6.00,
                estoque: 8,
                imagem: getImagemUrl('mousse-chocolate')
            },
            {
                id: 'mousse-maracuja',
                nome: 'Mousse de Maracujá',
                descricao: 'Mousse de maracujá refrescante',
                preco: 6.00,
                estoque: 5,
                imagem: getImagemUrl('mousse-maracuja')
            },
            {
                id: 'mousse-limao',
                nome: 'Mousse de Limão',
                descricao: 'Mousse de limão refrescante',
                preco: 6.00, // Corrigido para 6.00
                estoque: 8,
                imagem: getImagemUrl('mousse-limao')
            }
        ]
    }
};

// Salvar no localStorage se ainda não existir
if (!produtosSalvos) {
    localStorage.setItem('PRODUTOS', JSON.stringify(window.PRODUTOS));
}

// Função auxiliar para encontrar produto por ID
window.encontrarProdutoPorId = function(produtoId) {
    for (const categoria in window.PRODUTOS) {
        const produto = window.PRODUTOS[categoria].items.find(p => p.id === produtoId);
        if (produto) return produto;
    }
    return null;
};

// Função para verificar estoque
function verificarEstoque(produtoId) {
    for (const categoria in window.PRODUTOS) {
        const produto = window.PRODUTOS[categoria].items.find(p => p.id === produtoId);
        if (produto) {
            return {
                disponivel: produto.estoque > 0,
                quantidade: produto.estoque
            };
        }
    }
    return { disponivel: false, quantidade: 0 };
}

function verificarDisponibilidadeProduto(produtoId, quantidade) {
    const produto = encontrarProdutoPorId(produtoId);
    if (!produto) return { disponivel: false };

    // Verificar estoque atual
    const quantidadeNoCarrinho = window.carrinho?.filter(item => item.id === produtoId).length || 0;
    const estoqueDisponivel = produto.estoque - quantidadeNoCarrinho;

    return {
        disponivel: estoqueDisponivel >= quantidade,
        estoqueDisponivel,
        quantidadeNoCarrinho,
        mensagem: estoqueDisponivel < quantidade 
            ? `Apenas ${estoqueDisponivel} unidade(s) disponível(is)`
            : 'Estoque disponível'
    };
}

// Função para atualizar visual dos produtos
function atualizarVisualProdutos() {
    Object.keys(window.PRODUTOS).forEach(categoria => {
        window.PRODUTOS[categoria].items.forEach(produto => {
            const produtoElement = document.querySelector(`[data-produto-id="${produto.id}"]`);
            if (produtoElement) {
                const esgotado = produto.estoque <= 0;
                
                // Atualizar classes
                produtoElement.classList.toggle('esgotado', esgotado);
                
                // Atualizar botão
                const botaoAdicionar = produtoElement.querySelector('.button-adicionar');
                if (botaoAdicionar) {
                    botaoAdicionar.disabled = esgotado;
                    botaoAdicionar.textContent = esgotado ? 'Produto Esgotado' : 'Adicionar ao Carrinho';
                }

                // Atualizar informação de estoque
                const estoqueInfo = produtoElement.querySelector('.estoque-info');
                if (estoqueInfo) {
                    estoqueInfo.textContent = esgotado ? 'Produto Esgotado' : `${produto.estoque} unidades disponíveis`;
                }
            }
        });
    });
}

// Adicionar função para sincronizar estoque
function sincronizarEstoque() {
    const produtosAtualizados = JSON.parse(localStorage.getItem('PRODUTOS'));
    if (!produtosAtualizados) return;

    // Atualizar dados dos produtos
    Object.keys(produtosAtualizados).forEach(categoria => {
        if (window.PRODUTOS[categoria]) {
            produtosAtualizados[categoria].items.forEach(produtoAtualizado => {
                const produtoExistente = window.PRODUTOS[categoria].items.find(
                    p => p.id === produtoAtualizado.id
                );
                if (produtoExistente) {
                    produtoExistente.estoque = produtoAtualizado.estoque;
                }
            });
        }
    });

    // Atualizar visual de todos os produtos
    atualizarTodosOsProdutos();
}

function atualizarTodosOsProdutos() {
    document.querySelectorAll('.produto').forEach(produtoElement => {
        const produtoId = produtoElement.dataset.produtoId;
        if (produtoId) {
            atualizarVisualProduto(produtoId);
        }
    });
}

// Adicionar listener para mudanças no localStorage
window.addEventListener('storage', (e) => {
    if (e.key === 'PRODUTOS') {
        sincronizarEstoque();
    }
});

// Adicionar listener para atualizações de estoque
window.addEventListener('estoqueAtualizado', (event) => {
    const { produtoId, novoEstoque } = event.detail;
    const produto = encontrarProdutoPorId(produtoId);
    
    if (produto) {
        produto.estoque = novoEstoque;
        atualizarVisualProduto(produtoId);
    }
});

// Adicionar listener para atualizações do admin
window.addEventListener('estoqueAtualizado', function(e) {
    const { produtoId, novoEstoque } = e.detail;
    
    // Atualizar o estoque no objeto PRODUTOS
    for (const categoria in PRODUTOS) {
        const produto = PRODUTOS[categoria].items.find(p => p.id === produtoId);
        if (produto) {
            produto.estoque = novoEstoque;
            atualizarVisualProduto(produtoId);
            break;
        }
    }
});

// Função para sincronizar com o admin ao carregar
function sincronizarComAdmin() {
    const produtosAdmin = JSON.parse(localStorage.getItem('PRODUTOS'));
    if (produtosAdmin) {
        window.PRODUTOS = produtosAdmin;
        atualizarTodosOsProdutos();
    }
}

// Inicializar sincronização
document.addEventListener('DOMContentLoaded', sincronizarComAdmin);

// Remover todas as verificações em intervalo
document.addEventListener('DOMContentLoaded', () => {
    // Verificar estoque apenas uma vez ao carregar
    atualizarVisualProdutos();
});

// Atualizar quando houver mudanças no localStorage
window.addEventListener('storage', function(e) {
    if (e.key === 'PRODUTOS') {
        window.PRODUTOS = JSON.parse(e.newValue);
        atualizarVisualProdutos();
    }
});

// Função para atualizar estoque do produto
function atualizarEstoqueProduto(produtoId, quantidade) {
    const produto = encontrarProdutoPorId(produtoId);
    if (produto) {
        produto.estoque -= quantidade;
        localStorage.setItem('PRODUTOS', JSON.stringify(window.PRODUTOS));
        atualizarVisualProduto(produtoId);
    }
}

// Função para atualizar visual do produto
function atualizarVisualProduto(produtoId) {
    const produto = encontrarProdutoPorId(produtoId);
    const produtoElement = document.querySelector(`[data-produto-id="${produtoId}"]`);
    
    if (!produto || !produtoElement) return;

    const quantidadeNoCarrinho = window.carrinho?.filter(item => item.id === produtoId).length || 0;
    const estoqueDisponivel = produto.estoque - quantidadeNoCarrinho;
    const esgotado = estoqueDisponivel <= 0;

    // Atualizar visual do produto
    produtoElement.classList.toggle('esgotado', esgotado);
    
    // Atualizar elementos
    const botaoAdicionar = produtoElement.querySelector('.button-adicionar');
    const quantidadeControle = produtoElement.querySelector('.quantidade-controle');
    const estoqueInfo = produtoElement.querySelector('.estoque-info');

    if (botaoAdicionar) {
        botaoAdicionar.disabled = esgotado;
        botaoAdicionar.textContent = esgotado ? 'Produto Esgotado' : 'Adicionar ao Carrinho';
        botaoAdicionar.style.display = 'block'; // Garantir que o botão esteja visível
    }

    if (quantidadeControle) {
        quantidadeControle.style.display = esgotado ? 'none' : 'flex';
    }

    if (estoqueInfo) {
        estoqueInfo.textContent = esgotado ? 'Produto Esgotado' : `${estoqueDisponivel} unidades disponíveis`;
        estoqueInfo.classList.toggle('estoque-baixo', estoqueDisponivel < 5);
    }
}

// Adicionar verificação de imagens
function verificarImagens() {
    Object.values(window.PRODUTOS).forEach(categoria => {
        categoria.items.forEach(produto => {
            const img = new Image();
            img.onerror = () => {
                console.warn(`Imagem não encontrada: ${produto.imagem}`);
                produto.imagem = 'img/icons/produto-indisponivel.jpg'; // Caminho atualizado
            };
            img.src = produto.imagem;
        });
    });
}

document.addEventListener('DOMContentLoaded', verificarImagens);

// Função para validar quantidade
function validarQuantidade(input) {
    const produtoId = input.id.replace('quantidade-', '');
    const produto = encontrarProdutoPorId(produtoId);
    if (!produto) return;

    let valor = parseInt(input.value) || 0;
    const quantidadeNoCarrinho = window.carrinho?.filter(item => item.id === produtoId).length || 0;
    const estoqueDisponivel = produto.estoque - quantidadeNoCarrinho;

    // Garantir que o valor esteja entre 1 e o estoque disponível
    if (valor < 1) valor = 1;
    if (valor > estoqueDisponivel) {
        valor = estoqueDisponivel;
        window.mostrarErro(`Quantidade máxima disponível: ${estoqueDisponivel}`);
    }

    input.value = valor;
    atualizarDisplayEstoque(produtoId);
}

function alterarQuantidade(produtoId, delta) {
    const input = document.getElementById(`quantidade-${produtoId}`);
    if (!input) return;

    const produto = encontrarProdutoPorId(produtoId);
    if (!produto) return;

    const novoValor = parseInt(input.value || 1) + delta;
    const quantidadeNoCarrinho = window.carrinho?.filter(item => item.id === produtoId).length || 0;
    const estoqueDisponivel = produto.estoque - quantidadeNoCarrinho;

    if (novoValor >= 1 && novoValor <= estoqueDisponivel) {
        input.value = novoValor;
    }
    
    // Atualizar estado dos botões
    const btnMenos = input.previousElementSibling;
    const btnMais = input.nextElementSibling;
    
    if (btnMenos) btnMenos.disabled = novoValor <= 1;
    if (btnMais) btnMais.disabled = novoValor >= estoqueDisponivel;
}

// Exportar funções necessárias
window.verificarEstoque = verificarEstoque;
window.encontrarProdutoPorId = encontrarProdutoPorId;
window.atualizarEstoqueProduto = atualizarEstoqueProduto;
window.atualizarVisualProduto = atualizarVisualProduto;
window.verificarDisponibilidadeProduto = verificarDisponibilidadeProduto;
window.validarQuantidade = validarQuantidade;

// Produtos em destaque
const DESTAQUES = [
    window.PRODUTOS.trufas.items[0],    // Trufa de Chocolate
    window.PRODUTOS.brownies.items[0]    // Brownie Tradicional
];

// Função para adicionar ao carrinho com validação de preço
window.adicionarAoCarrinho = function(produtoId) {
    try {
        const produto = window.encontrarProdutoPorId(produtoId);
        if (!produto) {
            throw new Error('Produto não encontrado');
        }

        const quantidadeInput = document.getElementById(`quantidade-${produtoId}`);
        const quantidade = parseInt(quantidadeInput?.value || 1);
        
        // Validar quantidade e estoque
        if (!quantidade || quantidade <= 0) {
            throw new Error('Quantidade inválida');
        }

        if (quantidade > produto.estoque) {
            throw new Error(`Apenas ${produto.estoque} unidade(s) disponível(is)`);
        }

        // Adicionar ao carrinho
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        carrinho.push({
            id: produtoId,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: quantidade
        });
        
        localStorage.setItem('carrinho', JSON.stringify(carrinho));

        // Mostrar mensagem de sucesso
        Swal.fire({
            toast: true,
            position: 'top-end',
            title: 'Produto adicionado ao carrinho!',
            html: `${quantidade}x ${produto.nome}<br><br>⚠️ A disponibilidade só será garantida após a finalização da compra.`,
            icon: 'success',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        Swal.fire({
            toast: true,
            position: 'top-end',
            title: 'Erro',
            text: error.message,
            icon: 'error',
            showConfirmButton: false,
            timer: 3000
        });
    }
};

window.adicionarAoCarrinhoComFeedback = function(produtoId) {
    const produto = encontrarProdutoPorId(produtoId);
    if (!produto) {
        Swal.fire({
            title: 'Erro',
            text: 'Produto não encontrado',
            icon: 'error',
            timer: 2000,
            showConfirmButton: false
        });
        return;
    }

    const quantidadeInput = document.getElementById(`quantidade-${produtoId}`);
    const quantidade = parseInt(quantidadeInput?.value || 1);

    if (quantidade > produto.estoque) {
        Swal.fire({
            title: 'Estoque Insuficiente',
            text: `Apenas ${produto.estoque} unidade(s) disponível(is)`,
            icon: 'warning',
            timer: 2000,
            showConfirmButton: false
        });
        return;
    }

    // Adicionar ao carrinho
    if (typeof window.adicionarAoCarrinho === 'function') {
        window.adicionarAoCarrinho(produtoId);
    }

    // Mostrar feedback imediato
    Swal.fire({
        title: 'Produto adicionado ao carrinho!',
        html: `${quantidade}x ${produto.nome}<br><br>⚠️ A disponibilidade só será garantida após a finalização da compra. O carrinho não reserva os produtos.`,
        icon: 'success',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        position: 'top-end',
        toast: true
    });
};

// Função para calcular total do carrinho
function calcularTotalCarrinho() {
    if (!window.carrinho) return 0;
    
    return window.carrinho.reduce((total, item) => {
        return total + (Number(item.preco) * item.quantidade);
    }, 0);
}

function renderizarProdutos(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    Object.entries(PRODUTOS).forEach(([categoria, dados]) => {
        const produtosAtivos = dados.items.filter(produto => produto.status !== 'inativo');
        
        if (produtosAtivos.length > 0) {
            const secao = document.createElement('section');
            secao.className = 'categoria-produtos';
            secao.innerHTML = `
                <h2>${dados.titulo}</h2>
                <div class="produtos-grid">
                    ${produtosAtivos.map(produto => `
                        <div class="produto" data-produto-id="${produto.id}">
                            <h3>${produto.nome}</h3>
                            <p class="descricao">${produto.descricao}</p>
                            <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
                            <p class="estoque-info" id="estoque-${produto.id}">
                                ${produto.estoque} unidades disponíveis
                            </p>
                            <div class="produto-acoes">
                                <div class="quantidade-controle">
                                    <button onclick="alterarQuantidade('${produto.id}', 1)">+</button>
                                    <input type="number" 
                                           id="quantidade-${produto.id}" 
                                           value="1" 
                                           min="1" 
                                           max="${produto.estoque}"
                                           onchange="validarQuantidade(this)">
                                    <button onclick="alterarQuantidade('${produto.id}', -1)">-</button>
                                </div>
                                <button class="button-adicionar" onclick="adicionarAoCarrinho('${produto.id}')">
                                    Adicionar ao Carrinho
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(secao);
        }
    });
}

window.renderizarProdutos = renderizarProdutos;

function atualizarDisplayEstoque(produtoId) {
    const produto = window.encontrarProdutoPorId(produtoId);
    if (!produto) return;

    const produtoElement = document.querySelector(`[data-produto-id="${produtoId}"]`);
    if (!produtoElement) return;

    // Remover classes antigas
    produtoElement.classList.remove('esgotado');
    
    // Só marcar como esgotado se realmente não tiver estoque
    if (produto.estoque <= 0) {
        produtoElement.setAttribute('data-estoque', '0');
    } else {
        produtoElement.removeAttribute('data-estoque');
    }

    // Atualizar informação de estoque
    const estoqueInfo = produtoElement.querySelector('.estoque-info');
    if (estoqueInfo) {
        estoqueInfo.textContent = produto.estoque > 0 
            ? `${produto.estoque} unidades disponíveis`
            : 'Produto Esgotado';
    }
}

// Adicionar função de validação de preço
function validarPrecosProdutos() {
    Object.values(window.PRODUTOS).forEach(categoria => {
        categoria.items.forEach(produto => {
            if (!produto.preco || produto.preco <= 0) {
                console.error(`Produto com preço inválido: ${produto.nome}`);
                produto.preco = 0;
            }
        });
    });
}

// Chamar validação ao inicializar
document.addEventListener('DOMContentLoaded', validarPrecosProdutos);