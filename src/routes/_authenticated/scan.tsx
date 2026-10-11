import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useState } from "react";
import { toast } from "sonner";
import { ScanLine, CheckCircle2, AlertTriangle, Keyboard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/scan")({
  component: ScanPage,
});

// Fallback UUID generator if crypto.randomUUID is not available
function generateUUID() {
  try {
    return crypto.randomUUID();
  } catch {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

function deviceHash() {
  const key = "atbu-device-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

async function getCoords() {
  try {
    const pos = await new Promise<GeolocationPosition>((res, rej) => {
      if (!navigator.geolocation) return rej(new Error("no-geo"));
      navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 8000 });
    });
    return { lat: pos.coords.latitude, lon: pos.coords.longitude };
  } catch {
    return { lat: null, lon: null };
  }
}

function ScanPage() {
  const [status, setStatus] = useState<"idle" | "scanning" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [detail, setDetail] = useState<{ code?: string; title?: string } | null>(null);

  async function acceptToken(raw: string) {
    if (status === "processing") return;
    const t = raw.trim();
    if (!t) return;
    setStatus("processing");
    setMessage("Getting your location…");
    try {
      const { lat, lon } = await getCoords();
      setMessage("Recording attendance…");
      
      // Call the RPC function WITHOUT _student_id
      const { data, error } = await supabase.rpc("mark_attendance", {
        _token: t,
        _lat: lat ?? 0,
        _lon: lon ?? 0,
        _device_hash: deviceHash(),
      });
      
      if (error) throw new Error(error.message);
      const res = (data ?? {}) as { code?: string; title?: string };
      setDetail({ code: res.code, title: res.title });
      setStatus("success");
      toast.success("Attendance recorded!");
    } catch (e: any) {
      console.error("Attendance error:", e);
      setStatus("error");
      setMessage(e?.message ?? "Failed to record attendance.");
      toast.error(e?.message ?? "Failed");
    }
  }

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-primary">Sign in to lecture</h1>
        <p className="text-sm text-muted-foreground">
          Scan the QR code on screen or type the 6-digit code your lecturer reads out.
        </p>
      </header>

      <div className="mx-auto max-w-md">
        {status === "idle" && (
          <div className="space-y-4">
            <button
              onClick={() => setStatus("scanning")}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-3xl bg-hero p-10 text-white shadow-elev transition hover:opacity-95"
            >
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white/10 backdrop-blur">
                <ScanLine className="h-10 w-10 text-gold" />
              </div>
              <span className="font-display text-xl font-bold">Open camera</span>
              <span className="text-sm text-white/70">Scan the QR on screen</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                or enter code
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <PinEntry onSubmit={(v) => acceptToken(v)} />
          </div>
        )}

        {status === "scanning" && (
          <div className="overflow-hidden rounded-3xl border bg-black">
            <div className="relative aspect-square">
              <Scanner
                onScan={(res) => res[0]?.rawValue && acceptToken(res[0].rawValue)}
                onError={() => {}}
                constraints={{ facingMode: "environment" }}
                styles={{ container: { width: "100%", height: "100%" }, video: { objectFit: "cover" } }}
              />
              <div className="pointer-events-none absolute inset-6 rounded-2xl border-4 border-gold animate-pulse-ring" />
            </div>
            <div className="p-4 text-center text-sm text-white">Scanning…</div>
            <button
              onClick={() => setStatus("idle")}
              className="w-full border-t border-white/10 p-3 text-sm text-white/70 hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        )}

        {status === "processing" && (
          <div className="rounded-3xl border bg-card p-10 text-center shadow-elev">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm font-semibold">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="rounded-3xl border bg-card p-8 text-center shadow-elev">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/10">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold">You're marked present</h2>
            {detail && (
              <p className="mt-1 text-sm text-muted-foreground">
                {detail.code} · {detail.title}
              </p>
            )}
            <button
              onClick={() => {
                setStatus("idle");
                setDetail(null);
              }}
              className="mt-6 block w-full rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Done
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-3xl border bg-card p-8 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold">Couldn't record attendance</h2>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-6 w-full rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function PinEntry({ onSubmit }: { onSubmit: (pin: string) => void }) {
  const [pin, setPin] = useState("");
  const ok = /^\d{6}$/.test(pin);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (ok) onSubmit(pin);
      }}
      className="rounded-3xl border bg-card p-5 shadow-sm"
    >
      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Keyboard className="h-3.5 w-3.5" /> 6-digit code
      </label>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]{6}"
        autoComplete="one-time-code"
        maxLength={6}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="••••••"
        className="mt-2 w-full rounded-2xl border-2 border-dashed bg-background py-4 text-center font-mono text-3xl font-black tracking-[0.4em] text-primary focus:border-gold focus:outline-none"
      />
      <button
        type="submit"
        disabled={!ok}
        className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-elev disabled:cursor-not-allowed disabled:opacity-40"
      >
        Sign me in
      </button>
    </form>
  );
}