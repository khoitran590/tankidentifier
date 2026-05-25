export default function Loading() {
  return (
    <div className="catalog-page-wrap mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6">
      <div className="mb-6 h-10 w-2/3 max-w-md rounded-lg bg-card-muted" />
      <div className="mb-6 h-5 w-full max-w-lg rounded bg-card-muted" />
      <div className="mb-8 flex gap-2">
        <div className="h-12 flex-1 rounded-xl bg-card-muted" />
        <div className="h-12 w-24 rounded-xl bg-card-muted" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="aspect-[4/3] bg-card-muted" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 rounded bg-card-muted" />
              <div className="h-3 w-1/2 rounded bg-card-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
