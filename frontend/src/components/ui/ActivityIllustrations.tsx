"use client";

import React from "react";
import { FamilyIllustration } from "./FamilyIllustration";

interface IllustrationProps {
  className?: string;
}

/**
 * 1. Morning Tea with Grandchild (Assam Spiced Chai in traditional cup & saucer)
 */
export function TeaCupIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Morning Tea Cup" role="img">
      {/* Saucer */}
      <ellipse cx="32" cy="52" rx="22" ry="5" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2.2" />
      <ellipse cx="32" cy="51" rx="16" ry="3" fill="#CBD5E1" />
      {/* Cup Body */}
      <path d="M16 26 L20 46 Q32 52 44 46 L48 26 Z" fill="#FED7AA" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Warm decorative band */}
      <path d="M17.5 32 Q32 37 46.5 32 L45.5 37 Q32 42 18.5 37 Z" fill="#F97316" stroke="#0F172A" strokeWidth="1.6" />
      {/* Cup Rim & Hot Tea Surface */}
      <ellipse cx="32" cy="26" rx="16" ry="5" fill="#78350F" stroke="#0F172A" strokeWidth="2.2" />
      <ellipse cx="32" cy="26" rx="12" ry="3.5" fill="#9A3412" />
      {/* Handle */}
      <path d="M45 29 C53 29 53 43 42 43" stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {/* Steam Trails */}
      <path d="M26 19 Q23 13 27 9 Q29 5 27 2" stroke="#64748B" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M32 17 Q36 11 32 7 Q29 3 32 1" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M38 19 Q41 13 37 9 Q35 5 37 2" stroke="#64748B" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Little green tea leaf on saucer */}
      <path d="M12 49 Q15 45 20 48 Q18 53 12 49 Z" fill="#22C55E" stroke="#0F172A" strokeWidth="1.4" />
    </svg>
  );
}

/**
 * 2. Traditional Bihu Dhol Drum (Assam cultural festival drum with Gamosa sash & drumsticks)
 */
export function BihuDholIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Bihu Dhol Drum" role="img">
      {/* Drum Body (barrel shaped) */}
      <path
        d="M16 20 C24 16 40 16 48 20 L48 44 C40 48 24 48 16 44 Z"
        fill="#9A3412"
        stroke="#0F172A"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Left Drumhead Rim */}
      <ellipse cx="16" cy="32" rx="4.5" ry="12" fill="#FEF08A" stroke="#0F172A" strokeWidth="2.2" />
      {/* Right Drumhead Rim */}
      <ellipse cx="48" cy="32" rx="4.5" ry="12" fill="#FEF08A" stroke="#0F172A" strokeWidth="2.2" />
      {/* Gamosa Red & White Sash wrapped in center */}
      <rect x="28" y="17" width="8" height="30" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.8" />
      {/* Red woven motifs on sash */}
      <path d="M32 20 L34 23 L32 26 L30 23 Z" fill="#DC2626" />
      <path d="M32 28 L34 31 L32 34 L30 31 Z" fill="#DC2626" />
      <path d="M32 36 L34 39 L32 42 L30 39 Z" fill="#DC2626" />
      {/* V-shaped Leather Tension Straps */}
      <path d="M18 22 L28 32 L18 42" stroke="#FEF08A" strokeWidth="1.6" fill="none" />
      <path d="M46 22 L36 32 L46 42" stroke="#FEF08A" strokeWidth="1.6" fill="none" />
      {/* Drumsticks (Mari & Kathi) */}
      <line x1="8" y1="12" x2="22" y2="28" stroke="#78350F" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="9" cy="13" r="2.2" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.4" />
      <line x1="56" y1="12" x2="42" y2="28" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
      {/* Musical Vibration Waves */}
      <path d="M55 26 Q59 32 55 38" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M9 26 Q5 32 9 38" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * 3. Sacred Alpana & Festive Rangoli Patterns (Symmetrical Lotus Mandalas with dots)
 */
export function RangoliIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Rangoli Pattern" role="img">
      {/* Outer Decorative Scallop Ring */}
      <circle cx="32" cy="32" r="24" stroke="#FDE047" strokeWidth="2.5" strokeDasharray="3 3" />
      {/* 4 Cardinal Lotus Petals */}
      {/* Top Petal */}
      <path d="M32 14 C27 21 27 27 32 32 C37 27 37 21 32 14 Z" fill="#E11D48" stroke="#0F172A" strokeWidth="1.8" />
      {/* Bottom Petal */}
      <path d="M32 50 C27 43 27 37 32 32 C37 37 37 43 32 50 Z" fill="#E11D48" stroke="#0F172A" strokeWidth="1.8" />
      {/* Left Petal */}
      <path d="M14 32 C21 27 27 27 32 32 C27 37 21 37 14 32 Z" fill="#E11D48" stroke="#0F172A" strokeWidth="1.8" />
      {/* Right Petal */}
      <path d="M50 32 C43 27 37 27 32 32 C37 37 43 37 50 32 Z" fill="#E11D48" stroke="#0F172A" strokeWidth="1.8" />
      {/* 4 Diagonal Golden Petals */}
      <path d="M19 19 C25 24 28 27 32 32 C27 28 24 25 19 19 Z" fill="#FBBF24" stroke="#0F172A" strokeWidth="1.6" />
      <path d="M45 19 C39 24 36 27 32 32 C37 28 40 25 45 19 Z" fill="#FBBF24" stroke="#0F172A" strokeWidth="1.6" />
      <path d="M19 45 C25 40 28 37 32 32 C27 36 24 39 19 45 Z" fill="#FBBF24" stroke="#0F172A" strokeWidth="1.6" />
      <path d="M45 45 C39 40 36 37 32 32 C37 36 40 39 45 45 Z" fill="#FBBF24" stroke="#0F172A" strokeWidth="1.6" />
      {/* Central Golden Medallion */}
      <circle cx="32" cy="32" r="6" fill="#F59E0B" stroke="#0F172A" strokeWidth="2" />
      <circle cx="32" cy="32" r="2.5" fill="#FFFFFF" />
      {/* Traditional White Rice Powder Border Dots */}
      <circle cx="32" cy="8" r="2.2" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.4" />
      <circle cx="32" cy="56" r="2.2" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.4" />
      <circle cx="8" cy="32" r="2.2" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.4" />
      <circle cx="56" cy="32" r="2.2" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.4" />
      <circle cx="15" cy="15" r="1.8" fill="#FBBF24" />
      <circle cx="49" cy="15" r="1.8" fill="#FBBF24" />
      <circle cx="15" cy="49" r="1.8" fill="#FBBF24" />
      <circle cx="49" cy="49" r="1.8" fill="#FBBF24" />
    </svg>
  );
}

/**
 * 4. Blooming Lotus Flower on Water (for lotus-painter)
 */
export function LotusIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Blooming Lotus" role="img">
      {/* Lily pad underneath */}
      <ellipse cx="32" cy="48" rx="22" ry="7" fill="#059669" stroke="#0F172A" strokeWidth="2.2" />
      <path d="M32 48 L44 44" stroke="#047857" strokeWidth="1.8" />
      <path d="M32 48 L20 44" stroke="#047857" strokeWidth="1.8" />
      {/* Outer Pink Petals */}
      <path d="M12 43 C14 31 23 27 28 35 C22 41 16 44 12 43 Z" fill="#F43F5E" stroke="#0F172A" strokeWidth="2" />
      <path d="M52 43 C50 31 41 27 36 35 C42 41 48 44 52 43 Z" fill="#F43F5E" stroke="#0F172A" strokeWidth="2" />
      {/* Mid Petals */}
      <path d="M19 39 C20 25 28 20 32 30 C27 36 22 40 19 39 Z" fill="#FB7185" stroke="#0F172A" strokeWidth="2" />
      <path d="M45 39 C44 25 36 20 32 30 C37 36 42 40 45 39 Z" fill="#FB7185" stroke="#0F172A" strokeWidth="2" />
      {/* Center Main Petal */}
      <path d="M32 15 C26 24 26 36 32 42 C38 36 38 24 32 15 Z" fill="#FDA4AF" stroke="#0F172A" strokeWidth="2.2" />
      {/* Golden Pistil Core */}
      <circle cx="32" cy="33" r="3.5" fill="#FBBF24" stroke="#0F172A" strokeWidth="1.4" />
      {/* Gentle Water Waves */}
      <path d="M10 56 Q21 53 32 56 Q43 59 54 56" stroke="#10B981" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M18 60 Q25 58 32 60 Q39 62 46 60" stroke="#047857" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * 5. Butterflies in the Garden (for butterfly-sanctuary)
 */
export function ButterflyIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Garden Butterfly" role="img">
      {/* Left Upper Wing */}
      <path d="M32 30 C27 12 10 12 11 26 C12 34 26 34 32 32 Z" fill="#F97316" stroke="#0F172A" strokeWidth="2.2" />
      <circle cx="18" cy="22" r="3.2" fill="#FDE047" stroke="#0F172A" strokeWidth="1.2" />
      {/* Right Upper Wing */}
      <path d="M32 30 C37 12 54 12 53 26 C52 34 38 34 32 32 Z" fill="#F97316" stroke="#0F172A" strokeWidth="2.2" />
      <circle cx="46" cy="22" r="3.2" fill="#FDE047" stroke="#0F172A" strokeWidth="1.2" />
      {/* Left Lower Wing */}
      <path d="M32 32 C26 36 15 36 17 46 C19 53 30 46 32 38 Z" fill="#10B981" stroke="#0F172A" strokeWidth="2" />
      <circle cx="23" cy="43" r="2" fill="#FFFFFF" />
      {/* Right Lower Wing */}
      <path d="M32 32 C38 36 49 36 47 46 C45 53 34 46 32 38 Z" fill="#10B981" stroke="#0F172A" strokeWidth="2" />
      <circle cx="41" cy="43" r="2" fill="#FFFFFF" />
      {/* Butterfly Body */}
      <ellipse cx="32" cy="33" rx="2.5" ry="11" fill="#0F172A" />
      <circle cx="32" cy="20" r="3.2" fill="#0F172A" />
      {/* Antennae */}
      <path d="M30 18 Q25 11 22 13" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M34 18 Q39 11 42 13" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="22" cy="13" r="1.2" fill="#F59E0B" />
      <circle cx="42" cy="13" r="1.2" fill="#F59E0B" />
      {/* Sweet Garden Flower below */}
      <circle cx="12" cy="54" r="3.5" fill="#EC4899" stroke="#0F172A" strokeWidth="1.4" />
      <circle cx="12" cy="54" r="1.5" fill="#FDE047" />
      <path d="M8 58 Q14 56 18 58" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 6. Fresh Tea Leaves & Bamboo Basket (for tea-harvest, tea-harvest-vision, tea-garden-catch)
 */
export function TeaLeavesIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Tea Leaves Basket" role="img">
      {/* Bamboo Basket Base */}
      <path d="M14 32 L19 54 Q32 58 45 54 L50 32 Z" fill="#D97706" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Basket Woven Crosshatch texture */}
      <line x1="20" y1="36" x2="44" y2="52" stroke="#B45309" strokeWidth="1.5" />
      <line x1="44" y1="36" x2="20" y2="52" stroke="#B45309" strokeWidth="1.5" />
      <line x1="26" y1="33" x2="38" y2="56" stroke="#B45309" strokeWidth="1.5" />
      <line x1="38" y1="33" x2="26" y2="56" stroke="#B45309" strokeWidth="1.5" />
      {/* Basket Rim */}
      <ellipse cx="32" cy="32" rx="18" ry="4.5" fill="#FDE68A" stroke="#0F172A" strokeWidth="2.2" />
      {/* Tender Two Leaves & a Bud */}
      {/* Center Bud */}
      <path d="M32 10 Q34 18 32 28 Q30 18 32 10 Z" fill="#86EFAC" stroke="#0F172A" strokeWidth="2" />
      {/* Left Leaf */}
      <path d="M32 26 C22 25 15 16 17 11 C25 12 29 20 32 26 Z" fill="#22C55E" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
      <line x1="19" y1="13" x2="30" y2="24" stroke="#15803D" strokeWidth="1.4" />
      {/* Right Leaf */}
      <path d="M32 26 C42 25 49 16 47 11 C39 12 35 20 32 26 Z" fill="#16A34A" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
      <line x1="45" y1="13" x2="34" y2="24" stroke="#14532D" strokeWidth="1.4" />
      {/* Fresh Morning Dewdrop */}
      <circle cx="25" cy="18" r="1.8" fill="#DCFCE7" stroke="#0F172A" strokeWidth="0.8" />
    </svg>
  );
}

/**
 * 7. Floating River Lantern (for river-lanterns)
 */
export function RiverLanternIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Floating River Lantern" role="img">
      {/* Calming Water Surface in warm twilight tones */}
      <path d="M8 50 Q20 46 32 50 Q44 54 56 50" stroke="#D97706" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M14 56 Q23 53 32 56 Q41 59 50 56" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Pink Lotus Flower Bed under lamp */}
      <path d="M16 44 C20 41 26 42 32 46 C38 42 44 41 48 44 C42 49 22 49 16 44 Z" fill="#F43F5E" stroke="#0F172A" strokeWidth="1.8" />
      {/* Terracotta Earthen Diya / Boat */}
      <path d="M20 38 Q32 45 44 38 L41 44 Q32 48 23 44 Z" fill="#C2410C" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Glowing Warm Aura */}
      <circle cx="32" cy="24" r="14" fill="#FEF08A" fillOpacity="0.4" />
      {/* Diya Flame */}
      <path d="M32 10 C37 18 39 26 32 34 C25 26 27 18 32 10 Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="2" />
      <path d="M32 18 C35 23 35 28 32 32 C29 28 29 23 32 18 Z" fill="#EF4444" />
      <circle cx="32" cy="27" r="2" fill="#FFFBEB" />
      {/* Gentle Sparkles in the night air */}
      <path d="M16 18 L17.5 21 L20.5 22.5 L17.5 24 L16 27 L14.5 24 L11.5 22.5 L14.5 21 Z" fill="#FDE047" stroke="#0F172A" strokeWidth="1" />
      <path d="M47 16 L48 18 L50 19 L48 20 L47 22 L46 20 L44 19 L46 18 Z" fill="#FDE047" stroke="#0F172A" strokeWidth="0.8" />
    </svg>
  );
}

/**
 * 8. Handloom Weaving Shuttle & Silk (for loom)
 */
export function LoomIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Weaving Loom Shuttle" role="img">
      {/* Woven Silk Fabric in background with Assam diamond motif */}
      <rect x="12" y="10" width="40" height="44" rx="6" fill="#FEF3C7" stroke="#0F172A" strokeWidth="2" />
      {/* Traditional Red Mekhela Chador diamond border */}
      <path d="M18 16 L22 21 L18 26 L14 21 Z" fill="#DC2626" />
      <path d="M28 16 L32 21 L28 26 L24 21 Z" fill="#DC2626" />
      <path d="M38 16 L42 21 L38 26 L34 21 Z" fill="#DC2626" />
      <path d="M48 16 L52 21 L48 26 L44 21 Z" fill="#DC2626" />
      {/* Warp threads */}
      <line x1="16" y1="28" x2="48" y2="28" stroke="#D97706" strokeWidth="1.5" strokeDasharray="2 2" />
      <line x1="16" y1="33" x2="48" y2="33" stroke="#D97706" strokeWidth="1.5" strokeDasharray="2 2" />
      {/* Wooden Loom Shuttle (Mako) placed diagonally */}
      <g transform="rotate(-25 32 38)">
        <path d="M10 38 C18 34 46 34 54 38 C46 42 18 42 10 38 Z" fill="#92400E" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round" />
        {/* Hollow Bobbin Window */}
        <ellipse cx="32" cy="38" rx="10" ry="2.8" fill="#FEF08A" stroke="#0F172A" strokeWidth="1.4" />
        {/* Spun Red Silk Thread spool inside */}
        <rect x="25" y="36.5" width="14" height="3" rx="1.5" fill="#EF4444" />
      </g>
    </svg>
  );
}

/**
 * 9. Temple Bell (for monastery-bell)
 */
export function TempleBellIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Temple Bell" role="img">
      {/* Bell Crown / Hanging Loop */}
      <path d="M28 16 C28 11 36 11 36 16" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Brass Bell Dome */}
      <path d="M26 18 C26 24 16 34 16 46 L48 46 C48 34 38 24 38 18 Z" fill="#FBBF24" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Decorative Traditional Relief Bands */}
      <path d="M19 40 L45 40" stroke="#B45309" strokeWidth="2" />
      <circle cx="26" cy="34" r="1.5" fill="#B45309" />
      <circle cx="32" cy="34" r="1.5" fill="#B45309" />
      <circle cx="38" cy="34" r="1.5" fill="#B45309" />
      {/* Bell Rim Base */}
      <ellipse cx="32" cy="46" rx="16" ry="4" fill="#F59E0B" stroke="#0F172A" strokeWidth="2.2" />
      {/* Hanging Clapper & Prayer Ribbon */}
      <circle cx="32" cy="51" r="3.2" fill="#78350F" stroke="#0F172A" strokeWidth="1.6" />
      <path d="M32 54 L32 61" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" />
      {/* Resonating Sound Chimes */}
      <path d="M11 32 Q7 40 11 48" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M53 32 Q57 40 53 48" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * 10. River Boat on the Brahmaputra (for brahmaputra-boat)
 */
export function RiverBoatIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="River Boat" role="img">
      {/* Distant Hills & Rising Sun */}
      <circle cx="32" cy="22" r="10" fill="#FDE047" />
      <path d="M6 34 Q18 24 32 30 Q44 22 58 34 Z" fill="#6EE7B7" opacity="0.6" />
      {/* River Waves */}
      <path d="M6 46 Q19 42 32 46 Q45 50 58 46" stroke="#047857" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M12 54 Q22 51 32 54 Q42 57 52 54" stroke="#10B981" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Wooden Boat (Naao) */}
      <path d="M10 40 C18 48 46 48 54 40 L48 45 C38 49 26 49 16 45 Z" fill="#78350F" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Boat Deck Canopy (Bamboo roof) */}
      <path d="M24 40 C24 32 40 32 40 40 Z" fill="#D97706" stroke="#0F172A" strokeWidth="2" />
      {/* Steering Oar (Baitha) */}
      <line x1="46" y1="35" x2="55" y2="48" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="55" cy="48" rx="2" ry="3.5" fill="#B45309" stroke="#0F172A" strokeWidth="1.5" transform="rotate(-25 55 48)" />
    </svg>
  );
}

/**
 * 11. Great Indian Hornbill Flying in Hills (for hornbill-flight)
 */
export function HornbillIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Hornbill Flying" role="img">
      {/* Mountain Ridge */}
      <path d="M6 56 L24 40 L38 50 L58 36 L58 56 Z" fill="#047857" opacity="0.4" />
      {/* Large Hornbill Wings Spread */}
      <path d="M30 32 C18 20 8 26 6 36 C16 34 26 34 32 38 Z" fill="#0F172A" stroke="#0F172A" strokeWidth="2" />
      <path d="M34 32 C46 20 56 26 58 36 C48 34 38 34 32 38 Z" fill="#0F172A" stroke="#0F172A" strokeWidth="2" />
      {/* White Wing Tips */}
      <path d="M8 34 C12 30 18 31 16 35 Z" fill="#FFFFFF" />
      <path d="M56 34 C52 30 46 31 48 35 Z" fill="#FFFFFF" />
      {/* Body */}
      <ellipse cx="32" cy="36" rx="5" ry="11" fill="#0F172A" />
      <ellipse cx="32" cy="42" rx="3.5" ry="5" fill="#FFFFFF" />
      {/* Head */}
      <circle cx="32" cy="24" r="5" fill="#0F172A" stroke="#0F172A" strokeWidth="1.5" />
      {/* Iconic Yellow Casque & Beak */}
      <path d="M32 20 Q44 20 46 25 Q38 27 32 25 Z" fill="#FBBF24" stroke="#0F172A" strokeWidth="1.8" />
      <path d="M34 20 Q42 21 44 22 Z" fill="#DC2626" />
      {/* Red Eye */}
      <circle cx="33" cy="24" r="1.2" fill="#EF4444" />
    </svg>
  );
}

/**
 * 12. Clay Pottery on Wheel (for majuli-pottery)
 */
export function PotteryIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Making Clay Pots" role="img">
      {/* Potter's Wheel Base */}
      <ellipse cx="32" cy="52" rx="24" ry="6" fill="#64748B" stroke="#0F172A" strokeWidth="2.2" />
      <ellipse cx="32" cy="51" rx="20" ry="4" fill="#94A3B8" />
      {/* Earthen Clay Pot (Handi / Matka) */}
      <path d="M22 24 C14 34 14 44 22 48 C27 50 37 50 42 48 C50 44 50 34 42 24 Z" fill="#EA580C" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Neck & Rim */}
      <ellipse cx="32" cy="24" rx="10" ry="3.2" fill="#C2410C" stroke="#0F172A" strokeWidth="2" />
      <ellipse cx="32" cy="24" rx="7" ry="2" fill="#7C2D12" />
      {/* Traditional Engraved Geometric Ribbon */}
      <path d="M21 34 Q32 38 43 34" stroke="#FDE047" strokeWidth="2" fill="none" />
      <circle cx="28" cy="39" r="1.5" fill="#FDE047" />
      <circle cx="32" cy="40" r="1.5" fill="#FDE047" />
      <circle cx="36" cy="39" r="1.5" fill="#FDE047" />
      {/* Gentle spin motion arcs */}
      <path d="M10 50 Q7 45 10 40" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M54 50 Q57 45 54 40" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * 13. My Daily Routine (Clock, water glass, medicine)
 */
export function DailyRoutineIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Daily Routine" role="img">
      {/* Clock Face */}
      <circle cx="28" cy="28" r="18" fill="#FEF3C7" stroke="#0F172A" strokeWidth="2.2" />
      {/* Clock Hands at 8:00 AM */}
      <line x1="28" y1="28" x2="28" y2="16" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="28" y1="28" x2="22" y2="34" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="28" cy="28" r="2" fill="#DC2626" />
      {/* Fresh Water Glass in warm amber tone */}
      <path d="M42 34 L44 54 Q48 56 52 54 L54 34 Z" fill="#FEF3C7" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
      <path d="M43 42 Q48 44 53 42" stroke="#D97706" strokeWidth="1.6" fill="none" />
      {/* Medicine Capsule */}
      <g transform="rotate(-30 20 48)">
        <rect x="13" y="44" width="14" height="8" rx="4" fill="#EF4444" stroke="#0F172A" strokeWidth="1.8" />
        <rect x="20" y="44" width="7" height="8" rx="0" fill="#FDE047" stroke="#0F172A" strokeWidth="1.8" />
      </g>
      {/* Green Wellness Checkmark Badge */}
      <circle cx="48" cy="18" r="8" fill="#22C55E" stroke="#0F172A" strokeWidth="2" />
      <path d="M44 18 L47 21 L53 14" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/**
 * 14. Picture Puzzle / Jigsaw Pieces
 */
export function JigsawIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Picture Puzzle" role="img">
      {/* Top Left Piece */}
      <path d="M12 12 L28 12 C28 15 31 17 31 19 C31 21 28 23 28 26 L12 26 C12 23 14 21 14 19 C14 17 12 15 12 12 Z" fill="#0D9488" stroke="#0F172A" strokeWidth="2.2" />
      {/* Top Right Piece */}
      <path d="M34 12 L50 12 L50 26 C47 26 45 28 45 31 C45 34 47 36 50 36 L34 36 C34 33 36 31 36 28 C36 25 34 23 34 12 Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="2.2" />
      {/* Bottom Left Piece */}
      <path d="M12 32 L28 32 L28 48 C25 48 23 46 20 46 C17 46 15 48 12 48 Z" fill="#E11D48" stroke="#0F172A" strokeWidth="2.2" />
      {/* Bottom Right Piece with cute smiling face */}
      <path d="M34 36 L50 36 L50 48 L34 48 Z" fill="#10B981" stroke="#0F172A" strokeWidth="2.2" />
      <circle cx="40" cy="41" r="1.5" fill="#0F172A" />
      <circle cx="45" cy="41" r="1.5" fill="#0F172A" />
      <path d="M41 44 Q42.5 46 44 44" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * 15. Grandmother's Storybook (for storybook)
 */
export function StorybookIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Storybook" role="img">
      {/* Open Hardcover Book */}
      <path d="M10 46 C20 42 30 44 32 48 C34 44 44 42 54 46 L54 22 C44 18 34 20 32 24 C30 20 20 18 10 22 Z" fill="#FDE68A" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Book Spine */}
      <line x1="32" y1="24" x2="32" y2="48" stroke="#0F172A" strokeWidth="2.2" />
      {/* Book Cover Edge */}
      <path d="M8 48 C18 44 29 46 32 50 C35 46 46 44 56 48" stroke="#B45309" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Red Ribbon Bookmark */}
      <path d="M32 24 L32 38 L35 35 L38 38 L38 24" fill="#DC2626" />
      {/* Story Illustration Lines inside book */}
      <line x1="16" y1="28" x2="26" y2="28" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="16" y1="34" x2="24" y2="34" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="38" y1="28" x2="48" y2="28" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="40" y1="34" x2="48" y2="34" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
      {/* Rising Golden Sparkles */}
      <path d="M32 8 L33.5 12 L37.5 13.5 L33.5 15 L32 19 L30.5 15 L26.5 13.5 L30.5 12 Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.2" />
      <circle cx="20" cy="12" r="1.5" fill="#F59E0B" />
      <circle cx="44" cy="10" r="1.8" fill="#F59E0B" />
    </svg>
  );
}

/**
 * 16. Vintage Retro Radio (for radio)
 */
export function RadioIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Nostalgic Radio" role="img">
      {/* Antenna */}
      <line x1="18" y1="18" x2="38" y2="6" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      <circle cx="38" cy="6" r="2" fill="#DC2626" />
      {/* Radio Cabinet Body */}
      <rect x="10" y="18" width="44" height="34" rx="6" fill="#B45309" stroke="#0F172A" strokeWidth="2.2" />
      {/* Speaker Grille */}
      <rect x="15" y="24" width="20" height="22" rx="3" fill="#FEF3C7" stroke="#0F172A" strokeWidth="1.6" />
      <line x1="18" y1="29" x2="32" y2="29" stroke="#78350F" strokeWidth="1.4" />
      <line x1="18" y1="35" x2="32" y2="35" stroke="#78350F" strokeWidth="1.4" />
      <line x1="18" y1="41" x2="32" y2="41" stroke="#78350F" strokeWidth="1.4" />
      {/* Tuning Dial */}
      <circle cx="44" cy="29" r="6" fill="#FEF3C7" stroke="#0F172A" strokeWidth="1.8" />
      <line x1="44" y1="29" x2="47" y2="26" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
      {/* Volume Knob */}
      <circle cx="44" cy="41" r="3.5" fill="#78350F" stroke="#0F172A" strokeWidth="1.6" />
      {/* Floating Music Notes */}
      <path d="M48 10 Q52 7 56 12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="49" cy="11" r="1.5" fill="#F59E0B" />
    </svg>
  );
}

/**
 * 17. Village Walk / Wayfinding (for majuli-walk, wayfinding, day-in-my-world)
 */
export function VillageWalkIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Village Walk" role="img">
      {/* Golden Sunrise */}
      <circle cx="32" cy="22" r="12" fill="#FBBF24" />
      {/* Lush Green Village Fields */}
      <path d="M6 38 C16 32 30 34 40 32 C50 30 58 36 58 56 L6 56 Z" fill="#10B981" />
      {/* Traditional Thatched Village Home */}
      <path d="M12 34 L22 24 L32 34 Z" fill="#92400E" stroke="#0F172A" strokeWidth="2" />
      <rect x="15" y="34" width="14" height="10" fill="#FEF3C7" stroke="#0F172A" strokeWidth="1.8" />
      <rect x="19" y="38" width="6" height="6" fill="#78350F" />
      {/* Bamboo Groves on Right */}
      <path d="M46 18 Q48 28 44 42" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
      <path d="M52 22 Q54 32 50 44" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
      {/* Winding Footpath leading forward */}
      <path d="M30 44 C26 48 38 52 32 58 L24 58 C30 52 20 48 24 44 Z" fill="#D97706" stroke="#0F172A" strokeWidth="1.6" />
    </svg>
  );
}

/**
 * 18. Heritage Kitchen (for heritage-kitchen)
 */
export function KitchenIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Kitchen Pot" role="img">
      {/* Cooking Handi Pot */}
      <path d="M16 30 C12 38 12 48 20 52 C26 55 38 55 44 52 C52 48 52 38 48 30 Z" fill="#EA580C" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Pot Rim */}
      <ellipse cx="32" cy="30" rx="16" ry="4" fill="#FDE68A" stroke="#0F172A" strokeWidth="2.2" />
      {/* Wooden Spoon / Ladle resting inside */}
      <line x1="24" y1="16" x2="36" y2="40" stroke="#78350F" strokeWidth="3.2" strokeLinecap="round" />
      <ellipse cx="23" cy="15" rx="3.5" ry="5" fill="#92400E" stroke="#0F172A" strokeWidth="1.5" transform="rotate(-25 23 15)" />
      {/* Aromatic Steam */}
      <path d="M28 22 Q24 16 28 12" stroke="#64748B" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M36 20 Q40 14 36 10" stroke="#64748B" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * 19. Village Market Fresh Produce (for bazaar-buddies)
 */
export function MarketIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Market Produce" role="img">
      {/* Basket */}
      <path d="M14 36 L18 54 Q32 58 46 54 L50 36 Z" fill="#D97706" stroke="#0F172A" strokeWidth="2.2" />
      <ellipse cx="32" cy="36" rx="18" ry="4" fill="#FDE68A" stroke="#0F172A" strokeWidth="2" />
      {/* Red Apple */}
      <circle cx="24" cy="30" r="7" fill="#EF4444" stroke="#0F172A" strokeWidth="2" />
      <path d="M24 23 Q26 19 28 20" stroke="#15803D" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Golden Bananas */}
      <path d="M34 22 C30 26 32 36 44 32 C38 32 36 26 34 22 Z" fill="#FBBF24" stroke="#0F172A" strokeWidth="2" />
      {/* Green Vegetable Leaf */}
      <path d="M32 26 C28 18 36 14 42 20 C40 26 36 28 32 26 Z" fill="#22C55E" stroke="#0F172A" strokeWidth="1.8" />
    </svg>
  );
}

/**
 * 20. Follow the Arrows / Compass (for arrow-escape)
 */
export function CompassIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Directional Compass" role="img">
      <circle cx="32" cy="32" r="22" fill="#FEF3C7" stroke="#0F172A" strokeWidth="2.2" />
      {/* North Point */}
      <polygon points="32,14 36,32 32,28" fill="#EF4444" stroke="#0F172A" strokeWidth="1.6" />
      <polygon points="32,14 28,32 32,28" fill="#DC2626" stroke="#0F172A" strokeWidth="1.6" />
      {/* South Point */}
      <polygon points="32,50 36,32 32,36" fill="#EA580C" stroke="#0F172A" strokeWidth="1.6" />
      <polygon points="32,50 28,32 32,36" fill="#C2410C" stroke="#0F172A" strokeWidth="1.6" />
      {/* East & West Points */}
      <polygon points="50,32 32,28 36,32" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.6" />
      <polygon points="14,32 32,28 28,32" fill="#10B981" stroke="#0F172A" strokeWidth="1.6" />
      <circle cx="32" cy="32" r="3.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.8" />
    </svg>
  );
}

/**
 * 21. Finding Signs on the Road (for memory-road)
 */
export function RoadSignIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Road Signs" role="img">
      {/* Road asphalt with perspective */}
      <path d="M12 56 L24 34 L40 34 L52 56 Z" fill="#334155" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
      {/* White Road Crossing / Lane Divider */}
      <line x1="32" y1="36" x2="32" y2="42" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="46" x2="32" y2="54" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
      {/* Signpost Metal Pole */}
      <rect x="22" y="14" width="3.5" height="26" rx="1" fill="#94A3B8" stroke="#0F172A" strokeWidth="1.8" />
      {/* Green Street Navigation Signboard */}
      <rect x="10" y="10" width="28" height="15" rx="3" fill="#047857" stroke="#0F172A" strokeWidth="2" />
      <rect x="12" y="12" width="24" height="11" rx="1.5" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
      {/* Directional White Arrow on Green Sign */}
      <path d="M16 17.5 L24 17.5 M21 14.5 L25 17.5 L21 20.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="29" cy="17.5" r="1.5" fill="#FFFFFF" />
      {/* Red Octagonal STOP / Safety Sign on Right */}
      <rect x="44" y="20" width="3" height="20" rx="1" fill="#94A3B8" stroke="#0F172A" strokeWidth="1.8" />
      <polygon points="41,12 49,12 55,18 55,26 49,32 41,32 35,26 35,18" fill="#DC2626" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="41.5,13.5 48.5,13.5 53.5,18.5 53.5,25.5 48.5,30.5 41.5,30.5 36.5,25.5 36.5,18.5" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
      {/* White Sign Cross / Exclamation */}
      <circle cx="45" cy="22" r="2.5" fill="#FFFFFF" />
      {/* Sun / Daylight in sky */}
      <circle cx="53" cy="8" r="4" fill="#FBBF24" />
    </svg>
  );
}

/**
 * 22. Friendly AI Companion Saathi (for companion - Friendly Chat with Saathi)
 */
export function CompanionIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Friendly Companion Saathi" role="img">
      {/* Headset Band */}
      <path d="M16 28 C16 16 48 16 48 28" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Head Outline */}
      <circle cx="32" cy="32" r="18" fill="#FEF3C7" stroke="#0F172A" strokeWidth="2.2" />
      {/* Rosy Cheeks */}
      <circle cx="23" cy="35" r="3" fill="#FECDD3" />
      <circle cx="41" cy="35" r="3" fill="#FECDD3" />
      {/* Big Cheerful Eyes */}
      <circle cx="25" cy="29" r="3" fill="#0F172A" />
      <circle cx="26" cy="28" r="1" fill="#FFFFFF" />
      <circle cx="39" cy="29" r="3" fill="#0F172A" />
      <circle cx="40" cy="28" r="1" fill="#FFFFFF" />
      {/* Warm Smile */}
      <path d="M26 36 Q32 42 38 36" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* Headphone Ear Cushions */}
      <rect x="11" y="24" width="6" height="12" rx="3" fill="#7C3AED" stroke="#0F172A" strokeWidth="1.8" />
      <rect x="47" y="24" width="6" height="12" rx="3" fill="#7C3AED" stroke="#0F172A" strokeWidth="1.8" />
      {/* Mic Arm with glowing dot */}
      <path d="M14 34 Q16 43 24 44" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="25" cy="44" r="2.5" fill="#10B981" stroke="#0F172A" strokeWidth="1.2" />
      {/* Heart Badge at chest */}
      <path d="M32 50 C29 46 24 48 24 52 C24 56 32 60 32 60 C32 60 40 56 40 52 C40 48 35 46 32 50 Z" fill="#F43F5E" stroke="#0F172A" strokeWidth="1.8" />
      {/* Floating speech sound wave bubble */}
      <circle cx="48" cy="14" r="7" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.6" />
      <path d="M46 17 L46 12 Q48 11 50 14" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * 23. Rhythm Hills Folk Melody & Hill Drums (for rhythm-hills - Gentle Drum Songs)
 */
export function RhythmHillsIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Rhythm Hills Songs" role="img">
      {/* Sky & Distant Mountain */}
      <path d="M8 46 L24 22 L42 46 Z" fill="#86EFAC" stroke="#0F172A" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M26 48 L44 26 L58 48 Z" fill="#4ADE80" stroke="#0F172A" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Foreground Rolling Green Hill */}
      <path d="M4 56 Q32 38 60 56 L60 60 L4 60 Z" fill="#15803D" stroke="#0F172A" strokeWidth="2" />
      {/* Traditional Hill Hand Drum */}
      <ellipse cx="28" cy="42" rx="12" ry="6" fill="#F59E0B" stroke="#0F172A" strokeWidth="2" />
      <path d="M16 42 L16 50 Q28 56 40 50 L40 42 Z" fill="#B45309" stroke="#0F172A" strokeWidth="2" />
      {/* Drumhead center */}
      <ellipse cx="28" cy="42" rx="7" ry="3.5" fill="#FEF3C7" />
      {/* Floating Golden Musical Notes */}
      <circle cx="46" cy="20" r="3" fill="#D97706" stroke="#0F172A" strokeWidth="1.5" />
      <path d="M49 20 L49 10 Q53 9 55 12" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="36" cy="15" r="2.5" fill="#EF4444" stroke="#0F172A" strokeWidth="1.4" />
      <path d="M38.5 15 L38.5 7 Q42 6 44 9" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* Sound Waves */}
      <path d="M50 28 Q54 32 50 36" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * 24. Weaving Flower Motifs on Silk Loom (for weaving - Weaving Flower Patterns)
 */
export function WeavingFlowersIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Weaving Flower Patterns" role="img">
      {/* White Silk Woven Cloth Background */}
      <rect x="10" y="10" width="44" height="44" rx="4" fill="#FFFDF9" stroke="#0F172A" strokeWidth="2.2" />
      {/* Vertical Warp Threads */}
      <line x1="16" y1="10" x2="16" y2="54" stroke="#E2E8F0" strokeWidth="1.2" />
      <line x1="22" y1="10" x2="22" y2="54" stroke="#E2E8F0" strokeWidth="1.2" />
      <line x1="28" y1="10" x2="28" y2="54" stroke="#E2E8F0" strokeWidth="1.2" />
      <line x1="34" y1="10" x2="34" y2="54" stroke="#E2E8F0" strokeWidth="1.2" />
      <line x1="40" y1="10" x2="40" y2="54" stroke="#E2E8F0" strokeWidth="1.2" />
      <line x1="46" y1="10" x2="46" y2="54" stroke="#E2E8F0" strokeWidth="1.2" />
      {/* Traditional Assam Red Phool Gamosa Flower Motif in Center */}
      <polygon points="32,20 38,26 32,32 26,26" fill="#DC2626" stroke="#0F172A" strokeWidth="1.6" />
      <polygon points="32,32 38,38 32,44 26,38" fill="#DC2626" stroke="#0F172A" strokeWidth="1.6" />
      <polygon points="26,26 32,32 26,38 20,32" fill="#EF4444" stroke="#0F172A" strokeWidth="1.6" />
      <polygon points="38,26 44,32 38,38 32,32" fill="#EF4444" stroke="#0F172A" strokeWidth="1.6" />
      <circle cx="32" cy="32" r="3" fill="#FDE047" stroke="#0F172A" strokeWidth="1.4" />
      {/* Wooden Loom Shuttle (Maku) Crossing Across */}
      <path d="M6 46 C16 43 48 43 58 46 C48 49 16 49 6 46 Z" fill="#78350F" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
      {/* Spooled Red Thread inside Shuttle */}
      <ellipse cx="32" cy="46" rx="8" ry="2.2" fill="#DC2626" />
    </svg>
  );
}

/**
 * 25. Meghalaya Living Root Bridge (for root-bridge - Crossing the Root Bridge)
 */
export function LivingRootBridgeIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Living Root Bridge" role="img">
      {/* River Stream */}
      <path d="M8 56 Q32 48 56 56 L56 60 L8 60 Z" fill="#34D399" stroke="#0F172A" strokeWidth="1.8" />
      {/* River Boulders */}
      <circle cx="20" cy="56" r="4" fill="#94A3B8" stroke="#0F172A" strokeWidth="1.4" />
      <circle cx="44" cy="56" r="3.5" fill="#64748B" stroke="#0F172A" strokeWidth="1.4" />
      {/* Ancient Living Tree Trunks (Left & Right) */}
      <path d="M6 14 L12 14 L15 54 L4 54 Z" fill="#5C3D2E" stroke="#0F172A" strokeWidth="2" />
      <path d="M52 14 L58 14 L60 54 L49 54 Z" fill="#5C3D2E" stroke="#0F172A" strokeWidth="2" />
      {/* Living Canopy Leaves */}
      <circle cx="10" cy="12" r="8" fill="#15803D" stroke="#0F172A" strokeWidth="1.8" />
      <circle cx="54" cy="12" r="8" fill="#15803D" stroke="#0F172A" strokeWidth="1.8" />
      {/* Lower Arched Living Root Bridge Pathway */}
      <path d="M12 42 Q32 36 52 42 Q32 40 12 42 Z" fill="#78350F" stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" />
      {/* Upper Handrail Roots */}
      <path d="M12 28 Q32 24 52 28" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* Intertwined Vertical Knotted Roots */}
      <path d="M22 26 Q23 35 22 41" stroke="#9A3412" strokeWidth="1.8" fill="none" />
      <path d="M32 25 Q31 34 32 40" stroke="#9A3412" strokeWidth="1.8" fill="none" />
      <path d="M42 26 Q43 35 42 41" stroke="#9A3412" strokeWidth="1.8" fill="none" />
      {/* Green moss sprigs along the bridge */}
      <circle cx="27" cy="38" r="2.5" fill="#22C55E" />
      <circle cx="37" cy="38" r="2.5" fill="#22C55E" />
    </svg>
  );
}

/**
 * 26. Rare Dzukou Valley Lily (for dzukou-botanist - Finding Valley Flowers)
 */
export function DzukouLilyIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Dzukou Valley Lily" role="img">
      {/* Misty Hills Backdrop */}
      <path d="M6 46 Q32 32 58 46 L58 58 L6 58 Z" fill="#A7F3D0" stroke="#0F172A" strokeWidth="1.8" />
      {/* Lily Stem */}
      <path d="M32 56 Q31 38 33 22" stroke="#15803D" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      {/* Long Slender Grass-like Leaves */}
      <path d="M32 44 Q20 40 12 46" stroke="#15803D" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M32 36 Q44 32 52 38" stroke="#15803D" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Dzukou Lily Bell Blossom (Nodding Flower) */}
      <path d="M24 22 C22 14 42 14 40 22 C44 28 20 28 24 22 Z" fill="#F472B6" stroke="#0F172A" strokeWidth="1.8" />
      <path d="M32 14 C27 20 24 28 20 30 C22 26 28 22 32 14 Z" fill="#FBCFE8" stroke="#0F172A" strokeWidth="1.6" />
      <path d="M32 14 C37 20 40 28 44 30 C42 26 36 22 32 14 Z" fill="#FBCFE8" stroke="#0F172A" strokeWidth="1.6" />
      <path d="M32 14 C30 22 32 30 32 34 C32 30 34 22 32 14 Z" fill="#F43F5E" stroke="#0F172A" strokeWidth="1.6" />
      {/* Golden Yellow Stamens with Pollen */}
      <circle cx="28" cy="33" r="1.8" fill="#FBBF24" stroke="#0F172A" strokeWidth="1" />
      <circle cx="32" cy="36" r="1.8" fill="#FBBF24" stroke="#0F172A" strokeWidth="1" />
      <circle cx="36" cy="33" r="1.8" fill="#FBBF24" stroke="#0F172A" strokeWidth="1" />
      {/* Morning Dewdrop */}
      <circle cx="21" cy="27" r="1.5" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * 27. Courtyard Marigold Flower Pot (for memory-garden - Flower Garden Memories)
 */
export function GardenFlowerPotIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Garden Flower Pot" role="img">
      {/* Terracotta Flower Pot */}
      <path d="M18 36 L22 56 Q32 58 42 56 L46 36 Z" fill="#D97706" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="16" y="32" width="32" height="6" rx="2" fill="#F59E0B" stroke="#0F172A" strokeWidth="2" />
      {/* Foliage / Green Leaves */}
      <path d="M32 32 Q26 22 18 24 Q24 30 32 32 Z" fill="#16A34A" stroke="#0F172A" strokeWidth="1.6" />
      <path d="M32 32 Q38 22 46 24 Q40 30 32 32 Z" fill="#16A34A" stroke="#0F172A" strokeWidth="1.6" />
      <path d="M32 32 Q32 18 32 14" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" />
      {/* Center Marigold Bloom (Orange & Yellow) */}
      <circle cx="32" cy="18" r="9" fill="#EA580C" stroke="#0F172A" strokeWidth="1.8" />
      <circle cx="32" cy="18" r="6" fill="#F59E0B" />
      <circle cx="32" cy="18" r="3" fill="#FEF08A" />
      {/* Left Marigold */}
      <circle cx="22" cy="26" r="6.5" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.6" />
      <circle cx="22" cy="26" r="3" fill="#FEF08A" />
      {/* Right Marigold */}
      <circle cx="42" cy="26" r="6.5" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.6" />
      <circle cx="42" cy="26" r="3" fill="#FEF08A" />
      {/* Watering Droplets */}
      <path d="M50 14 Q52 10 54 14 Z" fill="#38BDF8" stroke="#0F172A" strokeWidth="1" />
      <path d="M54 20 Q56 16 58 20 Z" fill="#38BDF8" stroke="#0F172A" strokeWidth="1" />
    </svg>
  );
}

/**
 * 28. Brass Kettle Pouring Lal Saah (for daily-tasks - Making Warm Red Tea)
 */
export function TeaKettleIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Making Warm Red Tea" role="img">
      {/* Brass Kettle Body */}
      <ellipse cx="28" cy="44" rx="16" ry="6" fill="#D97706" stroke="#0F172A" strokeWidth="2" />
      <path d="M14 32 C12 44 44 44 42 32 Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="22" y="28" width="12" height="4" rx="1.5" fill="#B45309" stroke="#0F172A" strokeWidth="1.8" />
      {/* Kettle Lid Knob */}
      <circle cx="28" cy="26" r="2.5" fill="#78350F" stroke="#0F172A" strokeWidth="1.4" />
      {/* Handle over top */}
      <path d="M16 30 C16 16 40 16 40 30" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Spout */}
      <path d="M38 34 C44 32 46 24 50 22 L51 25 C47 28 44 38 38 38 Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.8" />
      {/* Poured Stream of Red Tea */}
      <path d="M50.5 24 Q54 34 53 46" stroke="#9A3412" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {/* Small Glass Cup */}
      <path d="M48 46 L49 56 Q54 58 59 56 L60 46 Z" fill="#FED7AA" stroke="#0F172A" strokeWidth="1.8" />
      <ellipse cx="54" cy="46" rx="5.5" ry="1.8" fill="#7C2D12" />
      {/* Steam rising */}
      <path d="M24 20 Q20 14 24 10" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M32 18 Q36 12 32 8" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * 29. Wooden Kitchen Pantry Shelves (for sorting - Sorting Household Items)
 */
export function PantrySortingIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Sorting Household Items" role="img">
      {/* Top Wooden Shelf */}
      <rect x="8" y="28" width="48" height="5" rx="1.5" fill="#78350F" stroke="#0F172A" strokeWidth="2" />
      {/* Bottom Wooden Shelf */}
      <rect x="8" y="52" width="48" height="5" rx="1.5" fill="#78350F" stroke="#0F172A" strokeWidth="2" />
      {/* Top Shelf Items: Turmeric Spice Jar & Red Tea Tin */}
      <rect x="14" y="14" width="10" height="14" rx="2" fill="#FEF08A" stroke="#0F172A" strokeWidth="1.8" />
      <rect x="16" y="11" width="6" height="3" rx="1" fill="#D97706" stroke="#0F172A" strokeWidth="1.2" />
      <rect x="16" y="18" width="6" height="5" fill="#F59E0B" />
      <rect x="28" y="12" width="12" height="16" rx="2" fill="#EF4444" stroke="#0F172A" strokeWidth="1.8" />
      <rect x="30" y="9" width="8" height="3" rx="1" fill="#DC2626" stroke="#0F172A" strokeWidth="1.2" />
      <circle cx="34" cy="19" r="2.5" fill="#FFFFFF" />
      {/* Bottom Shelf Items: Green Tea Caddy & Brass Bowl */}
      <rect x="16" y="36" width="12" height="16" rx="2" fill="#15803D" stroke="#0F172A" strokeWidth="1.8" />
      <path d="M22 41 L22 46 M20 44 L24 44" stroke="#86EFAC" strokeWidth="1.5" strokeLinecap="round" />
      {/* Brass Bowl */}
      <path d="M34 44 C34 52 48 52 48 44 Z" fill="#FBBF24" stroke="#0F172A" strokeWidth="1.8" />
      <ellipse cx="41" cy="44" rx="7" ry="2.2" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.4" />
      {/* Green Checkmark Badge on Organization */}
      <circle cx="48" cy="16" r="6" fill="#10B981" stroke="#0F172A" strokeWidth="1.6" />
      <path d="M45 16 L47 18 L51 14" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * 30. Keepsake Family Photo Album (for timeline - My Life Story)
 */
export function KeepsakeAlbumIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="My Life Story Album" role="img">
      {/* Open Photo Album Book */}
      <path d="M8 18 C16 16 30 18 32 22 C34 18 48 16 56 18 L56 50 C48 48 34 50 32 54 C30 50 16 48 8 50 Z" fill="#FEF3C7" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Leather Spine */}
      <line x1="32" y1="22" x2="32" y2="54" stroke="#78350F" strokeWidth="2.6" strokeLinecap="round" />
      {/* Left Page: Portrait Photo with Corner Mounts */}
      <rect x="13" y="24" width="14" height="18" rx="1" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.4" />
      <circle cx="20" cy="30" r="3" fill="#94A3B8" />
      <path d="M15 40 C17 36 23 36 25 40 Z" fill="#64748B" />
      <path d="M12 23 L15 23 L12 26 Z" fill="#F59E0B" />
      <path d="M28 23 L25 23 L28 26 Z" fill="#F59E0B" />
      {/* Right Page: Handwritten lines & pressed keepsake flower */}
      <line x1="36" y1="26" x2="51" y2="26" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="36" y1="31" x2="49" y2="31" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="44" cy="40" r="3.5" fill="#F43F5E" />
      <circle cx="44" cy="40" r="1.5" fill="#FDE047" />
      {/* Silk Ribbon Bookmark Draping */}
      <path d="M32 22 Q34 38 36 56" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * 31. Tuned Brass Gong on Bamboo Stand (for tuned-drum - Music Drum Circle)
 */
export function TunedGongIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Tuned Music Drum Circle" role="img">
      {/* Bamboo Stand */}
      <line x1="12" y1="12" x2="52" y2="12" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="16" y1="12" x2="14" y2="56" stroke="#78350F" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="48" y1="12" x2="50" y2="56" stroke="#78350F" strokeWidth="2.8" strokeLinecap="round" />
      {/* Hanging Ropes */}
      <line x1="26" y1="14" x2="26" y2="22" stroke="#DC2626" strokeWidth="1.8" />
      <line x1="38" y1="14" x2="38" y2="22" stroke="#DC2626" strokeWidth="1.8" />
      {/* Circular Tuned Brass Gong */}
      <circle cx="32" cy="34" r="15" fill="#F59E0B" stroke="#0F172A" strokeWidth="2.2" />
      <circle cx="32" cy="34" r="11" fill="#FBBF24" stroke="#0F172A" strokeWidth="1.4" />
      {/* Center Raised Boss */}
      <circle cx="32" cy="34" r="4.5" fill="#D97706" stroke="#0F172A" strokeWidth="1.8" />
      {/* Padded Striker Mallet */}
      <line x1="42" y1="46" x2="54" y2="34" stroke="#78350F" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="42" cy="46" r="4" fill="#EF4444" stroke="#0F172A" strokeWidth="1.6" />
      {/* Resonating Sound Rings */}
      <path d="M12 28 Q8 34 12 40" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M52 28 Q56 34 52 40" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * 32. Morning Sunrise over Village Stilt Cottage (for day-in-my-world - A Day in My Village)
 */
export function VillageSunriseIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="A Day in My Village" role="img">
      {/* Golden Rising Sun */}
      <circle cx="22" cy="22" r="10" fill="#FBBF24" stroke="#0F172A" strokeWidth="2" />
      <path d="M22 8 L22 5 M12 12 L10 10 M8 22 L5 22 M32 12 L34 10" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      {/* River Horizon */}
      <path d="M4 48 Q32 44 60 48 L60 60 L4 60 Z" fill="#34D399" stroke="#0F172A" strokeWidth="2" />
      {/* Chang Ghar Stilt Cottage */}
      <line x1="32" y1="42" x2="32" y2="52" stroke="#0F172A" strokeWidth="2.2" />
      <line x1="40" y1="42" x2="40" y2="52" stroke="#0F172A" strokeWidth="2.2" />
      <line x1="48" y1="42" x2="48" y2="52" stroke="#0F172A" strokeWidth="2.2" />
      {/* Cottage Walls */}
      <rect x="30" y="30" width="20" height="12" fill="#FED7AA" stroke="#0F172A" strokeWidth="2" />
      <rect x="37" y="34" width="6" height="8" fill="#78350F" />
      {/* Sloped Thatched Roof */}
      <polygon points="26,30 40,18 54,30" fill="#D97706" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Coconut Palm on Left */}
      <path d="M12 50 Q16 36 14 26" stroke="#78350F" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M14 26 Q8 20 4 24" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M14 26 Q18 18 22 22" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M14 26 Q12 16 10 14" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * 33. Hand Plucking Fresh Green Tea Shoot (for tea-harvest-vision - Picking Tea Leaves with Hands)
 */
export function HandPluckingIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Picking Tea Leaves with Hands" role="img">
      {/* Tea Bush Base */}
      <ellipse cx="32" cy="52" rx="20" ry="7" fill="#15803D" stroke="#0F172A" strokeWidth="2" />
      {/* Stem */}
      <path d="M32 52 L32 30" stroke="#166534" strokeWidth="2.8" strokeLinecap="round" />
      {/* Two Tender Green Tea Leaves */}
      <path d="M32 32 C22 28 20 18 32 20 C28 28 32 32 32 32 Z" fill="#22C55E" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
      <path d="M32 32 C42 28 44 18 32 20 C36 28 32 32 32 32 Z" fill="#22C55E" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
      {/* Central Fresh Shoot Bud */}
      <path d="M32 22 Q32 12 32 10 Q34 16 32 22" stroke="#86EFAC" strokeWidth="2.4" strokeLinecap="round" fill="#86EFAC" />
      {/* Gentle Hand Reaching from Top Right to Pluck */}
      <path d="M52 8 L44 16 C42 18 38 18 36 20 C35 21 34 22 36 24 C38 24 40 22 42 20 L50 14" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="#FED7AA" />
      {/* Thumb */}
      <path d="M40 18 C38 16 34 16 33 18 C33 20 35 21 38 20" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="#FED7AA" />
      {/* Interactive Golden Sparkles */}
      <path d="M26 12 L28 15 L31 16 L28 17 L26 20 L24 17 L21 16 L24 15 Z" fill="#FBBF24" />
      <path d="M42 28 L43 30 L45 31 L43 32 L42 34 L41 32 L39 31 L41 30 Z" fill="#F59E0B" />
    </svg>
  );
}

/**
 * Universal Activity Illustration Component.
 * Automatically selects the handcrafted, uniquely themed illustration for each gameId.
 */
export function ActivityIllustration({ gameId, className = "h-12 w-12 sm:h-14 sm:w-14" }: { gameId: string; className?: string }) {
  switch (gameId) {
    case "companion":
      return <CompanionIllustration className={className} />;
    case "rhythm-hills":
      return <RhythmHillsIllustration className={className} />;
    case "weaving":
      return <WeavingFlowersIllustration className={className} />;
    case "loom":
      return <LoomIllustration className={className} />;
    case "root-bridge":
      return <LivingRootBridgeIllustration className={className} />;
    case "dzukou-botanist":
      return <DzukouLilyIllustration className={className} />;
    case "memory-garden":
      return <GardenFlowerPotIllustration className={className} />;
    case "daily-tasks":
      return <TeaKettleIllustration className={className} />;
    case "grandchild-chat":
      return <TeaCupIllustration className={className} />;
    case "sorting":
      return <PantrySortingIllustration className={className} />;
    case "timeline":
      return <KeepsakeAlbumIllustration className={className} />;
    case "memory-detective":
    case "family-emotions":
      return <FamilyIllustration className={className} />;
    case "tuned-drum":
      return <TunedGongIllustration className={className} />;
    case "drum":
    case "bihu-dhol":
      return <BihuDholIllustration className={className} />;
    case "day-in-my-world":
      return <VillageSunriseIllustration className={className} />;
    case "tea-harvest-vision":
      return <HandPluckingIllustration className={className} />;
    case "tea-harvest":
    case "tea-garden-catch":
      return <TeaLeavesIllustration className={className} />;
    case "alpana":
      return <RangoliIllustration className={className} />;
    case "lotus-painter":
      return <LotusIllustration className={className} />;
    case "butterfly-sanctuary":
      return <ButterflyIllustration className={className} />;
    case "river-lanterns":
      return <RiverLanternIllustration className={className} />;
    case "monastery-bell":
      return <TempleBellIllustration className={className} />;
    case "brahmaputra-boat":
      return <RiverBoatIllustration className={className} />;
    case "hornbill-flight":
      return <HornbillIllustration className={className} />;
    case "majuli-pottery":
      return <PotteryIllustration className={className} />;
    case "daily-routine":
      return <DailyRoutineIllustration className={className} />;
    case "jigsaw":
      return <JigsawIllustration className={className} />;
    case "storybook":
      return <StorybookIllustration className={className} />;
    case "radio":
      return <RadioIllustration className={className} />;
    case "majuli-walk":
    case "wayfinding":
      return <VillageWalkIllustration className={className} />;
    case "heritage-kitchen":
      return <KitchenIllustration className={className} />;
    case "bazaar-buddies":
      return <MarketIllustration className={className} />;
    case "arrow-escape":
    case "pathways":
      return <CompassIllustration className={className} />;
    case "memory-road":
      return <RoadSignIllustration className={className} />;
    default:
      return <VillageSunriseIllustration className={className} />;
  }
}
