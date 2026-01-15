import { useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import wood from "./assets/wood.jpg";

import type { Mode, PoemPage, Profile } from "./types";
import { supabase } from "./utils/supabase";

import AuthGate from "./components/AuthGate";
import IndexModal from "./components/IndexModal";
import PoemPageView from "./components/PoemPageView";

import { BookOpen, Plus, List, ArrowLeft, ArrowRight, LogOut } from "lucide-react";

function blankPage(pageNo: number): PoemPage {
  return { page_no: pageNo, title: "", body: "" };
}

export default function App() {
  return (
    <AuthGate>
      {({ userId }) => <BookApp userId={userId} />}
    </AuthGate>
  );
}

function BookApp({ userId }: { userId: string }) {
  const flipRef = useRef<any>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [mode, setMode] = useState<Mode>("read");

  const [pages, setPages] = useState<PoemPage[]>([]);
  const [indexOpen, setIndexOpen] = useState(false);
  const [jump, setJump] = useState("");

  const pageCount = pages.length;

  const desktopBookSize = useMemo(() => {
    const w = Math.min(900, Math.max(680, window.innerWidth * 0.7));
    const h = Math.min(560, Math.max(420, window.innerHeight * 0.65));
    return { w, h };
  }, []);

  // ensure profile exists + fetch role
  useEffect(() => {
    (async () => {
      // create profile row if missing
      const { data: existing } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!existing) {
        await supabase.from("profiles").insert({ id: userId, role: "reader" });
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", userId)
        .single();

      if (prof) {
        setProfile(prof as Profile);
        setMode(prof.role === "writer" ? "write" : "read");
      }
    })();
  }, [userId]);

  // Load poems
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("poems")
        .select("page_no,title,body")
        .order("page_no", { ascending: true });

      setPages((data ?? []) as PoemPage[]);
    })();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    location.reload();
  };

  // FLIP only via buttons
  const prev = () => flipRef.current?.pageFlip?.().flipPrev();
  const next = () => flipRef.current?.pageFlip?.().flipNext();

  const jumpTo = (n: number) => {
    const book = flipRef.current?.pageFlip?.();
    if (!book) return;
    const index = Math.max(0, Math.min(pageCount - 1, n));
    book.flip(index);
  };

  const addPage = async () => {
    if (mode !== "write") return;

    const pageNo = pages.length + 1;
    const page = blankPage(pageNo);

    // insert into DB
    const { error } = await supabase.from("poems").insert(page);
    if (error) {
      alert(error.message);
      return;
    }

    // update UI
    const updated = [...pages, page];
    setPages(updated);

    setTimeout(() => {
      const book = flipRef.current?.pageFlip?.();
      if (book) book.flip(updated.length - 1);
    }, 100);
  };

  // autosave (upsert)
  const updatePage = (idx: number, updatedPage: PoemPage) => {
    setPages((prev) => prev.map((p, i) => (i === idx ? updatedPage : p)));

    if (mode !== "write") return;

    // debounced save
    window.clearTimeout((updatePage as any)._t);
    (updatePage as any)._t = window.setTimeout(async () => {
      const { error } = await supabase.from("poems").upsert(updatedPage, {
        onConflict: "page_no",
      });
      if (error) console.error(error);
    }, 350);
  };

  const isWriter = profile?.role === "writer";

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${wood})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
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

          <span className="ml-2 rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/80">
            {isWriter ? "WRITER" : "READER"}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-black/55 p-2 text-white ring-1 ring-white/10 backdrop-blur">
          <button
            onClick={() => setIndexOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
          >
            <List size={16} /> Index
          </button>

          {isWriter && (
            <button
              onClick={addPage}
              className="flex items-center gap-2 rounded-xl bg-emerald-500/90 px-3 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
            >
              <Plus size={16} /> Add Page
            </button>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Book */}
      <main className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-10">
        {pageCount === 0 ? (
          <div className="mt-10 w-full max-w-2xl rounded-3xl bg-black/55 p-10 text-center text-white ring-1 ring-white/10 backdrop-blur">
            <h2 className="text-2xl font-bold">Your book is empty 📖</h2>
            <p className="mt-2 text-sm text-white/70">
              {isWriter ? "Click “Add Page” to start writing poems." : "Waiting for poems..."}
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
                  useMouseEvents={false} // ✅ flip only via buttons
                  flippingTime={700}
                  className="shadow-2xl"
                >
                  {pages.map((p, idx) => (
                    <PoemPageView
                      key={p.page_no}
                      page={p}
                      mode={mode}
                      pageNumber={idx + 1}
                      onChange={(updated) => updatePage(idx, updated)}
                    />
                  ))}
                </HTMLFlipBook>
              </div>
            </div>

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
