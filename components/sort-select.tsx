"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function SortSelect({
  basePath,
  options,
}: {
  basePath: string;
  options: { value: string; label: string }[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(sp.toString());
    if (e.target.value && e.target.value !== "rec") {
      params.set("sort", e.target.value);
    } else {
      params.delete("sort");
    }
    startTransition(() => {
      router.push(`${basePath}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <select value={sp.get("sort") ?? "rec"} onChange={handleChange}>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
