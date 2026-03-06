import { useState } from "react";

interface ScanFormProps {
  onScan: (directories: string[]) => void;
  disabled: boolean;
}

export function ScanForm({ onScan, disabled }: ScanFormProps) {
  const [input, setInput] = useState(
    "/Users, /Users/kyle, /Users/kyle/code, /Users/kyle/Desktop",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dirs = input
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
    if (dirs.length > 0) {
      onScan(dirs);
    }
  };

  return (
    <form className="scan-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter directory paths (comma-separated, e.g. /Users/kyle/code)"
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || input.trim() === ""}>
        Scan
      </button>
    </form>
  );
}
