import Image from "next/image";
import Link from "next/link";

type Props = {
  showText?: boolean;
  size?: "sm" | "md";
};

const sizes = {
  sm: { box: 36, img: 32 },
  md: { box: 40, img: 36 },
};

export function Logo({ showText = true, size = "md" }: Props) {
  const { box, img } = sizes[size];

  return (
    <Link
      href="/"
      aria-label="Tank Identifier — home"
      className="group flex min-w-0 items-center gap-3"
    >
      <span
        className="flex shrink-0 items-center justify-center rounded-lg bg-card-muted ring-1 ring-border"
        style={{ width: box, height: box }}
      >
        <Image
          src="/logo.png"
          alt=""
          aria-hidden
          width={img}
          height={img}
          className="object-contain dark:invert"
          priority
        />
      </span>
      {showText && (
        <div className="min-w-0 hidden sm:block">
          <p className="truncate text-sm font-semibold tracking-wide text-heading group-hover:text-accent">
            Tank Identifier
          </p>
          <p className="truncate text-xs text-muted">Military armor catalog</p>
        </div>
      )}
    </Link>
  );
}
