interface IconProps {
  className?: string;
  size?: number;
}

function svgProps(size: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };
}

export function ArrowRightIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowLeftIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)} className={className}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

export function ArrowUpRightIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)} className={className}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function SearchIcon({ className, size = 18 }: IconProps) {
  return (
    <svg {...svgProps(size)} className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}

export function MenuIcon({ className, size = 22 }: IconProps) {
  return (
    <svg {...svgProps(size)} className={className}>
      <path d="M4 8h16M4 16h16" />
    </svg>
  );
}

export function CloseIcon({ className, size = 22 }: IconProps) {
  return (
    <svg {...svgProps(size)} className={className}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function LinkIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)} className={className}>
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
    </svg>
  );
}

/** Ícones das trilhas, desenhados no mesmo traço fino dos demais. */
export function TrackIcon({ slug, className, size = 28 }: IconProps & { slug: string }) {
  const props = { ...svgProps(size), strokeWidth: 1.25 };
  switch (slug) {
    case "analise-de-dados":
      return (
        <svg {...props} className={className}>
          <path d="M5 20V12M10 20V6M15 20v-9M20 20V9M3 20h18" />
        </svg>
      );
    case "ciencia-de-dados":
      return (
        <svg {...props} className={className}>
          {[5, 12, 19].flatMap((x) =>
            [5, 12, 19].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={x === 12 && y === 12 ? 1.8 : 1} />),
          )}
        </svg>
      );
    case "engenharia-de-dados":
      return (
        <svg {...props} className={className}>
          <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" />
          <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
        </svg>
      );
    case "business-intelligence":
      return (
        <svg {...props} className={className}>
          <rect x="3.5" y="4" width="17" height="16" rx="1" />
          <path d="M3.5 9h17M9 9v11M12 16l2.5-3 2.5 2" />
        </svg>
      );
    case "machine-learning":
      return (
        <svg {...props} className={className}>
          <circle cx="5" cy="7" r="1.5" />
          <circle cx="5" cy="17" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="19" cy="7" r="1.5" />
          <circle cx="19" cy="17" r="1.5" />
          <path d="m6.3 7.8 4.4 3.4M6.3 16.2l4.4-3.4M13.3 11.2l4.4-3.4M13.3 12.8l4.4 3.4" />
        </svg>
      );
    case "sql":
      return (
        <svg {...props} className={className}>
          <ellipse cx="12" cy="6" rx="7" ry="2.5" />
          <path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
        </svg>
      );
    default:
      return (
        <svg {...props} className={className}>
          <path d="M3 17c3-6 5-6 7-3s4 3 7-4l4 3" />
          <circle cx="3" cy="17" r="0.5" />
        </svg>
      );
  }
}
