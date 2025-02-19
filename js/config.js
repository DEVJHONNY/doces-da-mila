const CONFIG = {
    loja: {
        nome: "Mila Doces",
        telefone: "5571992124952", // Substitua pelo número real
        whatsapp: "5571992124952"  // Mesmo número formatado para WhatsApp
    },
    pagamento: {
        pix: {
            nome: "Lucas dos Anjos Araujo Rocha",
            banco: "PicPay",
            // Chave PIX completa para copia e cola
            chave: "00020126330014br.gov.bcb.pix0111076140585265204000053039865802BR5925Lucas Dos Anjos Araujo Ro6009Sao Paulo62290525REC67AF4A30A9AEF471415507630428C5",
            // Aqui você deve colocar a URL correta da sua imagem QR code
            qrCodeUrl: "https://i.ibb.co/m558LYPX/Whats-App-Image-2025-02-12-at-08-36-21.jpg"
        }
    },
    estoque: {
        alertaBaixo: {
            trufas: 5,
            mousses: 3,
            empadas: 3
        }
    }
};

// Garantir que CONFIG está disponível globalmente
window.CONFIG = CONFIG;

window.PRODUTOS = {
    trufas: {
        titulo: "Trufas",
        items: [] // Lista vazia para trufas
    },
    mousses: {
        titulo: "Mousses",
        items: [] // Lista vazia para mousses
    },
    empadas: {
        titulo: "Empadas",
        items: [] // Lista vazia para empadas
    }
};

// Atualizar configuração de alerta de estoque
CONFIG.estoque.alertaBaixo = {
    trufas: 5,
    mousses: 3,
    empadas: 3
};