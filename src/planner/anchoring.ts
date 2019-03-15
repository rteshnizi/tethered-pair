import { Vertex, VisibilityResult } from "../model/vertex";

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

function isAbsolutelyVisible(v: Vertex, target: Vertex): boolean {
	const res: VisibilityResult[] = [];
	if (v.isVisible(target, res)) {
		if (res.length === 0) return true;
	}
	return false;
}
