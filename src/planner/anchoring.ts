import { Vertex, VisibilityResult } from "../model/vertex";
import { Geometry, IsPolygonEmptyState, Fabric2Pts } from "../utils/geometry";
import * as FabricUtils from "../utils/fabric";
import { GapTreePairNode } from "../ds/gap-tree-pair";

/**
 * Whether both gaps and the robot can see the target anchor
 * @param verts
 * @param target The vertex we are checking for possible anchoring
 */
export function CanAnchorFromVertices(verts: Vertex[], target: Vertex): boolean {
	// fast check
	// If the target is not a global anchor then we should not use it for planning anyway
	if (!target.isGlobalAnchor) return false;
	// slow check
	for (const v of verts) {
		if (!isAbsolutelyVisible(v, target)) return false;
	}
	return true;
}

/**
 * Whether both gaps and the robot can see the target anchor
 * @param verts
 * @param possibleAnchor The vertex we are checking for possible anchoring
 */
export function CanAnchorFromVerticesSingle(prevAnchor: Vertex, src: Vertex, dst: Vertex, possibleAnchor: Vertex): boolean {
	// fast check
	// If the target is not a global anchor then we should not use it for planning anyway
	if (!possibleAnchor.isGlobalAnchor) return false;
	const verts = [prevAnchor, src, dst, possibleAnchor];
	// slow check
	for (const v of verts) {
		if (!isAbsolutelyVisible(v, possibleAnchor)) return false;
	}
	const result = Geometry.IsPolygonEmpty(FabricUtils.GetFabricPointsFromVertexArray(verts));
	if (result.state !== IsPolygonEmptyState.Empty) return false;
	return true;
}

export function ShouldPop(v1: Vertex, anchorToPop: Vertex, v2: Vertex): boolean {
	const result = Geometry.IsPolygonEmpty(FabricUtils.GetFabricPointsFromVertexArray([v1, v2, anchorToPop]));
	if (result.state !== IsPolygonEmptyState.Empty) return false;
	return isAbsolutelyVisible(v1, v2);
}

export function PopAsNeeded(node: GapTreePairNode, parent: GapTreePairNode, isFirst: boolean): Set<string> | undefined {
	const targetGap = isFirst ? node.val.first : node.val.second;
	// TODO: If threw exception, add if statement
	const originGap = isFirst ? parent.val.first : parent.val.second;
	if (node.cableVerts.length === 1) {
		// DON"T KNOW HOW TO HANDLE THIS YET
		return;
	} else {
		const myMove = Fabric2Pts.LineFromPoints(originGap.gap.location, targetGap.gap.location);
		let ind = 0;
		let step = +1;
		if (isFirst) {
			step = +1;
			ind = 0;
		} else {
			step = -1;
			ind = node.cableVerts.length - 1;
		}
		const popped: Set<string> = new Set();
		while (ind + step < node.cableVerts.length && ind + step >= 0 && ind < node.cableVerts.length && ind >= 0) {
			const anchorToPop = node.cableVerts[ind];
			const prevAnchor = node.cableVerts[ind + step];
			const bigVect = Geometry.GetHugeVector(prevAnchor, anchorToPop);
			const stitch = Fabric2Pts.LineFromPoints(prevAnchor.location, anchorToPop.location.add(bigVect));
			if (Geometry.IntersectPtLines(stitch, myMove)) {
				popped.add(node.popAnchor(ind, isFirst).name);
			} else {
				ind += step;
			}
		}
		return popped;
	}
}

// FIXME: This is most definitely buggy.
// The reason is that what if g11->g12 is small but g01->g02 is big, this doesn't work
// The must be a logic I am missing here
// export function ShouldPopLastAnchor(g01: Vertex, g11: Vertex, anchor: Vertex, g02: Vertex, g12: Vertex) {
// 	const projVect = Geometry.GetProjectionVect(g01, g11, anchor).multiply(-1);
// 	const epsilonToG1 = Geometry.GetEpsilonVector(g01, g11);
// 	const stitchLineStart = g01.location.add(projVect).add(epsilonToG1.multiply(-1));
// 	const stitchLineEnd = g11.location.add(projVect).add(epsilonToG1);

// }

function isAbsolutelyVisible(v: Vertex, target: Vertex): boolean {
	const res: VisibilityResult[] = [];
	if (v.isVisible(target, res)) {
		if (res.length === 0) return true;
	}
	return false;
}
