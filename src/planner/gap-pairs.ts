import Model from "../model/model-service";
import { Geometry } from "../utils/geometry";
import { Vertex } from "../model/vertex";
import { Robot } from "../model/robot";
import { GapTreeNode } from "../ds/gap-tree";

/** String is the key obtain by calling `MakeGapPairName()` or `GapPair.toString()` */
export type GapPairs = Map<string, GapPair>;

/** use this to identify which gap belongs to which robot */
export interface GapString {
	gapNames: string[];
	robotNames: string[];
}

/** I am das */
export class GapPair {
	public first: LabeledGap;
	public second: LabeledGap;
	constructor(g1: LabeledGap, g2: LabeledGap) {
		if (g1.robot.name < g2.robot.name) {
			this.first = g1;
			this.second = g2;
		} else {
			this.first = g2;
			this.second = g1;
		}
	}

	public toString(): string {
		return GapPairToString(this.first, this.second);
	}
}

/** This function is not safe to use as it assumes the correct ordering. Use `MakeGapPairName()` instead. */
function GapPairToString(first: LabeledGap, second: LabeledGap): string {
	return `${first.toString()}-${second.toString()}`;
}

export class LabeledGap {
	constructor(public gap: Vertex, public robot: Robot) { }

	public toString(): string {
		return `(${this.robot.name},${this.gap.name})`;
	}
}

export function GapPairExists(gapPairs: Map<string, GapPair>, g1: LabeledGap, g2: LabeledGap): boolean {
	return gapPairs.has(MakeGapPairName(g1, g2)) || gapPairs.has(MakeGapPairName(g1, g2));
}

export function GetGapPairs(): Map<string, GapPair> {
	const pairs: Map<string, GapPair> = new Map();
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
				!GapPairExists(pairs, g1, g2) &&
				g1.gap.isVisible(g2.gap) &&
				Geometry.IsPolygonEmpty(verts)
			) {
				const pair = new GapPair(g1, g2);
				pairs.set(pair.toString(), pair);
			}
			g1.gap.deselect();
			g2.gap.deselect();
		}
	};
	MakeGapStrings().forEach(processGapString);
	return pairs;
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
	const all: LabeledGap[] = [];
	const addGap = (gap: Vertex, robot: Robot) => {
		all.push(new LabeledGap(gap, robot));
	};
	main.gaps.forEach((g) => { addGap(g, main); });
	other.gaps.filter((g) => main.isVisible(g)).forEach((g) => { addGap(g, other); })
	return all;
}

/** This mimics `GapPair.toString()` */
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
	return GapPairToString(t1, t2);
}

export function MakeGapTreeNodes(gapPairs: GapPairs, parent: GapTreeNode): void {
	gapPairs.forEach((gapPair, key) => {
		const gtn = new GapTreeNode(gapPair.first);
		if (!parent.isChild(gapPair.first)) {
			parent.addChild(gtn);
		}
		gtn.addChild(new GapTreeNode(gapPair.second));
	});
}
