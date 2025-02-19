// ==========================================
// CONFIGURAÇÕES INICIAIS
// ==========================================
const QR_CODE_PIX_URL = 'https://i.ibb.co/m558LYPX/Whats-App-Image-2025-02-12-at-08-36-21.jpg';
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// ==========================================
// GERENCIAMENTO DE PRODUTOS
// ==========================================
const PRODUTOS = {
    trufas: [
        { id: 'trufa-chocolate', nome: 'Trufa de Chocolate', preco: 3.00, estoque: 20 },
        { id: 'trufa-morango', nome: 'Trufa de Morango', preco: 3.00, estoque: 15 },
        { id: 'trufa-maracuja', nome: 'Trufa de Maracujá', preco: 3.00, estoque: 15 }
        // ... outros sabores
    ],
    brownies: [
        { id: 'brownie-tradicional', nome: 'Brownie Tradicional', preco: 7.00, estoque: 12 },
        { id: 'brownie-nutella', nome: 'Brownie de Nutella', preco: 8.00, estoque: 10 }
        // ... outros sabores
    ],
    mousses: [
        { id: 'mousse-chocolate', nome: 'Mousse de Chocolate', preco: 6.00, estoque: 8 },
        { id: 'mousse-maracuja', nome: 'Mousse de Maracujá', preco: 6.00, estoque: 8 }
        // ... outros sabores
    ]
};

// ==========================================
// FUNÇÕES DE ESTOQUE
// ==========================================
const EstoqueManager = {
    verificar(produtoId, quantidade) {
        const produto = this.encontrarProduto(produtoId);
        if (!produto) return { disponivel: false, mensagem: "Produto não encontrado" };
        
        if (produto.estoque < quantidade) {
            return {
                disponivel: false,
                mensagem: `Desculpe, temos apenas ${produto.estoque} unidades de ${produto.nome} em estoque.`
            };
        }
        return { disponivel: true };
    },

    encontrarProduto(produtoId) {
        for (const categoria in PRODUTOS) {
            const produto = PRODUTOS[categoria].find(p => p.id === produtoId);
            if (produto) return produto;
        }
        return null;
    },

    atualizar(produtoId, quantidade) {
        const produto = this.encontrarProduto(produtoId);
        if (produto) {
            produto.estoque = quantidade;
            this.atualizarExibicao(produtoId);
        }
    }
};

// ==========================================
// FUNÇÕES DE UTILIDADE
// ==========================================
function formatarMoeda(valor) {
    return `R$${valor.toFixed(2)}`;
}

function formatarQuantidade(quantidade, produto) {
    return quantidade === 1 ? 
        `${quantidade} unidade de ${produto}` : 
        `${quantidade} unidades de ${produto}`;
}

// ==========================================
// FUNÇÕES DE CARRINHO
// ==========================================
function adicionarAoCarrinho(produto, preco, quantidade) {
    quantidade = parseInt(quantidade);
    const verificacao = EstoqueManager.verificar(produto, quantidade);
    
    if (!verificacao.disponivel) {
        mostrarErro(verificacao.mensagem);
        return;
    }

    EstoqueManager.baixar(produto, quantidade);
    
    for (let i = 0; i < quantidade; i++) {
        carrinho.push({ produto, preco });
    }
    
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarCarrinho();
    mostrarPopupSucesso('Produto adicionado ao carrinho!');
}

function alterarQuantidadeCarrinho(produto, preco, delta) {
    const quantidadeAtual = carrinho.filter(item => item.produto === produto).length;
    const novaQuantidade = quantidadeAtual + delta;

    if (novaQuantidade <= 0) {
        carrinho = carrinho.filter(item => item.produto !== produto);
    } else {
        const verificacao = EstoqueManager.verificar(produto, novaQuantidade);
        if (!verificacao.disponivel) {
            mostrarErro(verificacao.mensagem);
            return;
        }

        if (delta > 0) {
            carrinho.push({ produto, preco });
        } else {
            const index = carrinho.findIndex(item => item.produto === produto);
            if (index !== -1) carrinho.splice(index, 1);
        }
    }

    EstoqueManager.atualizar(produto, EstoqueManager.getQuantidade(produto) - delta);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const listaCarrinho = document.getElementById('lista-carrinho');
    const totalCarrinho = document.getElementById('total-carrinho');
    
    if (!listaCarrinho || !totalCarrinho) return;
    
    let total = 0;
    listaCarrinho.innerHTML = '';

    const produtosAgrupados = agruparProdutosCarrinho();
    renderizarProdutosCarrinho(produtosAgrupados, listaCarrinho, total);

    if (listaCarrinho.children.length === 0) {
        listaCarrinho.innerHTML = '<p>Seu carrinho está vazio.</p>';
        totalCarrinho.textContent = '0.00';
    }
}

// ==========================================
// FUNÇÕES DE PAGAMENTO
// ==========================================
function mostrarQRCode() {
    const container = document.getElementById('qr-code');
    if (!container) return;
    
    container.style.display = 'block';
    container.innerHTML = `
        <div class="qr-code-wrapper">
            <h3>📱 Pagamento via PIX</h3>
            <p>Escaneie o QR Code abaixo:</p>
            <img src="${QR_CODE_PIX_URL}" alt="QR Code para pagamento via Pix" style="max-width: 300px;">
            <p class="info">Após o pagamento, envie o comprovante pelo WhatsApp</p>
        </div>
    `;
}

function esconderQRCode() {
    const container = document.getElementById('qr-code');
    if (container) container.style.display = 'none';
}

// ==========================================
// FUNÇÕES DE CHECKOUT
// ==========================================
async function finalizarCompra() {
    const dados = coletarDadosCheckout();
    if (!validarDadosCheckout(dados)) return;

    const ticket = gerarTicket(dados);
    const whatsappLink = gerarLinkWhatsApp(ticket);

    if (await confirmarPedido()) {
        limparCarrinho();
        redirecionarWhatsApp(whatsappLink);
    }
}

function gerarTicket(dados) {
    let ticket = `🍰 Loja de Doces Mila - Novo Pedido! 🍪\n\n`;
    ticket += `👤 Cliente: ${dados.nome}\n`;
    ticket += `🏠 Endereço de Entrega: ${dados.endereco}\n`;
    if (dados.telefone) ticket += `📞 WhatsApp: ${dados.telefone}\n`;
    if (dados.observacoes) ticket += `\n📝 Observações: ${dados.observacoes}\n`;
    ticket += `\n💰 Método de Pagamento: ${dados.metodoPagamento}\n`;
    ticket += `\n📋 Itens do Pedido:\n\n`;

    const produtosAgrupados = agruparProdutosCarrinho();
    Object.values(produtosAgrupados).forEach(item => {
        const quantidadeTexto = formatarQuantidade(item.quantidade, item.produto);
        ticket += `🔸 ${quantidadeTexto} - R$${(item.preco * item.quantidade).toFixed(2)}\n`;
    });

    ticket += `\n📊 Resumo:\nTotal Geral: R$${document.getElementById('total-carrinho').textContent}`;
    return ticket;
}

// ==========================================
// FUNÇÕES DE COMPRA
// ==========================================
async function comprarAgora(produtoId) {
    const quantidade = parseInt(document.getElementById(`quantidade-${produtoId}`).value);
    const produto = EstoqueManager.encontrarProduto(produtoId);
    
    if (!produto) {
        await mostrarErro('Produto não encontrado');
        return;
    }

    const verificacao = EstoqueManager.verificar(produtoId, quantidade);
    if (!verificacao.disponivel) {
        await mostrarErro(verificacao.mensagem);
        return;
    }

    const total = produto.preco * quantidade;
    if (await confirmarCompra(produto, quantidade, total)) {
        EstoqueManager.atualizar(produtoId, produto.estoque - quantidade);
        redirecionarParaCheckout(produtoId, quantidade, produto.preco);
    }
}

// ==========================================
// FUNÇÕES DE INTERFACE
// ==========================================
function mostrarPopupSucesso(mensagem) {
    const popup = document.createElement('div');
    popup.classList.add('popup-sucesso');
    popup.textContent = mensagem;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1500);
}

function mostrarErro(mensagem) {
    Swal.fire({
        title: 'Atenção',
        text: mensagem,
        icon: 'warning',
        confirmButtonColor: '#ff758c'
    });
}

function gerarProdutosHTML(categoria) {
    if (!PRODUTOS[categoria]) return '';
    
    const html = `
        <div class="categoria-titulo">
            <h2>${categoria.charAt(0).toUpperCase() + categoria.slice(1)}</h2>
        </div>
        <div class="produtos-grid">
            ${PRODUTOS[categoria].map(produto => `
                <div class="produto" data-id="${produto.id}">
                    <h3>${produto.nome}</h3>
                    <p class="preco">R$${produto.preco.toFixed(2)}</p>
                    <div class="quantidade-controle">
                        <button onclick="alterarQuantidade('${produto.id}', -1)">-</button>
                        <input type="number" id="quantidade-${produto.id}" value="1" min="1" max="99">
                        <button onclick="alterarQuantidade('${produto.id}', 1)">+</button>
                    </div>
                    <button class="button-comprar" onclick="comprarAgora('${produto.id}')">
                        Comprar
                    </button>
                </div>
            `).join('')}
        </div>
    `;
    return html;
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    atualizarCarrinho();
    Object.keys(EstoqueManager.getEstoque()).forEach(produto => {
        EstoqueManager.atualizarExibicao(produto);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    inicializarPagina();
});

// Exportar funções necessárias globalmente
window.adicionarAoCarrinho = adicionarAoCarrinho;
window.alterarQuantidadeCarrinho = alterarQuantidadeCarrinho;
window.finalizarCompra = finalizarCompra;
window.mostrarQRCode = mostrarQRCode;
window.esconderQRCode = esconderQRCode;
window.comprarAgora = comprarAgora;
window.alterarQuantidade = alterarQuantidade;
window.gerarProdutosHTML = gerarProdutosHTML;
