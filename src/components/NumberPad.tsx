import React, { useEffect, useCallback } from 'react';

interface NumberPadProps {
  value: string;
  onDigit: (digit: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  onDelete: () => void;
  color: 'blue' | 'red' | 'green' | 'purple';
  disabled?: boolean;
  enableKeyboard?: boolean;
  keyboardRef?: React.RefObject<HTMLDivElement>;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-500',
    hover: 'hover:bg-blue-600',
    border: 'border-blue-600',
    text: 'text-blue-700',
    light: 'bg-blue-100',
    submit: 'bg-blue-600 hover:bg-blue-700',
  },
  red: {
    bg: 'bg-red-500',
    hover: 'hover:bg-red-600',
    border: 'border-red-600',
    text: 'text-red-700',
    light: 'bg-red-100',
    submit: 'bg-red-600 hover:bg-red-700',
  },
  green: {
    bg: 'bg-green-500',
    hover: 'hover:bg-green-600',
    border: 'border-green-600',
    text: 'text-green-700',
    light: 'bg-green-100',
    submit: 'bg-green-600 hover:bg-green-700',
  },
  purple: {
    bg: 'bg-purple-500',
    hover: 'hover:bg-purple-600',
    border: 'border-purple-600',
    text: 'text-purple-700',
    light: 'bg-purple-100',
    submit: 'bg-purple-600 hover:bg-purple-700',
  },
};

const NumberPad: React.FC<NumberPadProps> = ({
  value,
  onDigit,
  onClear,
  onSubmit,
  onDelete,
  color,
  disabled = false,
  enableKeyboard = false,
  keyboardRef,
}) => {
  const colors = colorClasses[color];
  const topDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  useEffect(() => {
    if (!enableKeyboard || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        onDigit(e.key);
      } else if (e.key === 'Enter') {
        onSubmit();
      } else if (e.key === 'Backspace') {
        onDelete();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        onClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, disabled, onDigit, onSubmit, onDelete, onClear]);

  const handleTouchStart = useCallback((e: React.TouchEvent, action: () => void) => {
    if (disabled) return;
    e.preventDefault();
    action();
  }, [disabled]);

  const handleClick = useCallback((e: React.MouseEvent, action: () => void) => {
    if (disabled) return;
    action();
  }, [disabled]);

  return (
    <div
      ref={keyboardRef}
      className={`p-4 rounded-2xl ${colors.light} border-4 ${colors.border} shadow-lg`}
      tabIndex={enableKeyboard ? 0 : undefined}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Display */}
      <div className={`mb-4 p-4 bg-white rounded-xl text-center text-3xl font-bold ${colors.text} min-h-[60px] flex items-center justify-center border-2 ${colors.border}`}>
        {value || <span className="text-gray-300">?</span>}
      </div>
      
      {/* Number Grid - Top 3 rows */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {topDigits.map((digit) => (
          <button
            key={digit}
            onTouchStart={(e) => handleTouchStart(e, () => onDigit(digit))}
            onClick={(e) => handleClick(e, () => onDigit(digit))}
            disabled={disabled}
            className={`${colors.bg} ${colors.hover} text-white font-bold text-xl py-3 rounded-xl transition-all duration-150 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
            style={{ 
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
            }}
          >
            {digit}
          </button>
        ))}
      </div>

      {/* Bottom row - Centered zero */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <button
          onTouchStart={(e) => handleTouchStart(e, onClear)}
          onClick={(e) => handleClick(e, onClear)}
          disabled={disabled}
          className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-xl transition-all duration-150 transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-md"
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
        >
          Clear
        </button>
        <button
          onTouchStart={(e) => handleTouchStart(e, () => onDigit('0'))}
          onClick={(e) => handleClick(e, () => onDigit('0'))}
          disabled={disabled}
          className={`${colors.bg} ${colors.hover} text-white font-bold text-xl py-3 rounded-xl transition-all duration-150 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
        >
          0
        </button>
        <button
          onTouchStart={(e) => handleTouchStart(e, onDelete)}
          onClick={(e) => handleClick(e, onDelete)}
          disabled={disabled}
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 rounded-xl transition-all duration-150 transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-md"
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
        >
          ⌫
        </button>
      </div>
      
      {/* Submit Button */}
      <button
        onTouchStart={(e) => handleTouchStart(e, onSubmit)}
        onClick={(e) => handleClick(e, onSubmit)}
        disabled={disabled || value.length === 0}
        className={`w-full ${colors.submit} text-white font-bold py-3 rounded-xl transition-all duration-150 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-lg`}
        style={{ 
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
      >
        ✓ Submit
      </button>

      {enableKeyboard && (
        <p className="text-center text-xs text-gray-400 mt-2">⌨️ You can also use your keyboard!</p>
      )}
    </div>
  );
};

export default NumberPad;
