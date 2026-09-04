"use client";

import { useState } from "react";
import Image from "next/image";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { getMediaUrl } from "@/lib/api";
import type { FamilyMemberItem } from "@/types";

interface FamilyNetworkCardProps {
  familyMembers: FamilyMemberItem[];
  onOpenLightbox: (item: { title: string; text?: string | null; photoUrl?: string | null }) => void;
}

function MemberPhoto({
  photoUrl,
  name,
  onClick,
}: {
  photoUrl?: string | null;
  name: string;
  relation: string;
  onClick: () => void;
}) {
  const t = useTranslations("patientDetail");
  const [hasError, setHasError] = useState(false);
  const photo = photoUrl ? getMediaUrl(photoUrl) : null;

  if (!photo || hasError) {
    return (
      <div className="w-14 h-14 rounded-xl border-2 border-border bg-amber-100 text-amber-900 font-black flex items-center justify-center text-xl shrink-0 shadow-xs">
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-tactile shrink-0 cursor-pointer overflow-hidden rounded-xl"
      aria-label={t("family.view", { name })}
    >
      <Image
        src={photo}
        alt=""
        width={56}
        height={56}
        sizes="56px"
        className="w-14 h-14 rounded-xl border-2 border-border object-cover bg-surface-muted"
        onError={() => setHasError(true)}
      />
    </button>
  );
}

export function FamilyNetworkCard({ familyMembers, onOpenLightbox }: FamilyNetworkCardProps) {
  const t = useTranslations("patientDetail");

  return (
    <div className="scrapbook-card">
      <div className="flex items-center justify-between border-b-2 border-border-soft pb-4 mb-5">
        <div>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink flex items-center gap-2">
            <Users className="h-6 w-6 text-tea" />
            <span>{t("family.title")}</span>
          </h2>
          <p className="text-sm text-ink-secondary mt-0.5">
            {t("family.subtitle")}
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-surface-muted border-2 border-border-soft text-ink font-bold text-sm">
          {familyMembers.length} {t("family.saved")}
        </span>
      </div>

      {familyMembers.length === 0 ? (
        <div className="text-center py-8 text-ink-secondary text-sm">
          {t("family.empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {familyMembers.map((member) => (
            <div
              key={member.id}
              className="bg-surface rounded-xl border-3 border-border p-4 shadow-[3px_3px_0px_var(--color-border)] flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <MemberPhoto
                  photoUrl={member.photoUrl}
                  name={member.name}
                  relation={member.relation}
                  onClick={() =>
                    onOpenLightbox({
                      title: `${member.name} • ${member.relation}`,
                      text: member.notes,
                      photoUrl: member.photoUrl,
                    })
                  }
                />
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
          ))}
        </div>
      )}
    </div>
  );
}
