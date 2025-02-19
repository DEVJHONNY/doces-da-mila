// Funções utilitárias globais - definir primeiro
window.mostrarSucesso = function(mensagem) {
    Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: mensagem,
        timer: 2000,
        showConfirmButton: false
    });
};

window.mostrarErro = function(mensagem) {
    Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: mensagem
    });
};

window.alterarQuantidade = function(produtoId, delta) {
    const input = document.getElementById(`quantidade-${produtoId}`);
    if (!input) return;

    const novaQuantidade = Math.max(1, parseInt(input.value) + delta);
    const produto = window.encontrarProdutoPorId(produtoId);
    
    if (produto && novaQuantidade <= produto.estoque) {
        input.value = novaQuantidade;
    }
};

// Estado global
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Funções utilitárias globais
window.formatarMoeda = function(valor) {
    return `R$${valor.toFixed(2)}`;
};

window.formatarQuantidade = function(quantidade, produto) {
    return quantidade === 1 ? 
        `${quantidade} unidade de ${produto}` : 
        `${quantidade} unidades de ${produto}`;
};

// Função para adicionar ao carrinho
async function adicionarAoCarrinho(produtoId) {
    const produto = encontrarProdutoPorId(produtoId);
    if (!produto) {
        console.error('Produto não encontrado:', produtoId);
        return;
    }

    // Validar preço antes de adicionar
    if (!produto.preco || produto.preco <= 0) {
        window.mostrarErro(`Erro: Preço inválido para ${produto.nome}`);
        return;
    }

    const quantidade = parseInt(document.getElementById(`quantidade-${produtoId}`)?.value || 1);
    
    // Verificar estoque
    if (quantidade > produto.estoque) {
        await mostrarErro(`Apenas ${produto.estoque} unidade(s) disponível(is)`);
        return;
    }

    // Adicionar item único com quantidade
    carrinho.push({
        id: produtoId,
        nome: produto.nome,
        preco: Number(produto.preco), // Garantir que é número
        quantidade: quantidade
    });

    // Atualizar estoque
    produto.estoque -= quantidade;
    localStorage.setItem('PRODUTOS', JSON.stringify(PRODUTOS));
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    
    // Atualizar interface
    atualizarCarrinho();
    atualizarVisualProduto(produtoId);
}

// Função para encontrar produto
window.encontrarProdutoPorId = function(produtoId) {
    for (const categoria in PRODUTOS) {
        const produtos = PRODUTOS[categoria].items;
        const produto = produtos.find(p => p.id === produtoId);
        if (produto) return produto;
    }
    return null;
};

function alterarQuantidadeCarrinho(produtoId, delta) {
    const produto = encontrarProdutoPorId(produtoId);
    if (!produto) return;

    const quantidadeNoCarrinho = carrinho.filter(item => item.id === produtoId).length;

    if (delta > 0) {
        // Verificar se há estoque disponível
        if (quantidadeNoCarrinho >= produto.estoque) {
            mostrarErro('Não há mais estoque disponível deste produto');
            return;
        }
    }

    if (delta > 0) {
        carrinho.push({
            id: produtoId,
            nome: produto.nome,
            preco: produto.preco
        });
    } else if (quantidadeNoCarrinho > 0) {
        // Remover um item
        const index = carrinho.findIndex(i => i.id === produtoId);
        if (index !== -1) {
            carrinho.splice(index, 1);
        }
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarCarrinho();
    atualizarVisualProdutos();
}

// Funções Auxiliares
async function confirmarPedido(produto, quantidade, preco) {
    const total = quantidade * preco;
    const result = await Swal.fire({
        title: 'Confirmar Pedido',
        html: `
            <p>Você está comprando:</p>
            <p><strong>${quantidade}x ${produto.nome}</strong></p>
            <p>Total: ${formatarMoeda(total)}</p>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar'
    });
    return result.isConfirmed;
}

function redirecionarParaCheckout(produtoId, quantidade, preco) {
    const params = new URLSearchParams({
        produto: produtoId,
        quantidade: quantidade,
        preco: preco
    });
    window.location.href = `checkout.html?${params.toString()}`;
}

// Função para atualizar o carrinho
function atualizarCarrinho() {
    const listaCarrinho = document.getElementById('lista-carrinho');
    const totalCarrinho = document.getElementById('total-carrinho');
    
    if (!listaCarrinho || !totalCarrinho) return;

    listaCarrinho.innerHTML = '';
    let total = 0;

    // Agrupar itens por ID e somar quantidades
    const itensAgrupados = {};
    carrinho.forEach(item => {
        if (!itensAgrupados[item.id]) {
            itensAgrupados[item.id] = {
                ...item,
                quantidade: 0,
                subtotal: 0
            };
        }
        itensAgrupados[item.id].quantidade += item.quantidade;
        itensAgrupados[item.id].subtotal += Number(item.preco) * item.quantidade;
    });

    // Renderizar itens agrupados
    Object.values(itensAgrupados).forEach(item => {
        const subtotal = item.subtotal;
        total += subtotal;

        const li = document.createElement('li');
        li.innerHTML = `
            <div class="item-carrinho">
                <span class="item-info">${item.nome}</span>
                <div class="quantidade-controle">
                    <button onclick="alterarQuantidadeCarrinho('${item.id}', -1)">-</button>
                    <span class="quantidade">${item.quantidade}</span>
                    <button onclick="alterarQuantidadeCarrinho('${item.id}', 1)">+</button>
                </div>
                <span class="preco">R$${subtotal.toFixed(2)}</span>
            </div>
        `;
        listaCarrinho.appendChild(li);
    });

    totalCarrinho.textContent = total.toFixed(2);
}

// Função para finalizar compra
async function finalizarCompra() {
    if (!carrinho.length) {
        await mostrarErro('Seu carrinho está vazio!');
        return;
    }

    // Verificar disponibilidade real antes de finalizar
    const indisponiveisOuInsuficientes = [];
    const itensPorProduto = {};

    // Agrupar itens do carrinho por produto
    carrinho.forEach(item => {
        if (!itensPorProduto[item.id]) {
            itensPorProduto[item.id] = 0;
        }
        itensPorProduto[item.id]++;
    });

    // Verificar disponibilidade
    for (const [produtoId, quantidade] of Object.entries(itensPorProduto)) {
        const produto = encontrarProdutoPorId(produtoId);
        if (!produto || produto.estoque < quantidade) {
            const item = carrinho.find(i => i.id === produtoId);
            indisponiveisOuInsuficientes.push(item.nome);
        }
    }

    if (indisponiveisOuInsuficientes.length > 0) {
        await Swal.fire({
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

    const metodoPagamento = document.querySelector('input[name="metodo-pagamento"]:checked');
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const endereco = document.getElementById('endereco').value;

    if (!metodoPagamento || !nome || !endereco) {
        await mostrarErro('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    const dados = {
        nome,
        telefone,
        endereco,
        observacoes: document.getElementById('observacoes').value,
        metodoPagamento: metodoPagamento.value,
        itens: carrinho
    };

    // Atualizar estoque após confirmação da venda
    Object.entries(itensPorProduto).forEach(([produtoId, quantidade]) => {
        const produto = encontrarProdutoPorId(produtoId);
        if (produto) {
            produto.estoque -= quantidade;
        }
    });

    // Salvar alterações no estoque
    localStorage.setItem('PRODUTOS', JSON.stringify(PRODUTOS));

    // Gerar e enviar pedido
    const ticket = gerarTicket(dados);
    const whatsappLink = gerarLinkWhatsApp(ticket);
    
    // Registrar venda
    const venda = {
        data: new Date().toISOString(),
        itens: carrinho,
        cliente: {
            nome: dados.nome,
            telefone: dados.telefone,
            endereco: dados.endereco
        },
        total: carrinho.reduce((sum, item) => sum + item.preco, 0),
        metodoPagamento: dados.metodoPagamento
    };

    // Salvar venda no histórico
    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    vendas.push(venda);
    localStorage.setItem('vendas', JSON.stringify(vendas));

    // Mostrar confirmação
    await Swal.fire({
        title: 'Pedido Confirmado!',
        text: 'Seu pedido foi registrado com sucesso!',
        icon: 'success',
        confirmButtonText: 'OK'
    });

    // Abrir WhatsApp
    window.open(whatsappLink, '_blank');

    // Limpar carrinho
    carrinho = [];
    localStorage.removeItem('carrinho');
    
    // Atualizar interface
    atualizarCarrinho();
    atualizarVisualProdutos();
}

// Funções de Ticket e WhatsApp
function gerarTicket(dados) {
    let ticket = `🧁 Novo Pedido - Mila Doces 🧁\n\n`;
    ticket += `📋 Dados do Cliente:\n`;
    ticket += `Nome: ${dados.nome}\n`;
    ticket += `Endereço: ${dados.endereco}\n`;
    if (dados.telefone) ticket += `Telefone: ${dados.telefone}\n`;
    if (dados.observacoes) ticket += `Observações: ${dados.observacoes}\n`;
    
    ticket += `\n🛍️ Itens do Pedido:\n`;
    
    let total = 0;
    // Usar os itens agrupados com preços corretos
    dados.itens.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;
        ticket += `• ${item.quantidade}x ${item.nome} - R$ ${subtotal.toFixed(2)}\n`;
    });

    ticket += `\n💰 Total: R$ ${total.toFixed(2)}\n`;
    ticket += `💳 Forma de Pagamento: ${dados.metodoPagamento}`;

    return ticket;
}

function gerarLinkWhatsApp(mensagem) {
    const numeroWhatsApp = CONFIG.loja.telefone;
    return `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Substituir atualizarExibicaoCarrinho por atualizarCarrinho
    atualizarCarrinho();
    
    // Inicializar estoque
    Object.keys(PRODUTOS).forEach(categoria => {
        PRODUTOS[categoria].items.forEach(produto => {
            EstoqueManager.atualizarExibicao(produto.id);
        });
    });
});

// Exportar funções utilitárias
window.formatarMoeda = formatarMoeda;
window.formatarQuantidade = formatarQuantidade;

// Expor funções necessárias globalmente
window.adicionarAoCarrinho = adicionarAoCarrinho;
window.alterarQuantidadeCarrinho = alterarQuantidadeCarrinho;
window.finalizarCompra = finalizarCompra;
window.gerarTicket = gerarTicket;
window.gerarLinkWhatsApp = gerarLinkWhatsApp;
window.mostrarSucesso = mostrarSucesso;
window.mostrarErro = mostrarErro;

function toggleMenu() {
    const nav = document.querySelector('nav');
    const body = document.body;
    
    nav.classList.toggle('active');
    
    // Adicionar/remover overlay
    if (nav.classList.contains('active')) {
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        overlay.onclick = toggleMenu;
        body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('active'), 50);
    } else {
        const overlay = document.querySelector('.menu-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
    }

    // Prevenir rolagem quando menu está aberto
    body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
}
