import React from 'react';

interface ScoreSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  lowLabel?: string;
  highLabel?: string;
  emoji?: string;
}

export const ScoreSlider: React.FC<ScoreSliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  lowLabel = 'Baixo',
  highLabel = 'Alto',
  emoji,
}) => {
  const getColor = (v: number) => {
    if (v <= 3) return 'text-rose-400';
    if (v <= 6) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="space-y-2 bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {emoji && <span className="text-lg">{emoji}</span>}
          <span className="text-sm font-semibold text-slate-200">{label}</span>
        </div>
        <span className={`text-base font-extrabold px-2.5 py-0.5 rounded-lg bg-slate-800/80 ${getColor(value)}`}>
          {value} <span className="text-xs text-slate-500 font-normal">/ {max}</span>
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
      />

      <div className="flex justify-between text-[11px] text-slate-500 font-medium">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
};
