"use client";

import { useState } from "react";
import { copyText } from "@/lib/clipboard";
import { Check, Copy } from "./Icons";

export function CopyEmailButton({
  email,
  label = "Copy address",
}: {
  email: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={async () => {
          try {
            await copyText(email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }}
        className="btn btn-secondary btn-sm"
      >
        {copied ? <Check className="text-accent" /> : <Copy />}
        {copied ? "Copied" : label}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </>
  );
}
