// Verificar autenticação
if (!sessionStorage.getItem('adminLogado')) {
    window.location.href = 'login.html';
}

// Funções e variáveis globais
window.vendas = JSON.parse(localStorage.getItem('vendas')) || [];
window.vendasChart = null;
window.produtosChart = null;

// Expor funções principais globalmente
window.logout = function() {
    if (confirm('Deseja realmente sair?')) {
        sessionStorage.removeItem('adminLogado');
        window.location.href = 'login.html';
    }
};

window.atualizarDashboard = async function(periodo = 'hoje') {
    try {
        // Verificar se Chart.js está disponível
        if (typeof Chart === 'undefined') {
            throw new Error('Chart.js não está disponível');
        }
        
        const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
        const agora = new Date();
        let dataInicial = new Date();
        let dataFinal = new Date(agora);

        // Ajuste do período
        switch(periodo) {
            case 'semana':
                dataInicial.setDate(agora.getDate() - 7);
                break;
            case 'mes':
                dataInicial.setMonth(agora.getMonth() - 1);
                break;
            case 'hoje':
                dataInicial.setHours(0, 0, 0, 0);
                dataFinal.setHours(23, 59, 59, 999);
                break;
        }

        // Filtrar vendas do período
        const vendasPeriodo = vendas.filter(venda => {
            const dataVenda = new Date(venda.data);
            return dataVenda >= dataInicial && dataVenda <= dataFinal;
        });

        // Calcular totais
        let totalVendas = 0;
        let totalProdutos = 0;

        vendasPeriodo.forEach(venda => {
            if (venda.itens && Array.isArray(venda.itens)) {
                venda.itens.forEach(item => {
                    totalVendas += item.preco * item.quantidade;
                    totalProdutos += item.quantidade;
                });
            }
        });

        // Calcular período anterior para comparação
        const periodoAnteriorTotal = calcularTotalPeriodoAnterior(periodo);
        const variacao = calcularVariacao(totalVendas, periodoAnteriorTotal);
        const ticketMedio = vendasPeriodo.length > 0 ? totalVendas / vendasPeriodo.length : 0;

        // Atualizar elementos do DOM
        document.getElementById('vendas-totais').textContent = totalVendas.toFixed(2);
        document.getElementById('total-pedidos').textContent = vendasPeriodo.length;
        document.getElementById('ticket-medio').textContent = ticketMedio.toFixed(2);
        document.getElementById('produtos-vendidos').textContent = totalProdutos;

        // Atualizar comparação
        const comparacaoEl = document.getElementById('vendas-comparacao');
        if (comparacaoEl) {
            comparacaoEl.textContent = `${variacao > 0 ? '+' : ''}${variacao}% que ${periodo === 'hoje' ? 'ontem' : 'período anterior'}`;
            comparacaoEl.style.color = variacao >= 0 ? '#28a745' : '#dc3545';
        }

        // Atualizar gráficos
        await atualizarGraficos(periodo, vendasPeriodo);

    } catch (error) {
        console.error('Erro ao atualizar dashboard:', error);
        Swal.fire('Erro', 'Falha ao atualizar dashboard', 'error');
    }
};

window.atualizarIndicadores = function() {
    const hoje = new Date();
    const vendasHoje = vendas.filter(v => new Date(v.data).toDateString() === hoje.toDateString());
    
    // Verificar se os elementos existem antes de atualizar
    const vendasTotaisEl = document.getElementById('vendas-totais');
    const totalPedidosEl = document.getElementById('total-pedidos');
    const ticketMedioEl = document.getElementById('ticket-medio');
    const produtosVendidosEl = document.getElementById('produtos-vendidos');

    if (vendasTotaisEl) {
        vendasTotaisEl.textContent = calcularTotalVendas(vendasHoje).toFixed(2);
    }
    
    if (totalPedidosEl) {
        totalPedidosEl.textContent = vendasHoje.length;
    }
    
    if (ticketMedioEl) {
        ticketMedioEl.textContent = 
            (vendasHoje.length ? calcularTotalVendas(vendasHoje) / vendasHoje.length : 0).toFixed(2);
    }
    
    if (produtosVendidosEl) {
        produtosVendidosEl.textContent = 
            vendasHoje.reduce((total, venda) => {
                return total + venda.itens?.reduce((sum, item) => sum + item.quantidade, 0) || 0;
            }, 0);
    }
};

function inicializarProdutos() {
    // Carregar produtos do localStorage se existirem
    const produtosStorage = localStorage.getItem('PRODUTOS');
    if (produtosStorage) {
        window.PRODUTOS = JSON.parse(produtosStorage);
    } else if (!window.PRODUTOS) {
        // Produtos padrão se não existirem
        window.PRODUTOS = {
            trufas: {
                titulo: "Trufas",
                items: [
                    {
                        id: 'trufa-chocolate',
                        nome: 'Trufa de Chocolate',
                        preco: 3.00,
                        estoque: 20
                    },
                    {
                        id: 'trufa-morango',
                        nome: 'Trufa de Morango',
                        preco: 3.00,
                        estoque: 15
                    }
                ]
            },
            brownies: {
                titulo: "Brownies",
                items: [
                    {
                        id: 'brownie-tradicional',
                        nome: 'Brownie Tradicional',
                        preco: 7.00,
                        estoque: 12
                    }
                ]
            },
            mousses: {
                titulo: "Mousses",
                items: [
                    {
                        id: 'mousse-chocolate',
                        nome: 'Mousse de Chocolate',
                        preco: 6.00,
                        estoque: 8
                    }
                ]
            }
        };
        localStorage.setItem('PRODUTOS', JSON.stringify(window.PRODUTOS));
    }
}

window.preencherSelectProdutos = function() {
    inicializarProdutos(); // Garantir que os produtos estejam carregados
    
    const select = document.getElementById('produto-venda');
    if (!select) return;

    // Limpar opções existentes
    select.innerHTML = '<option value="">Selecione um produto</option>';

    // Adicionar produtos por categoria
    Object.entries(window.PRODUTOS).forEach(([categoria, dados]) => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = dados.titulo;

        dados.items.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto.id;
            option.textContent = `${produto.nome} - R$ ${produto.preco.toFixed(2)}`;
            option.dataset.preco = produto.preco;
            option.dataset.estoque = produto.estoque;
            optgroup.appendChild(option);
        });

        select.appendChild(optgroup);
    });

    // Atualizar valores ao selecionar produto
    select.addEventListener('change', atualizarValoresVenda);
};

function atualizarValoresVenda() {
    const select = document.getElementById('produto-venda');
    const option = select.options[select.selectedIndex];
    const quantidadeInput = document.getElementById('quantidade-venda');
    const valorInput = document.getElementById('valor-venda');
    const estoqueSpan = document.getElementById('estoque-disponivel');

    if (option.value) {
        const preco = parseFloat(option.dataset.preco);
        const estoque = parseInt(option.dataset.estoque);
        const quantidade = parseInt(quantidadeInput.value) || 1;

        valorInput.value = (preco * quantidade).toFixed(2);
        estoqueSpan.textContent = estoque;
        quantidadeInput.max = estoque;
    } else {
        valorInput.value = '';
        estoqueSpan.textContent = '-';
    }
}

// Inicialização quando documento carrega
document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('adminLogado')) {
        window.location.replace('login.html');
        return;
    }

    try {
        inicializarProdutos();
        window.preencherSelectProdutos();
        
        // Inicializar dashboard e gráficos apenas uma vez
        setTimeout(() => {
            inicializarDashboard();
            inicializarGraficos();
        }, 100);

        // Configurar formulário
        const formVendaManual = document.getElementById('form-venda-manual');
        if (formVendaManual) {
            formVendaManual.addEventListener('submit', registrarVendaManual);
        }

        // Configurar seletor de período
        const periodoSelect = document.getElementById('periodo');
        if (periodoSelect) {
            periodoSelect.addEventListener('change', (e) => atualizarDashboard(e.target.value));
        }

    } catch (error) {
        console.error('Erro na inicialização:', error);
        Swal.fire('Erro', 'Falha ao inicializar dashboard', 'error');
    }

    // Atualizar interface após cada mudança
    window.addEventListener('produtoAtualizado', () => {
        carregarGerenciamentoProdutos(document.querySelector('.content-body'));
        atualizarAlertasEstoque();
    });

    window.addEventListener('estoqueAtualizado', () => {
        carregarControleEstoque(document.querySelector('.content-body'));
        atualizarAlertasEstoque();
    });

    // Adicionar delegação de eventos para botões de ajuste
    document.body.addEventListener('click', (e) => {
        const btnAdjust = e.target.closest('.btn-adjust');
        if (btnAdjust) {
            const produtoId = btnAdjust.closest('tr').dataset.produtoId;
            if (produtoId) {
                ajustarEstoque(produtoId);
            }
        }
    });
});

function inicializarDashboard() {
    console.log('Inicializando dashboard...');
    atualizarIndicadores();
    return atualizarGraficos()
        .catch(error => {
            console.error('Erro ao inicializar gráficos:', error);
            // Tentar novamente após um breve delay
            return new Promise(resolve => {
                setTimeout(async () => {
                    try {
                        await atualizarGraficos();
                        resolve();
                    } catch (err) {
                        console.error('Erro na segunda tentativa:', err);
                        throw err;
                    }
                }, 2000);
            });
        });
}

function calcularTotalPeriodoAnterior(periodo) {
    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    const agora = new Date();
    let dataInicial, dataFinal;

    switch(periodo) {
        case 'hoje':
            dataFinal = new Date(agora);
            dataFinal.setDate(agora.getDate() - 1);
            dataFinal.setHours(23, 59, 59, 999);
            dataInicial = new Date(dataFinal);
            dataInicial.setHours(0, 0, 0, 0);
            break;
        case 'semana':
            dataFinal = new Date(agora);
            dataFinal.setDate(agora.getDate() - 7);
            dataInicial = new Date(dataFinal);
            dataInicial.setDate(dataFinal.getDate() - 7);
            break;
        case 'mes':
            dataFinal = new Date(agora);
            dataFinal.setMonth(agora.getMonth() - 1);
            dataInicial = new Date(dataFinal);
            dataInicial.setMonth(dataFinal.getMonth() - 1);
            break;
    }

    const vendasPeriodoAnterior = vendas.filter(venda => {
        const dataVenda = new Date(venda.data);
        return dataVenda >= dataInicial && dataVenda <= dataFinal;
    });

    let total = 0;
    vendasPeriodoAnterior.forEach(venda => {
        if (venda.itens && Array.isArray(venda.itens)) {
            venda.itens.forEach(item => {
                total += item.preco * item.quantidade;
            });
        }
    });

    return total;
}

function calcularVariacao(atual, anterior) {
    if (anterior === 0) return atual > 0 ? 100 : 0;
    return Math.round(((atual - anterior) / anterior) * 100);
}

function calcularPeriodoAnterior(periodo) {
    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    const hoje = new Date();
    let dataInicial, dataFinal;

    switch(periodo) {
        case 'hoje':
            dataFinal = new Date(hoje);
            dataFinal.setDate(hoje.getDate() - 1);
            dataInicial = new Date(dataFinal);
            break;
        case 'semana':
            dataFinal = new Date(hoje);
            dataFinal.setDate(hoje.getDate() - 7);
            dataInicial = new Date(dataFinal);
            dataInicial.setDate(dataFinal.getDate() - 7);
            break;
        case 'mes':
            dataFinal = new Date(hoje);
            dataFinal.setMonth(hoje.getMonth() - 1);
            dataInicial = new Date(dataFinal);
            dataInicial.setMonth(dataFinal.getMonth() - 1);
            break;
    }

    const vendasPeriodoAnterior = vendas.filter(v => {
        const dataVenda = new Date(v.data);
        return dataVenda >= dataInicial && dataVenda <= dataFinal;
    });

    return vendasPeriodoAnterior.reduce((sum, venda) => sum + (venda.total || 0), 0);
}

function calcularComparacao(atual, anterior) {
    if (anterior === 0) return atual > 0 ? 100 : 0;
    return Math.round(((atual - anterior) / anterior) * 100);
}

function inicializarGraficos() {
    // Destruir gráficos existentes
    if (window.vendasChart) {
        window.vendasChart.destroy();
        window.vendasChart = null;
    }
    if (window.produtosChart) {
        window.produtosChart.destroy();
        window.produtosChart = null;
    }

    const ctxVendas = document.getElementById('vendasChart')?.getContext('2d');
    const ctxProdutos = document.getElementById('produtosChart')?.getContext('2d');

    if (!ctxVendas || !ctxProdutos) return;

    window.vendasChart = new Chart(ctxVendas, {
        type: 'line',
        data: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Vendas Diárias',
                data: calcularVendasPorDia(),
                borderColor: '#ff758c',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    window.produtosChart = new Chart(ctxProdutos, {
        type: 'doughnut',
        data: {
            labels: ['Trufas', 'Brownies', 'Mousses'],
            datasets: [{
                data: calcularVendasPorCategoria(),
                backgroundColor: ['#ff758c', '#ffd3b6', '#ffaaa5']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

async function atualizarGraficos(periodo = 'hoje') {
    if (typeof Chart === 'undefined') {
        throw new Error('Chart.js não está disponível');
    }

    try {
        const ctxVendas = document.getElementById('vendasChart');
        const ctxProdutos = document.getElementById('produtosChart');

        if (!ctxVendas || !ctxProdutos) {
            throw new Error('Canvas dos gráficos não encontrados');
        }

        // Destruir gráficos existentes
        if (window.vendasChart instanceof Chart) {
            window.vendasChart.destroy();
        }
        if (window.produtosChart instanceof Chart) {
            window.produtosChart.destroy();
        }

        // Preparar dados
        const dadosVendas = calcularVendasPorDia();
        const dadosProdutos = calcularVendasPorCategoria();

        // Criar novos gráficos
        window.vendasChart = new Chart(ctxVendas, {
            type: 'line',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Vendas Diárias',
                    data: dadosVendas,
                    borderColor: '#ff758c',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        window.produtosChart = new Chart(ctxProdutos, {
            type: 'doughnut',
            data: {
                labels: ['Trufas', 'Brownies', 'Mousses'],
                datasets: [{
                    data: dadosProdutos,
                    backgroundColor: ['#ff758c', '#ffd3b6', '#ffaaa5']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

    } catch (error) {
        console.error('Erro ao criar gráficos:', error);
        throw error;
    }
}

function registrarVendaManual(e) {
    e.preventDefault();
    
    try {
        const produtoSelect = document.getElementById('produto-venda');
        const quantidadeInput = document.getElementById('quantidade-venda');
        const valorInput = document.getElementById('valor-venda');
        const dataInput = document.getElementById('data-venda');

        // Validações
        if (!produtoSelect.value || !quantidadeInput.value || !valorInput.value || !dataInput.value) {
            throw new Error('Todos os campos são obrigatórios');
        }

        const quantidade = parseInt(quantidadeInput.value);
        const valor = parseFloat(valorInput.value);
        const data = dataInput.value;

        // Validar quantidade e valor
        if (quantidade <= 0 || valor <= 0) {
            throw new Error('Quantidade e valor devem ser maiores que zero');
        }

        // Buscar produto
        let produtoEncontrado;
        for (const categoria in window.PRODUTOS) {
            const produto = window.PRODUTOS[categoria].items.find(p => p.id === produtoSelect.value);
            if (produto) {
                produtoEncontrado = produto;
                break;
            }
        }

        if (!produtoEncontrado) {
            throw new Error('Produto não encontrado');
        }

        // Verificar estoque
        if (produtoEncontrado.estoque < quantidade) {
            throw new Error('Quantidade maior que o estoque disponível');
        }

        // Criar venda
        const venda = {
            id: `venda_${Date.now()}`,
            data: data,
            itens: [{
                id: produtoEncontrado.id,
                nome: produtoEncontrado.nome,
                quantidade: quantidade,
                preco: valor / quantidade
            }],
            total: valor,
            status: 'concluido',
            timestamp: new Date().toISOString()
        };

        // Atualizar estoque
        produtoEncontrado.estoque -= quantidade;
        localStorage.setItem('PRODUTOS', JSON.stringify(window.PRODUTOS));

        // Salvar venda
        const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
        vendas.push(venda);
        localStorage.setItem('vendas', JSON.stringify(vendas));

        // Atualizar interface
        window.atualizarDashboard('hoje');

        // Limpar formulário
        e.target.reset();
        valorInput.value = '';
        document.getElementById('estoque-disponivel').textContent = '-';

        // Mostrar sucesso
        Swal.fire({
            title: 'Venda Registrada!',
            text: `${quantidade}x ${produtoEncontrado.nome}`,
            icon: 'success',
            timer: 2000
        });

    } catch (error) {
        console.error('Erro ao registrar venda:', error);
        Swal.fire('Erro', error.message, 'error');
    }
}

// Funções auxiliares
function calcularTotalVendas(vendasArray) {
    return vendasArray.reduce((total, venda) => total + venda.valor, 0);
}

function calcularVendasPorDia() {
    const ultimos7Dias = [];
    const hoje = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const vendasDoDia = vendas.filter(v => 
            new Date(v.data).toDateString() === data.toDateString()
        );
        const totalDoDia = vendasDoDia.reduce((sum, v) => sum + v.total, 0);
        ultimos7Dias.push(totalDoDia);
    }
    
    return ultimos7Dias;
}

function calcularVendasPorCategoria() {
    const totais = {
        trufas: 0,
        brownies: 0,
        mousses: 0
    };

    vendas.forEach(venda => {
        if (venda.itens && Array.isArray(venda.itens)) {
            venda.itens.forEach(item => {
                const categoria = getCategoriaItem(item.id);
                if (totais.hasOwnProperty(categoria.toLowerCase())) {
                    totais[categoria.toLowerCase()] += item.preco * item.quantidade;
                }
            });
        }
    });

    return Object.values(totais);
}

function calcularVendasPeriodo(periodo) {
    const labels = [];
    const valores = [];
    const hoje = new Date();
    let dias = 7; // padrão para semana

    switch(periodo) {
        case 'hoje':
            dias = 24; // horas do dia
            for (let i = 0; i < dias; i++) {
                labels.push(`${i}h`);
                valores.push(calcularVendasHora(i));
            }
            break;
        case 'mes':
            dias = 30;
            for (let i = dias - 1; i >= 0; i--) {
                const data = new Date(hoje);
                data.setDate(data.getDate() - i);
                labels.push(data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
                valores.push(calcularVendasDia(data));
            }
            break;
        default: // semana
            for (let i = 6; i >= 0; i--) {
                const data = new Date(hoje);
                data.setDate(data.getDate() - i);
                labels.push(data.toLocaleDateString('pt-BR', { weekday: 'short' }));
                valores.push(calcularVendasDia(data));
            }
    }

    return { labels, valores };
}

function calcularProdutosPeriodo(periodo) {
    const categorias = ['Trufas', 'Brownies', 'Mousses'];
    const valores = [0, 0, 0];
    
    vendas.forEach(venda => {
        if (estaNoPeriodo(new Date(venda.data), periodo)) {
            venda.itens?.forEach(item => {
                const categoria = getCategoriaItem(item.id);
                const index = categorias.indexOf(categoria);
                if (index !== -1) {
                    valores[index] += item.preco;
                }
            });
        }
    });

    return {
        labels: categorias,
        valores: valores
    };
}

function calcularVendasHora(hora) {
    return vendas.filter(v => {
        const dataVenda = new Date(v.data);
        return dataVenda.getHours() === hora && 
               dataVenda.toDateString() === new Date().toDateString();
    }).reduce((sum, v) => sum + v.valor, 0);
}

function calcularVendasDia(data) {
    return vendas.filter(v => {
        const dataVenda = new Date(v.data);
        return dataVenda.toDateString() === data.toDateString();
    }).reduce((sum, v) => sum + v.valor, 0);
}

function estaNoPeriodo(data, periodo) {
    const hoje = new Date();
    switch(periodo) {
        case 'hoje':
            return data.toDateString() === hoje.toDateString();
        case 'semana':
            const ultimaSemana = new Date(hoje);
            ultimaSemana.setDate(hoje.getDate() - 7);
            return data >= ultimaSemana && data <= hoje;
        case 'mes':
            const ultimoMes = new Date(hoje);
            ultimoMes.setMonth(hoje.getMonth() - 1);
            return data >= ultimoMes && data <= hoje;
        default:
            return false;
    }
}

function getCategoriaItem(produtoId) {
    for (const categoria in PRODUTOS) {
        if (PRODUTOS[categoria].items.find(p => p.id === produtoId)) {
            return categoria.charAt(0).toUpperCase() + categoria.slice(1);
        }
    }
    return 'Outros';
}

// Adicionar CSS para o botão de logout
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .logout-button {
            position: absolute;
            bottom: 2rem;
            left: 2rem;
            right: 2rem;
            padding: 1rem;
            background: #ff758c;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .logout-button:hover {
            background: #ff4d6d;
        }
    </style>
`);

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar interface
    carregarPagina('dashboard');

    // Adicionar listeners para navegação
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pagina = e.target.dataset.page;
            carregarPagina(pagina);
            
            // Atualizar menu ativo
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
});

function carregarPagina(pagina) {
    const contentBody = document.querySelector('.content-body');
    const pageTitle = document.getElementById('page-title');

    switch(pagina) {
        case 'dashboard':
            pageTitle.textContent = '📊 Dashboard';
            carregarDashboard(contentBody);
            break;
        case 'produtos':
            pageTitle.textContent = '🧁 Gerenciar Produtos';
            carregarGerenciamentoProdutos(contentBody);
            break;
        case 'pedidos':
            pageTitle.textContent = '📦 Pedidos';
            carregarGerenciamentoPedidos(contentBody);
            break;
        case 'estoque':
            pageTitle.textContent = '📝 Controle de Estoque';
            carregarControleEstoque(contentBody);
            break;
    }
}

function carregarDashboard(container) {
    // Dados do dashboard
    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    const produtos = window.PRODUTOS || {};
    
    // Calcular totais
    const totalVendas = vendas.reduce((total, venda) => total + (venda.total || 0), 0);
    const produtosEmFalta = calcularProdutosEmFalta(produtos);
    const vendasHoje = calcularVendasHoje(vendas);

    container.innerHTML = `
        <div class="dashboard-grid">
            <div class="dashboard-card">
                <h3>Pedidos Pendentes</h3>
                <p class="number">${vendas.filter(v => v.status === 'pendente').length}</p>
            </div>
            <div class="dashboard-card">
                <h3>Produtos em Falta</h3>
                <p class="number">${produtosEmFalta}</p>
            </div>
            <div class="dashboard-card">
                <h3>Vendas Hoje</h3>
                <p class="number">R$ ${vendasHoje.toFixed(2)}</p>
            </div>
        </div>
        <div class="recent-orders">
            <h3>Pedidos Recentes</h3>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${gerarLinhasPedidosRecentes(vendas.slice(-5))}
                </tbody>
            </table>
        </div>
    `;
}

function calcularProdutosEmFalta(produtos) {
    let emFalta = 0;
    Object.values(produtos).forEach(categoria => {
        categoria.items?.forEach(produto => {
            if (produto.estoque <= 5) emFalta++;
        });
    });
    return emFalta;
}

function calcularVendasHoje(vendas) {
    const hoje = new Date().toDateString();
    return vendas
        .filter(v => new Date(v.data).toDateString() === hoje)
        .reduce((total, venda) => total + (venda.total || 0), 0);
}

function gerarLinhasPedidosRecentes(vendas) {
    return vendas.map(venda => `
        <tr>
            <td>#${venda.id}</td>
            <td>${venda.cliente?.nome || 'N/A'}</td>
            <td>R$ ${venda.total?.toFixed(2) || '0.00'}</td>
            <td>${venda.status || 'pendente'}</td>
            <td>
                <button onclick="verDetalhesPedido('${venda.id}')" class="btn-view">👁️</button>
                <button onclick="atualizarStatusPedido('${venda.id}')" class="btn-status">📝</button>
            </td>
        </tr>
    `).join('');
}

// Atualizar função de gerenciamento de produtos
function carregarGerenciamentoProdutos(container) {
    container.innerHTML = `
        <div class="admin-section">
            <div class="admin-actions">
                <button onclick="abrirModalNovoProduto()" class="btn-primary">
                    ➕ Novo Produto
                </button>
                <select id="filtro-categoria" onchange="filtrarProdutos(this.value)">
                    <option value="todos">Todas Categorias</option>
                    <option value="trufas">Trufas</option>
                    <option value="mousses">Mousses</option>
                    <option value="empadas">Empadas</option>
                </select>
            </div>
            <div class="table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Categoria</th>
                            <th>Preço</th>
                            <th>Estoque</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tabela-produtos">
                        ${gerarLinhasProdutos()}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Adicionar função de filtro
window.filtrarProdutos = function(categoria) {
    const tbody = document.getElementById('tabela-produtos');
    if (!tbody) return;

    if (categoria === 'todos') {
        tbody.innerHTML = gerarLinhasProdutos();
    } else {
        tbody.innerHTML = gerarLinhasProdutosFiltrados(categoria);
    }
};

// Adicionar função para filtrar produtos por categoria
function gerarLinhasProdutosFiltrados(categoria) {
    if (!PRODUTOS[categoria]) return '';
    
    return PRODUTOS[categoria].items.map(produto => `
        <tr>
            <td>${produto.nome}</td>
            <td>${categoria}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.estoque}</td>
            <td>${produto.estoque > 0 ? 'Ativo' : 'Esgotado'}</td>
            <td>
                <button onclick="editarProduto('${produto.id}')" class="btn-edit">✏️</button>
                <button onclick="excluirProduto('${produto.id}')" class="btn-delete">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Atualizar função de sincronização de estoque
window.sincronizarEstoque = function() {
    // Verificar se há mudanças no estoque
    const estoqueAtual = JSON.parse(localStorage.getItem('PRODUTOS'));
    if (!estoqueAtual) return;

    // Atualizar estoque em todas as páginas
    window.PRODUTOS = estoqueAtual;
    localStorage.setItem('PRODUTOS', JSON.stringify(window.PRODUTOS));
    
    // Disparar evento de atualização
    window.dispatchEvent(new CustomEvent('estoqueAtualizado'));
    
    // Atualizar interface
    atualizarTodosDisplaysEstoque();
    atualizarAlertasEstoque();
};

function carregarGerenciamentoPedidos(container) {
    container.innerHTML = `
        <div class="admin-section">
            <div class="filtros-pedidos">
                <select onchange="filtrarPedidos(this.value)">
                    <option value="todos">Todos os Pedidos</option>
                    <option value="pendentes">Pendentes</option>
                    <option value="concluidos">Concluídos</option>
                </select>
            </div>
            <div class="table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID Pedido</th>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Itens</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tabela-pedidos">
                        ${gerarLinhasPedidos()}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function carregarControleEstoque(container) {
    container.innerHTML = `
        <div class="admin-section">
            <div class="alertas-estoque">
                <div class="alerta-card">
                    <h3>Produtos em Baixa</h3>
                    <div id="produtos-baixa-estoque"></div>
                </div>
            </div>
            <div class="table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Estoque Atual</th>
                            <th>Mínimo</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tabela-estoque">
                        ${gerarLinhasEstoque()}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    atualizarAlertasEstoque();
}

// Funções auxiliares para gerar linhas das tabelas
function gerarLinhasProdutos() {
    let html = '';
    Object.entries(PRODUTOS).forEach(([categoria, dados]) => {
        dados.items.forEach(produto => {
            html += `
                <tr>
                    <td>${produto.nome}</td>
                    <td>${categoria}</td>
                    <td>R$ ${produto.preco.toFixed(2)}</td>
                    <td>${produto.estoque}</td>
                    <td>${produto.estoque > 0 ? 'Ativo' : 'Esgotado'}</td>
                    <td>
                        <button onclick="editarProduto('${produto.id}')" class="btn-edit">✏️</button>
                        <button onclick="excluirProduto('${produto.id}')" class="btn-delete">🗑️</button>
                    </td>
                </tr>
            `;
        });
    });
    return html;
}

function gerarLinhasPedidos() {
    const pedidos = JSON.parse(localStorage.getItem('vendas')) || [];
    return pedidos.map(pedido => `
        <tr>
            <td>#${pedido.id || 'N/A'}</td>
            <td>${new Date(pedido.data).toLocaleString()}</td>
            <td>${pedido.cliente?.nome || 'N/A'}</td>
            <td>${pedido.itens?.length || 0} itens</td>
            <td>R$ ${pedido.total?.toFixed(2) || '0.00'}</td>
            <td>${pedido.status || 'Pendente'}</td>
            <td>
                <button onclick="verDetalhesPedido('${pedido.id}')" class="btn-view">👁️</button>
                <button onclick="atualizarStatusPedido('${pedido.id}')" class="btn-status">📝</button>
            </td>
        </tr>
    `).join('');
}

function gerarLinhasEstoque() {
    let html = '';
    Object.entries(PRODUTOS).forEach(([categoria, dados]) => {
        dados.items.forEach(produto => {
            const estoqueMinimo = 5; // Você pode ajustar este valor
            const status = produto.estoque <= estoqueMinimo ? 'Baixo' : 'Ok';
            const statusClass = status.toLowerCase();
            
            html += `
                <tr data-produto-id="${produto.id}">
                    <td>${produto.nome}</td>
                    <td class="estoque-valor">${produto.estoque}</td>
                    <td>${estoqueMinimo}</td>
                    <td class="status ${statusClass}">${status}</td>
                    <td>
                        <button onclick="window.ajustarEstoque('${produto.id}')" class="btn-adjust">
                            📦
                        </button>
                    </td>
                </tr>
            `;
        });
    });
    return html;
}

function atualizarAlertasEstoque() {
    const containerAlertas = document.getElementById('produtos-baixa-estoque');
    if (!containerAlertas) return;

    const produtosBaixos = [];
    Object.entries(PRODUTOS).forEach(([categoria, dados]) => {
        dados.items.forEach(produto => {
            if (produto.estoque <= 5) {
                produtosBaixos.push({
                    nome: produto.nome,
                    estoque: produto.estoque
                });
            }
        });
    });

    containerAlertas.innerHTML = produtosBaixos.length > 0 ?
        produtosBaixos.map(p => `
            <div class="alerta-item">
                <span>${p.nome}</span>
                <span class="estoque-baixo">${p.estoque} unidades</span>
            </div>
        `).join('') :
        '<p>Nenhum produto com estoque baixo</p>';
}

function sincronizarDados() {
    Swal.fire({
        title: 'Sincronizando...',
        text: 'Atualizando dados do sistema',
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
        }
    }).then(() => {
        Swal.fire('Sucesso!', 'Dados sincronizados com sucesso', 'success');
    });
}

function logout() {
    Swal.fire({
        title: 'Deseja sair?',
        text: "Você será desconectado do sistema",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff758c',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, sair',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '../index.html';
        }
    });
}

// Funções para gerenciamento de produtos
function editarProduto(produtoId) {
    const produto = encontrarProdutoPorId(produtoId);
    if (!produto) return;

    Swal.fire({
        title: 'Editar Produto',
        html: `
            <div class="form-group">
                <label>Nome</label>
                <input id="edit-nome" class="swal2-input" value="${produto.nome}">
            </div>
            <div class="form-group">
                <label>Preço</label>
                <input id="edit-preco" type="number" step="0.01" class="swal2-input" value="${produto.preco}">
            </div>
            <div class="form-group">
                <label>Estoque</label>
                <input id="edit-estoque" type="number" class="swal2-input" value="${produto.estoque}">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                nome: document.getElementById('edit-nome').value,
                preco: parseFloat(document.getElementById('edit-preco').value),
                estoque: parseInt(document.getElementById('edit-estoque').value)
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Atualizar produto
            produto.nome = result.value.nome;
            produto.preco = result.value.preco;
            produto.estoque = result.value.estoque;
            
            // Salvar no localStorage
            localStorage.setItem('PRODUTOS', JSON.stringify(PRODUTOS));
            
            // Notificar outras abas
            SyncManager.notifyProdutoAtualizado(produto);
            
            // Atualizar interface
            carregarGerenciamentoProdutos(document.querySelector('.content-body'));
            atualizarAlertasEstoque();
        }
    });
}

function excluirProduto(produtoId) {
    Swal.fire({
        title: 'Confirmar exclusão',
        text: 'Deseja realmente excluir este produto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Encontrar e remover o produto
            for (const categoria in PRODUTOS) {
                const index = PRODUTOS[categoria].items.findIndex(p => p.id === produtoId);
                if (index !== -1) {
                    PRODUTOS[categoria].items.splice(index, 1);
                    break;
                }
            }
            
            // Salvar no localStorage
            localStorage.setItem('PRODUTOS', JSON.stringify(PRODUTOS));
            
            // Notificar outras abas
            SyncManager.notifyProdutoRemovido(produtoId);
            
            // Atualizar interface
            carregarGerenciamentoProdutos(document.querySelector('.content-body'));
            atualizarAlertasEstoque();
        }
    });
}

function ajustarEstoque(produtoId) {
    const produto = encontrarProdutoPorId(produtoId);
    if (!produto) {
        mostrarFeedback('Produto não encontrado', 'error');
        return;
    }

    Swal.fire({
        title: 'Ajustar Estoque',
        html: `
            <div class="form-group">
                <label>Produto: ${produto.nome}</label>
                <label>Estoque Atual: ${produto.estoque}</label>
                <input id="novo-estoque" type="number" class="swal2-input" value="${produto.estoque}" min="0">
            </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#ff758c',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Atualizar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const novoValor = parseInt(document.getElementById('novo-estoque').value);
            if (isNaN(novoValor) || novoValor < 0) {
                Swal.showValidationMessage('Digite um valor válido');
                return false;
            }
            return novoValor;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Atualizar estoque
            produto.estoque = result.value;
            
            // Salvar no localStorage
            localStorage.setItem('PRODUTOS', JSON.stringify(PRODUTOS));
            
            // Atualizar interface
            carregarControleEstoque(document.querySelector('.content-body'));
            atualizarAlertasEstoque();
            
            // Mostrar confirmação
            mostrarFeedback(`Estoque de ${produto.nome} atualizado para ${result.value}`, 'success');
        }
    });
}

// Função auxiliar para encontrar produto por ID
function encontrarProdutoPorId(produtoId) {
    for (const categoria in PRODUTOS) {
        const produto = PRODUTOS[categoria].items.find(p => p.id === produtoId);
        if (produto) return produto;
    }
    return null;
}

// Função para feedback
function mostrarFeedback(mensagem, tipo = 'success') {
    Swal.fire({
        title: tipo === 'success' ? 'Sucesso!' : 'Erro',
        text: mensagem,
        icon: tipo,
        timer: 2000,
        showConfirmButton: false
    });
}

// Função para adicionar novo produto
function abrirModalNovoProduto() {
    Swal.fire({
        title: 'Novo Produto',
        html: `
            <div class="form-group">
                <label>Nome</label>
                <input id="novo-nome" class="swal2-input">
            </div>
            <div class="form-group">
                <label>Categoria</label>
                <select id="novo-categoria" class="swal2-select">
                    <option value="trufas">Trufas</option>
                    <option value="mousses">Mousses</option>
                    <option value="empadas">Empadas</option>
                </select>
            </div>
            <div class="form-group">
                <label>Preço</label>
                <input id="novo-preco" type="number" step="0.01" class="swal2-input">
            </div>
            <div class="form-group">
                <label>Estoque Inicial</label>
                <input id="novo-estoque" type="number" class="swal2-input" value="0">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Adicionar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                nome: document.getElementById('novo-nome').value,
                categoria: document.getElementById('novo-categoria').value,
                preco: parseFloat(document.getElementById('novo-preco').value),
                estoque: parseInt(document.getElementById('novo-estoque').value)
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const novoProduto = {
                id: `${result.value.categoria}-${Date.now()}`,
                nome: result.value.nome,
                preco: result.value.preco,
                estoque: result.value.estoque,
                descricao: `${result.value.nome} artesanal`
            };

            // Verificar se a categoria existe
            if (!PRODUTOS[result.value.categoria]) {
                PRODUTOS[result.value.categoria] = {
                    titulo: result.value.categoria.charAt(0).toUpperCase() + result.value.categoria.slice(1),
                    items: []
                };
            }

            // Adicionar à categoria apropriada
            PRODUTOS[result.value.categoria].items.push(novoProduto);
            
            // Salvar no localStorage
            localStorage.setItem('PRODUTOS', JSON.stringify(PRODUTOS));
            
            // Atualizar somente uma vez via SyncManager
            SyncManager.notifyProdutoAdicionado(result.value.categoria, novoProduto);
            
            // Não chamar carregarGerenciamentoProdutos aqui, ele será chamado pelo evento
            mostrarFeedback('Produto adicionado com sucesso!', 'success');
        }
    });
}

// Expor funções necessárias globalmente
window.editarProduto = editarProduto;
window.excluirProduto = excluirProduto;
window.ajustarEstoque = ajustarEstoque;
window.abrirModalNovoProduto = abrirModalNovoProduto;
window.verDetalhesPedido = verDetalhesPedido;
window.atualizarStatusPedido = atualizarStatusPedido;
window.filtrarPedidos = function(status) {
    const pedidos = JSON.parse(localStorage.getItem('vendas')) || [];
    const pedidosFiltrados = status === 'todos' ? 
        pedidos : 
        pedidos.filter(p => p.status === status);
        
    const tbody = document.getElementById('tabela-pedidos');
    if (tbody) {
        tbody.innerHTML = gerarLinhasPedidos(pedidosFiltrados);
    }
};

// Adicionar CSS para feedback visual
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .btn-adjust {
            padding: 5px 10px;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-adjust:hover {
            background: var(--secondary-color);
            transform: scale(1.05);
        }
        
        .status.baixo {
            color: #dc3545;
            font-weight: bold;
        }
        
        .status.ok {
            color: #28a745;
        }
        
        .estoque-valor {
            font-weight: bold;
        }
    </style>
`);

// Função para ver detalhes do pedido
function verDetalhesPedido(pedidoId) {
    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    const pedido = vendas.find(v => v.id === pedidoId);
    
    if (!pedido) {
        Swal.fire('Erro', 'Pedido não encontrado', 'error');
        return;
    }

    let itensHtml = '';
    if (pedido.itens) {
        itensHtml = pedido.itens.map(item => `
            <tr>
                <td>${item.nome}</td>
                <td>${item.quantidade}x</td>
                <td>R$ ${item.preco.toFixed(2)}</td>
                <td>R$ ${(item.quantidade * item.preco).toFixed(2)}</td>
            </tr>
        `).join('');
    }

    Swal.fire({
        title: `Pedido #${pedido.id}`,
        html: `
            <div class="pedido-detalhes">
                <h3>Dados do Cliente</h3>
                <p><strong>Nome:</strong> ${pedido.cliente?.nome || 'N/A'}</p>
                <p><strong>Endereço:</strong> ${pedido.cliente?.endereco || 'N/A'}</p>
                <p><strong>Telefone:</strong> ${pedido.cliente?.telefone || 'N/A'}</p>
                
                <h3>Itens do Pedido</h3>
                <table class="pedido-itens">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qtd</th>
                            <th>Preço</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itensHtml}
                    </tbody>
                </table>
                
                <div class="pedido-total">
                    <strong>Total:</strong> R$ ${pedido.total?.toFixed(2) || '0.00'}
                </div>
                
                <div class="pedido-status">
                    <strong>Status:</strong> ${pedido.status || 'Pendente'}
                </div>
            </div>
        `,
        width: '600px'
    });
}

// Função para atualizar status do pedido
function atualizarStatusPedido(pedidoId) {
    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    const pedido = vendas.find(v => v.id === pedidoId);
    
    if (!pedido) {
        Swal.fire('Erro', 'Pedido não encontrado', 'error');
        return;
    }

    Swal.fire({
        title: 'Atualizar Status',
        input: 'select',
        inputOptions: {
            'pendente': 'Pendente',
            'preparando': 'Preparando',
            'entrega': 'Em Entrega',
            'concluido': 'Concluído',
            'cancelado': 'Cancelado'
        },
        inputValue: pedido.status || 'pendente',
        showCancelButton: true,
        confirmButtonText: 'Atualizar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            pedido.status = result.value;
            localStorage.setItem('vendas', JSON.stringify(vendas));
            
            // Atualizar interface
            const tbody = document.getElementById('tabela-pedidos');
            if (tbody) {
                tbody.innerHTML = gerarLinhasPedidos();
            }

            Swal.fire('Sucesso', 'Status atualizado com sucesso!', 'success');
        }
    });
}

// Função para filtrar pedidos
function filtrarPedidos(status) {
    const tbody = document.getElementById('tabela-pedidos');
    if (!tbody) return;

    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    const pedidosFiltrados = status === 'todos' ? 
        vendas : 
        vendas.filter(p => p.status === status);

    tbody.innerHTML = gerarLinhasPedidos(pedidosFiltrados);
}

// Exportar funções globalmente
window.verDetalhesPedido = verDetalhesPedido;
window.atualizarStatusPedido = atualizarStatusPedido;
window.filtrarPedidos = filtrarPedidos;
