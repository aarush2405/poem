import { forwardRef, useEffect, useRef, useState } from "react";
import type { Mode, PoemPage } from "../types";
import pageBg from "../assets/page.jpg";

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
      className="page h-full w-full text-zinc-900"
      style={{
        borderRadius: 18,
        padding: 24,
        backgroundImage: `url(${pageBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        boxShadow:
          "inset 0 0 0 1px rgba(0,0,0,0.07), 0 16px 40px rgba(0,0,0,0.32)",
        }}
        // block flip interactions stealing focus
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="mb-2 text-xs text-zinc-500 select-none">
          Page {pageNumber}
        </div>
<div
  className="page relative h-full w-full text-zinc-900 overflow-hidden"

  style={{
    boxShadow:
      "inset 0 0 80px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(0,0,0,0.06)",
  }}
/>

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
  className={`w-full bg-transparent text-3xl font-semibold outline-none ${
    editable ? "border-b border-zinc-400/50 pb-2" : ""
  }`}
  style={{ fontFamily: "TBJ Nord Poem" }}
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
  onBlur={syncToParent}
  className="h-full w-full resize-none rounded-2xl bg-black/0 p-4 text-[20px] leading-8 outline-none"
  style={{ fontFamily: "TBJ Nord Poem" }}
/>

        </div>
      </div>
    );
  }
);

export default PoemPageView;
