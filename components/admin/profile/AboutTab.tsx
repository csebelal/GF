"use client";

import { Close } from "@/components/Icons";
import { adminDangerIconBtnClass } from "@/components/admin/ui/FormPrimitives";
import type { ProfileTabProps } from "./types";

export function AboutTab({ profile, setProfile }: ProfileTabProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">About Intro Header</h3>
        <div>
          <label className="block text-xs font-semibold text-[#4c535b]">Intro Headline</label>
          <input
            type="text"
            value={profile.aboutStory?.introHeadline || ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                aboutStory: { ...profile.aboutStory, introHeadline: e.target.value },
              })
            }
            className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#4c535b]">Intro Paragraph</label>
          <textarea
            rows={3}
            value={profile.aboutStory?.introParagraph || ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                aboutStory: { ...profile.aboutStory, introParagraph: e.target.value },
              })
            }
            className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
          />
        </div>
      </div>

      {/* Dynamic Story Chapters */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
            Story Chapters ({profile.aboutStory?.chapters?.length || 0})
          </h3>
          <button
            type="button"
            onClick={() => {
              const chapters = [...(profile.aboutStory?.chapters || [])];
              chapters.push({
                id: `chapter-${Date.now()}`,
                label: "New Chapter",
                title: "Chapter Title",
                body: ["Paragraph 1 of your story..."],
              });
              setProfile({
                ...profile,
                aboutStory: { ...profile.aboutStory, chapters },
              });
            }}
            className="rounded-md bg-[#e1eeec] px-3 py-1.5 text-xs font-semibold text-[#0e5f5b] hover:bg-[#d0e5e2]"
          >
            + Add Chapter
          </button>
        </div>

        <div className="space-y-6">
          {(profile.aboutStory?.chapters || []).map((chapter: any, cIdx: number) => (
            <div key={chapter.id || cIdx} className="rounded-lg border border-[#e6e1d8] p-4 bg-[#faf9f6] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#191c20]">Chapter #{cIdx + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const chapters = [...profile.aboutStory.chapters];
                    chapters.splice(cIdx, 1);
                    setProfile({
                      ...profile,
                      aboutStory: { ...profile.aboutStory, chapters },
                    });
                  }}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Remove Chapter
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#4c535b]">Timeline Label</label>
                  <input
                    type="text"
                    value={chapter.label || ""}
                    onChange={(e) => {
                      const chapters = [...profile.aboutStory.chapters];
                      chapters[cIdx].label = e.target.value;
                      setProfile({
                        ...profile,
                        aboutStory: { ...profile.aboutStory, chapters },
                      });
                    }}
                    placeholder="e.g. Where I started"
                    className="mt-1 w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4c535b]">Chapter Title</label>
                  <input
                    type="text"
                    value={chapter.title || ""}
                    onChange={(e) => {
                      const chapters = [...profile.aboutStory.chapters];
                      chapters[cIdx].title = e.target.value;
                      setProfile({
                        ...profile,
                        aboutStory: { ...profile.aboutStory, chapters },
                      });
                    }}
                    className="mt-1 w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-[#4c535b]">Paragraphs</label>
                  <button
                    type="button"
                    onClick={() => {
                      const chapters = [...profile.aboutStory.chapters];
                      chapters[cIdx].body = [...(chapters[cIdx].body || []), ""];
                      setProfile({
                        ...profile,
                        aboutStory: { ...profile.aboutStory, chapters },
                      });
                    }}
                    className="text-[11px] text-[#0e5f5b] hover:underline"
                  >
                    + Add Paragraph
                  </button>
                </div>

                {(chapter.body || []).map((p: string, pIdx: number) => (
                  <div key={pIdx} className="flex gap-2 items-start">
                    <textarea
                      rows={2}
                      value={p}
                      onChange={(e) => {
                        const chapters = [...profile.aboutStory.chapters];
                        chapters[cIdx].body[pIdx] = e.target.value;
                        setProfile({
                          ...profile,
                          aboutStory: { ...profile.aboutStory, chapters },
                        });
                      }}
                      className="flex-1 rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const chapters = [...profile.aboutStory.chapters];
                        chapters[cIdx].body.splice(pIdx, 1);
                        setProfile({
                          ...profile,
                          aboutStory: { ...profile.aboutStory, chapters },
                        });
                      }}
                      aria-label={`Remove paragraph ${pIdx + 1}`}
                      className={adminDangerIconBtnClass}
                    >
                      <Close className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operating Principles */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">Operating Principles</h3>
          <button
            type="button"
            onClick={() => {
              const principles = [...(profile.aboutStory?.principles || [])];
              principles.push({ title: "New Principle", body: "Description of the principle..." });
              setProfile({
                ...profile,
                aboutStory: { ...profile.aboutStory, principles },
              });
            }}
            className="rounded-md bg-[#e1eeec] px-3 py-1.5 text-xs font-semibold text-[#0e5f5b] hover:bg-[#d0e5e2]"
          >
            + Add Principle
          </button>
        </div>

        <div className="space-y-4">
          {(profile.aboutStory?.principles || []).map((principle: any, pIdx: number) => (
            <div key={pIdx} className="rounded-lg border border-[#e6e1d8] p-3 bg-[#faf9f6] space-y-2">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={principle.title}
                  onChange={(e) => {
                    const principles = [...profile.aboutStory.principles];
                    principles[pIdx].title = e.target.value;
                    setProfile({
                      ...profile,
                      aboutStory: { ...profile.aboutStory, principles },
                    });
                  }}
                  placeholder="Principle Title"
                  className="w-2/3 rounded-md border border-[#d4cdc0] bg-white px-2 py-1 text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={() => {
                    const principles = [...profile.aboutStory.principles];
                    principles.splice(pIdx, 1);
                    setProfile({
                      ...profile,
                      aboutStory: { ...profile.aboutStory, principles },
                    });
                  }}
                  className="text-xs text-red-500"
                >
                  Remove
                </button>
              </div>
              <textarea
                rows={2}
                value={principle.body}
                onChange={(e) => {
                  const principles = [...profile.aboutStory.principles];
                  principles[pIdx].body = e.target.value;
                  setProfile({
                    ...profile,
                    aboutStory: { ...profile.aboutStory, principles },
                  });
                }}
                placeholder="Principle description..."
                className="w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
