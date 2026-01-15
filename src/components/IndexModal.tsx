import { useMemo, useState } from "react";
import type { PoemPage } from "../types";
import { X } from "lucide-react";

export default function IndexModal({
  open,
  pages,
  onClose,
  onJump,
}: {
  open: boolean;
  pages: PoemPage[];
  onClose: () => void;
  onJump: (pageIndex: number) => void;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return pages;
    return pages.filter((p) => (p.title || "").toLowerCase().includes(query));
  }, [q, pages]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-4">
      <div className="mx-auto mt-10 w-full max-w-2xl rounded-2xl bg-zinc-950/90 p-5 text-white shadow-2xl ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Index</h3>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 p-2 hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search poem titles..."
          className="mt-4 w-full rounded-xl bg-white/10 px-4 py-3 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400/60"
        />

        <div className="mt-4 max-h-[55vh] overflow-auto rounded-xl ring-1 ring-white/10">
          {pages.length === 0 ? (
            <div className="p-6 text-sm text-white/70">No pages yet.</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-white/70">No matches.</div>
          ) : (
            <ul className="divide-y divide-white/10">
              {filtered.map((p) => {
                const realIndex = pages.findIndex((x) => x.id === p.id);
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => onJump(realIndex)}
                      className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-white/5"
                    >
                      <span className="font-medium">
                        {p.title?.trim() ? p.title : "Untitled Poem"}
                      </span>
                      <span className="text-xs text-white/60">
                        Page {realIndex + 1}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
