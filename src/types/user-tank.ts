import type { TankSpecs } from "@/types/tank";

export type UserTank = {
  id: string;
  slug: string;
  name: string;
  images: string[];
  thumbnail: string;
  specs: TankSpecs;
  ownerId: string;
};

export type UserTankFormSpecs = TankSpecs;

export const EMPTY_TANK_SPECS: UserTankFormSpecs = {
  country: "",
  era: "Modern",
  type: "Main Battle Tank",
  weight_t: 0,
  length_m: 0,
  width_m: 0,
  height_m: 0,
  crew: 4,
  main_gun: "",
  secondary: "",
  engine: "",
  power_hp: 0,
  power_to_weight_hp_t: 0,
  max_speed_kmh: 0,
  range_km: 0,
  armor: "",
};
