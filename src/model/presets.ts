interface Preset {
	name: string;
	json: string;
}

export const PresetUnset: Preset = {
	name: "Unset",
	json: '{"robots":["0, 0","0, 0"],"destinations":["0, 0","0, 0"],"obstacles":[],"cableLength":0}',
}

export const Preset1: Preset = {
	name: "Preset 1",
	json: '{"robots":["100, 50","500, 50"],"destinations":["150, 500", "330, 520"], "obstacles":[["175, 100","225, 100","225, 150","175, 150"],["300, 200","425, 200","300, 225","425, 225"],["50, 300","50, 350","250, 300","250, 350"],["325, 400","350, 400","325, 425","350, 425"],["425, 410","400, 435","450, 435"]],"cableLength":500}',
}

export const AllPresets = [PresetUnset, Preset1];