import type { ReactNode } from "react";

type IconName =
  | "bolt"
  | "brain"
  | "calendar"
  | "chat"
  | "check"
  | "chevron"
  | "clock"
  | "compass"
  | "map"
  | "search"
  | "spark"
  | "target"
  | "users";

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

export function Icon({ name, size = 20, className }: IconProps) {
  const paths: Record<IconName, ReactNode> = {
    bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
    brain: (
      <>
        <path d="M8.5 14.5A3.5 3.5 0 0 1 5 11V8a3 3 0 0 1 3-3 3 3 0 0 1 6 0 3 3 0 0 1 3 3v3a3.5 3.5 0 0 1-3.5 3.5" />
        <path d="M8.5 14.5V22" />
        <path d="M13.5 14.5V22" />
        <path d="M8 9h8" />
        <path d="M9 5.5V9" />
        <path d="M15 5.5V9" />
      </>
    ),
    calendar: (
      <>
        <path d="M7 3v4" />
        <path d="M17 3v4" />
        <path d="M4 8h16" />
        <path d="M5 5h14a1 1 0 0 1 1 1v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1Z" />
      </>
    ),
    chat: (
      <>
        <path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v4A3.5 3.5 0 0 1 15.5 14H11l-5 4v-4.2A3.5 3.5 0 0 1 5 6.5Z" />
        <path d="M8 7h8" />
        <path d="M8 10h5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 6 6 6-6 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    compass: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2.2 5-4.8 2 2.2-5 4.8-2Z" />
      </>
    ),
    map: (
      <>
        <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
        <path d="M9 3v15" />
        <path d="M15 6v15" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 4 4" />
      </>
    ),
    spark: (
      <>
        <path d="M12 2v6" />
        <path d="M12 16v6" />
        <path d="M2 12h6" />
        <path d="M16 12h6" />
        <path d="m5 5 4 4" />
        <path d="m15 15 4 4" />
        <path d="m19 5-4 4" />
        <path d="m9 15-4 4" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" />
      </>
    ),
    users: (
      <>
        <path d="M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-5A3.5 3.5 0 0 0 4 18.5V20" />
        <circle cx="10" cy="8" r="4" />
        <path d="M20 20v-1a3 3 0 0 0-2.2-2.9" />
        <path d="M16.5 4.4a4 4 0 0 1 0 7.2" />
      </>
    )
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  );
}
