export interface SudokuPuzzle {
  id: string;
  name: Record<string, string>;
  size: 4;
  initialGrid: number[][]; // 0 means empty
  solution: number[][];
}

export const SUDOKU_PUZZLES: SudokuPuzzle[] = [
  {
    id: "sudoku_easy_1",
    name: {
      en: "Morning Garden Sudoku",
      hi: "सुबह का सुडोकू (आसान)",
      as: "পুৱাৰ সহজ সুডোকু",
      bn: "সকালের সহজ সুডোকু",
    },
    size: 4,
    initialGrid: [
      [1, 0, 3, 0],
      [0, 0, 0, 2],
      [3, 0, 0, 0],
      [0, 4, 0, 1],
    ],
    solution: [
      [1, 2, 3, 4],
      [4, 3, 1, 2],
      [3, 1, 2, 4],
      [2, 4, 4, 1],
    ],
  },
  {
    id: "sudoku_easy_2",
    name: {
      en: "Village Tea Sudoku",
      hi: "चाय की चुस्की सुडोकू",
      as: "চাহৰ মেল সুডোকু",
      bn: "চায়ের আড্ডা সুডোকু",
    },
    size: 4,
    initialGrid: [
      [0, 2, 4, 0],
      [1, 0, 0, 3],
      [4, 0, 0, 2],
      [0, 1, 3, 0],
    ],
    solution: [
      [3, 2, 4, 1],
      [1, 4, 2, 3],
      [4, 3, 1, 2],
      [2, 1, 3, 4],
    ],
  },
];

export interface WordSearchPuzzle {
  id: string;
  title: Record<string, string>;
  words: { word: string; clue: string }[];
  grid: string[][];
}

export const WORD_SEARCH_EN: WordSearchPuzzle = {
  id: "ws_en_1",
  title: {
    en: "Morning Heritage Words",
    hi: "सुबह के शब्द",
    as: "পুৱাৰ চিনাকি শব্দ",
    bn: "সকালের শব্দসন্ধান",
  },
  words: [
    { word: "TEA", clue: "Warm morning drink in a glass" },
    { word: "RIVER", clue: "Mighty Brahmaputra waterway" },
    { word: "LOTUS", clue: "Sacred pink water flower" },
    { word: "HOME", clue: "Safe ancestral courtyard" },
  ],
  grid: [
    ["T", "E", "A", "X", "Y"],
    ["R", "I", "V", "E", "R"],
    ["L", "O", "T", "U", "S"],
    ["H", "O", "M", "E", "K"],
    ["B", "I", "H", "U", "M"],
  ],
};
