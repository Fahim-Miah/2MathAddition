import React from 'react';

interface NumberPadProps {
  value: string;
  onInput: (val: string) => void;
  color?: 'blue' | 'red' | 'green' | 'purple';
}

export const NumberPad: React.FC<NumberPadProps> = ({ value, onInput, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
    red: 'bg-red-500 hover:bg-red-600 active:bg-red-700',
    green: 'bg-green-500 hover:bg-green-600 active:bg-green-700',
    purple: 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700',
  };

  const handlePress = (num: string) => {
    onInput(value + num);
  };

  const handleClear = () => {
    onInput('');
  };

  const handleBackspace = () => {
    onInput(value.slice(0, -1));
  };

  const buttons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['⌫', '0', 'C'],
  ];

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-[200px]">
      {buttons.flat().map((btn) => (
        <button
          key={btn}
          onClick={() => {
            if (btn === 'C') handleClear();
            else if (btn === '⌫') handleBackspace();
            else handlePress(btn);
          }}
          className={`${colorClasses[color]} text-white font-bold text-xl rounded-xl h-14 w-full shadow-md transition-all duration-100 active:scale-95 flex items-center justify-center`}
        >
          {btn}
        </button>
      ))}
    </div>
  );
};
