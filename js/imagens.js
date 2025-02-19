const IMAGENS_TEMPORARIAS = {
    'trufa-chocolate': 'https://via.placeholder.com/300x200?text=Trufa+de+Chocolate',
    'trufa-morango': 'https://via.placeholder.com/300x200?text=Trufa+de+Morango',
    'trufa-maracuja': 'https://via.placeholder.com/300x200?text=Trufa+de+Maracuja',
    // ...adicione todas as imagens temporárias aqui
};

// Função para obter URL da imagem
function getImagemUrl(produtoId) {
    return IMAGENS_TEMPORARIAS[produtoId] || 'img/icons/produto-indisponivel.jpg';
}

window.getImagemUrl = getImagemUrl;
