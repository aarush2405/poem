import { useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import wood from "./assets/wood.jpg";

import type { Mode, PoemPage } from "./types";
import { loadState, saveMode, savePages } from "./utils/storage";

import ModeModal from "./components/ModeModal";
import IndexModal from "./components/IndexModal";
import PoemPageView from "./components/PoemPageView";

import { BookOpen, Plus, List, ArrowLeft, ArrowRight } from "lucide-react";

function newBlankPage(nextId: number): PoemPage {
  return {
    id: String(nextId),
    title: "",
    body: "",
  };
}

export default function App() {
  const flipRef = useRef<any>(null);

  const [mode, setMode] = useState<Mode | null>(null);
  const [pages, setPages] = useState<PoemPage[]>([]);
  const [indexOpen, setIndexOpen] = useState(false);
  const [jump, setJump] = useState("");

  // Load from localStorage
  useEffect(() => {
    const s = loadState();
    if (s.pages && Array.isArray(s.pages)) setPages(s.pages);
    if (s.mode === "read" || s.mode === "write") setMode(s.mode);
  }, []);

  const pageCount = pages.length;

  // Responsive book size
  const desktopBookSize = useMemo(() => {
    const w = Math.min(900, Math.max(680, window.innerWidth * 0.7));
    const h = Math.min(560, Math.max(420, window.innerHeight * 0.65));
    return { w, h };
  }, []);

  const chooseMode = (m: Mode) => {
    setMode(m);
    saveMode(m);
  };

  const addPage = () => {
    const updated = [...pages, newBlankPage(pages.length + 1)];
    setPages(updated);
    savePages(updated);

    // Flip to last page
    setTimeout(() => {
      const book = flipRef.current?.pageFlip?.();
      if (book) book.flip(updated.length - 1);
    }, 100);
  };

  const updatePage = (idx: number, updatedPage: PoemPage) => {
    const updated = pages.map((p, i) => (i === idx ? updatedPage : p));
    setPages(updated);
    savePages(updated);
  };

  const prev = () => flipRef.current?.pageFlip?.().flipPrev();
  const next = () => flipRef.current?.pageFlip?.().flipNext();

  const jumpTo = (n: number) => {
    const book = flipRef.current?.pageFlip?.();
    if (!book) return;
    const index = Math.max(0, Math.min(pageCount - 1, n));
    book.flip(index);
  };

  const showModeModal = mode === null;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${wood})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <ModeModal open={showModeModal} onPick={chooseMode} />

      <IndexModal
        open={indexOpen}
        pages={pages}
        onClose={() => setIndexOpen(false)}
        onJump={(idx) => {
          setIndexOpen(false);
          jumpTo(idx);
        }}
      />

      {/* Top bar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-black/55 px-4 py-3 text-white ring-1 ring-white/10 backdrop-blur">
          <BookOpen size={18} />
          <span className="text-sm font-semibold">Virtual Poem Book</span>
          {mode && (
            <span className="ml-2 rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/80">
              {mode.toUpperCase()} MODE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-black/55 p-2 text-white ring-1 ring-white/10 backdrop-blur">
          <button
            onClick={() => setIndexOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
          >
            <List size={16} /> Index
          </button>

          {mode === "write" && (
            <button
              onClick={addPage}
              className="flex items-center gap-2 rounded-xl bg-emerald-500/90 px-3 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
            >
              <Plus size={16} /> Add Page
            </button>
          )}
        </div>
      </header>

      {/* Book area */}
      <main className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-10">
        {pageCount === 0 ? (
          <div className="mt-10 w-full max-w-2xl rounded-3xl bg-black/55 p-10 text-center text-white ring-1 ring-white/10 backdrop-blur">
            <h2 className="text-2xl font-bold">Your book is empty 📖</h2>
            <p className="mt-2 text-sm text-white/70">
              {mode === "write"
                ? 'Click "Add Page" to start writing poems.'
                : "Switch to Write mode to add poems."}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 flex w-full justify-center">
              <div className="rounded-[28px] bg-black/35 p-6 ring-1 ring-white/10 backdrop-blur">
                <HTMLFlipBook
                  ref={flipRef}
                  width={desktopBookSize.w / 2}
                  height={desktopBookSize.h}
                  size="stretch"
                  minWidth={320}
                  maxWidth={520}
                  minHeight={420}
                  maxHeight={620}
                  showCover={false}
                  mobileScrollSupport={true}
                  drawShadow={true}
                  useMouseEvents={false}
                  flippingTime={700}
                  className="shadow-2xl"
                >
                  {pages.map((p, idx) => (
                    <PoemPageView
                      key={p.id}
                      page={p}
                      mode={mode ?? "read"}
                      pageNumber={idx + 1}
                      onChange={(updated) => updatePage(idx, updated)}
                      onFocusInput={() => setInputsActive(true)}
                      onBlurInput={() => setInputsActive(false)}
                    />
                  ))}
                </HTMLFlipBook>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-5 flex w-full max-w-3xl items-center justify-between gap-3 rounded-2xl bg-black/55 p-3 text-white ring-1 ring-white/10 backdrop-blur">
              <div className="flex gap-2">
                <button
                  onClick={prev}
                  className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
                >
                  <span className="inline-flex items-center gap-2">
                    <ArrowLeft size={16} /> Prev
                  </span>
                </button>

                <button
                  onClick={next}
                  className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
                >
                  <span className="inline-flex items-center gap-2">
                    Next <ArrowRight size={16} />
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/70">Jump to</span>
                <input
                  value={jump}
                  onChange={(e) => setJump(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const n = parseInt(jump, 10);
                      if (!Number.isNaN(n)) jumpTo(n - 1);
                      setJump("");
                    }
                  }}
                  placeholder="page #"
                  className="w-24 rounded-xl bg-white/10 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400/60"
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
