"use client";

import { getMediaUrl } from "@/lib/api";
import type { FamilyMemberItem } from "@/types";

interface FamilyNetworkCardProps {
  familyMembers: FamilyMemberItem[];
  onOpenLightbox: (item: { title: string; text?: string | null; photoUrl?: string | null }) => void;
}

export function FamilyNetworkCard({ familyMembers, onOpenLightbox }: FamilyNetworkCardProps) {
  return (
    <div className="scrapbook-card">
      <div className="flex items-center justify-between border-b-2 border-border-soft pb-4 mb-5">
        <div>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink">
            👨‍👩‍👧‍👦 Family & Care Circle
          </h2>
          <p className="text-sm text-ink-secondary mt-0.5">
            Key family members and loved ones for photo-recognition games
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-surface-muted border-2 border-border-soft text-ink font-bold text-sm">
          {familyMembers.length} Saved
        </span>
      </div>

      {familyMembers.length === 0 ? (
        <div className="text-center py-8 text-ink-secondary text-sm">
          No family members registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {familyMembers.map((member) => {
            const photo = getMediaUrl(member.photoUrl);
            return (
              <div
                key={member.id}
                className="bg-surface rounded-xl border-3 border-border p-4 shadow-[3px_3px_0px_var(--color-border)] flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  {photo ? (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenLightbox({
                          title: `${member.name} • ${member.relation}`,
                          text: member.notes,
                          photoUrl: member.photoUrl,
                        })
                      }
                      className="btn-tactile shrink-0 cursor-pointer"
                    >
                      <img
                        src={photo}
                        alt={member.name}
                        className="w-14 h-14 rounded-xl border-2 border-border object-cover bg-surface-muted"
                      />
                    </button>
                  ) : (
                    <div className="w-14 h-14 rounded-xl border-2 border-border bg-tea/20 text-tea font-bold flex items-center justify-center text-xl shrink-0">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base text-ink truncate">
                      {member.name}
                    </h3>
                    <span className="inline-block px-2 py-0.5 rounded-lg bg-surface-muted border border-border-soft text-xs font-bold text-ink-secondary uppercase tracking-wider mt-1">
                      {member.relation}
                    </span>
                  </div>
                </div>

                {member.notes && (
                  <p className="mt-3 text-xs text-ink-secondary bg-surface-muted/60 p-2.5 rounded-lg border border-border-soft leading-snug">
                    {member.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
