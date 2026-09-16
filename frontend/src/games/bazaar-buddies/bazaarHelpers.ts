import { BAZAAR_PRODUCTS, type BazaarProduct } from "./bazaarI18n";

export function getProduceEmoji(id: string): string {
  switch (id) {
    case "lemon":
      return "🍋";
    case "fern":
      return "🌿";
    case "banana":
      return "🍌";
    case "tea":
      return "🍵";
    case "pottery":
      return "🏺";
    case "rice":
      return "🌾";
    case "pickle":
      return "🌶️";
    case "oil":
      return "🌻";
    default:
      return "🧺";
  }
}

export function getShortName(product: BazaarProduct, locale: string): string {
  switch (product.id) {
    case "lemon":
      return locale === "as" ? "কাজী নেমু" : locale === "hi" ? "काज़ी नींबू" : "Kaji Nemu";
    case "fern":
      return locale === "as" ? "ঢেকীয়া শাক" : locale === "hi" ? "ढेकीया साग" : "Dhekia Saag";
    case "banana":
      return locale === "as" ? "ভীম কল" : locale === "hi" ? "भीम केला" : "Bhim Kol";
    case "tea":
      return locale === "as" ? "অসম চাহ" : locale === "hi" ? "असम चाय" : "Assam Tea";
    case "pottery":
      return locale === "as" ? "মাটিৰ কলহ" : locale === "hi" ? "मिट्टी का घड़ा" : "Clay Pot";
    case "rice":
      return locale === "as" ? "জোহা চাউল" : locale === "hi" ? "जोहा चावल" : "Joha Rice";
    case "pickle":
      return locale === "as" ? "জলকীয়া আচাৰ" : locale === "hi" ? "मिर्च अचार" : "Chili Pickle";
    case "oil":
      return locale === "as" ? "সৰিয়হ তেল" : locale === "hi" ? "सरसों तेल" : "Mustard Oil";
    default:
      return product.name.en.split("(")[0].trim();
  }
}

export function noteStyle(note: number): string {
  switch (note) {
    case 10:
      return "bg-[#795548] text-white border-black hover:brightness-110";
    case 20:
      return "bg-[#C0CA33] text-black border-black hover:brightness-95";
    case 50:
      return "bg-[#00897B] text-white border-black hover:brightness-110";
    case 100:
      return "bg-[#5E35B1] text-white border-black hover:brightness-110";
    case 200:
      return "bg-[#F4511E] text-white border-black hover:brightness-110";
    case 500:
      return "bg-[#546E7A] text-white border-black hover:brightness-110";
    default:
      return "bg-surface text-ink border-black";
  }
}

export function getChangeNotes(amount: number): number[] {
  const notes: number[] = [];
  let rem = amount;
  const denoms = [500, 200, 100, 50, 20, 10];
  for (const d of denoms) {
    while (rem >= d) {
      notes.push(d);
      rem -= d;
    }
  }
  return notes;
}

export function generateChangeChoices(correctChange: number): number[] {
  if (correctChange <= 0) return [10, 20, 30, 40];

  const set = new Set<number>();
  set.add(correctChange);

  const offsets = [-10, 10, -20, 20, -30, 30, 40];
  for (const off of offsets) {
    const val = correctChange + off;
    if (val > 0) {
      set.add(val);
    }
    if (set.size >= 4) break;
  }

  let fallback = 10;
  while (set.size < 4) {
    set.add(fallback);
    fallback += 10;
  }

  return Array.from(set).slice(0, 4).sort((a, b) => a - b);
}

export function generateTargetIds(count = 4): string[] {
  while (true) {
    const shuffled = [...BAZAAR_PRODUCTS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    const sum = selected.reduce((s, p) => s + p.price, 0);
    if (sum !== 200 && sum !== 500) {
      return selected.map((p) => p.id);
    }
  }
}
