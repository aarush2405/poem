import { forwardRef } from "react";
import type { Mode, PoemPage } from "../types";

type Props = {
  page: PoemPage;
  mode: Mode;
  pageNumber: number;
  onChange: (updated: PoemPage) => void;
  onFocusInput: () => void;
  onBlurInput: () => void;
};

const PoemPageView = forwardRef<HTMLDivElement, Props>(
  ({ page, mode, pageNumber, onChange, onFocusInput, onBlurInput }, ref) => {
    const editable = mode === "write";

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
      >
        {/* Page number */}
        <div className="mb-2 text-xs text-zinc-500 select-none">
          Page {pageNumber}
        </div>

        {/* Title */}
        <input
          value={page.title}
          placeholder="Poem title..."
          readOnly={!editable}
          onFocus={onFocusInput}
          onBlur={onBlurInput}
          onChange={(e) => onChange({ ...page, title: e.target.value })}
          className={`w-full bg-transparent text-xl font-semibold outline-none ${
            editable ? "border-b border-zinc-300 pb-2" : ""
          }`}
        />

        {/* Body */}
        <div className="mt-4" style={{ height: "calc(100% - 70px)" }}>
          <textarea
            value={page.body}
            placeholder={editable ? "Write your poem here..." : "This page is empty."}
            readOnly={!editable}
            onFocus={onFocusInput}
            onBlur={onBlurInput}
            onChange={(e) => onChange({ ...page, body: e.target.value })}
            className="h-full w-full resize-none rounded-xl bg-white/40 p-4 text-[15px] leading-6 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>
    );
  }
);

export default PoemPageView;
