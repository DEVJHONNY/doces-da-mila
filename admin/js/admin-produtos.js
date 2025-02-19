const AdminProdutos = {
    produtos: null,

    init() {
        this.produtos = JSON.parse(localStorage.getItem('PRODUTOS')) || {};
        this.renderizarProdutos();
        this.setupEventListeners();
    },

    renderizarProdutos() {
        const container = document.querySelector('.produtos-grid');
        if (!container) return;

        container.innerHTML = '';
        Object.entries(this.produtos).forEach(([categoria, dados]) => {
            dados.items.forEach(produto => {
                container.appendChild(this.criarCardProduto(produto, categoria));
            });
        });
    },

    criarCardProduto(produto, categoria) {
        const card = document.createElement('div');
        card.className = `produto-card ${produto.status === 'inativo' ? 'inativo' : ''}`;
        card.innerHTML = `
            <div class="produto-info">
                <h3>${produto.nome}</h3>
                <p class="categoria">${categoria}</p>
                <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
                <p class="estoque">Estoque: ${produto.estoque}</p>
                <p class="status">Status: ${produto.status || 'ativo'}</p>
            </div>
            <div class="card-actions">
                <button onclick="AdminProdutos.editarProduto('${produto.id}', '${categoria}')" class="btn-editar">
                    ✏️ Editar
                </button>
                <button onclick="AdminProdutos.toggleStatus('${produto.id}', '${categoria}')" class="btn-toggle">
                    ${produto.status === 'inativo' ? '🟢 Ativar' : '🔴 Desativar'}
                </button>
                <button onclick="AdminProdutos.confirmarRemocao('${produto.id}', '${categoria}')" class="btn-remover">
                    🗑️ Remover
                </button>
            </div>
        `;
        return card;
    },

    async toggleStatus(produtoId, categoria) {
        const produto = this.produtos[categoria].items.find(p => p.id === produtoId);
        if (!produto) return;

        produto.status = produto.status === 'inativo' ? 'ativo' : 'inativo';
        this.salvarProdutos();
        this.renderizarProdutos();

        await Swal.fire({
            icon: 'success',
            title: `Produto ${produto.status === 'ativo' ? 'ativado' : 'desativado'}!`,
            text: produto.nome,
            timer: 1500,
            showConfirmButton: false
        });
    },

    async confirmarRemocao(produtoId, categoria) {
        const result = await Swal.fire({
            title: 'Confirmar remoção',
            text: "Esta ação não pode ser desfeita!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff758c',
            cancelButtonColor: '#666',
            confirmButtonText: 'Sim, remover!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            this.removerProduto(produtoId, categoria);
        }
    },

    removerProduto(produtoId, categoria) {
        this.produtos[categoria].items = this.produtos[categoria].items.filter(p => p.id !== produtoId);
        this.salvarProdutos();
        this.renderizarProdutos();

        Swal.fire({
            icon: 'success',
            title: 'Produto removido!',
            showConfirmButton: false,
            timer: 1500
        });
    },

    editarProduto(produtoId, categoria) {
        const produto = this.produtos[categoria].items.find(p => p.id === produtoId);
        if (!produto) return;

        document.getElementById('nome').value = produto.nome;
        document.getElementById('categoria').value = categoria;
        document.getElementById('preco').value = produto.preco;
        document.getElementById('estoque').value = produto.estoque;
        document.getElementById('descricao').value = produto.descricao || '';
        
        const statusInputs = document.getElementsByName('status');
        for (let input of statusInputs) {
            if (input.value === (produto.status || 'ativo')) {
                input.checked = true;
            }
        }

        document.getElementById('produto-id').value = produtoId;
        document.getElementById('modal-produto').style.display = 'block';
    },

    salvarProdutos() {
        localStorage.setItem('PRODUTOS', JSON.stringify(this.produtos));
        this.atualizarLoja();
    },

    atualizarLoja() {
        // Disparar evento para atualizar a loja
        window.dispatchEvent(new Event('produtosAtualizados'));
    },

    setupEventListeners() {
        document.getElementById('form-produto').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarFormulario(e.target);
        });
    },

    async salvarFormulario(form) {
        const produtoId = form.querySelector('#produto-id').value;
        const categoria = form.querySelector('#categoria').value;
        
        const novoProduto = {
            id: produtoId || `${categoria}-${Date.now()}`,
            nome: form.querySelector('#nome').value,
            preco: parseFloat(form.querySelector('#preco').value),
            estoque: parseInt(form.querySelector('#estoque').value),
            descricao: form.querySelector('#descricao').value,
            status: form.querySelector('input[name="status"]:checked').value
        };

        if (!this.produtos[categoria]) {
            this.produtos[categoria] = { items: [] };
        }

        if (produtoId) {
            // Atualizar produto existente
            const index = this.produtos[categoria].items.findIndex(p => p.id === produtoId);
            if (index !== -1) {
                this.produtos[categoria].items[index] = novoProduto;
            }
        } else {
            // Adicionar novo produto
            this.produtos[categoria].items.push(novoProduto);
        }

        this.salvarProdutos();
        this.renderizarProdutos();
        document.getElementById('modal-produto').style.display = 'none';
        form.reset();

        await Swal.fire({
            icon: 'success',
            title: 'Produto salvo com sucesso!',
            showConfirmButton: false,
            timer: 1500
        });
    }
};

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    AdminProdutos.init();
});

// Expor funções necessárias globalmente
window.AdminProdutos = AdminProdutos;
