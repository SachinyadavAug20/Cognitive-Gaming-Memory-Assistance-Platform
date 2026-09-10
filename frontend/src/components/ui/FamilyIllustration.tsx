"use client";

interface FamilyIllustrationProps {
  className?: string;
}

/**
 * Handcrafted vector illustration depicting a warm, multi-generational family
 * (Grandparent with glasses, smiling parent, joyful child, and love heart).
 * Designed with bold outlines and warm tones to match CogniCare's tactile senior UI.
 */
export function FamilyIllustration({ className = "h-12 w-12 sm:h-14 sm:w-14" }: FamilyIllustrationProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Loving Family Illustration"
      role="img"
    >
      {/* Floating love heart above */}
      <path
        d="M32 9.5 C30 5.5 24 5.5 21.5 9 C19 13 23 17.5 32 23.5 C41 17.5 45 13 42.5 9 C40 5.5 34 5.5 32 9.5 Z"
        fill="#EF4444"
        stroke="#0F172A"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* --- Left Figure: Grandparent / Elder with glasses --- */}
      <g id="grandparent">
        {/* Torso / Clothes */}
        <path
          d="M9 54 C9 43 17 38 24 38 C27 38 30 39.5 32 42 C27 45 24 49 24 54 Z"
          fill="#38BDF8"
          stroke="#0F172A"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Head */}
        <circle cx="21" cy="27" r="8" fill="#FED7AA" stroke="#0F172A" strokeWidth="2.2" />
        {/* Silver Hair */}
        <path
          d="M13.5 27 C13.5 20 17 19 21 19 C25 19 28.5 20 28.5 27 C26.5 23.5 23.5 23 21 23 C18.5 23 15.5 23.5 13.5 27 Z"
          fill="#94A3B8"
          stroke="#0F172A"
          strokeWidth="1.8"
        />
        {/* Round Glasses */}
        <circle cx="18.5" cy="27.5" r="2.4" stroke="#0F172A" strokeWidth="1.6" fill="#F8FAFC" fillOpacity="0.4" />
        <circle cx="23.5" cy="27.5" r="2.4" stroke="#0F172A" strokeWidth="1.6" fill="#F8FAFC" fillOpacity="0.4" />
        <line x1="20.9" y1="27.5" x2="21.1" y2="27.5" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
        {/* Gentle Smile */}
        <path d="M19 32 Q21 33.5 23 32" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </g>

      {/* --- Right Figure: Parent / Loved One --- */}
      <g id="parent">
        {/* Torso / Clothes */}
        <path
          d="M55 54 C55 43 47 38 40 38 C37 38 34 39.5 32 42 C37 45 40 49 40 54 Z"
          fill="#34D399"
          stroke="#0F172A"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Head */}
        <circle cx="43" cy="27" r="8" fill="#FED7AA" stroke="#0F172A" strokeWidth="2.2" />
        {/* Dark Hair */}
        <path
          d="M35 27 C35.5 20 39.5 19 43 19 C47 19 51 20 51 27 C48.5 23.5 45.5 23 43 23 C40 23 37 24 35 27 Z"
          fill="#78350F"
          stroke="#0F172A"
          strokeWidth="1.8"
        />
        {/* Smiling Eyes */}
        <circle cx="40.5" cy="27" r="1.1" fill="#0F172A" />
        <circle cx="45.5" cy="27" r="1.1" fill="#0F172A" />
        {/* Smile */}
        <path d="M41 31.5 Q43 33.5 45 31.5" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </g>

      {/* --- Center Front Figure: Grandchild / Child --- */}
      <g id="child">
        {/* Torso / Clothes */}
        <path
          d="M23 54 C23 46 27 42.5 32 42.5 C37 42.5 41 46 41 54 Z"
          fill="#FB923C"
          stroke="#0F172A"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Collar Detail */}
        <path d="M29.5 43.5 L32 46.5 L34.5 43.5" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        {/* Head */}
        <circle cx="32" cy="35" r="7" fill="#FDE68A" stroke="#0F172A" strokeWidth="2.2" />
        {/* Cute Hair Tuft */}
        <path
          d="M28 32 C29 27.5 34 27.5 36 32 C34.2 30.2 32.2 29.8 30 30.2 Z"
          fill="#0F172A"
        />
        {/* Happy Eyes ^ ^ */}
        <path d="M29.2 34.5 Q30.2 33.2 31.2 34.5" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <path d="M32.8 34.5 Q33.8 33.2 34.8 34.5" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        {/* Joyful open smile */}
        <path
          d="M29.8 37.2 Q32 40.2 34.2 37.2 Z"
          fill="#E11D48"
          stroke="#0F172A"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
