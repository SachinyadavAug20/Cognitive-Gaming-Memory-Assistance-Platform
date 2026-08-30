/**
 * Mathematical Jigsaw Puzzle Interlocking Path Generator
 * Generates authentic jigsaw pieces with interlocking tabs (+1) and blanks (-1).
 */

export type EdgeType = 0 | 1 | -1; // 0 = flat, 1 = tab (male), -1 = slot (female)

export interface PieceEdges {
  top: EdgeType;
  right: EdgeType;
  bottom: EdgeType;
  left: EdgeType;
}

/**
 * Generate consistent interlocking edge definitions for an N x N grid.
 * Adjacent pieces have opposite edge signs so they interlock perfectly.
 */
export function generateJigsawGridEdges(gridSize: number, seed = 42): PieceEdges[][] {
  // Horizontal seams: (gridSize - 1) rows of gridSize edges
  // Vertical seams: gridSize rows of (gridSize - 1) edges
  const hSeams: EdgeType[][] = [];
  const vSeams: EdgeType[][] = [];

  let rng = seed;
  const pseudoRandom = () => {
    rng = (rng * 9301 + 49297) % 233280;
    return rng / 233280;
  };

  // Horizontal edges between row r and r+1
  for (let r = 0; r < gridSize - 1; r++) {
    const row: EdgeType[] = [];
    for (let c = 0; c < gridSize; c++) {
      row.push(pseudoRandom() > 0.5 ? 1 : -1);
    }
    hSeams.push(row);
  }

  // Vertical edges between col c and c+1
  for (let r = 0; r < gridSize; r++) {
    const row: EdgeType[] = [];
    for (let c = 0; c < gridSize - 1; c++) {
      row.push(pseudoRandom() > 0.5 ? 1 : -1);
    }
    vSeams.push(row);
  }

  const grid: PieceEdges[][] = [];
  for (let r = 0; r < gridSize; r++) {
    const row: PieceEdges[] = [];
    for (let c = 0; c < gridSize; c++) {
      const top: EdgeType = r === 0 ? 0 : (hSeams[r - 1][c] === 1 ? -1 : 1);
      const bottom: EdgeType = r === gridSize - 1 ? 0 : hSeams[r][c];
      const left: EdgeType = c === 0 ? 0 : (vSeams[r][c - 1] === 1 ? -1 : 1);
      const right: EdgeType = c === gridSize - 1 ? 0 : vSeams[r][c];
      row.push({ top, right, bottom, left });
    }
    grid.push(row);
  }

  return grid;
}

/**
 * Generate an SVG path `d` string for a single jigsaw piece.
 * The piece base box is from (x, y) to (x + size, y + size).
 * Tab depth controls how far tabs stick out (e.g. 0.18 * size).
 */
export function createJigsawPiecePath(
  x: number,
  y: number,
  size: number,
  edges: PieceEdges,
  tabRatio = 0.18
): string {
  const tab = size * tabRatio;
  const s = size;

  let d = `M ${x} ${y} `;

  // TOP EDGE (from (x, y) to (x + s, y))
  if (edges.top === 0) {
    d += `L ${x + s} ${y} `;
  } else {
    const dir = edges.top; // 1 = outwards (up, -y), -1 = inwards (down, +y)
    const midX = x + s / 2;
    const peakY = y - dir * tab;
    const neckY = y + dir * (tab * 0.2);
    d += `L ${x + s * 0.38} ${y} `;
    d += `C ${x + s * 0.38} ${neckY}, ${midX - tab * 0.75} ${peakY}, ${midX} ${peakY} `;
    d += `C ${midX + tab * 0.75} ${peakY}, ${x + s * 0.62} ${neckY}, ${x + s * 0.62} ${y} `;
    d += `L ${x + s} ${y} `;
  }

  // RIGHT EDGE (from (x + s, y) to (x + s, y + s))
  if (edges.right === 0) {
    d += `L ${x + s} ${y + s} `;
  } else {
    const dir = edges.right; // 1 = outwards (right, +x), -1 = inwards (left, -x)
    const midY = y + s / 2;
    const peakX = x + s + dir * tab;
    const neckX = x + s - dir * (tab * 0.2);
    d += `L ${x + s} ${y + s * 0.38} `;
    d += `C ${neckX} ${y + s * 0.38}, ${peakX} ${midY - tab * 0.75}, ${peakX} ${midY} `;
    d += `C ${peakX} ${midY + tab * 0.75}, ${neckX} ${y + s * 0.62}, ${x + s} ${y + s * 0.62} `;
    d += `L ${x + s} ${y + s} `;
  }

  // BOTTOM EDGE (from (x + s, y + s) to (x, y + s))
  if (edges.bottom === 0) {
    d += `L ${x} ${y + s} `;
  } else {
    const dir = edges.bottom; // 1 = outwards (down, +y), -1 = inwards (up, -y)
    const midX = x + s / 2;
    const peakY = y + s + dir * tab;
    const neckY = y + s - dir * (tab * 0.2);
    d += `L ${x + s * 0.62} ${y + s} `;
    d += `C ${x + s * 0.62} ${neckY}, ${midX + tab * 0.75} ${peakY}, ${midX} ${peakY} `;
    d += `C ${midX - tab * 0.75} ${peakY}, ${x + s * 0.38} ${neckY}, ${x + s * 0.38} ${y + s} `;
    d += `L ${x} ${y + s} `;
  }

  // LEFT EDGE (from (x, y + s) to (x, y))
  if (edges.left === 0) {
    d += `L ${x} ${y} `;
  } else {
    const dir = edges.left; // 1 = outwards (left, -x), -1 = inwards (right, +x)
    const midY = y + s / 2;
    const peakX = x - dir * tab;
    const neckX = x + dir * (tab * 0.2);
    d += `L ${x} ${y + s * 0.62} `;
    d += `C ${neckX} ${y + s * 0.62}, ${peakX} ${midY + tab * 0.75}, ${peakX} ${midY} `;
    d += `C ${peakX} ${midY - tab * 0.75}, ${neckX} ${y + s * 0.38}, ${x} ${y + s * 0.38} `;
    d += `L ${x} ${y} `;
  }

  d += "Z";
  return d;
}
