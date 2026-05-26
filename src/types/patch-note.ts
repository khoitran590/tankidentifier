export type TankAddition = {
  name: string;
  slug?: string;
  country?: string;
  note?: string;
};

export type SpecUpdate = {
  tankName: string;
  slug?: string;
  change: string;
};

export type PatchNote = {
  id: string;
  title: string;
  version: string;
  summary: string;
  newTanks: TankAddition[];
  specUpdates: SpecUpdate[];
  publishedAt: string;
};

export const EMPTY_PATCH_NOTE = {
  title: "",
  version: "",
  summary: "",
  newTanks: [] as TankAddition[],
  specUpdates: [] as SpecUpdate[],
};
