export type TankSpecs = {
  country: string;
  era: string;
  type: string;
  weight_t: number;
  length_m: number;
  width_m: number;
  height_m: number;
  crew: number;
  main_gun: string;
  secondary?: string;
  engine: string;
  power_hp: number;
  power_to_weight_hp_t: number;
  max_speed_kmh: number;
  range_km: number;
  armor: string;
};

export type Tank = {
  id: string;
  slug: string;
  name: string;
  images: string[];
  thumbnail: string;
  specs: TankSpecs;
};
