import type { VehicleCategory, VehicleSpecs } from "@/types/vehicle";

const ROWS: {
  key: keyof VehicleSpecs;
  label: string;
  labelAircraft?: string;
  suffix?: string;
}[] = [
  { key: "country", label: "Country" },
  { key: "era", label: "Era" },
  { key: "type", label: "Classification", labelAircraft: "Role" },
  {
    key: "weight_t",
    label: "Combat weight",
    labelAircraft: "Empty weight",
    suffix: " t",
  },
  { key: "length_m", label: "Length", suffix: " m" },
  {
    key: "width_m",
    label: "Width",
    labelAircraft: "Wingspan",
    suffix: " m",
  },
  { key: "height_m", label: "Height", suffix: " m" },
  { key: "crew", label: "Crew" },
  {
    key: "main_gun",
    label: "Main armament",
    labelAircraft: "Weapons",
  },
  {
    key: "secondary",
    label: "Secondary weapons",
    labelAircraft: "Other stores",
  },
  { key: "engine", label: "Engine" },
  {
    key: "power_hp",
    label: "Engine power",
    labelAircraft: "Thrust (approx.)",
    suffix: " hp",
  },
  {
    key: "power_to_weight_hp_t",
    label: "Power-to-weight",
    labelAircraft: "Thrust/weight",
    suffix: " hp/t",
  },
  { key: "max_speed_kmh", label: "Maximum speed", suffix: " km/h" },
  {
    key: "range_km",
    label: "Operational range",
    labelAircraft: "Combat radius / range",
    suffix: " km",
  },
  {
    key: "armor",
    label: "Armor",
    labelAircraft: "Protection",
  },
];

type Props = {
  specs: VehicleSpecs;
  category?: VehicleCategory;
};

export function SpecTable({ specs, category = "tanks" }: Props) {
  const isAircraft = category === "aircraft";

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <tbody>
          {ROWS.map(({ key, label, labelAircraft, suffix }) => {
            const value = specs[key];
            if (value === undefined || value === "") return null;
            const rowLabel = isAircraft && labelAircraft ? labelAircraft : label;
            const display =
              typeof value === "number" ? `${value}${suffix ?? ""}` : String(value);
            return (
              <tr key={key} className="border-b border-border last:border-0">
                <th className="w-2/5 bg-card-muted px-4 py-3 text-left font-medium text-muted">
                  {rowLabel}
                </th>
                <td className="px-4 py-3 text-foreground">{display}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
