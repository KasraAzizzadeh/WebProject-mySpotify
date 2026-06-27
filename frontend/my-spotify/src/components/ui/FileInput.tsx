"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";

type FileInputProps = {
  label?: string;
  error?: string;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  value: File[];
  onChange: (files: File[]) => void;
};

export default function FileInput({
  label,
  error,
  multiple = true,
  maxFiles = 1,
  accept,
  value,
  onChange,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files || []);

    let updated = multiple ? [...value, ...incoming] : incoming;

    if (updated.length > maxFiles) {
      updated = updated.slice(updated.length - maxFiles);
    }

    onChange(updated);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-neutral-400 mb-1">
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {/* CONTAINER (UNCHANGED STRUCTURE) */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2">

        {/* FILE BOX */}
        <div className="flex-1 min-h-[44px] px-3 py-2 rounded-lg bg-neutral-800/60 border border-neutral-700/40 text-sm text-neutral-300 flex flex-wrap gap-2">

          {value.length === 0 ? (
            <span className="text-neutral-500">
              No files selected
            </span>
          ) : (
            value.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between w-full sm:w-auto bg-neutral-900/50 px-2 py-1 rounded"
              >
                <span className="truncate max-w-[60vw] sm:max-w-[180px]">
                  {file.name}
                </span>

                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-red-400 hover:text-red-300 text-xs ml-2"
                >
                  ✕
                </button>
              </div>
            ))
          )}

          {/* UPLOAD BUTTON (UNCHANGED POSITION) */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="
              ml-auto
              mt-2 sm:mt-0
              p-2
              rounded
              text-neutral-400 hover:text-green-400
              transition
              flex items-center justify-center
            "
            aria-label="Upload files"
          >
            <Upload size={18} />
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
}