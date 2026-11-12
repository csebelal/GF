import type { Dispatch, SetStateAction } from "react";

export type ProfileTabKey =
  | "hero"
  | "nav"
  | "footer"
  | "identity"
  | "about"
  | "contact"
  | "seo";

export const PROFILE_TABS: { key: ProfileTabKey; label: string }[] = [
  { key: "hero", label: "Hero & Home Fold" },
  { key: "nav", label: "Menu & Header" },
  { key: "footer", label: "Footer Settings" },
  { key: "identity", label: "Identity & CV" },
  { key: "about", label: "About Story & Principles" },
  { key: "contact", label: "Contact Page & Cards" },
  { key: "seo", label: "SEO & Settings" },
];

export interface ProfileMessage {
  text: string;
  type: "success" | "error";
}

export interface ProfileTabProps {
  profile: any;
  setProfile: Dispatch<SetStateAction<any>>;
}
