"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, RefreshCw } from "@/components/Icons";

interface CacheFlushButtonProps {
  variant?: "light" | "dark";
}

export function CacheFlushButton({ variant = "light" }: CacheFlushButtonProps) {
  const router = useRouter();
  const [flushing, setFlushing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  async function handleFlush() {
    setFlushing(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/admin/system/revalidate", {
        method: "POST",
      });
      if (res.ok) {
        const timeStr = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        setStatusMsg(`Flushed ${timeStr}`);
        router.refresh();
      } else {
        setStatusMsg("Flush failed");
      }
    } catch {
      setStatusMsg("Network error");
    } finally {
      setFlushing(false);
    }
  }

  const isDark = variant === "dark";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleFlush}
        disabled={flushing}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
          isDark
            ? "border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 focus-visible:ring-white"
            : "border border-[#d4cdc0] bg-white text-[#191c20] hover:border-[#0e5f5b] hover:bg-[#faf8f4] focus-visible:ring-[#0e5f5b]"
        }`}
      >
        <RefreshCw
          className={`size-3.5 ${isDark ? "text-[#a7e3dc]" : "text-[#0e5f5b]"} ${
            flushing ? "animate-spin" : ""
          }`}
        />
        <span>{flushing ? "Flushing..." : "Flush Cache"}</span>
      </button>
      {statusMsg ? (
        <span
          className={`inline-flex items-center gap-1 font-mono text-[11px] ${
            isDark ? "text-[#a7e3dc]" : "text-[#0a4744]"
          }`}
        >
          <CheckCircle2 className="size-3.5" />
          <span>{statusMsg}</span>
        </span>
      ) : null}
    </div>
  );
}
