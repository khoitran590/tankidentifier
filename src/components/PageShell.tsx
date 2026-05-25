import { Breadcrumbs, type BreadcrumbItem } from "@/components/Breadcrumbs";

type Props = {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function PageShell({
  breadcrumbs,
  title,
  description,
  actions,
  children,
  className = "",
}: Props) {
  return (
    <div className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 ${className}`.trim()}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-base leading-relaxed text-muted sm:mt-3 sm:text-lg">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  );
}
