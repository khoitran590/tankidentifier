export default function TankDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6">
      <div className="mb-6 h-4 w-48 rounded bg-card-muted" />
      <div className="mb-8 h-10 w-2/3 max-w-lg rounded-lg bg-card-muted" />
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="aspect-[4/3] rounded-xl bg-card-muted" />
          <div className="aspect-[4/3] rounded-xl bg-card-muted" />
        </div>
        <div className="space-y-3 rounded-xl border border-border p-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-card-muted/80" />
          ))}
        </div>
      </div>
    </div>
  );
}
