import React from 'react';

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  valueMin: number; // 0 = sem limite mínimo
  valueMax: number; // 0 = sem limite máximo
  onChange: (min: number, max: number) => void;
  format?: (v: number) => string;
}

// Controle deslizante de duas alças (min/max) — usado nos filtros de
// Power Score e Level do Marketplace, no lugar dos dois campos numéricos
// soltos que existiam antes (pedido explícito do usuário, igual ao
// controle da referência que ele mandou).
export const RangeSlider: React.FC<RangeSliderProps> = ({ label, min, max, step, valueMin, valueMax, onChange, format }) => {
  const effMin = valueMin > 0 ? valueMin : min;
  const effMax = valueMax > 0 ? valueMax : max;
  const fmt = format ?? ((v: number) => v.toLocaleString('pt-BR'));

  const handleMinChange = (raw: number) => {
    const clamped = Math.min(raw, effMax);
    onChange(clamped <= min ? 0 : clamped, valueMax);
  };
  const handleMaxChange = (raw: number) => {
    const clamped = Math.max(raw, effMin);
    onChange(valueMin, clamped >= max ? 0 : clamped);
  };

  const pctMin = ((effMin - min) / (max - min)) * 100;
  const pctMax = ((effMax - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-slate-400">{label}</label>
        <span className="text-xs text-slate-300 font-semibold">{fmt(effMin)} ~ {fmt(effMax)}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-1.5 bg-slate-700 rounded-full" />
        <div
          className="absolute h-1.5 bg-cyan-500 rounded-full"
          style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={effMin}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className="absolute inset-x-0 w-full h-6 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-900 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-900"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={effMax}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className="absolute inset-x-0 w-full h-6 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-900 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-900"
        />
      </div>
    </div>
  );
};

export default RangeSlider;
