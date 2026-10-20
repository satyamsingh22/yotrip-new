import React, { useState } from 'react';

interface BannerCounterProps {
  value?: number; // Optional controlled value
  onChange?: (value: number) => void; // Callback to parent
  min?: number; // Default min
  max?: number; // Default max
}

const BannerCounter: React.FC<BannerCounterProps> = ({
  value,
  onChange,
  min = 0,
  max = 99,
}) => {
  // Use internal state only if value prop is not provided
  const [internalValue, setInternalValue] = useState<number>(min);

  const quantity = value !== undefined ? value : internalValue;

  const handleChangeValue = (newValue: number) => {
    // Clamp the value within min-max
    const clampedValue = Math.max(min, Math.min(max, newValue));

    if (onChange) {
      onChange(clampedValue); // Notify parent
    } else {
      setInternalValue(clampedValue); // Update internal state
    }
  };

  const handleIncrement = () => handleChangeValue(quantity + 1);
  const handleDecrement = () => handleChangeValue(quantity - 1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const numericValue = parseInt(val, 10);

    if (val === "") {
      handleChangeValue(min); // Reset to min if empty
    } else if (!isNaN(numericValue)) {
      handleChangeValue(numericValue);
    }
  };

  return (
    <div className="custom-increment">
      <div className="input-group">
        <span className="input-group-btn float-start">
          <button
            type="button"
            className="quantity-left-minus btn btn-light btn-number"
            onClick={handleDecrement}
            disabled={quantity <= min}
          >
            <i className="isax isax-minus" />
          </button>
        </span>
        <input
          type="text"
          className="input-number text-center"
          value={quantity.toString()}
          onChange={handleInputChange}
        />
        <span className="input-group-btn float-end">
          <button
            type="button"
            className="quantity-right-plus btn btn-light btn-number"
            onClick={handleIncrement}
            disabled={quantity >= max}
          >
            <i className="isax isax-add" />
          </button>
        </span>
      </div>
    </div>
  );
};

export default BannerCounter;
