"use client";

import type { TankSpecs } from "@/types/tank";

type Props = {
  specs: TankSpecs;
  onChange: (specs: TankSpecs) => void;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  );
}

export function TankSpecsFields({ specs, onChange }: Props) {
  function set<K extends keyof TankSpecs>(key: K, value: TankSpecs[K]) {
    onChange({ ...specs, [key]: value });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-heading">General</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Country">
            <input
              className={inputClass}
              value={specs.country}
              onChange={(e) => set("country", e.target.value)}
              required
            />
          </Field>
          <Field label="Era">
            <input
              className={inputClass}
              value={specs.era}
              onChange={(e) => set("era", e.target.value)}
              required
            />
          </Field>
          <Field label="Type / classification">
            <input
              className={inputClass}
              value={specs.type}
              onChange={(e) => set("type", e.target.value)}
              required
            />
          </Field>
          <Field label="Crew">
            <input
              type="number"
              min={1}
              className={inputClass}
              value={specs.crew || ""}
              onChange={(e) => set("crew", Number(e.target.value))}
              required
            />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-heading">Dimensions</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Weight (t)">
            <input
              type="number"
              step="0.1"
              min={0}
              className={inputClass}
              value={specs.weight_t || ""}
              onChange={(e) => set("weight_t", Number(e.target.value))}
              required
            />
          </Field>
          <Field label="Length (m)">
            <input
              type="number"
              step="0.1"
              min={0}
              className={inputClass}
              value={specs.length_m || ""}
              onChange={(e) => set("length_m", Number(e.target.value))}
              required
            />
          </Field>
          <Field label="Width (m)">
            <input
              type="number"
              step="0.1"
              min={0}
              className={inputClass}
              value={specs.width_m || ""}
              onChange={(e) => set("width_m", Number(e.target.value))}
              required
            />
          </Field>
          <Field label="Height (m)">
            <input
              type="number"
              step="0.1"
              min={0}
              className={inputClass}
              value={specs.height_m || ""}
              onChange={(e) => set("height_m", Number(e.target.value))}
              required
            />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-heading">Performance</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Engine">
            <input
              className={inputClass}
              value={specs.engine}
              onChange={(e) => set("engine", e.target.value)}
              required
            />
          </Field>
          <Field label="Power (hp)">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={specs.power_hp || ""}
              onChange={(e) => set("power_hp", Number(e.target.value))}
              required
            />
          </Field>
          <Field label="Power/weight (hp/t)">
            <input
              type="number"
              step="0.1"
              min={0}
              className={inputClass}
              value={specs.power_to_weight_hp_t || ""}
              onChange={(e) => set("power_to_weight_hp_t", Number(e.target.value))}
              placeholder="Auto-calculated if empty"
            />
          </Field>
          <Field label="Max speed (km/h)">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={specs.max_speed_kmh || ""}
              onChange={(e) => set("max_speed_kmh", Number(e.target.value))}
              required
            />
          </Field>
          <Field label="Range (km)">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={specs.range_km || ""}
              onChange={(e) => set("range_km", Number(e.target.value))}
              required
            />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-heading">Armament & protection</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Main armament">
            <input
              className={inputClass}
              value={specs.main_gun}
              onChange={(e) => set("main_gun", e.target.value)}
              required
            />
          </Field>
          <Field label="Secondary weapons">
            <input
              className={inputClass}
              value={specs.secondary ?? ""}
              onChange={(e) => set("secondary", e.target.value)}
            />
          </Field>
          <Field label="Armor">
            <input
              className={inputClass}
              value={specs.armor}
              onChange={(e) => set("armor", e.target.value)}
              required
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
