"use client";

type Option = {
  label: string;
  value: string;
};

interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
}

export default function RadioGroup({
  value,
  onChange,
  options,
  className = "",
}: RadioGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <input
            type="radio"
            name="radio-group"
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="
              h-4 w-4
              accent-green-500
              cursor-pointer
            "
          />

          <span
            className={`
              text-sm transition-colors
              ${
                value === option.value
                  ? "text-white"
                  : "text-neutral-400 group-hover:text-neutral-200"
              }
            `}
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}