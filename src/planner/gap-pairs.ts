import Model from "../model/model-service";
import { Geometry, IsPolygonEmptyState } from "../utils/geometry";
import { Vertex, VisibilityResult } from "../model/vertex";
import { GapTreeNode } from "../ds/gap-tree";
import { PrintDebug } from "../utils/debug";
import { CanAnchorFromVertices as CanAnchorFromVertices } from "./anchoring";
import { LabeledGap } from "./labeled-gap";
import { GapTreePairNode } from "../ds/gap-tree-pair";

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

export function GapPairExists(gapPairs: Map<string, GapPair>, g1: LabeledGap, g2: LabeledGap): boolean {
	return gapPairs.has(MakeGapPairName(g1, g2)) || gapPairs.has(MakeGapPairName(g1, g2));
}

/** This implementation is more similar to the gap Matrix */
export function GetGapPairs(): Map<string, GapPair> {
	const pairs: Map<string, GapPair> = new Map();
	const r0 = Model.Instance.Robots[0];
	const r1 = Model.Instance.Robots[1];
	r0.findGaps(true);
	r1.findGaps(true);

	for (const g1 of r0.gaps) {
		for (const g2 of r1.gaps) {
			// FIXME: THIS CASE IS DEFINITELY BUGGY
			let l1 = new LabeledGap(g1, r0, undefined);
			let l2 = new LabeledGap(g2, r1, undefined);
			// if (GapPairExists(pairs, l1, l2)) continue;

			const possibleAnchors: Vertex[] = [];
			// const visResult: VisibilityResult[] = [];
			// // TODO: What if the gap is farther than cable length?
			// if (!g1.isVisible(g2, visResult)) {
			// 	for (const vis of visResult) {
			// 		vis.edges.forEach((ps) => {
			// 			// Both gaps as well both robots should be able to see the anchor if they want to anchor around it
			// 			if (CanAnchorFromVertices([g1, g2, r0, r1], ps.v1)) possibleAnchors.push(ps.v1);
			// 			if (CanAnchorFromVertices([g1, g2, r0, r1], ps.v2)) possibleAnchors.push(ps.v2);
			// 		});
			// 	}
			// 	// If the gaps can't see each other AND there are no possible anchors, then they are not compatible
			// 	if (possibleAnchors.length === 0) continue;
			// }
			const verts = [r0.location, g1.location, g2.location, r1.location];
			const result = Geometry.IsPolygonEmpty(verts);
			PrintDebug(result.innerPermissibleVerts);
			if (result.state === IsPolygonEmptyState.NotEmpty) continue;
			result.innerPermissibleVerts.forEach((p) => {
				// if (CanAnchorFromVertexPair(g1, g2, p) && CanAnchorFromVertexPair(r0, r1, p)) possibleAnchors.push(p);
				if (CanAnchorFromVertices([g1, g2, r0, r1], p)) {
					// Anchor the current gaps to the anchor and next time it will be single gap problem
					possibleAnchors.push(p);
					let tmpV: Vertex | undefined;
					tmpV = Model.Instance.getVertexByLocation(r0.location);
					if (tmpV) {
						l1 = new LabeledGap(tmpV, r0, p);
					}
					tmpV = Model.Instance.getVertexByLocation(r1.location);
					if (tmpV) {
						l2 = new LabeledGap(tmpV, r1, p);
					}
				}
			});
			if (result.state === IsPolygonEmptyState.OnlyPermissibleVerts && possibleAnchors.length === 0) continue;
			if (possibleAnchors.length > 0) {
				possibleAnchors.forEach((a) => {
					const pair = new GapPair(l1, l2);
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
			gtn = new GapTreeNode(gapPair.first, gapPair.first.anchor);
			if (!parent.addChild(gtn)) return;
		}
		gtn.addChild(new GapTreeNode(gapPair.second, gapPair.second.anchor));
	});
}

export function MakeGapTreePairNodes(gapPairs: GapPairs, parent: GapTreePairNode): void {
	// we are both staying then we shouldn't only one of us at a time should wait
	gapPairs.forEach((gapPair) => {
		// So here is the tricky part, when we are adding the Tree Nodes we are in R1
		// So parent.parent is R0 and is associated with first
		// This if is here so both robot don't stay at the same location forever because that has the lowest cost+H
		if (gapPair.first.eq(parent.val.first) && gapPair.second.eq(parent.val.second)) return;

		parent.addChild(new GapTreePairNode(gapPair));
	});
}
