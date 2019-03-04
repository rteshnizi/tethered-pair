interface Preset {
	name: string;
	json: string;
}

export const PresetUnset: Preset = {
	name: "Unset",
	json: '{"robots":["0, 0","0, 0"],"obstacles":[],"cableLength":0}',
}

export const Preset1: Preset = {
	name: "Preset 1",
	json: '{"robots":["100, 50","500, 50"],"obstacles":[["200, 100","250, 100","250, 150","200, 150"],["300, 200","425, 200","300, 225","425, 225"],["50, 300","50, 350","250, 300","250, 350"],["300, 400","325, 400","300, 425","325, 425"],["425, 400","400, 425","450, 425"]],"cableLength":500}',
}

export const AllPresets = [PresetUnset, Preset1];