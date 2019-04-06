import { LabeledGap } from "./labeled-gap";
import { Vertex, VisibilityResult } from "../model/vertex";
import { Robot } from "../model/robot";
import * as Anchoring from "./anchoring";
import { Geometry, IsPolygonEmptyState } from "../utils/geometry";
import { PrintDebug } from "../utils/debug";
import { GapTreeNode } from "../ds/gap-tree";
import { GapTreePairNode } from "../ds/gap-tree-pair";
import { GapPair } from "./gap-pairs";

export function CreateLabeledGaps(r: Robot, previousAnchor: Vertex): LabeledGap[] {
	const gaps: LabeledGap[] = [];
	r.findGaps(false);
	for (const g1 of r.gaps) {
		const possibleAnchors: Vertex[] = [];
		const verts = [previousAnchor.location, r.location, g1.location];
		// Special case of anchoring around the current gap
		// If I am standing at a gap and I can all the other things are setup right, I should consider anchoring around this gap
		const v = r.myVertex();
		if (v && v.name !== r.name) {
			if (Anchoring.CanAnchorFromVertices([previousAnchor, g1], v)) possibleAnchors.push(v);
		}

		// general case of looking for other possible anchors
		const result = Geometry.IsPolygonEmpty(verts);
		PrintDebug(result.innerPermissibleVerts);
		if (result.state === IsPolygonEmptyState.NotEmpty) continue;
		result.innerPermissibleVerts.forEach((p) => {
			if (Anchoring.CanAnchorFromVertices([previousAnchor, g1, r], p)) possibleAnchors.push(p);
		});
		if (result.state === IsPolygonEmptyState.OnlyPermissibleVerts && possibleAnchors.length === 0) continue;
		if (possibleAnchors.length > 0) {
			possibleAnchors.forEach((a) => {
				gaps.push(new LabeledGap(g1, r, a));
			});
		} else {
			gaps.push(new LabeledGap(g1, r, previousAnchor));
		}
	}
	return gaps;
}

export function MakeGapTreeNodes(r0Gaps: LabeledGap[], r1Gaps: LabeledGap[], parent: GapTreeNode): void {
	// Add the tree nodes for R0 under the R1 Parent and keep them
	// Then add the ones for R1
	for (const r0Gap of r0Gaps) {
		let gtn = parent.isChild(r0Gap);
		if (!gtn) {
			gtn = new GapTreeNode(r0Gap, r0Gap.anchor);
			if (!parent.addChild(gtn)) continue;
		}
		for (const r1Gap of r1Gaps) {
			gtn.addChild(new GapTreeNode(r1Gap, r1Gap.anchor));
		}
	}
}

/** When we add the child, we check for pops in there! */
export function MakeGapTreePairNodes(r0Gaps: LabeledGap[], r1Gaps: LabeledGap[], parent: GapTreePairNode): void {
	// Add the tree nodes for R0 under the R1 Parent and keep them
	// Then add the ones for R1
	for (const r0Gap of r0Gaps) {
		for (const r1Gap of r1Gaps) {
			parent.addChild(new GapTreePairNode(new GapPair(r0Gap, r1Gap)));
		}
	}
}
