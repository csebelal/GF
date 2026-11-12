import { safeHref } from "@/lib/security/sanitize";
import { Download } from "./Icons";

const DEFAULT_CV = {
  href: "/cv/Afrin-Akter-Chishti-Salesforce-Administrator-CV.pdf",
  downloadName: "Afrin-Akter-Chishti-Salesforce-Administrator-CV.pdf",
};

interface CVDownloadProps {
  variant?: "primary" | "secondary" | "link";
  size?: "md" | "sm";
  label?: string;
  showMeta?: boolean;
  className?: string;
  cv?: {
    href: string;
    downloadName: string;
    sizeLabel?: string;
  };
}

/** Download link for the bundled CV PDF with a descriptive filename. */
export function CVDownload({
  variant = "secondary",
  size = "md",
  label = "Download CV",
  className = "",
  cv: customCv,
}: CVDownloadProps) {
  const cv = customCv ?? DEFAULT_CV;
  const cvHref = safeHref(cv.href, DEFAULT_CV.href);

  if (variant === "link") {
    return (
      <a
        href={cvHref}
        download={cv.downloadName}
        className={`link-arrow transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${className}`}
      >
        <Download className="text-[1.05em]" />
        <span>{label}</span>
        <span className="sr-only">(PDF)</span>
      </a>
    );
  }

  const variantClass = variant === "primary" ? "btn-primary" : "btn-secondary";
  return (
    <a
      href={cvHref}
      download={cv.downloadName}
      className={`btn ${variantClass} ${size === "sm" ? "btn-sm" : ""} transition-all duration-200 ${className}`}
    >
      <Download className="text-[1.1em]" />
      <span>{label}</span>
      <span className="sr-only">(PDF)</span>
    </a>
  );
}
