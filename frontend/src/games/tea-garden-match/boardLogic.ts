import type { GridCell, TileType } from "./types";

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function getRandomTileType(pool: TileType[]): TileType {
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

export function checkMatches(board: GridCell[][], rows: number, cols: number): Set<string> {
  const matchedCoords = new Set<string>();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 2; c++) {
      const t = board[r][c].type;
      if (t === board[r][c + 1].type && t === board[r][c + 2].type) {
        matchedCoords.add(`${r},${c}`);
        matchedCoords.add(`${r},${c + 1}`);
        matchedCoords.add(`${r},${c + 2}`);
        let k = c + 3;
        while (k < cols && board[r][k].type === t) {
          matchedCoords.add(`${r},${k}`);
          k++;
        }
      }
    }
  }

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows - 2; r++) {
      const t = board[r][c].type;
      if (t === board[r + 1][c].type && t === board[r + 2][c].type) {
        matchedCoords.add(`${r},${c}`);
        matchedCoords.add(`${r + 1},${c}`);
        matchedCoords.add(`${r + 2},${c}`);
        let k = r + 3;
        while (k < rows && board[k][c].type === t) {
          matchedCoords.add(`${k},${c}`);
          k++;
        }
      }
    }
  }

  return matchedCoords;
}

export function findValidMove(board: GridCell[][], rows: number, cols: number): [[number, number], [number, number]] | null {
  const directions = [
    [0, 1],
    [1, 0],
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < rows && nc < cols) {
          const tempBoard = board.map((row) => row.map((cell) => ({ ...cell })));
          const tmp = tempBoard[r][c];
          tempBoard[r][c] = tempBoard[nr][nc];
          tempBoard[nr][nc] = tmp;

          const matches = checkMatches(tempBoard, rows, cols);
          if (matches.size > 0) {
            return [
              [r, c],
              [nr, nc],
            ];
          }
        }
      }
    }
  }
  return null;
}

export function createInitialBoard(rows: number, cols: number, pool: TileType[]): GridCell[][] {
  let attempts = 0;
  while (attempts < 100) {
    attempts++;
    const board: GridCell[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: GridCell[] = [];
      for (let c = 0; c < cols; c++) {
        const disallowed = new Set<TileType>();
        if (c >= 2 && row[c - 1].type === row[c - 2].type) {
          disallowed.add(row[c - 1].type);
        }
        if (r >= 2 && board[r - 1][c].type === board[r - 2][c].type) {
          disallowed.add(board[r - 1][c].type);
        }
        const allowed = pool.filter((t) => !disallowed.has(t));
        const chosen = allowed.length > 0 ? getRandomTileType(allowed) : getRandomTileType(pool);
        row.push({
          id: `${r}-${c}-${Math.random().toString(36).substring(2, 7)}`,
          type: chosen,
        });
      }
      board.push(row);
    }

    const validMove = findValidMove(board, rows, cols);
    if (validMove) {
      return board;
    }
  }

  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      id: `${r}-${c}-${Math.random().toString(36).substring(2, 7)}`,
      type: pool[(r + c) % pool.length],
    }))
  );
}
