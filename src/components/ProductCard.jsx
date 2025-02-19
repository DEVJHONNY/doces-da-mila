import React from 'react';
import QuantityControl from './QuantityControl';
import './ProductCard.css';

const ProductCard = ({
    product,
    onAddToCart
}) => {
    const [quantity, setQuantity] = React.useState(1);
    const isOutOfStock = product.estoque <= 0;

    const handleAddToCart = () => {
        onAddToCart?.({
            ...product,
            quantity
        });
    };

    return (
        <div className={`produto ${isOutOfStock ? 'esgotado' : ''}`}>
            <h3>{product.nome}</h3>
            <p className="descricao">{product.descricao}</p>
            <p className="preco">R$ {product.preco.toFixed(2)}</p>
            
            <div className="produto-acoes">
                <QuantityControl
                    initialValue={1}
                    min={1}
                    max={product.estoque}
                    onChange={setQuantity}
                    disabled={isOutOfStock}
                />
                <button 
                    className="button-adicionar"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                >
                    {isOutOfStock ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
