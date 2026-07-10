interface SeniorModeIconProps {
  className?: string;
}

export function SeniorModeIcon({ className }: SeniorModeIconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7.5 8.5c-.8 1.2-1 2.4-.8 3.6" />
      <path d="M16.5 8.5c.8 1.2 1 2.4.8 3.6" />
      <path d="M8 7.5c1.2-1.4 2.8-2 4-2s2.8.6 4 2" />
      <circle cx="12" cy="12.5" r="4.25" />
      <circle cx="9.75" cy="12.5" r="1.65" />
      <circle cx="14.25" cy="12.5" r="1.65" />
      <path d="M11.4 12.5h1.2" />
      <path d="M8.5 19c1.6-1.8 5.4-1.8 7 0" />
    </svg>
  );
}
