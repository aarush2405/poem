import { forwardRef, useEffect, useRef, useState } from "react";
import type { Mode, PoemPage } from "../types";

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

    // ✅ when flipping pages, update text properly
    useEffect(() => {
      setTitle(page.title ?? "");
      setBody(page.body ?? "");
    }, [page.page_no]);

    // ✅ debounce autosave (smooth typing)
    const tRef = useRef<number | null>(null);
    const autoSave = (nextTitle: string, nextBody: string) => {
      if (tRef.current) window.clearTimeout(tRef.current);
      tRef.current = window.setTimeout(() => {
        onAutoSave({ ...page, title: nextTitle, body: nextBody });
      }, 600);
    };

    // ✅ sync to UI on blur
    const syncToParent = () => {
      onChange({ ...page, title, body });
    };

    /**
     * ✅ Paper coords (Your Canva image)
     */
    const RECT = {
      left: 30.27,
      top: 13.15,
      width: 39.36,
      height: 76.86,
    };

    return (
      <div
        ref={ref}
        className="relative h-full w-full overflow-hidden"
        style={{
          background: "transparent", // ✅ no black box
        }}
        // ✅ stop flipbook stealing input clicks
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* ✅ Transparent writing layer */}
        <div
          style={{
            position: "absolute",
            left: `${RECT.left}%`,
            top: `${RECT.top}%`,
            width: `${RECT.width}%`,
            height: `${RECT.height}%`,
            padding: "2.5% 3%",
            boxSizing: "border-box",
          }}
        >
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
            className="w-full bg-transparent outline-none"
            style={{
              fontFamily: "TBJ Nord Poem",
              fontSize: 34,
              lineHeight: "44px",
              color: "#1a1a1a",
              border: "none",
              padding: 0,
              caretColor: "#111",
            }}
          />

          {/* Body */}
          <textarea
            value={body}
            placeholder={editable ? "Write your poem here..." : ""}
            readOnly={!editable}
            onChange={(e) => {
              const v = e.target.value;
              setBody(v);
              autoSave(title, v);
            }}
            onBlur={syncToParent}
            className="w-full resize-none bg-transparent outline-none"
            style={{
              height: "calc(100% - 60px)",
              marginTop: 18,
              fontFamily: "TBJ Nord Poem",
              fontSize: 24,
              lineHeight: "42px",
              color: "#1a1a1a",
              border: "none",
              padding: 0,
              caretColor: "#111",
            }}
          />
        </div>
      </div>
    );
  }
);

export default PoemPageView;
