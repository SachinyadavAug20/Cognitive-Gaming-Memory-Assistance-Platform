import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

/**
 * Kaziranga Great Mormon / Golden Birdwing Butterfly
 * Swallowtail wings with symmetry and gentle curves.
 */
export function KazirangaButterflyIcon({
  size = 24,
  className,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Body */}
      <line x1="12" y1="6" x2="12" y2="18" />
      {/* Antennae */}
      <path d="M12 6C10.5 4 9 3.5 8 4" />
      <path d="M12 6C13.5 4 15 3.5 16 4" />
      {/* Upper Wings */}
      <path d="M12 8C7 5 3 6 3 11C3 14 7 15 12 13" />
      <path d="M12 8C17 5 21 6 21 11C21 14 17 15 12 13" />
      {/* Lower Wings */}
      <path d="M12 13C8 14 5 16 6 19C7 21 10 20 12 16" />
      <path d="M12 13C16 14 19 16 18 19C17 21 14 20 12 16" />
    </svg>
  );
}

/**
 * Traditional Assamese Bihu Dhol
 * Double-headed horizontal drum with diagonal tuning ropes.
 */
export function BihuDholIcon({
  size = 24,
  className,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Left Head */}
      <ellipse cx="6" cy="12" rx="2.5" ry="6" />
      {/* Right Head */}
      <ellipse cx="18" cy="12" rx="2.5" ry="6" />
      {/* Body Shell */}
      <path d="M6 6C10 5.5 14 5.5 18 6" />
      <path d="M6 18C10 18.5 14 18.5 18 18" />
      {/* Diagonal Leather Bracing Straps */}
      <line x1="6" y1="8" x2="18" y2="16" strokeWidth="1.5" />
      <line x1="6" y1="16" x2="18" y2="8" strokeWidth="1.5" />
      <line x1="6" y1="12" x2="18" y2="12" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  );
}

/**
 * Traditional Khasi Ksing Drum
 * Cylindrical wooden percussion instrument from the Meghalaya Hills.
 */
export function KhasiKsingIcon({
  size = 24,
  className,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Top Head */}
      <ellipse cx="12" cy="5" rx="7" ry="2.5" />
      {/* Cylindrical Body */}
      <line x1="5" y1="5" x2="5" y2="19" />
      <line x1="19" y1="5" x2="19" y2="19" />
      {/* Bottom Rim */}
      <path d="M5 19C5 20.5 8.1 21.5 12 21.5C15.9 21.5 19 20.5 19 19" />
      {/* Tension Lacing */}
      <path d="M5 6L12 19L19 6" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Traditional Clay Kulhar / Chai Cup
 * Authentic earthenware vessel for serving morning tea.
 */
export function ClayKulharIcon({
  size = 24,
  className,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Rim */}
      <ellipse cx="12" cy="5" rx="7" ry="2" />
      {/* Clay Vessel Body tapering downward */}
      <path d="M5 5L7 19C7 20.1 9.2 21 12 21C14.8 21 17 20.1 17 19L19 5" />
      {/* Steam rising */}
      <path d="M10 1C9.5 2 9.5 2.5 10 3" strokeWidth="1.5" />
      <path d="M14 1C13.5 2 13.5 2.5 14 3" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Assam Tea Leaf: "Two Leaves and a Bud" (Duiti Paat Eti Kuhi)
 * Iconic Camellia sinensis assamica harvesting motif.
 */
export function AssamTeaLeafIcon({
  size = 24,
  className,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Central Stem */}
      <path d="M12 22C12 18 12 14 12 9" />
      {/* Central Tender Bud */}
      <path d="M12 9C11 6 12 3 12 2C12 3 13 6 12 9Z" fill="currentColor" fillOpacity="0.2" />
      {/* Left Leaf */}
      <path d="M12 13C8 12 4 10 4 6C8 6 11 9 12 13Z" />
      {/* Right Leaf */}
      <path d="M12 11C16 10 20 8 20 4C16 4 13 7 12 11Z" />
    </svg>
  );
}

/**
 * Muga Silk Loom Flying Shuttle (Taat Xaal / Makoo)
 * Handloom wooden shuttle carrying weft thread across warp.
 */
export function MugaLoomShuttleIcon({
  size = 24,
  className,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Pointed Shuttle Body */}
      <path d="M2 12C5 8 19 8 22 12C19 16 5 16 2 12Z" />
      {/* Bobbin Cavity */}
      <rect x="8" y="10" width="8" height="4" rx="1.5" />
      {/* Spun Weft Thread */}
      <line x1="10" y1="10" x2="10" y2="14" strokeWidth="1.5" />
      <line x1="12" y1="10" x2="12" y2="14" strokeWidth="1.5" />
      <line x1="14" y1="10" x2="14" y2="14" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Sacred Diya / Earthen Lamp
 * Traditional brass or terracotta lamp with warm flame.
 */
export function DiyaLampIcon({
  size = 24,
  className,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Clay Lamp Bowl */}
      <path d="M3 14C3 18 7 21 12 21C17 21 21 18 21 14C21 13 19 12 12 12C5 12 3 13 3 14Z" />
      {/* Base Stand */}
      <path d="M9 21L8 23H16L15 21" />
      {/* Flame */}
      <path
        d="M12 2C10 5 9 7.5 10 9.5C11 11.5 13 11.5 14 9.5C15 7.5 14 5 12 2Z"
        fill="currentColor"
        fillOpacity="0.25"
      />
    </svg>
  );
}

/**
 * Bamboo Culm / Shoot
 * Segmented bamboo cane with nodes.
 */
export function BambooShootIcon({
  size = 24,
  className,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Vertical Stalk */}
      <line x1="9" y1="2" x2="9" y2="22" />
      <line x1="15" y1="2" x2="15" y2="22" />
      {/* Nodes */}
      <rect x="8" y="7" width="8" height="2" rx="1" />
      <rect x="8" y="14" width="8" height="2" rx="1" />
      {/* Small Sprout Leaves */}
      <path d="M15 8C17 7 19 8 20 6C18 9 16 8 15 8Z" />
      <path d="M9 15C7 14 5 15 4 13C6 16 8 15 9 15Z" />
    </svg>
  );
}
