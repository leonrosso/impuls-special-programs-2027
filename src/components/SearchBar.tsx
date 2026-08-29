interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="search-bar">
      <input
        type="search"
        inputMode="search"
        placeholder="Cerca per titolo o coach..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Cerca per titolo o coach"
      />
    </div>
  );
}
