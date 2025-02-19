import React from 'react';
import './QuantityControl.css';

const QuantityControl = ({ 
    initialValue = 1,
    min = 1,
    max,
    onChange,
    disabled = false
}) => {
    const [value, setValue] = React.useState(initialValue);

    const handleIncrement = () => {
        if (value < max) {
            const newValue = value + 1;
            setValue(newValue);
            onChange?.(newValue);
        }
    };

    const handleDecrement = () => {
        if (value > min) {
            const newValue = value - 1;
            setValue(newValue);
            onChange?.(newValue);
        }
    };

    const handleInputChange = (e) => {
        const newValue = parseInt(e.target.value) || min;
        const validValue = Math.min(Math.max(newValue, min), max);
        setValue(validValue);
        onChange?.(validValue);
    };

    return (
        <div className="quantidade-controle">
            <button 
                onClick={handleDecrement}
                disabled={disabled || value <= min}
                aria-label="Diminuir quantidade"
            >
                -
            </button>
            <input
                type="number"
                value={value}
                onChange={handleInputChange}
                min={min}
                max={max}
                disabled={disabled}
            />
            <button 
                onClick={handleIncrement}
                disabled={disabled || value >= max}
                aria-label="Aumentar quantidade"
            >
                +
            </button>
        </div>
    );
};

export default QuantityControl;
