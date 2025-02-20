// Inicializar carrinho
window.carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Verificar dependências
function verificarDependencias() {
    const dependencias = ['mostrarSucesso', 'mostrarErro', 'alterarQuantidade', 'encontrarProdutoPorId'];
    const faltando = dependencias.filter(dep => !window[dep]);
    
    if (faltando.length > 0) {
        console.error('Dependências faltando:', faltando);
        return false;
    }
    return true;
}

// Adicionar configuração de mensagens
const MENSAGENS = {
    AVISO_RESERVA: `⚠️ A disponibilidade só será garantida após a finalização da compra.
                    O carrinho não reserva os produtos.`,
    PRODUTO_ADICIONADO: (nome, quantidade) => `${quantidade}x ${nome} adicionado(s) ao carrinho!`
};

function adicionarAoCarrinho(produtoId) {
    try {
        const produto = encontrarProdutoPorId(produtoId);
        if (!produto) {
            throw new Error('Produto não encontrado');
        }

        const quantidadeInput = document.getElementById(`quantidade-${produtoId}`);
        const quantidade = parseInt(quantidadeInput?.value || 1);
        
        // Verificar quantidade atual no carrinho
        const quantidadeNoCarrinho = window.carrinho.reduce((total, item) => 
            item.id === produtoId ? total + item.quantidade : total, 0);
        
        // Verificar se excede o estoque
        if (quantidadeNoCarrinho + quantidade > produto.estoque) {
            throw new Error(`Apenas ${produto.estoque} unidade(s) disponível(is)`);
        }

        // Adicionar ao carrinho
        window.carrinho.push({
            id: produtoId,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: quantidade
        });

        localStorage.setItem('carrinho', JSON.stringify(window.carrinho));

        // Atualizar interface
        atualizarCarrinho();
        atualizarDisplayEstoque(produtoId);

        // Mostrar mensagem de sucesso unificada
        Swal.fire({
            toast: true,
            position: 'top-end',
            title: `Produto adicionado ao carrinho!`,
            html: `${quantidade}x ${produto.nome}<br><br>⚠️ A disponibilidade só será garantida após a finalização da compra. O carrinho não reserva os produtos.`,
            icon: 'success',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

    } catch (error) {
        console.error('Erro:', error);
        Swal.fire({
            toast: true,
            position: 'top-end',
            title: 'Erro',
            text: error.message,
            icon: 'error',
            timer: 2000,
            showConfirmButton: false
        });
    }
}

// Nova função para atualizar o display do estoque
function atualizarDisplayEstoque(produtoId) {
    const produto = window.encontrarProdutoPorId(produtoId);
    if (!produto) return;

    // Calcular estoque disponível real
    const quantidadeNoCarrinho = carrinho.filter(item => item.id === produtoId).length;
    const estoqueDisponivel = produto.estoque - quantidadeNoCarrinho;
    
    const produtoElement = document.querySelector(`[data-produto-id="${produtoId}"]`);
    if (!produtoElement) return;

    // Só marcar como esgotado se realmente não tiver estoque no produto
    const estaEsgotado = produto.estoque <= 0;

    // Atualizar classes e atributos
    produtoElement.classList.toggle('esgotado', estaEsgotado);
    if (estaEsgotado) {
        produtoElement.setAttribute('data-estoque', '0');
    } else {
        produtoElement.removeAttribute('data-estoque');
    }

    // Atualizar controles de quantidade
    const quantidadeControle = produtoElement.querySelector('.quantidade-controle');
    const botaoAdicionar = produtoElement.querySelector('.button-adicionar');
    
    if (botaoAdicionar) {
        botaoAdicionar.disabled = estaEsgotado;
        botaoAdicionar.textContent = estaEsgotado ? 'Produto Esgotado' : 'Adicionar ao Carrinho';
    }

    if (quantidadeControle) {
        quantidadeControle.style.display = estaEsgotado ? 'none' : 'flex';
    }

    // Atualizar informação de estoque
    const estoqueInfo = produtoElement.querySelector('.estoque-info');
    if (estoqueInfo) {
        estoqueInfo.textContent = estaEsgotado 
            ? 'Produto Esgotado'
            : `${produto.estoque} unidades disponíveis`;
        estoqueInfo.classList.toggle('estoque-baixo', produto.estoque < 5);
    }
}

/* Adicionar esta nova função de verificação de estoque */
function verificarDisponibilidadeProduto(produtoId, quantidadeDesejada) {
    const produto = window.encontrarProdutoPorId(produtoId);
    if (!produto) return { disponivel: false };

    const quantidadeNoCarrinho = carrinho.reduce((total, item) => 
        item.id === produtoId ? total + item.quantidade : total, 0);
        
    return {
        disponivel: produto.estoque >= (quantidadeDesejada + quantidadeNoCarrinho),
        estoqueDisponivel: produto.estoque,
        quantidadeNoCarrinho
    };
}

function verificarEstoqueAdmin(produtoId, quantidadeDesejada) {
    const produtosAdmin = JSON.parse(localStorage.getItem('PRODUTOS'));
    if (!produtosAdmin) return { disponivel: false, mensagem: 'Erro ao verificar estoque' };

    let estoqueDisponivel = 0;
    let produtoEncontrado = null;

    // Procurar produto no estoque do admin
    for (const categoria in produtosAdmin) {
        const produto = produtosAdmin[categoria].items.find(p => p.id === produtoId);
        if (produto) {
            produtoEncontrado = produto;
            estoqueDisponivel = produto.estoque;
            break;
        }
    }

    if (!produtoEncontrado) {
        return { disponivel: false, mensagem: 'Produto não encontrado' };
    }

    // Verificar quantidade no carrinho atual
    const quantidadeNoCarrinho = carrinho.filter(item => item.id === produtoId).length;
    const estoqueReal = estoqueDisponivel - quantidadeNoCarrinho;

    return {
        disponivel: estoqueReal >= quantidadeDesejada,
        estoqueDisponivel: estoqueReal,
        mensagem: estoqueReal < quantidadeDesejada 
            ? `Apenas ${estoqueReal} unidades disponíveis`
            : 'Estoque disponível'
    };
}

// Função atualizada para renderizar item do carrinho com quantidade correta
function renderizarItemCarrinho(item) {
    const produto = window.encontrarProdutoPorId(item.id);
    if (!produto) return '';

    const preco = produto.preco;
    const quantidade = item.quantidade || 1;
    const subtotal = preco * quantidade;

    return `
        <div class="item-carrinho" data-produto-id="${item.id}">
            <div class="item-info">
                <h4>${item.nome}</h4>
                <p class="preco">R$ ${preco.toFixed(2)} x ${quantidade}</p>
            </div>
            <div class="quantidade-controles">
                <button onclick="alterarQuantidadeCarrinho('${item.id}', -1)" class="btn-quantidade">-</button>
                <span class="quantidade">${quantidade}</span>
                <button onclick="alterarQuantidadeCarrinho('${item.id}', 1)" class="btn-quantidade">+</button>
            </div>
        </div>
    `;
}

// Função atualizada para calcular quantidade corretamente
function atualizarCarrinho() {
    const container = document.getElementById('lista-carrinho');
    const totalElement = document.getElementById('total-carrinho');
    
    if (!container) return;

    // Limpar carrinho se estiver vazio
    if (!window.carrinho || window.carrinho.length === 0) {
        container.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio</p>';
        if (totalElement) totalElement.textContent = '0.00';
        return;
    }

    // Agrupar itens válidos
    const itensAgrupados = {};
    let total = 0;

    window.carrinho.forEach(item => {
        // Verificar se o item é válido
        const produto = encontrarProdutoPorId(item.id);
        if (!produto) return; // Pular itens inválidos

        if (!itensAgrupados[item.id]) {
            itensAgrupados[item.id] = {
                id: item.id,
                nome: produto.nome, // Usar nome do produto encontrado
                preco: produto.preco, // Usar preço do produto encontrado
                quantidade: item.quantidade || 1
            };
        } else {
            itensAgrupados[item.id].quantidade += (item.quantidade || 1);
        }
        total += produto.preco * (item.quantidade || 1);
    });

    // Renderizar itens válidos
    container.innerHTML = Object.values(itensAgrupados)
        .map(item => `
            <div class="item-carrinho" data-produto-id="${item.id}">
                <div class="item-info">
                    <h4>${item.nome}</h4>
                    <p>R$ ${Number(item.preco).toFixed(2)} x ${item.quantidade}</p>
                </div>
                <div class="quantidade-controles">
                    <button onclick="alterarQuantidadeCarrinho('${item.id}', -1)" class="btn-quantidade">-</button>
                    <span class="quantidade">${item.quantidade}</span>
                    <button onclick="alterarQuantidadeCarrinho('${item.id}', 1)" class="btn-quantidade">+</button>
                </div>
            </div>
        `).join('');

    if (totalElement) {
        totalElement.textContent = total.toFixed(2);
    }
}

function alterarQuantidadeCarrinho(produtoId, delta) {
    try {
        const produto = encontrarProdutoPorId(produtoId);
        if (!produto) {
            throw new Error('Produto não encontrado');
        }

        // Encontrar item no carrinho
        const itensAgrupados = {};
        window.carrinho.forEach(item => {
            if (!itensAgrupados[item.id]) {
                itensAgrupados[item.id] = {
                    ...item,
                    quantidade: 0
                };
            }
            itensAgrupados[item.id].quantidade++;
        });

        const itemAtual = itensAgrupados[produtoId];
        const novaQuantidade = (itemAtual?.quantidade || 0) + delta;

        if (novaQuantidade <= 0) {
            // Confirmar remoção
            Swal.fire({
                title: 'Remover produto?',
                text: `Deseja remover ${produto.nome} do carrinho?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sim',
                cancelButtonText: 'Não'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.carrinho = window.carrinho.filter(item => item.id !== produtoId);
                    localStorage.setItem('carrinho', JSON.stringify(window.carrinho));
                    atualizarCarrinho();
                    atualizarDisplayEstoque(produtoId);
                }
            });
            return;
        }

        // Verificar estoque apenas ao aumentar
        if (delta > 0 && novaQuantidade > produto.estoque) {
            throw new Error(`Apenas ${produto.estoque} unidade(s) disponível(is)`);
        }

        // Atualizar carrinho
        if (delta > 0) {
            window.carrinho.push({
                id: produtoId,
                nome: produto.nome,
                preco: produto.preco,
                quantidade: 1
            });
        } else {
            const index = window.carrinho.findIndex(item => item.id === produtoId);
            if (index !== -1) {
                window.carrinho.splice(index, 1);
            }
        }

        localStorage.setItem('carrinho', JSON.stringify(window.carrinho));
        atualizarCarrinho();

    } catch (error) {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: error.message,
            showConfirmButton: false,
            timer: 2000
        });
    }
}

function atualizarCarrinhoCompleto(produtoId) {
    localStorage.setItem('carrinho', JSON.stringify(window.carrinho));
    atualizarCarrinho();
    atualizarDisplayEstoque(produtoId);
}

function confirmarRemocao(produtoId) {
    const produto = encontrarProdutoPorId(produtoId);
    if (!produto) return;

    Swal.fire({
        title: 'Tem certeza?',
        html: `<p>Deseja mesmo remover ${produto.nome} do carrinho?</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff758c',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, remover',
        cancelButtonText: 'Não, manter'
    }).then((result) => {
        if (result.isConfirmed) {
            carrinho = carrinho.filter(item => item.id !== produtoId);
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            atualizarCarrinho();
            atualizarDisplayEstoque(produtoId);
            
            Swal.fire({
                title: 'Removido!',
                text: 'O produto foi removido do carrinho.',
                icon: 'success',
                timer: 1500
            });
        }
    });
}

function limparCarrinho() {
    carrinho = [];
    localStorage.removeItem('carrinho');
    atualizarCarrinho();
    atualizarTodosDisplaysEstoque(); // Nova função
}

function gerarTicket(dados) {
    let ticket = `🧁 Novo Pedido - Mila Doces 🧁\n\n`;
    ticket += `📋 Dados do Cliente:\n`;
    ticket += `Nome: ${dados.nome}\n`;
    ticket += `Endereço: ${dados.endereco}\n`;
    if (dados.telefone) ticket += `WhatsApp: ${dados.telefone}\n`;
    if (dados.observacoes) ticket += `Observações: ${dados.observacoes}\n`;

    ticket += `\n🛍️ Itens do Pedido:\n`;

    let total = 0;
    const itensAgrupados = {};

    // Agrupar itens corretamente por ID
    window.carrinho.forEach(item => {
        const produto = encontrarProdutoPorId(item.id);
        if (!produto) return;

        if (!itensAgrupados[item.id]) {
            itensAgrupados[item.id] = {
                nome: produto.nome,
                preco: produto.preco, // Usar o preço do produto atual
                quantidade: 1
            };
        } else {
            itensAgrupados[item.id].quantidade++;
        }
        total += Number(produto.preco); // Adicionar ao total
    });

    // Adicionar itens ao ticket com os valores corretos
    Object.values(itensAgrupados).forEach(item => {
        const subtotal = item.quantidade * item.preco;
        ticket += `• ${item.quantidade}x ${item.nome} - R$ ${subtotal.toFixed(2)}\n`;
    });

    ticket += `\n💰 Total: R$ ${total.toFixed(2)}\n`;
    ticket += `💳 Forma de Pagamento: ${dados.metodoPagamento.toUpperCase()}`;

    return ticket;
}

// Adicionar esta função para atualizar todos os displays de estoque
function atualizarTodosDisplaysEstoque() {
    document.querySelectorAll('.produto').forEach(produtoElement => {
        const produtoId = produtoElement.dataset.produtoId;
        if (produtoId) {
            atualizarDisplayEstoque(produtoId);
        }
    });
}

function encontrarProdutoAtualizado(produtosAtualizados, produtoId) {
    if (!produtosAtualizados) return null;
    
    for (const categoria in produtosAtualizados) {
        const produto = produtosAtualizados[categoria].items.find(p => p.id === produtoId);
        if (produto) return produto;
    }
    return null;
}

async function finalizarCompra() {
    try {
        // Verificar se carrinho está vazio
        if (!window.carrinho || window.carrinho.length === 0) {
            throw new Error('Seu carrinho está vazio!');
        }

        // Verificar disponibilidade real antes de finalizar
        const indisponiveisOuInsuficientes = [];
        const reservas = {};

        // Verificar disponibilidade de todos os itens
        carrinho.forEach(item => {
            if (!reservas[item.id]) {
                reservas[item.id] = 0;
            }
            reservas[item.id] += item.quantidade;

            const produto = encontrarProdutoPorId(item.id);
            if (!produto || produto.estoque < reservas[item.id]) {
                indisponiveisOuInsuficientes.push(item.nome);
            }
        });

        if (indisponiveisOuInsuficientes.length > 0) {
            Swal.fire({
                title: 'Produtos Indisponíveis',
                html: `
                    Desculpe, mas os seguintes produtos não estão mais disponíveis na quantidade desejada:
                    <br><br>
                    ${indisponiveisOuInsuficientes.join('<br>')}
                    <br><br>
                    Por favor, revise seu carrinho.
                `,
                icon: 'error'
            });
            return;
        }

        // Se chegou aqui, a compra foi finalizada com sucesso
        const dadosCompra = {
            // ...existing purchase data...
        };

        // Enviar para WhatsApp
        const ticket = gerarTicket(dadosCompra);
        const whatsappLink = gerarLinkWhatsApp(ticket);
        window.open(whatsappLink, '_blank');

        // Limpar carrinho
        window.carrinho = [];
        localStorage.removeItem('carrinho');
        
        // Atualizar interface
        atualizarCarrinho();
        atualizarVisualProdutos();

        // Mostrar confirmação
        await Swal.fire({
            title: 'Pedido Realizado!',
            text: 'Seu pedido foi enviado com sucesso!',
            icon: 'success',
            confirmButtonText: 'OK'
        });

        // Redirecionar para página inicial
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Erro ao finalizar compra:', error);
        Swal.fire({
            title: 'Erro',
            text: error.message || 'Erro ao finalizar compra',
            icon: 'error'
        });
    }
}

function removerDoCarrinho(produtoId) {
    // Remove o item do carrinho
    window.carrinho = window.carrinho.filter(item => item.id !== produtoId);
    
    // Atualiza localStorage
    localStorage.setItem('carrinho', JSON.stringify(window.carrinho));
    
    // Atualiza interface
    atualizarCarrinho();
    atualizarVisualProdutos();

    // Mostrar feedback
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Produto removido do carrinho',
        showConfirmButton: false,
        timer: 2000
    });
}

// Exportar funções
window.adicionarAoCarrinho = adicionarAoCarrinho;
window.atualizarCarrinho = atualizarCarrinho;
window.alterarQuantidadeCarrinho = alterarQuantidadeCarrinho;
window.limparCarrinho = limparCarrinho;
window.gerarTicket = gerarTicket;
window.confirmarRemocao = confirmarRemocao;
window.atualizarDisplayEstoque = atualizarDisplayEstoque;
window.atualizarTodosDisplaysEstoque = atualizarTodosDisplaysEstoque;
window.removerDoCarrinho = removerDoCarrinho;

// Inicializar carrinho se estiver na página de checkout
if (document.getElementById('lista-carrinho')) {
    document.addEventListener('DOMContentLoaded', () => {
        if (verificarDependencias()) {
            atualizarCarrinho();
            atualizarTodosDisplaysEstoque();
        }
    });
}
