import Model from "../model/model-service";
import { Geometry } from "../utils/geometry";
import { Vertex } from "../model/vertex";
import { Robot } from "../model/robot";
import { Edge } from "../model/edge";

/** use this to identify which gap belongs to which robot */
export interface GapString {
	gapNames: string[];
	robotNames: string[];
}

export class LabeledGap {
	constructor(public gap: Vertex, public robot: Robot) { }
	toString() {
		return `(${this.robot.name},${this.gap.name})`;
	}
}

export function GapPairExists(gapPairs: Set<string>, g1: LabeledGap, g2: LabeledGap): boolean {
	return gapPairs.has(MakeGapPairName(g1, g2)) || gapPairs.has(MakeGapPairName(g1, g2));
}

export function GetGapPairs(): Set<string> {
	const s: Set<string> = new Set();
	const processGapString = (gapString: LabeledGap[]) => {
		for(let i = 0; i < gapString.length; i++) {
			const g1 = gapString[i];
			let g2 = gapString[i];
			// go forward until you see a gap of the the other robot
			for(let j = i + 1; j < gapString.length; j++) {
				g1.gap.select();
				g2 = gapString[j];
				g2.gap.select();
				if (gapString[j].robot !== gapString[i].robot) break;
				g2.gap.deselect();
			}
			const verts = [g1.robot.location, g2.robot.location, g2.gap.location, g1.gap.location];
			// g1.robot.name !== g2.robot.name is there to prevent the end of the for loops
			if (
				g1.robot.name !== g2.robot.name &&
				!GapPairExists(s, g1, g2) &&
				g1.gap.isVisible(g2.gap) &&
				Geometry.IsPolygonEmpty(verts)
			) {
				s.add(MakeGapPairName(g1, g2));
			}
			g1.gap.deselect();
			g2.gap.deselect();
		}
	};
	MakeGapStrings().forEach(processGapString);
	return s;
}

function MakeGapStrings(): LabeledGap[][] {
	const r0 = Model.Instance.Robots[0];
	const r1 = Model.Instance.Robots[1];
	r0.findGaps();
	r1.findGaps();
	const r0String = MakeGapString(r0, r1);
	const r1String = MakeGapString(r1, r0);
	return [r0String, r1String];
}

function MakeGapString(main: Robot, other: Robot): LabeledGap[] {
	let edgeRef = new Edge(`${main.toString()}->${other.toString()}`, main, other);
	const all: LabeledGap[] = [];
	const addGap = (gap: Vertex, robot: Robot) => {
		all.push(new LabeledGap(gap, robot));
	};
	main.gaps.forEach((g) => { addGap(g, main); });
	other.gaps.filter((g) => main.isVisible(g)).forEach((g) => { addGap(g, other); })
	return all;
}

function MakeGapPairName(g1: LabeledGap, g2: LabeledGap) {
	// Do this so gap pair always begins with R0
	let t1: LabeledGap;
	let t2: LabeledGap;
	if (g1.robot.name < g2.robot.name) {
		t1 = g1;
		t2 = g2;
	} else {
		t1 = g2;
		t2 = g1;
	}
	return `${t1.toString()}-${t2.toString()}`;
}
