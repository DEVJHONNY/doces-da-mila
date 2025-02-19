// Definir ordem das categorias
const CATEGORIAS_ORDEM = [
    'trufas',
    'mousses',
    'empadas'
];

function renderizarEstoque() {
    const container = document.querySelector('.estoque-grid');
    if (!container) return;

    container.innerHTML = '';
    
    // Renderizar categorias na ordem definida
    CATEGORIAS_ORDEM.forEach(categoriaId => {
        const categoria = PRODUTOS[categoriaId];
        if (!categoria) return;

        const section = document.createElement('div');
        section.className = 'categoria-estoque';
        section.innerHTML = `
            <h2>${categoria.titulo}</h2>
            <div class="produtos-lista">
                ${categoria.items.map(produto => `
                    <div class="produto-estoque ${produto.estoque < 5 ? 'estoque-baixo' : ''}">
                        <div class="produto-info">
                            <h3>${produto.nome}</h3>
                            <p>Preço: R$ ${produto.preco.toFixed(2)}</p>
                            <p>Em estoque: ${produto.estoque}</p>
                        </div>
                        <div class="estoque-controles">
                            <button onclick="alterarEstoque('${produto.id}', -1)">-</button>
                            <input type="number" value="${produto.estoque}" 
                                   id="estoque-${produto.id}"
                                   onchange="atualizarEstoque('${produto.id}', this.value)">
                            <button onclick="alterarEstoque('${produto.id}', 1)">+</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(section);
    });
}

// ...rest of existing code...
