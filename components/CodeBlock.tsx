"use client";

import { useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/clipboard";
import { Check, Copy } from "./Icons";

const LANGUAGE_LABELS: Record<string, string> = {
  sql: "SOQL / SQL",
  soql: "SOQL",
  apex: "Apex",
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  json: "JSON",
  csv: "CSV",
  text: "Formula / text",
  bash: "Shell",
  xml: "XML",
  yaml: "YAML",
};

/** Accessible code block with a language label and a copy button. */
export function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const label = language ? (LANGUAGE_LABELS[language] ?? language.toUpperCase()) : "Code";

  useEffect(() => () => clearTimeout(timer.current), []);

  const onCopy = async () => {
    try {
      await copyText(code);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-[#f6f4ef]">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-white/60 py-1.5 pl-4 pr-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-body transition-colors hover:bg-tint hover:text-ink"
        >
          {status === "copied" ? <Check className="text-sm text-accent" /> : <Copy className="text-sm" />}
          {status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : "Copy code"}
        </button>
      </div>
      <pre
        tabIndex={0}
        aria-label={`${label} example`}
        className="overflow-x-auto p-4 font-mono text-[0.8125rem] leading-relaxed text-ink sm:text-sm"
      >
        <code>{code}</code>
      </pre>
      <span role="status" className="sr-only">
        {status === "copied" ? "Code copied to clipboard" : status === "failed" ? "Copying failed" : ""}
      </span>
    </div>
  );
}
