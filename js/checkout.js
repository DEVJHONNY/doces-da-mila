function mostrarOpcoesPix() {
    const pixOptions = document.getElementById('pix-options');
    if (!pixOptions) return;

    pixOptions.innerHTML = `
        <div class="qr-code-container">
            <h3>📱 Pagamento via PIX</h3>
            
            <!-- QR Code -->
            <div class="qr-code-wrapper">
                <img src="${CONFIG.pagamento.pix.qrCodeUrl}" alt="QR Code PIX">
                <p class="instrucao">Escaneie o QR Code com o app do seu banco</p>
            </div>

            <!-- Chave PIX para copiar -->
            <div class="pix-key-wrapper">
                <p>Ou copie a chave PIX:</p>
                <div class="pix-key-box">
                    <input type="text" 
                           value="${CONFIG.pagamento.pix.chave}" 
                           readonly 
                           id="pix-key-input">
                    <button onclick="copiarChavePix()" class="copy-button">
                        📋 Copiar
                    </button>
                </div>
            </div>

            <!-- Informações da conta -->
            <div class="pix-info">
                <p><strong>Banco:</strong> ${CONFIG.pagamento.pix.banco}</p>
                <p><strong>Nome:</strong> ${CONFIG.pagamento.pix.nome}</p>
            </div>
        </div>
    `;
    
    pixOptions.style.display = 'block';
}

function ocultarOpcoesPix() {
    const pixOptions = document.getElementById('pix-options');
    if (pixOptions) {
        pixOptions.style.display = 'none';
    }
}

function copiarChavePix() {
    const input = document.getElementById('pix-key-input');
    if (!input) return;

    input.select();
    document.execCommand('copy');

    // Mostrar feedback
    Swal.fire({
        title: 'Chave PIX copiada!',
        text: 'Cole a chave no app do seu banco para fazer o pagamento',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}

// Função para processar o pagamento
function processarPagamento(metodoPagamento) {
    if (metodoPagamento === 'pix') {
        mostrarOpcoesPix();
    } else {
        ocultarOpcoesPix();
    }
}

// Garantir que as funções estão disponíveis globalmente
window.mostrarOpcoesPix = mostrarOpcoesPix;
window.ocultarOpcoesPix = ocultarOpcoesPix;
window.copiarChavePix = copiarChavePix;
window.processarPagamento = processarPagamento;

// Funções de utilidade para mensagens
function mostrarErro(mensagem) {
    Swal.fire({
        title: 'Erro',
        text: mensagem,
        icon: 'error',
        confirmButtonColor: '#ff758c'
    });
}

function mostrarSucesso(mensagem) {
    Swal.fire({
        title: 'Sucesso',
        text: mensagem,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}

// Funções auxiliares de checkout
function coletarDadosCheckout() {
    return {
        nome: document.getElementById('nome').value.trim(),
        endereco: document.getElementById('endereco').value.trim(),
        telefone: document.getElementById('telefone')?.value.trim(),
        observacoes: document.getElementById('observacoes')?.value.trim(),
        metodoPagamento: document.querySelector('input[name="metodo-pagamento"]:checked')?.value
    };
}

function confirmarPedido(ticket) {
    return Swal.fire({
        title: 'Confirmar Pedido',
        html: `Deseja confirmar seu pedido?<br><br>${ticket.replace(/\n/g, '<br>')}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ff758c',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
    }).then(result => result.isConfirmed);
}

async function processarPedido(dados) {
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
}

function limparCarrinho() {
    carrinho = [];
    localStorage.removeItem('carrinho');
    atualizarCarrinho();
    mostrarSucesso('Pedido realizado com sucesso!');
}

function redirecionarWhatsApp(ticket) {
    const texto = encodeURIComponent(ticket);
    const numeroWhatsApp = CONFIG.loja.whatsapp;
    window.open(`https://wa.me/${numeroWhatsApp}?text=${texto}`, '_blank');
}

function validarFormulario() {
    const nome = document.getElementById('nome').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const metodoPagamento = document.querySelector('input[name="metodo-pagamento"]:checked');

    if (!nome) {
        mostrarErro('Por favor, preencha seu nome');
        return false;
    }

    if (!endereco) {
        mostrarErro('Por favor, preencha seu endereço');
        return false;
    }

    if (!metodoPagamento) {
        mostrarErro('Por favor, selecione um método de pagamento');
        return false;
    }

    return true;
}

async function finalizarCompra() {
    if (!validarFormulario()) return;
    
    try {
        const dados = coletarDadosCheckout();
        const ticket = gerarTicket(dados);
        
        // Verificar se há itens no carrinho
        if (!carrinho || carrinho.length === 0) {
            throw new Error('Seu carrinho está vazio');
        }

        const confirmacao = await confirmarPedido(ticket);
        if (confirmacao) {
            await processarPedido(dados);
            limparCarrinho();
            redirecionarWhatsApp(ticket);
        }
    } catch (erro) {
        console.error(erro);
        mostrarErro('Ocorreu um erro ao finalizar seu pedido. Por favor, tente novamente.');
    }
}

function gerarTicket(dados) {
    let ticket = `🧁 Novo Pedido - Mila Doces 🧁\n\n`;
    ticket += `📋 Dados do Cliente:\n`;
    ticket += `Nome: ${dados.nome}\n`;
    ticket += `Endereço: ${dados.endereco}\n`;
    if (dados.telefone) ticket += `WhatsApp: ${dados.telefone}\n`;
    if (dados.observacoes) ticket += `\nObservações: ${dados.observacoes}\n`;
    
    ticket += `\n🛍️ Itens do Pedido:\n`;
    
    // Agrupar itens por ID
    const itensAgrupados = {};
    carrinho.forEach(item => {
        if (!itensAgrupados[item.id]) {
            itensAgrupados[item.id] = {
                nome: item.nome,
                preco: item.preco,
                quantidade: 1
            };
        } else {
            itensAgrupados[item.id].quantidade++;
        }
    });

    let total = 0;
    // Adicionar cada item ao ticket
    Object.entries(itensAgrupados).forEach(([id, item]) => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;
        ticket += `• ${item.quantidade}x ${item.nome} - R$ ${subtotal.toFixed(2)}\n`;
    });

    ticket += `\n💰 Total: R$ ${total.toFixed(2)}\n`;
    ticket += `💳 Forma de Pagamento: ${dados.metodoPagamento.toUpperCase()}`;

    return ticket;
}

document.addEventListener('DOMContentLoaded', () => {
    // Verificar estoque antes de finalizar
    document.querySelector('form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Verificar estoque de todos os itens
        const erros = [];
        for (const item of carrinho) {
            const verificacao = window.EstoqueController.verificarDisponibilidade(
                item.id,
                carrinho.filter(i => i.id === item.id).length
            );
            
            if (!verificacao.disponivel) {
                erros.push(`${item.nome}: ${verificacao.mensagem}`);
            }
        }

        if (erros.length > 0) {
            window.mostrarErro(
                'Alguns produtos não estão mais disponíveis:\n' + 
                erros.join('\n')
            );
            return;
        }

        // Continuar com o checkout
        // ...resto do código de finalização
    });
});
