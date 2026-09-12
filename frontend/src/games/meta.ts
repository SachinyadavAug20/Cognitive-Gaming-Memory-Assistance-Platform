/**
 * Server-safe game catalogue metadata.
 *
 * Deliberately does NOT import component files or lucide-react icon definitions
 * so that it can be used in static metadata / sitemap generation without pulling
 * heavy game bundles into the build graph.
 */
export interface GameMeta {
  id: string;
  titleKey: string;
  descKey: string;
  domain: string;
}

const RAW: Array<[string, string, string, string]> = [
  // vision-3d
  ["lotus-painter", "lotusPainter.title", "lotusPainter.desc", "Lotus Mandala Art"],
  ["butterfly-sanctuary", "butterflySanctuary.title", "butterflySanctuary.desc", "Butterfly Gentle Perch"],
  ["tea-garden-catch", "teaGardenCatch.title", "teaGardenCatch.desc", "Tea Garden Plucking"],
  ["alpana", "alpana.title", "alpana.desc", "Sacred Floor Art"],
  ["river-lanterns", "riverLanterns.title", "riverLanterns.desc", "Peaceful River Lanterns"],
  ["loom", "loom.title", "loom.desc", "Traditional Loom Weaving"],
  ["drum", "drum.title", "drum.desc", "Folk Dhol Beats"],
  ["tuned-drum", "tunedDrum.title", "tunedDrum.desc", "Melodic Drum Beats"],
  ["hornbill-flight", "hornbill.title", "hornbill.desc", "Gentle Hornbill Flight"],
  ["majuli-pottery", "pottery.title", "pottery.desc", "Majuli Clay Pottery"],
  // reminiscence
  ["grandchild-chat", "grandchildChat.title", "grandchildChat.desc", "Family Conversation"],
  ["memory-detective", "memoryDetective.title", "memoryDetective.desc", "Family Photo Detective"],
  ["timeline", "timeline.title", "timeline.desc", "Life Story Timeline"],
  ["jigsaw", "jigsaw.title", "jigsaw.desc", "Family Photo Jigsaw"],
  ["radio", "radio.title", "radio.desc", "Vintage Folk Radio"],
  ["ancestral-herbalist", "ancestralHerbalist.title", "ancestralHerbalist.desc", "Ancestral Healing Herbs"],
  // attention
  ["tea-harvest", "teaHarvest.title", "teaHarvest.desc", "Tea Garden Harvest"],
  ["monastery-bell", "monasteryBell.title", "monasteryBell.desc", "Monastery Bell Memory"],
  ["brahmaputra-boat", "boat.title", "boat.desc", "River Boat Journey"],
  ["dzukou-botanist", "botanist.title", "botanist.desc", "Valley Flower Search"],
  ["wayfinding", "wayfinding.title", "wayfinding.desc", "Village Orientation"],
  ["root-bridge", "rootBridge.title", "rootBridge.desc", "Living Root Bridge"],
  ["storybook", "storybook.title", "storybook.desc", "Village Heritage Tales"],
  // iadl
  ["daily-routine", "dailyRoutine.title", "dailyRoutine.desc", "Daily Care Routine"],
  ["heritage-kitchen", "kitchen.title", "kitchen.desc", "Traditional Kitchen Cooking"],
  ["sorting", "sorting.title", "sorting.desc", "Object Sorting"],
  // calm
  // spatial vector
  ["arrow-escape", "arrowEscape.title", "arrowEscape.desc", "Path Finding & Direction"],
  // advanced
  ["majuli-walk", "majuliWalk.title", "majuliWalk.desc", "Peaceful Village Walk"],
  ["tea-harvest-vision", "teaHarvestVision.title", "teaHarvestVision.desc", "Gentle Hand Movement"],
  ["bihu-dhol", "bihuDhol.title", "bihuDhol.desc", "Folk Drum Rhythm"],
  ["day-in-my-world", "dayInMyWorld.title", "dayInMyWorld.subtitle", "Village Story & Memories"],
  ["bazaar-buddies", "bazaarBuddies.title", "bazaarBuddies.desc", "Local Market Shopping"],
  ["memory-garden", "memoryGarden.title", "memoryGarden.desc", "Memory Flower Garden"],
  ["memory-road", "memoryRoad.title", "memoryRoad.desc", "Village Road Walk"],
  ["daily-tasks", "dailyTasks.title", "dailyTasks.desc", "Morning Tea Routine"],
  ["companion", "companion.title", "companion.desc", "Friendly Voice Companion"],
  ["rhythm-hills", "rhythmHills.title", "rhythmHills.desc", "Gentle Mountain Melodies"],
  ["weaving", "weaving.title", "weaving.desc", "Traditional Weaving Motifs"],
  ["family-emotions", "familyEmotions.title", "familyEmotions.desc", "Family Emotions & Social Warmth"],
];

export const GAME_META: GameMeta[] = RAW.map(([id, titleKey, descKey, domain]) => ({
  id,
  titleKey,
  descKey,
  domain,
}));

export const GAME_IDS: string[] = GAME_META.map((g) => g.id);

export function getGameMeta(id: string): GameMeta | undefined {
  return GAME_META.find((g) => g.id === id);
}