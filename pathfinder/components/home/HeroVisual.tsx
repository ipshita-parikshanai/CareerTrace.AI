'use client';

/**
 * Hero visual: a single self-contained SVG that draws the "career trace" idea.
 *
 * Why all-SVG (no CSS-positioned overlays): in the previous version the nodes
 * lived in HTML (positioned with %), the curve lived in <svg> (positioned with
 * absolute viewBox coords). When the container aspect-ratio shifted across
 * screen sizes the two layers drifted apart and the path stopped passing
 * through the nodes. With a single fixed-viewBox SVG everything is locked to
 * the same coordinate system, so the main path mathematically passes through
 * the stepping stones, the You node, and the Goal node.
 */
export function HeroVisual() {
  // Geometry — chosen so the cubic bezier visibly threads each stone.
  // Main path: M 75 245 C 225 245, 325 175, 460 175 S 660 105, 725 95
  // Stones below were computed at t=0.25/0.5/0.75 along each cubic segment.
  const stones: { cx: number; cy: number }[] = [
    { cx: 179, cy: 234 },
    { cx: 364, cy: 186 },
    { cx: 549, cy: 164 },
    { cx: 675, cy: 112 },
  ];

  return (
    <div className="relative mx-auto aspect-[20/9] w-full max-w-3xl" aria-hidden>
      <svg
        viewBox="0 0 800 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="hv-main" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="55%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="hv-alt" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="hv-goalGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hv-startGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </radialGradient>
          <filter id="hv-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="2" result="off" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.18" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Two faded alternative paths — same start & end as the main path,
            different control points to suggest "other people's journeys". */}
        <path
          d="M 75 245 C 220 130, 400 280, 540 200 S 700 80, 725 95"
          stroke="url(#hv-alt)"
          strokeWidth="2"
          strokeDasharray="5 8"
          fill="none"
          className="motion-safe:animate-[dash_30s_linear_infinite]"
        />
        <path
          d="M 75 245 C 230 290, 410 290, 540 230 S 700 140, 725 95"
          stroke="url(#hv-alt)"
          strokeWidth="2"
          strokeDasharray="3 9"
          fill="none"
          className="motion-safe:animate-[dash_38s_linear_infinite_reverse]"
        />

        {/* Main career path — passes exactly through You (75,245),
            through the stepping stones below, and into Goal (725,95). */}
        <path
          d="M 75 245 C 225 245, 325 175, 460 175 S 660 105, 725 95"
          stroke="url(#hv-main)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Stepping-stone nodes laid out ON the main path */}
        {stones.map((s, i) => (
          <g key={i}>
            <circle cx={s.cx} cy={s.cy} r="9" fill="white" stroke="#0d9488" strokeWidth="2.5" />
            <circle cx={s.cx} cy={s.cy} r="3" fill="#0d9488" />
          </g>
        ))}

        {/* Goal halo */}
        <circle cx="725" cy="95" r="56" fill="url(#hv-goalGlow)" />
        {/* Start halo */}
        <circle cx="75" cy="245" r="48" fill="url(#hv-startGlow)" />

        {/* ── Floating mini-card #1: real person ──
            Placed just above the second stepping stone so it visibly belongs
            to the main path. */}
        <g transform="translate(220 70)" filter="url(#hv-shadow)">
          <rect
            x="0"
            y="0"
            width="200"
            height="46"
            rx="12"
            fill="white"
            stroke="#e2e8f0"
          />
          <circle cx="22" cy="23" r="13" fill="#0284c7" />
          <text
            x="22"
            y="27"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="white"
            fontFamily="Inter, ui-sans-serif, system-ui"
          >
            AS
          </text>
          <text
            x="44"
            y="20"
            fontSize="12"
            fontWeight="700"
            fill="#0f172a"
            fontFamily="Inter, ui-sans-serif, system-ui"
          >
            87% path match
          </text>
          <text
            x="44"
            y="34"
            fontSize="10"
            fill="#64748b"
            fontFamily="Inter, ui-sans-serif, system-ui"
          >
            Anya · Stripe
          </text>
        </g>
        {/* leader line from card #1 to its anchor stone */}
        <line
          x1="320"
          y1="116"
          x2={stones[1].cx}
          y2={stones[1].cy}
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        {/* ── Floating mini-card #2: affinity ──
            Sits below the curve mid-section to balance composition. */}
        <g transform="translate(420 270)" filter="url(#hv-shadow)">
          <rect
            x="0"
            y="0"
            width="220"
            height="46"
            rx="12"
            fill="#fffbeb"
            stroke="#fde68a"
          />
          <circle cx="22" cy="23" r="11" fill="#f59e0b" />
          <text
            x="22"
            y="27"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="white"
            fontFamily="Inter, ui-sans-serif, system-ui"
          >
            ✦
          </text>
          <text
            x="42"
            y="20"
            fontSize="12"
            fontWeight="700"
            fill="#78350f"
            fontFamily="Inter, ui-sans-serif, system-ui"
          >
            64% affinity
          </text>
          <text
            x="42"
            y="34"
            fontSize="10"
            fill="#92400e"
            fontFamily="Inter, ui-sans-serif, system-ui"
          >
            Same school · same employer
          </text>
        </g>
        {/* leader line from card #2 to its anchor stone */}
        <line
          x1="530"
          y1="270"
          x2={stones[2].cx}
          y2={stones[2].cy}
          stroke="#fbbf24"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        {/* ── You node ── */}
        <g transform="translate(75 245)">
          <circle r="28" fill="white" />
          <circle r="26" fill="url(#hv-main)" />
          {/* Simple graduation-cap glyph */}
          <g transform="translate(-12 -10)" fill="white">
            <polygon points="12,0 24,6 12,12 0,6" />
            <rect x="6" y="10" width="12" height="6" rx="1" />
            <rect x="22" y="6" width="2" height="8" />
          </g>
          <rect
            x="-32"
            y="32"
            width="64"
            height="20"
            rx="10"
            fill="white"
            stroke="#99f6e4"
          />
          <text
            x="0"
            y="46"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="#115e59"
            fontFamily="Inter, ui-sans-serif, system-ui"
          >
            You today
          </text>
        </g>

        {/* ── Goal node ── */}
        <g transform="translate(725 95)" filter="url(#hv-shadow)">
          <circle r="32" fill="white" />
          <circle
            r="30"
            fill="#f97316"
            stroke="white"
            strokeWidth="3"
          />
          {/* Target glyph (concentric circles + bullseye) */}
          <circle r="14" fill="none" stroke="white" strokeWidth="2.5" />
          <circle r="7" fill="none" stroke="white" strokeWidth="2" />
          <circle r="2.5" fill="white" />
          <rect
            x="-32"
            y="-58"
            width="64"
            height="20"
            rx="10"
            fill="#fef3c7"
            stroke="#fcd34d"
          />
          <text
            x="0"
            y="-44"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="#78350f"
            fontFamily="Inter, ui-sans-serif, system-ui"
          >
            Your goal
          </text>
        </g>
      </svg>
    </div>
  );
}
