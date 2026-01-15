import { forwardRef, useEffect, useRef, useState } from "react";
import type { Mode, PoemPage } from "../types";
import pageBg from "../assets/page.png";

type Props = {
  page: PoemPage;
  mode: Mode;
  pageNumber: number;
  onChange: (updated: PoemPage) => void;
  onAutoSave: (updated: PoemPage) => void;
};

const PoemPageView = forwardRef<HTMLDivElement, Props>(
  ({ page, mode, pageNumber, onChange, onAutoSave }, ref) => {
    const editable = mode === "write";

    const [title, setTitle] = useState(page.title ?? "");
    const [body, setBody] = useState(page.body ?? "");

    useEffect(() => {
      setTitle(page.title ?? "");
      setBody(page.body ?? "");
    }, [page.page_no]);

    // Debounced autosave to DB (no parent rerender)
    const tRef = useRef<number | null>(null);
    const autoSave = (nextTitle: string, nextBody: string) => {
      if (tRef.current) window.clearTimeout(tRef.current);
      tRef.current = window.setTimeout(() => {
        onAutoSave({ ...page, title: nextTitle, body: nextBody });
      }, 600);
    };

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
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* ✅ very light paper tone so texture stays visible */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "rgba(255, 248, 230, 0.28)", // LOWER opacity
          }}
        />

        {/* content */}
        <div className="relative z-10 h-full">
          {/* page number */}
          <div className="mb-3 text-xs text-zinc-600 select-none">
            Page {pageNumber}
          </div>

          {/* ✅ Title: fully transparent */}
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
            className="w-full bg-transparent outline-none"
            style={{
              fontFamily: "TBJ Nord Poem",
              fontSize: 30,
              lineHeight: "38px",
              color: "#161616",
              border: "none",
              padding: "4px 2px",
              textShadow: "0 1px 0 rgba(255,255,255,0.55)", // ✅ readable on texture
              caretColor: "#111",
            }}
          />

          {/* ✅ Body area */}
          <div className="mt-4" style={{ height: "calc(100% - 80px)" }}>
            <textarea
              value={body}
              placeholder={editable ? "Write your poem here..." : "This page is empty."}
              readOnly={!editable}
              onChange={(e) => {
                const v = e.target.value;
                setBody(v);
                autoSave(title, v);
              }}
              onBlur={syncToParent}
              className="h-full w-full resize-none bg-transparent outline-none"
              style={{
                fontFamily: "TBJ Nord Poem",
                fontSize: 22,
                lineHeight: "36px",
                color: "#0e2a2a", // dark ink
                padding: "6px 2px",
                border: "none",
                textShadow: "0 1px 0 rgba(255,255,255,0.55)",
                caretColor: "#111",
              }}
            />
          </div>
        </div>
      </div>
    );
  }
);

export default PoemPageView;
