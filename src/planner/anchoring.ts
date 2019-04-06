import { Vertex, VisibilityResult } from "../model/vertex";
import { Geometry, IsPolygonEmptyState, Fabric2Pts } from "../utils/geometry";
import * as FabricUtils from "../utils/fabric";

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

export function ShouldPop(v1: Vertex, anchorToPop: Vertex, v2: Vertex): boolean {
	const result = Geometry.IsPolygonEmpty(FabricUtils.GetFabricPointsFromVertexArray([v1, v2, anchorToPop]));
	if (result.state !== IsPolygonEmptyState.Empty) return false;
	return isAbsolutelyVisible(v1, v2);
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
