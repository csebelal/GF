import { ogSize, renderOgImage } from "@/lib/og";

export const alt = "Afrin Akter Chishti — Salesforce Administrator";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    eyebrow: "Portfolio",
    title: "Salesforce automation, CRM data and connected systems",
  });
}
