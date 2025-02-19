document.addEventListener('DOMContentLoaded', () => {
    const estoqueGrid = document.querySelector('.estoque-grid');
    if (!estoqueGrid) return;

    Object.keys(PRODUTOS).forEach(categoria => {
        const categoriaDiv = document.createElement('div');
        categoriaDiv.classList.add('categoria-estoque');
        
        categoriaDiv.innerHTML = `
            <h2>${PRODUTOS[categoria].titulo}</h2>
            <div class="produtos-lista">
                ${PRODUTOS[categoria].items.map(produto => renderizarProduto(produto)).join('')}
            </div>
        `;
        
        estoqueGrid.appendChild(categoriaDiv);
    });
});

function ajustarEstoque(produtoId, delta) {
    const input = document.getElementById(`input-${produtoId}`);
    const novoValor = parseInt(input.value) + delta;
    if (novoValor >= 0) {
        atualizarEstoque(produtoId, novoValor);
    }
}

function atualizarEstoque(produtoId, novoValor) {
    novoValor = parseInt(novoValor);
    if (novoValor < 0) return;

    // Encontrar e atualizar o produto
    for (const categoria in PRODUTOS) {
        const produto = PRODUTOS[categoria].items.find(p => p.id === produtoId);
        if (produto) {
            produto.estoque = novoValor;
            
            // Salvar no localStorage
            localStorage.setItem('PRODUTOS', JSON.stringify(PRODUTOS));
            
            // Atualizar display
            document.getElementById(`estoque-${produtoId}`).textContent = novoValor;
            
            // Disparar evento para sincronizar com a loja
            window.dispatchEvent(new CustomEvent('estoqueAtualizado', {
                detail: {
                    produtoId,
                    novoEstoque: novoValor,
                    timestamp: Date.now()
                }
            }));

            // Propagar atualização para todas as janelas
            localStorage.setItem('ultimaAtualizacaoEstoque', JSON.stringify({
                produtoId,
                novoEstoque: novoValor,
                timestamp: Date.now()
            }));

            // Feedback visual
            Swal.fire({
                title: 'Estoque Atualizado!',
                text: `${produto.nome}: ${novoValor} unidades`,
                icon: 'success',
                timer: 1500
            });
            
            break;
        }
    }
}

function renderizarProduto(produto) {
    return `
        <div class="produto-estoque ${produto.estoque < 5 ? 'estoque-baixo' : ''}">
            <div class="produto-info">
                <h3>${produto.nome}</h3>
                <div class="preco-container">
                    <label>Preço: R$ </label>
                    <input type="number" 
                           class="preco-input" 
                           value="${produto.preco.toFixed(2)}" 
                           step="0.50" 
                           min="0"
                           onchange="atualizarPrecoProduto('${produto.id}', this.value)">
                </div>
                <p>Em estoque: <span id="estoque-${produto.id}">${produto.estoque}</span></p>
            </div>
            <div class="estoque-controles">
                <button onclick="ajustarEstoque('${produto.id}', -1)">-</button>
                <input type="number" value="${produto.estoque}" 
                       id="input-${produto.id}" 
                       onchange="atualizarEstoque('${produto.id}', this.value)">
                <button onclick="ajustarEstoque('${produto.id}', 1)">+</button>
            </div>
        </div>
    `;
}

function atualizarPrecoProduto(produtoId, novoPreco) {
    novoPreco = parseFloat(novoPreco);
    if (isNaN(novoPreco) || novoPreco < 0) {
        alert('Preço inválido');
        return;
    }

    // Encontrar e atualizar o produto
    for (const categoria in PRODUTOS) {
        const produto = PRODUTOS[categoria].items.find(p => p.id === produtoId);
        if (produto) {
            produto.preco = novoPreco;
            
            // Atualizar localStorage
            localStorage.setItem('PRODUTOS', JSON.stringify(PRODUTOS));
            
            // Notificar mudança
            window.dispatchEvent(new Event('produtosAtualizados'));
            
            // Mostrar confirmação
            Swal.fire({
                title: 'Preço Atualizado!',
                text: `${produto.nome}: R$ ${novoPreco.toFixed(2)}`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            
            break;
        }
    }
}

// Adicionar listener para atualizações
window.addEventListener('produtosAtualizados', () => {
    // Recarregar produtos em todas as páginas
    if (window.atualizarCatalogo) {
        window.atualizarCatalogo();
    }
    if (window.preencherSelectProdutos) {
        window.preencherSelectProdutos();
    }
});
