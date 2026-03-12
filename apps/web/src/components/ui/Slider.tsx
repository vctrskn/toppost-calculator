'use client';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
}

export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  label,
  unit = '',
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <span className="text-sm font-semibold text-brand">
            {value} {unit}
          </span>
        </div>
      )}
      <div className="relative flex h-11 items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="slider-input h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200"
          style={{
            background: `linear-gradient(to right, #fc6a09 0%, #fc6a09 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
          }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-400">
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>
      <style jsx>{`
        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fc6a09;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }
        .slider-input::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fc6a09;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
