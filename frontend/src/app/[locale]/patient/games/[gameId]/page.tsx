import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { GameClient } from "./GameClient";
import { getGameMeta } from "@/games/meta";
import { buildMetadata, resolveMessage } from "@/lib/metadata";

type Props = {
  params: Promise<{ locale: string; gameId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, gameId } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const meta = getGameMeta(gameId);
  if (!meta) {
    return buildMetadata({
      locale,
      title: "Cognitive Therapy Game",
      description: "Interactive cognitive digital therapeutic serious game for elderly memory care.",
      path: `/patient/games/${gameId}`,
    });
  }

  const messages = await getMessages();
  const games = (messages as { games?: unknown })?.games;
  const title = resolveMessage(games, meta.titleKey, meta.id);
  const description = resolveMessage(
    games,
    meta.descKey,
    `${meta.domain} — cognitive digital therapeutic for elderly memory care.`
  );

  return buildMetadata({
    locale,
    title,
    description,
    path: `/patient/games/${gameId}`,
    keywords: [
      meta.domain,
      "cognitive therapy game",
      "dementia gameplay",
      "elderly memory care",
      "CDTx serious game",
    ],
  });
}

export default async function GamePage({ params }: Props) {
  const { gameId } = await params;
  return <GameClient key={gameId} />;
}