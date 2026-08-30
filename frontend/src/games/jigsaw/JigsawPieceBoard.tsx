"use client";

import { useMemo } from "react";
import { Check, Lock } from "lucide-react";
import {
  generateJigsawGridEdges,
  createJigsawPiecePath,
  type PieceEdges,
} from "./jigsawEngine";

interface JigsawPieceBoardProps {
  gridSize: number; // 2, 3, or 4
  order: number[]; // pieceId at each position (0..N^2-1)
  selectedPos: number | null;
  snappingPos: number[];
  photoUrl: string;
  peeking: boolean;
  ghostGuide: boolean;
  onPieceTap: (pos: number) => void;
}

export function JigsawPieceBoard({
  gridSize,
  order,
  selectedPos,
  snappingPos,
  photoUrl,
  peeking,
  ghostGuide,
  onPieceTap,
}: JigsawPieceBoardProps) {
  const BOARD_SIZE = 400;
  const tileSize = BOARD_SIZE / gridSize;

  // Generate deterministic edge grid based on gridSize
  const edgeGrid = useMemo(() => {
    return generateJigsawGridEdges(gridSize, 12345);
  }, [gridSize]);

  // Precompute paths for all original piece shapes
  const pieceDefs = useMemo(() => {
    const defs: { id: number; r: number; c: number; edges: PieceEdges; pathD: string }[] = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const id = r * gridSize + c;
        const edges = edgeGrid[r][c];
        // Path is generated in local coordinates from (0,0) to (tileSize, tileSize)
        const pathD = createJigsawPiecePath(0, 0, tileSize, edges, 0.18);
        defs.push({ id, r, c, edges, pathD });
      }
    }
    return defs;
  }, [gridSize, edgeGrid, tileSize]);

  return (
    <div className="relative mx-auto w-full max-w-sm sm:max-w-md aspect-square rounded-3xl p-3 bg-[#1F1B18] border-4 border-black shadow-[8px_8px_0px_#000] overflow-hidden flex items-center justify-center select-none">
      {/* Peeking Overlay Mode */}
      {peeking ? (
        <div className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-white/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt="Original Preview"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10 flex items-end justify-center pb-4">
            <span className="rounded-full border-2 border-black bg-ink px-4 py-1.5 text-xs font-black text-white shadow-lg">
              Peeking at Original Portrait
            </span>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          {/* Ghost Blueprint Guide Background */}
          {ghostGuide && (
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-25 grayscale-[15%]"
              style={{
                backgroundImage: `url(${photoUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}

          {/* SVG Jigsaw Puzzle Engine */}
          <svg
            viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
            className="w-full h-full overflow-visible"
          >
            <defs>
              {/* Define clip-path for every original piece */}
              {pieceDefs.map((p) => (
                <clipPath key={`clip-piece-${p.id}`} id={`clip-piece-${p.id}`}>
                  <path d={p.pathD} />
                </clipPath>
              ))}

              {/* Glowing Drop-shadow filter for selected piece */}
              <filter id="piece-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Render all slots */}
            {order.map((pieceId, pos) => {
              const curRow = Math.floor(pos / gridSize);
              const curCol = pos % gridSize;
              const curX = curCol * tileSize;
              const curY = curRow * tileSize;

              const origDef = pieceDefs[pieceId];
              if (!origDef) return null;

              const isSelected = selectedPos === pos;
              const isCorrect = pieceId === pos;
              const isSnapping = snappingPos.includes(pos);

              // Position image inside the clip path so the correct slice appears
              const imgX = -origDef.c * tileSize;
              const imgY = -origDef.r * tileSize;

              return (
                <g
                  key={`tile-slot-${pos}-${pieceId}`}
                  transform={`translate(${curX}, ${curY})`}
                  onClick={() => onPieceTap(pos)}
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    filter: isSelected
                      ? "url(#piece-shadow) drop-shadow(0 0 8px #F59E0B)"
                      : undefined,
                  }}
                >
                  {/* Jigsaw Clipped Image Slice */}
                  <g clipPath={`url(#clip-piece-${origDef.id})`}>
                    <image
                      href={photoUrl}
                      x={imgX}
                      y={imgY}
                      width={BOARD_SIZE}
                      height={BOARD_SIZE}
                      preserveAspectRatio="none"
                    />
                    {/* Bevel lighting effect */}
                    <path
                      d={origDef.pathD}
                      fill={
                        isSnapping
                          ? "rgba(34, 197, 94, 0.4)"
                          : isSelected
                          ? "rgba(245, 158, 11, 0.25)"
                          : "none"
                      }
                    />
                  </g>

                  {/* Puzzle Piece Cut Line Outline */}
                  <path
                    d={origDef.pathD}
                    fill="none"
                    stroke={
                      isSelected
                        ? "#F59E0B"
                        : isCorrect
                        ? "rgba(16, 185, 129, 0.8)"
                        : "#000000"
                    }
                    strokeWidth={isSelected ? 4 : 2.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {/* Correct Lock Badge */}
                  {isCorrect && (
                    <g
                      transform={`translate(${tileSize * 0.72}, ${tileSize * 0.72})`}
                      className="pointer-events-none"
                    >
                      <circle
                        r={tileSize * 0.14}
                        fill="#10B981"
                        stroke="#000"
                        strokeWidth="1.5"
                      />
                      <Check
                        className="text-white"
                        style={{
                          transform: `translate(${-tileSize * 0.1}, ${-tileSize * 0.1})`,
                          width: tileSize * 0.2,
                          height: tileSize * 0.2,
                        }}
                      />
                    </g>
                  )}

                  {/* Selected Indicator Ring */}
                  {isSelected && (
                    <g
                      transform={`translate(${tileSize * 0.5}, ${tileSize * 0.5})`}
                      className="pointer-events-none animate-pulse"
                    >
                      <circle
                        r={tileSize * 0.18}
                        fill="#F59E0B"
                        stroke="#000"
                        strokeWidth="2"
                      />
                      <Lock
                        className="text-white"
                        style={{
                          transform: `translate(${-tileSize * 0.1}, ${-tileSize * 0.1})`,
                          width: tileSize * 0.2,
                          height: tileSize * 0.2,
                        }}
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
