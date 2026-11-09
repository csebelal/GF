import { profile as staticProfile } from "@/content/site";
import { Download } from "./Icons";

interface CVDownloadProps {
  variant?: "primary" | "secondary" | "link";
  size?: "md" | "sm";
  label?: string;
  showMeta?: boolean;
  className?: string;
  cv?: {
    href: string;
    downloadName: string;
    sizeLabel: string;
  };
}

/** Download link for the bundled CV PDF with a descriptive filename. */
export function CVDownload({
  variant = "secondary",
  size = "md",
  label = "Download CV",
  showMeta = false,
  className = "",
  cv: customCv,
}: CVDownloadProps) {
  const cv = customCv ?? staticProfile.cv;
  const meta = cv.sizeLabel;

  if (variant === "link") {
    return (
      <a href={cv.href} download={cv.downloadName} className={`link-arrow ${className}`}>
        <Download className="text-[1.05em]" />
        {label}
        {showMeta ? <span className="font-normal text-muted">({meta})</span> : <span className="sr-only">({meta})</span>}
      </a>
    );
  }

  const variantClass = variant === "primary" ? "btn-primary" : "btn-secondary";
  return (
    <a
      href={cv.href}
      download={cv.downloadName}
      className={`btn ${variantClass} ${size === "sm" ? "btn-sm" : ""} ${className}`}
    >
      <Download className="text-[1.1em]" />
      <span>{label}</span>
      {showMeta ? (
        <span className={`text-xs font-medium ${variant === "primary" ? "text-white/70" : "text-muted"}`}>{meta}</span>
      ) : (
        <span className="sr-only">({meta})</span>
      )}
    </a>
  );
}
