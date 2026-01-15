import type { Mode } from "../types";

export default function ModeModal({
  open,
  onPick,
}: {
  open: boolean;
  onPick: (mode: Mode) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-zinc-950/80 p-6 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur">
        <h2 className="text-xl font-semibold">Choose mode</h2>
        <p className="mt-2 text-sm text-white/70">
          Read Mode is locked. Write Mode lets you create and edit poems (autosaved).
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => onPick("read")}
            className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/20"
          >
            Read Mode
          </button>
          <button
            onClick={() => onPick("write")}
            className="rounded-xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            Write Mode
          </button>
        </div>
      </div>
    </div>
  );
}
