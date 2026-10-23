type Option<T extends string> = { value: T; label: string };

type SegmentedProps<T extends string> = {
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  label: string;
};

/** Compact single-choice control; every segment is a 44px-tall touch target. */
export default function Segmented<T extends string>({ value, options, onChange, label }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-xl bg-[var(--green-light)] p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`min-h-10 flex-1 whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition-colors ${
              selected ? "bg-white text-[var(--green)] shadow-sm" : "text-[var(--muted)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
