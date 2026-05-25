import Image from "next/image";
import Link from "next/link";
import { MAIN_NAV } from "@/lib/navigation";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <Image
              src="/logo.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 object-contain dark:invert"
            />
            <div>
            <p className="font-semibold text-heading">Tank Identifier</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Browse and compare military armored vehicles from the Kaggle dataset.
            </p>
            </div>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted transition hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-6 border-t border-border pt-6 text-center text-xs text-subtle sm:text-left">
          Data:{" "}
          <a
            href="https://www.kaggle.com/datasets/antoreepjana/military-tanks-dataset-images"
            className="text-accent hover:text-accent-hover"
            target="_blank"
            rel="noopener noreferrer"
          >
            Military Tanks Dataset (Images)
          </a>
          {" · "}
          Specs are approximate reference values for comparison
        </p>
      </div>
    </footer>
  );
}
