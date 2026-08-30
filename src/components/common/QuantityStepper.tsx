import React, { useState, useEffect } from "react";
import { Minus, Plus, AlertCircle } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  min: number;
  step: number;
  max: number;
  unit?: string;
  onChange: (val: number) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  min,
  step,
  max,
  unit = "kg",
  onChange,
  disabled = false,
  size = "md",
}) => {
  const [inputValue, setInputValue] = useState<string>(value > 0 ? value.toString() : min.toString());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value > 0) {
      setInputValue(value.toString());
      setError(null);
    }
  }, [value]);

  const validateAndEmit = (num: number) => {
    if (max <= 0) {
      setError("Agotado");
      return;
    }

    if (num < min) {
      setError(`Mínimo ${min} ${unit}`);
      return;
    }

    if (num > max) {
      setError(`Máximo disponible: ${max} ${unit}`);
      return;
    }

    // Step check
    const remainder = (num - min) % step;
    if (remainder !== 0) {
      const nearestValid = min + Math.round((num - min) / step) * step;
      setError(`Sube de ${step} en ${step} ${unit}`);
      return;
    }

    setError(null);
    onChange(num);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || max <= 0) return;

    const current = parseInt(inputValue, 10) || min;
    const next = current - step;

    if (next >= min) {
      setInputValue(next.toString());
      validateAndEmit(next);
    } else {
      setError(`Mínimo: ${min} ${unit}`);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || max <= 0) return;

    const current = parseInt(inputValue, 10) || (min - step);
    const next = current < min ? min : current + step;

    if (next <= max) {
      setInputValue(next.toString());
      validateAndEmit(next);
    } else {
      setError(`Disponible: ${max} ${unit}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setInputValue(raw);
    if (!raw) return;

    const num = parseInt(raw, 10);
    validateAndEmit(num);
  };

  const handleBlur = () => {
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || num < min) {
      setInputValue(min.toString());
      validateAndEmit(min);
    } else if (num > max) {
      const clamped = Math.floor((max - min) / step) * step + min;
      setInputValue(clamped.toString());
      validateAndEmit(clamped);
    } else {
      const stepOffset = Math.round((num - min) / step) * step;
      const snapped = Math.min(max, min + stepOffset);
      setInputValue(snapped.toString());
      validateAndEmit(snapped);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Senior-friendly high contrast big touch stepper */}
      <div className="flex items-center rounded-2xl border-2 border-slate-300 bg-white shadow-sm overflow-hidden focus-within:border-brand-600">
        {/* Big Minus Button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || max <= 0 || (parseInt(inputValue, 10) <= min)}
          className="w-13 h-13 min-w-[50px] min-h-[50px] flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-black disabled:opacity-25 disabled:cursor-not-allowed transition-colors border-r-2 border-slate-200 active:scale-95 touch-manipulation text-xl"
          title={`Restar ${step} ${unit}`}
          aria-label="Restar cantidad"
        >
          <Minus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Big Number Display */}
        <div className="flex items-center justify-center px-2 min-w-[75px]">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled || max <= 0}
            className="w-14 h-12 text-center text-slate-950 font-black text-xl bg-transparent focus:outline-none"
            aria-label={`Cantidad en ${unit}`}
          />
          <span className="text-sm font-extrabold text-slate-700 select-none">
            {unit}
          </span>
        </div>

        {/* Big Plus Button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || max <= 0 || (parseInt(inputValue, 10) + step > max)}
          className="w-13 h-13 min-w-[50px] min-h-[50px] flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black disabled:opacity-25 disabled:cursor-not-allowed transition-colors border-l-2 border-slate-200 active:scale-95 touch-manipulation text-xl"
          title={`Sumar ${step} ${unit}`}
          aria-label="Sumar cantidad"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-1 mt-1 text-xs text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
