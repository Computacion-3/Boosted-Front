export type LikeButtonProps = {
  liked: boolean;
  label: string;
  disabled?: boolean;
  onToggle: () => void;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="size-5 shrink-0"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      fill={filled ? "currentColor" : "none"}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

export function LikeButton({ liked, label, disabled, onToggle }: LikeButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn-ghost btn-sm shrink-0 touch-manipulation gap-2 whitespace-nowrap rounded-full ${
        liked ? "text-primary" : "text-base-content/70"
      }${disabled ? " opacity-60" : ""}`}
      aria-pressed={liked}
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (!disabled) onToggle();
      }}
    >
      <HeartIcon filled={liked} />
      <span className="tabular-nums text-sm">{label}</span>
    </button>
  );
}
