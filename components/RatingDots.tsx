import * as React from 'react';

interface RatingDotsProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  colorClass?: string;
  size?: 'sm' | 'md';
}

const RatingDots: React.FC<RatingDotsProps> = ({
  value,
  onChange,
  max = 5,
  colorClass = 'bg-brand-primary',
  size = 'md',
}) => {
  const [hoverValue, setHoverValue] = React.useState(0);
  
  const dotSize = size === 'sm' ? 'w-3 h-3' : 'w-5 h-5';
  const spacing = size === 'sm' ? 'space-x-1' : 'space-x-1.5';

  return (
    <div className={`flex items-center ${spacing}`} onMouseLeave={() => setHoverValue(0)}>
      {Array.from({ length: max }).map((_, index) => {
        const dotValue = index + 1;
        const isFilled = hoverValue > 0 ? dotValue <= hoverValue : dotValue <= value;
        const isHovered = hoverValue > 0 && dotValue <= hoverValue;

        return (
          <button
            key={dotValue}
            type="button"
            className={`${dotSize} rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-light-bg dark:focus:ring-offset-dark-bg focus:ring-brand-primary ${
              isFilled ? colorClass : 'bg-gray-300 dark:bg-gray-700'
            } ${isHovered ? 'transform scale-110 brightness-110' : ''}`}
            onMouseEnter={() => setHoverValue(dotValue)}
            onClick={() => {
                if (dotValue === value) {
                    onChange(0); // Allow clearing the rating
                } else {
                    onChange(dotValue);
                }
            }}
            aria-label={`Set rating to ${dotValue}`}
          />
        );
      })}
    </div>
  );
};

export default RatingDots;