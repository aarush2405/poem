import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export default function AuthGate({
  children,
}: {
  children: (arg: { userId: string }) => JSX.Element;
}) {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  if (!userId) return <AuthScreen />;

  return children({ userId });
}

function AuthScreen() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const login = async () => {
    setErr(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    setBusy(false);
    if (error) setErr(error.message);
  };

  return (
    <div className="min-h-screen grid place-items-center bg-zinc-950 p-6 text-white">
      <div className="w-full max-w-sm rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
        <h1 className="text-xl font-bold">Virtual Poem Book</h1>
        <p className="mt-1 text-sm text-white/70">Login to continue</p>

        <input
          className="mt-4 w-full rounded-xl bg-white/10 px-4 py-3 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400/60"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="mt-3 w-full rounded-xl bg-white/10 px-4 py-3 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400/60"
          placeholder="Password"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        {err && <div className="mt-3 text-sm text-red-300">{err}</div>}

        <button
          onClick={login}
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-black hover:bg-emerald-300 disabled:opacity-60"
        >
          {busy ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
