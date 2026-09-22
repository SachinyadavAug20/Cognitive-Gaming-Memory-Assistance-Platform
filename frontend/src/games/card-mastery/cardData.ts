export type CardSuit = "spades" | "hearts" | "diamonds" | "clubs" | "joker";
export type CardRank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "Joker";

export interface PlayingCard {
  id: string;
  suit: CardSuit;
  rank: CardRank;
  value: number; // 1 for A (or 14 depending on context), 2..10, 11 for J, 12 for Q, 13 for K, 15 for Joker
  color: "red" | "black";
  symbol: string;
  isJoker: boolean;
  jokerColor?: "red" | "black";
}

export const SUIT_SYMBOLS: Record<CardSuit, string> = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  joker: "🃏",
};

export const SUITS_LOCALIZED: Record<string, Record<CardSuit, string>> = {
  en: { spades: "Spades ♠", hearts: "Hearts ♥", diamonds: "Diamonds ♦", clubs: "Clubs ♣", joker: "Joker 🃏" },
  as: { spades: "ইস্কাপন ♠", hearts: "পান ♥", diamonds: "ৰুইতন ♦", clubs: "চিৰিয়া ♣", joker: "জোকাৰ 🃏" },
  hi: { spades: "हुकुम ♠", hearts: "पान ♥", diamonds: "ईंट ♦", clubs: "चिड़ी ♣", joker: "जोकर 🃏" },
  bn: { spades: "ইস্কাপন ♠", hearts: "হরতন (পান) ♥", diamonds: "রুইতন ♦", clubs: "চিড়িতন ♣", joker: "জোকার 🃏" },
  mr: { spades: "इसपीक ♠", hearts: "बदाम ♥", diamonds: "चौकट ♦", clubs: "किलवर ♣", joker: "जोकर 🃏" },
  ne: { spades: "हुकुम ♠", hearts: "पान ♥", diamonds: "ईंट ♦", clubs: "चिड़ी ♣", joker: "जोकर 🃏" },
  mni: { spades: "য়েন্থাং ♠", hearts: "থমোই (পান) ♥", diamonds: "ডায়মন্ড ♦", clubs: "ক্লাব ♣", joker: "জোকার 🃏" },
  brx: { spades: "स्पेड ♠", hearts: "पान ♥", diamonds: "दायमन्द ♦", clubs: "क्लाब ♣", joker: "जोकार 🃏" },
  grt: { spades: "Spades ♠", hearts: "Hearts ♥", diamonds: "Diamonds ♦", clubs: "Clubs ♣", joker: "Joker 🃏" },
  kha: { spades: "Spades ♠", hearts: "Hearts ♥", diamonds: "Diamonds ♦", clubs: "Clubs ♣", joker: "Joker 🃏" },
  lus: { spades: "Spades ♠", hearts: "Hearts ♥", diamonds: "Diamonds ♦", clubs: "Clubs ♣", joker: "Joker 🃏" },
};

export const RANKS_LOCALIZED: Record<string, Record<CardRank, string>> = {
  en: {
    A: "Ace", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9", "10": "10",
    J: "Jack", Q: "Queen", K: "King", Joker: "Joker",
  },
  as: {
    A: "টেক্কা (Ace)", "2": "দুৱা (২)", "3": "তীয়া (৩)", "4": "চৌকা (৪)", "5": "পাঞ্জা (৫)",
    "6": "ছক্কা (৬)", "7": "সত্তা (৭)", "8": "আঠা (৮)", "9": "নহলা (৯)", "10": "দহলা (১০)",
    J: "গোলাম (Jack)", Q: "বিবি (Queen)", K: "চাহেব (King)", Joker: "জোকাৰ",
  },
  hi: {
    A: "इक्का (Ace)", "2": "दुक्की (२)", "3": "तिक्की (३)", "4": "चौका (४)", "5": "पंजा (५)",
    "6": "छक्का (६)", "7": "सत्ता (७)", "8": "अठ्ठा (८)", "9": "नहला (९)", "10": "दहला (१०)",
    J: "गुलाम (Jack)", Q: "बेगम (Queen)", K: "बादशाह (King)", Joker: "जोकर",
  },
  bn: {
    A: "টেক্কা (Ace)", "2": "দুরি (২)", "3": "তিরি (৩)", "4": "চৌকা (৪)", "5": "পাঞ্জা (৫)",
    "6": "ছক্কা (৬)", "7": "সাত্তা (৭)", "8": "আট্টি (৮)", "9": "নহলা (৯)", "10": "দহলা (১০)",
    J: "গোলাম (Jack)", Q: "বিবি (Queen)", K: "সাহেব (King)", Joker: "জোকার",
  },
  mr: {
    A: "एक्का (Ace)", "2": "दुरी (२)", "3": "तिर्री (३)", "4": "चौकार (४)", "5": "पंजा (५)",
    "6": "छक्की (६)", "7": "सत्ती (७)", "8": "अठ्ठी (८)", "9": "नहला (९)", "10": "दहला (१०)",
    J: "गुलाम (Jack)", Q: "राणी (Queen)", K: "राजा (King)", Joker: "जोकर",
  },
  ne: {
    A: "एक्का (Ace)", "2": "दुक्की (२)", "3": "तिक्की (३)", "4": "चौका (४)", "5": "पञ्जा (५)",
    "6": "छक्का (६)", "7": "सत्ता (७)", "8": "अठ्ठा (८)", "9": "नहला (९)", "10": "दहला (१०)",
    J: "गुलाम (Jack)", Q: "रानी (Queen)", K: "बादशाह (King)", Joker: "जोकर",
  },
  mni: {
    A: "এক্কা (Ace)", "2": "অনি (২)", "3": "অহুম (৩)", "4": "মরি (৪)", "5": "মঙা (৫)",
    "6": "তরুক (৬)", "7": "তরেৎ (৭)", "8": "নিপাল (৮)", "9": "মাপল (৯)", "10": "তরা (১০)",
    J: "গুলাম (Jack)", Q: "রানি (Queen)", K: "নিংথৌ (King)", Joker: "জোকার",
  },
  brx: {
    A: "एक्का (Ace)", "2": "नै (२)", "3": "थाम (३)", "4": "ब्रै (४)", "5": "बा (५)",
    "6": "द' (६)", "7": "स्नि (७)", "8": "दाइन (८)", "9": "गु (९)", "10": "जि (१०)",
    J: "गोलाम (Jack)", Q: "रानि (Queen)", K: "राजा (King)", Joker: "जोकार",
  },
  grt: {
    A: "Ace (Sa)", "2": "2 (Gni)", "3": "3 (Gitam)", "4": "4 (Bri)", "5": "5 (Bong·a)",
    "6": "6 (Dok)", "7": "7 (Sni)", "8": "8 (Chet)", "9": "9 (Skuk)", "10": "10 (Chikung)",
    J: "Jack", Q: "Queen (Rani)", K: "King (Raja)", Joker: "Joker",
  },
  kha: {
    A: "Ace (Shyiem)", "2": "2 (Ar)", "3": "3 (Lai)", "4": "4 (Saw)", "5": "5 (San)",
    "6": "6 (Hynriew)", "7": "7 (Hynniew)", "8": "8 (Phra)", "9": "9 (Khyndai)", "10": "10 (Shiphew)",
    J: "Jack", Q: "Queen (Syiem Kynthei)", K: "King (Syiem Shynrang)", Joker: "Joker",
  },
  lus: {
    A: "Ace (Pakhat)", "2": "2 (Pahnih)", "3": "3 (Pathum)", "4": "4 (Pali)", "5": "5 (Panga)",
    "6": "6 (Paruk)", "7": "7 (Pasarih)", "8": "8 (Pariat)", "9": "9 (Pakhaw)", "10": "10 (Sawm)",
    J: "Jack", Q: "Queen (Lalnu)", K: "King (Lalpa)", Joker: "Joker",
  },
};

export const COLORS_LOCALIZED: Record<string, { red: string; black: string }> = {
  en: { red: "Red", black: "Black" },
  as: { red: "ৰঙা (Red)", black: "ক'লা (Black)" },
  hi: { red: "लाल (Red)", black: "काला (Black)" },
  bn: { red: "লাল (Red)", black: "কালো (Black)" },
  mr: { red: "लाल (Red)", black: "काळा (Black)" },
  ne: { red: "रातो (Red)", black: "कालो (Black)" },
  mni: { red: "অঙাংবা (Red)", black: "অমুবা (Black)" },
  brx: { red: "गोजा (Red)", black: "गोसोम (Black)" },
  grt: { red: "Gitchak (Red)", black: "Gisim (Black)" },
  kha: { red: "Saw (Red)", black: "Ion (Black)" },
  lus: { red: "Sen (Red)", black: "Dum (Black)" },
};

export function getCleanLocale(locale: string): string {
  const code = (locale?.split("-")[0]?.toLowerCase() || "en");
  return SUITS_LOCALIZED[code] ? code : "en";
}

export function getCardName(card: PlayingCard, locale: string): string {
  const l = getCleanLocale(locale);
  if (card.isJoker) {
    const col = card.jokerColor === "red"
      ? (COLORS_LOCALIZED[l]?.red || "Red")
      : (COLORS_LOCALIZED[l]?.black || "Black");
    const jok = SUITS_LOCALIZED[l]?.joker || "Joker";
    return `${col} ${jok}`;
  }
  const rankStr = RANKS_LOCALIZED[l]?.[card.rank] || card.rank;
  const suitStr = SUITS_LOCALIZED[l]?.[card.suit] || card.suit;
  
  if (l === "hi" || l === "as" || l === "bn" || l === "mr" || l === "ne") {
    // e.g. "পানৰ চাহেব" or "पान का बादशाह"
    return `${suitStr} - ${rankStr}`;
  }
  return `${rankStr} of ${suitStr}`;
}

export function getSuitName(suit: CardSuit, locale: string): string {
  const l = getCleanLocale(locale);
  return SUITS_LOCALIZED[l]?.[suit] || suit;
}

export function getRankName(rank: CardRank, locale: string): string {
  const l = getCleanLocale(locale);
  return RANKS_LOCALIZED[l]?.[rank] || rank;
}

// Generate full standard 54-card deck
export function createStandard54Deck(): PlayingCard[] {
  const suits: CardSuit[] = ["spades", "hearts", "diamonds", "clubs"];
  const ranks: { rank: CardRank; value: number }[] = [
    { rank: "A", value: 1 },
    { rank: "2", value: 2 },
    { rank: "3", value: 3 },
    { rank: "4", value: 4 },
    { rank: "5", value: 5 },
    { rank: "6", value: 6 },
    { rank: "7", value: 7 },
    { rank: "8", value: 8 },
    { rank: "9", value: 9 },
    { rank: "10", value: 10 },
    { rank: "J", value: 11 },
    { rank: "Q", value: 12 },
    { rank: "K", value: 13 },
  ];

  const deck: PlayingCard[] = [];

  for (const suit of suits) {
    const color = suit === "hearts" || suit === "diamonds" ? "red" : "black";
    const symbol = SUIT_SYMBOLS[suit];
    for (const { rank, value } of ranks) {
      deck.push({
        id: `${suit}_${rank}`,
        suit,
        rank,
        value,
        color,
        symbol,
        isJoker: false,
      });
    }
  }

  // 2 Jokers
  deck.push({
    id: "red_joker",
    suit: "joker",
    rank: "Joker",
    value: 15,
    color: "red",
    symbol: "🃏",
    isJoker: true,
    jokerColor: "red",
  });

  deck.push({
    id: "black_joker",
    suit: "joker",
    rank: "Joker",
    value: 15,
    color: "black",
    symbol: "🃏",
    isJoker: true,
    jokerColor: "black",
  });

  return deck;
}

// Global cached 54-card deck
export const FULL_DECK_54 = createStandard54Deck();

// Helper to shuffle
export function shuffleCards<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
