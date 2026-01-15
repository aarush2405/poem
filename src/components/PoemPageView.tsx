import { forwardRef, useEffect, useRef, useState } from "react";
import type { Mode, PoemPage } from "../types";
import pageBg from "../assets/page.png"; // ✅ ensure this exists in src/assets/page.png

type Props = {
  page: PoemPage;
  mode: Mode;
  pageNumber: number;

  // update parent only when user leaves (prevents focus bugs)
  onChange: (updated: PoemPage) => void;

  // autosave in background (no re-render spam)
  onAutoSave: (updated: PoemPage) => void;
};

const PoemPageView = forwardRef<HTMLDivElement, Props>(
  ({ page, mode, pageNumber, onChange, onAutoSave }, ref) => {
    const editable = mode === "write";

    // ✅ local state for smooth typing
    const [title, setTitle] = useState(page.title ?? "");
    const [body, setBody] = useState(page.body ?? "");

    // sync when flipping to another page
    useEffect(() => {
      setTitle(page.title ?? "");
      setBody(page.body ?? "");
    }, [page.page_no]);

    // ✅ debounce autosave to DB (NO parent re-render)
    const tRef = useRef<number | null>(null);
    const autoSave = (nextTitle: string, nextBody: string) => {
      if (tRef.current) window.clearTimeout(tRef.current);
      tRef.current = window.setTimeout(() => {
        onAutoSave({ ...page, title: nextTitle, body: nextBody });
      }, 600);
    };

    // ✅ sync parent only on blur
    const syncToParent = () => {
      onChange({ ...page, title, body });
    };

    return (
      <div
        ref={ref}
        className="page relative h-full w-full overflow-hidden text-zinc-900"
        style={{
          borderRadius: 18,
          padding: 26,
          backgroundImage: `url(${pageBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          boxShadow:
            "inset 0 0 0 1px rgba(0,0,0,0.07), 0 16px 40px rgba(0,0,0,0.32)",
        }}
        // ✅ prevent flipbook from stealing focus
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* ✅ Paper overlay to fix dark/brown look */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "rgba(255, 248, 230, 0.78)",
          }}
        />

        {/* Foreground content */}
        <div className="relative z-10 h-full">
          {/* Page number */}
          <div className="mb-3 text-xs text-zinc-600 select-none">
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
            onBlur={syncToParent}
            className={`w-full bg-transparent text-2xl font-semibold outline-none ${
              editable ? "border-b border-zinc-400/40 pb-2" : ""
            }`}
            style={{
              fontFamily: "TBJ Nord Poem",
              color: "#1f1f1f",
            }}
          />

          {/* Body */}
          <div className="mt-4" style={{ height: "calc(100% - 80px)" }}>
            <textarea
              value={body}
              placeholder={
                editable ? "Write your poem here..." : "This page is empty."
              }
              readOnly={!editable}
              onChange={(e) => {
                const v = e.target.value;
                setBody(v);
                autoSave(title, v);
              }}
              onBlur={syncToParent}
              className="h-full w-full resize-none rounded-2xl p-5 outline-none"
              style={{
                fontFamily: "TBJ Nord Poem",
                fontSize: 20,
                lineHeight: "34px",
                color: "#1f1f1f",
                background: "rgba(255,255,255,0.55)",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.10)",
                backdropFilter: "blur(2px)",
              }}
            />
          </div>
        </div>
      </div>
    );
  }
);

export default PoemPageView;
