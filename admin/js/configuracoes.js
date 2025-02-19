document.addEventListener('DOMContentLoaded', () => {
    carregarConfiguracoes();
    
    // Form submit
    document.getElementById('config-form')?.addEventListener('submit', salvarConfiguracoes);
});

function carregarConfiguracoes() {
    const config = JSON.parse(localStorage.getItem('CONFIG')) || window.CONFIG;

    // Preencher campos
    document.getElementById('nome-loja').value = config.loja.nome;
    document.getElementById('whatsapp').value = config.loja.telefone;
    document.getElementById('instagram').value = config.loja.instagram;
    document.getElementById('chave-pix').value = config.pagamento?.pix?.chavePix || '';
    
    // Preencher alertas de estoque
    document.getElementById('alerta-trufas').value = config.estoque?.alertaBaixo?.trufa || 5;
    document.getElementById('alerta-brownies').value = config.estoque?.alertaBaixo?.brownie || 3;
    document.getElementById('alerta-mousses').value = config.estoque?.alertaBaixo?.mousse || 2;

    // Mostrar QR Code atual se existir
    const qrPreview = document.getElementById('qr-code-preview');
    if (qrPreview && config.pagamento?.pix?.qrCodeUrl) {
        qrPreview.src = config.pagamento.pix.qrCodeUrl;
        qrPreview.style.display = 'block';
    }
}

async function salvarConfiguracoes(e) {
    e.preventDefault();

    const config = {
        loja: {
            nome: document.getElementById('nome-loja').value,
            telefone: document.getElementById('whatsapp').value,
            instagram: document.getElementById('instagram').value
        },
        pagamento: {
            pix: {
                chavePix: document.getElementById('chave-pix').value,
                qrCodeUrl: document.getElementById('qr-code-preview').src
            }
        },
        estoque: {
            alertaBaixo: {
                trufa: parseInt(document.getElementById('alerta-trufas').value),
                brownie: parseInt(document.getElementById('alerta-brownies').value),
                mousse: parseInt(document.getElementById('alerta-mousses').value)
            }
        }
    };

    // Salvar configurações
    localStorage.setItem('CONFIG', JSON.stringify(config));
    window.CONFIG = config;

    // Mostrar confirmação
    await Swal.fire({
        title: 'Configurações Salvas!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
    });
}

// Manipulação do upload de QR Code
document.getElementById('qr-code-pix')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('qr-code-preview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});
