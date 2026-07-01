"use client";

import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import RadioGroup from "@/components/ui/RadioGroup";

export default function DiscoverFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filter = searchParams.get("filter") ?? "latest";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "latest") {
      params.delete("filter");
    } else {
      params.set("filter", value);
    }

    router.push(`/discover?${params.toString()}`);
    setOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="
          h-11 w-11
          rounded-lg
          border border-neutral-700
          bg-neutral-800/60
          flex items-center justify-center
          text-neutral-300
          hover:text-white
          hover:border-green-500
          transition
          group
        "
      >
        <SlidersHorizontal className="w-5 h-5 group-hover:text-green-500" />
      </button>

      {open && (
        <div
          className="
            absolute
            right-0
            mt-2
            w-56
            rounded-xl
            border border-neutral-700
            bg-neutral-900
            shadow-2xl
            p-4
            z-50
          "
        >
          <RadioGroup
            value={filter}
            onChange={handleChange}
            options={[
              {
                value: "latest",
                label: "Latest",
              },
              {
                value: "most-streamed",
                label: "Most Streamed",
              },
              {
                value: "oldest",
                label: "Oldest",
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}