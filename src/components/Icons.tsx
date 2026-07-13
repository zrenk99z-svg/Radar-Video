import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export const FilmIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
  </svg>
);

export const ComicIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 5a1 1 0 0 1 1-1h11l4 4v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    <path d="M16 4v4h4M8 12h8M8 16h5" />
  </svg>
);

export const GameIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 11h4M8 9v4M15 11h.01M18 13h.01" />
    <rect x="2" y="7" width="20" height="10" rx="5" />
  </svg>
);

export const HeroIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
    <path d="M9.5 11.5l2 2 3.5-4" />
  </svg>
);

export const RadarIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
    <path d="M12 12l6-4" />
  </svg>
);

export const FireIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 10 12 9 12 3z" />
    <path d="M12 21a5 5 0 0 0 5-5c0-3-2-4-3-6" />
  </svg>
);

export const SearchIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const SparkIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </svg>
);

export const BookmarkIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 4h12v16l-6-4-6 4z" />
  </svg>
);

export const TrashIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13" />
  </svg>
);

export const ArrowUpIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);

export const ArrowDownIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const GearIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
  </svg>
);

export const CalendarIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v3M16 3v3" />
  </svg>
);

export const UsersIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="8" r="3.5" />
    <path d="M22 20v-2a4 4 0 0 0-3-3.9M16 4.5a4 4 0 0 1 0 7" />
  </svg>
);

export const WandIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M15 4V2M15 10V8M12.5 6.5h-2M19.5 6.5h-2M5 21l10-10-2-2L3 19z" />
    <path d="M17.5 8.5 15 6" />
  </svg>
);

export const LongIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="m10 9 5 3-5 3z" />
  </svg>
);

export const ShortIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="7" y="3" width="10" height="18" rx="2" />
    <path d="m11 9 3 2-3 2z" />
  </svg>
);

export const LinkIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
    <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
  </svg>
);
