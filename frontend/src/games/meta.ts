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
  ["lotus-painter", "lotusPainter.title", "lotusPainter.desc", "OpenCV Optical Air-Canvas & Lotus Bloom"],
  ["butterfly-sanctuary", "butterflySanctuary.title", "butterflySanctuary.desc", "OpenCV Optical Hand Perch Stabilization"],
  ["tea-garden-catch", "teaGardenCatch.title", "teaGardenCatch.desc", "OpenCV Dual-Hand Kinesthetic Harvest"],
  ["alpana", "alpana.title", "alpana.desc", "Computer Vision Air-Canvas"],
  ["river-lanterns", "riverLanterns.title", "riverLanterns.desc", "3D Graphics & Optical Vision"],
  ["loom", "loom.title", "loom.desc", "3D Constructional Praxis"],
  ["drum", "drum.title", "drum.desc", "3D Auditory-Motor Entrainment"],
  ["hornbill-flight", "hornbill.title", "hornbill.desc", "Visuomotor Glider Physics"],
  ["majuli-pottery", "pottery.title", "pottery.desc", "Tactile Motor Praxis"],
  // reminiscence
  ["grandchild-chat", "grandchildChat.title", "grandchildChat.desc", "AI Conversational Reminiscence"],
  ["memory-detective", "memoryDetective.title", "memoryDetective.desc", "Face & Clue Spaced Retrieval"],
  ["timeline", "timeline.title", "timeline.desc", "Chronological Life Milestones"],
  ["jigsaw", "jigsaw.title", "jigsaw.desc", "Visuospatial Family Puzzles"],
  ["radio", "radio.title", "radio.desc", "Auditory Vintage Reminiscence"],
  // attention
  ["tea-harvest", "teaHarvest.title", "teaHarvest.desc", "Selective Attention"],
  ["monastery-bell", "monasteryBell.title", "monasteryBell.desc", "Auditory Working Memory Span"],
  ["brahmaputra-boat", "boat.title", "boat.desc", "Spatial Navigation & Tracking"],
  ["dzukou-botanist", "botanist.title", "botanist.desc", "Visual Discrimination & Search"],
  ["wayfinding", "wayfinding.title", "wayfinding.desc", "Spatial Orientation"],
  ["root-bridge", "rootBridge.title", "rootBridge.desc", "Spatial Strategy"],
  ["storybook", "storybook.title", "storybook.desc", "AI Branching Life Tales"],
  // iadl
  ["daily-routine", "dailyRoutine.title", "dailyRoutine.desc", "Prospective Memory & Routine"],
  ["heritage-kitchen", "kitchen.title", "kitchen.desc", "IADL Recipe Sequencing"],
  ["sorting", "sorting.title", "sorting.desc", "Executive Categorisation"],
  // calm
  // spatial vector
  ["arrow-escape", "arrowEscape.title", "arrowEscape.desc", "Spatial Planning & Vector Clearance"],
  // advanced
  ["majuli-walk", "majuliWalk.title", "majuliWalk.desc", "3D Spatial Memory Navigation"],
  ["tea-harvest-vision", "teaHarvestVision.title", "teaHarvestVision.desc", "OpenCV Motion Tracking Harvest"],
  ["bihu-dhol", "bihuDhol.title", "bihuDhol.desc", "Adaptive Acoustic Drum Rhythm"],
  ["day-in-my-world", "dayInMyWorld.title", "dayInMyWorld.subtitle", "6-Chapter 3D Story Campaign & Saathi AI"],
  ["bazaar-buddies", "bazaarBuddies.title", "bazaarBuddies.desc", "IADL Budget & Money Management"],
  ["memory-garden", "memoryGarden.title", "memoryGarden.desc", "Multi-Activity Memory Suite"],
  ["memory-road", "memoryRoad.title", "memoryRoad.desc", "Road Safety & Visual Search"],
  ["daily-tasks", "dailyTasks.title", "dailyTasks.desc", "IADL Sequencing & Daily Routine"],
  ["companion", "companion.title", "companion.desc", "Conversational Reminiscence Companion"],
  ["rhythm-hills", "rhythmHills.title", "rhythmHills.desc", "Kinesthetic Rhythm & Tempo Matching"],
  ["weaving", "weaving.title", "weaving.desc", "Traditional Motif Pattern Completion"],
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