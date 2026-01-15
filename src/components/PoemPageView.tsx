import { forwardRef, useEffect, useRef, useState } from "react";
import type { Mode, PoemPage } from "../types";

type Props = {
  page: PoemPage;
  mode: Mode;
  pageNumber: number;

  // ✅ only used when leaving the field (so UI stays in sync)
  onChange: (updated: PoemPage) => void;

  // ✅ autosave in background, no parent re-render
  onAutoSave: (updated: PoemPage) => void;
};

const PoemPageView = forwardRef<HTMLDivElement, Props>(
  ({ page, mode, pageNumber, onChange, onAutoSave }, ref) => {
    const editable = mode === "write";

    // ✅ local state for smooth typing
    const [title, setTitle] = useState(page.title ?? "");
    const [body, setBody] = useState(page.body ?? "");

    // sync when page changes (flipping)
    useEffect(() => {
      setTitle(page.title ?? "");
      setBody(page.body ?? "");
    }, [page.page_no]);

    // ✅ debounced autosave WITHOUT touching parent state
    const tRef = useRef<number | null>(null);
    const autoSave = (nextTitle: string, nextBody: string) => {
      if (tRef.current) window.clearTimeout(tRef.current);
      tRef.current = window.setTimeout(() => {
        onAutoSave({ ...page, title: nextTitle, body: nextBody });
      }, 600);
    };

    // ✅ update parent ONLY on blur (prevents typing focus bugs)
    const syncToParent = () => {
      onChange({ ...page, title, body });
    };

    return (
      <div
        ref={ref}
        className="page h-full w-full bg-[#f7f1e3] text-zinc-900"
        style={{
          borderRadius: 14,
          padding: 18,
          boxShadow:
            "inset 0 0 0 1px rgba(0,0,0,0.06), 0 10px 30px rgba(0,0,0,0.25)",
        }}
        // block flip interactions stealing focus
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="mb-2 text-xs text-zinc-500 select-none">
          Page {pageNumber}
        </div>

        {/* Title */}
        <input
          value={title}
          placeholder="Poem title..."
          readOnly={!editable}
          onChange={(e) => {
            const v = e.target.value;
            setTitle(v);
            autoSave(v, body);
          }}
          onBlur={syncToParent} // ✅ sync only when you exit field
          className={`w-full bg-transparent text-xl font-semibold outline-none ${
            editable ? "border-b border-zinc-300 pb-2" : ""
          }`}
        />

        {/* Body */}
        <div className="mt-4" style={{ height: "calc(100% - 70px)" }}>
          <textarea
            value={body}
            placeholder={editable ? "Write your poem here..." : "This page is empty."}
            readOnly={!editable}
            onChange={(e) => {
              const v = e.target.value;
              setBody(v);
              autoSave(title, v);
            }}
            onBlur={syncToParent} // ✅ sync only when you exit field
            className="h-full w-full resize-none rounded-xl bg-white/40 p-4 text-[15px] leading-6 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>
    );
  }
);

export default PoemPageView;
