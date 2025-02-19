
// Carregar vendas do localStorage
let vendas = JSON.parse(localStorage.getItem('vendas')) || [];

document.addEventListener('DOMContentLoaded', () => {
    carregarVendas();
    inicializarFiltros();
});

function inicializarFiltros() {
    const filtros = document.querySelectorAll('.filtro-status');
    filtros.forEach(filtro => {
        filtro.addEventListener('click', () => {
            filtros.forEach(f => f.classList.remove('ativo'));
            filtro.classList.add('ativo');
            filtrarVendas(filtro.dataset.status);
        });
    });
}

function filtrarVendas(status = 'todos') {
    const vendasFiltradas = status === 'todos' 
        ? vendas 
        : vendas.filter(v => v.status === status);

    const tbody = document.querySelector('.tabela-vendas tbody');
    if (!tbody) return;

    tbody.innerHTML = vendasFiltradas.map(venda => `
        <tr>
            <td>${new Date(venda.data).toLocaleDateString()}</td>
            <td>${venda.cliente?.nome || 'Venda Direta'}</td>
            <td>R$ ${calcularTotalVenda(venda).toFixed(2)}</td>
            <td>
                ${venda.itens.map(item => 
                    `${item.quantidade}x ${item.nome}`
                ).join(', ')}
            </td>
            <td>
                <span class="status-${venda.status || 'pendente'}">
                    ${venda.status || 'Pendente'}
                </span>
            </td>
            <td>
                <button onclick="alterarStatus('${venda.id}')">Alterar Status</button>
                <button onclick="verDetalhes('${venda.id}')">Ver Detalhes</button>
            </td>
        </tr>
    `).join('');
}

function calcularTotalVenda(venda) {
    return venda.itens.reduce((total, item) => {
        return total + (item.preco * item.quantidade);
    }, 0);
}

function carregarVendas() {
    // Adicionar IDs às vendas se não tiverem
    vendas = vendas.map(venda => ({
        ...venda,
        id: venda.id || Math.random().toString(36).substr(2, 9)
    }));
    
    // Salvar vendas atualizadas
    localStorage.setItem('vendas', JSON.stringify(vendas));
    
    // Mostrar todas as vendas inicialmente
    filtrarVendas('todos');
}

async function alterarStatus(vendaId) {
    const venda = vendas.find(v => v.id === vendaId);
    if (!venda) return;

    const { value: novoStatus } = await Swal.fire({
        title: 'Alterar Status',
        input: 'select',
        inputOptions: {
            'pendente': 'Pendente',
            'preparando': 'Preparando',
            'entregue': 'Entregue',
            'cancelado': 'Cancelado'
        },
        inputValue: venda.status || 'pendente'
    });

    if (novoStatus) {
        venda.status = novoStatus;
        localStorage.setItem('vendas', JSON.stringify(vendas));
        filtrarVendas(document.querySelector('.filtro-status.ativo')?.dataset.status || 'todos');
    }
}

async function verDetalhes(vendaId) {
    const venda = vendas.find(v => v.id === vendaId);
    if (!venda) return;

    const detalhes = `
        Data: ${new Date(venda.data).toLocaleDateString()}
        Cliente: ${venda.cliente?.nome || 'Venda Direta'}
        Telefone: ${venda.cliente?.telefone || 'N/A'}
        Endereço: ${venda.cliente?.endereco || 'N/A'}
        
        Itens:
        ${venda.itens.map(item => 
            `${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2)}`
        ).join('\n')}
        
        Total: R$ ${calcularTotalVenda(venda).toFixed(2)}
        Status: ${venda.status || 'Pendente'}
    `;

    await Swal.fire({
        title: 'Detalhes da Venda',
        html: `<pre style="text-align: left;">${detalhes}</pre>`,
        width: '600px'
    });
}

// Expor funções globalmente
window.filtrarVendas = filtrarVendas;
window.alterarStatus = alterarStatus;
window.verDetalhes = verDetalhes;
