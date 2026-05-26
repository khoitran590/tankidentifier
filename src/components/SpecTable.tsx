import type { TankSpecs } from "@/types/tank";

const ROWS: { key: keyof TankSpecs; label: string; suffix?: string }[] = [
  { key: "country", label: "Country" },
  { key: "era", label: "Era" },
  { key: "type", label: "Classification" },
  { key: "weight_t", label: "Combat weight", suffix: " t" },
  { key: "length_m", label: "Length", suffix: " m" },
  { key: "width_m", label: "Width", suffix: " m" },
  { key: "height_m", label: "Height", suffix: " m" },
  { key: "crew", label: "Crew" },
  { key: "main_gun", label: "Main armament" },
  { key: "secondary", label: "Secondary weapons" },
  { key: "engine", label: "Engine" },
  { key: "power_hp", label: "Engine power", suffix: " hp" },
  { key: "power_to_weight_hp_t", label: "Power-to-weight", suffix: " hp/t" },
  { key: "max_speed_kmh", label: "Maximum speed", suffix: " km/h" },
  { key: "range_km", label: "Operational range", suffix: " km" },
  { key: "armor", label: "Armor" },
];

type Props = {
  specs: TankSpecs;
};

export function SpecTable({ specs }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-border dark:border-border-strong dark:shadow-sm">
      <table className="w-full text-sm">
        <tbody>
          {ROWS.map(({ key, label, suffix }) => {
            const value = specs[key];
            if (value === undefined || value === "") return null;
            const display =
              typeof value === "number" ? `${value}${suffix ?? ""}` : String(value);
            return (
              <tr key={key} className="border-b border-border last:border-0 dark:border-border-strong/80">
                <th className="w-2/5 bg-card-muted px-4 py-3 text-left font-medium text-muted dark:bg-card dark:text-stone-300">
                  {label}
                </th>
                <td className="bg-card/50 px-4 py-3 text-foreground dark:bg-card-muted/40">
                  {display}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
