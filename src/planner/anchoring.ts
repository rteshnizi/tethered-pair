import { Vertex } from "../model/vertex";
import Model from "../model/model-service";

/** Whether both gaps can see the target anchor */
export function CanAnchorFromGapPair(g1: Vertex, g2: Vertex, target: Vertex): boolean {
	// fast check
	// If the target is not a global anchor then we should not use it for planning anyway
	if (!target.isGlobalAnchor) return false
	if (!g1.isVisible(target)) return false;
	if (!g2.isVisible(target)) return false;
	if (!target.canAnchor(g1, g2, Model.Instance.CableLength)) return false;
	return true;
}