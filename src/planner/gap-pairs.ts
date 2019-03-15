import Model from "../model/model-service";
import { Geometry, IsPolygonEmptyState } from "../utils/geometry";
import { Vertex, VisibilityResult } from "../model/vertex";
import { Robot } from "../model/robot";
import { GapTreeNode } from "../ds/gap-tree";
import { PrintDebug, DEBUG_LEVEL } from "../utils/debug";
import { CanAnchorFromGapPair as CanAnchorFromVertexPair } from "./anchoring";

/** String is the key obtain by calling `MakeGapPairName()` or `GapPair.toString()` */
export type GapPairs = Map<string, GapPair>;

/** use this to identify which gap belongs to which robot */
export interface GapString {
	gapNames: string[];
	robotNames: string[];
}

export class GapPair {
	public first: LabeledGap;
	public second: LabeledGap;
	constructor(g1: LabeledGap, g2: LabeledGap, public anchor?: Vertex) {
		if (g1.robot.name < g2.robot.name) {
			this.first = g1;
			this.second = g2;
		} else {
			this.first = g2;
			this.second = g1;
		}
	}

	public toString(): string {
		return GapPairToString(this.first, this.second, this.anchor);
	}
}

/** This function is not safe to use as it assumes the correct ordering. Use `MakeGapPairName()` instead. */
function GapPairToString(first: LabeledGap, second: LabeledGap, anchor?: Vertex): string {
	const anchorStr = anchor ? `x${anchor.toString()}` : "";
	return `${first.toString()}-${second.toString()}${anchorStr}`;
}

export class LabeledGap {
	constructor(public gap: Vertex, public robot: Robot) { }

	public eq(other: LabeledGap): boolean {
		// we don't need to check the robots because first always belongs to R0 and second to R1
		if (this.gap.name !== other.gap.name) return false;
		if (this.gap.name !== other.gap.name) return false;
		return true;
	}

	public toString(): string {
		return `(${this.robot.name},${this.gap.name})`;
	}
}

export function GapPairExists(gapPairs: Map<string, GapPair>, g1: LabeledGap, g2: LabeledGap): boolean {
	return gapPairs.has(MakeGapPairName(g1, g2)) || gapPairs.has(MakeGapPairName(g1, g2));
}

/** This implementation is more similar to the gap Matrix */
export function GetGapPairs(): Map<string, GapPair> {
	const pairs: Map<string, GapPair> = new Map();
	const r0 = Model.Instance.Robots[0];
	const r1 = Model.Instance.Robots[1];

	for (const g1 of r0.gaps) {
		for (const g2 of r1.gaps) {
			const l1 = new LabeledGap(g1, r0);
			const l2 = new LabeledGap(g2, r1);
			if (GapPairExists(pairs, l1, l2)) continue;
			const possibleAnchors: Vertex[] = [];
			const visResult: VisibilityResult[] = [];
			// TODO: What if the gap is farther than cable length?
			if (!g1.isVisible(g2, visResult)) {
				for (const vis of visResult) {
					vis.edges.forEach((ps) => {
						// Both gaps as well both robots should be able to see the anchor if they want to anchor around it
						if (CanAnchorFromVertexPair(g1, g2, ps.v1) && CanAnchorFromVertexPair(r0, r1, ps.v1)) possibleAnchors.push(ps.v1);
						if (CanAnchorFromVertexPair(g1, g2, ps.v2) && CanAnchorFromVertexPair(r0, r1, ps.v2)) possibleAnchors.push(ps.v2);
					});
				}
				// If the gaps can't see each other AND there are no possible anchors, then they are not compatible
				if (possibleAnchors.length === 0) continue;
			}
			const verts = [r0.location, g1.location, g2.location, r1.location];
			const innerVerts: Vertex[] = [];
			const result = Geometry.IsPolygonEmpty(verts, innerVerts);
			PrintDebug(innerVerts);
			if (result.state === IsPolygonEmptyState.NotEmpty) continue;
			innerVerts.forEach((p) => {
				if (CanAnchorFromVertexPair(g1, g2, p) && CanAnchorFromVertexPair(r0, r1, p)) possibleAnchors.push(p);
			});
			if (result.state === IsPolygonEmptyState.OnlyPermissibleVerts && possibleAnchors.length === 0) continue;
			if (possibleAnchors.length > 0) {
				possibleAnchors.forEach((a) => {
					const pair = new GapPair(l1, l2, a);
					pairs.set(pair.toString(), pair);
				});
			} else {
				const pair = new GapPair(l1, l2);
				pairs.set(pair.toString(), pair);
			}
		}
	}
	return pairs;
}

// FIXME: Buggy --> This method is incorrect, for the time being we use a O(n^2) solution
/*
export function _GetGapPairs(): Map<string, GapPair> {
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
*/

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
	// we are both staying then we shouldn't only one of us at a time should wait
	gapPairs.forEach((gapPair) => {
		// So here is the tricky part, when we are adding the Tree Nodes we are in R1
		// So parent.parent is R0 and is associated with first
		// This if is here so both robot don't stay at the same location forever because that has the lowest cost+H
		if (gapPair.first.eq(parent.parent!.val) && gapPair.second.eq(parent.val)) return;

		let gtn = parent.isChild(gapPair.first);
		if (!gtn) {
			gtn = new GapTreeNode(gapPair.first, gapPair.anchor);
			if (!parent.addChild(gtn)) return;
		}
		gtn.addChild(new GapTreeNode(gapPair.second, gapPair.anchor));
	});
}
