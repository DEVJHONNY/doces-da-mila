const IMAGENS_PRODUTOS = {
    'trufa-chocolate': 'https://via.placeholder.com/300x200?text=Trufa+Chocolate',
    'trufa-morango': 'https://via.placeholder.com/300x200?text=Trufa+Morango',
    'trufa-maracuja': 'https://via.placeholder.com/300x200?text=Trufa+Maracuja',
    'trufa-limao': 'https://via.placeholder.com/300x200?text=Trufa+Limao',
    'brownie-tradicional': 'https://via.placeholder.com/300x200?text=Brownie+Tradicional',
    'brownie-nutella': 'https://via.placeholder.com/300x200?text=Brownie+Nutella',
    'brownie-doce-leite': 'https://via.placeholder.com/300x200?text=Brownie+Doce+de+Leite',
    'mousse-chocolate': 'https://via.placeholder.com/300x200?text=Mousse+Chocolate',
    'mousse-maracuja': 'https://via.placeholder.com/300x200?text=Mousse+Maracuja',
    'mousse-limao': 'https://via.placeholder.com/300x200?text=Mousse+Limao'
};

// Função para obter URL da imagem
function getImagemUrl(id) {
    return IMAGENS_PRODUTOS[id] || 'https://via.placeholder.com/300x200?text=Imagem+Indisponível';
}

window.IMAGENS_PRODUTOS = IMAGENS_PRODUTOS;
window.getImagemUrl = getImagemUrl;
