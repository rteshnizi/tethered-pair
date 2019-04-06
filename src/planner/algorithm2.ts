import * as GapPairFuncs from "./gap-pairs";
import Model from "../model/model-service";
import { VertexVisitState, Vertex } from "../model/vertex";
import { Path } from "../model/path";
import { PrintDebug, DEBUG_LEVEL } from "../utils/debug";
import Renderer from "../viewer/renderer-service";
import { Cable } from "../model/cable";
import { LabeledGap } from "./labeled-gap";
import * as SingleGapFuncs from "./single-gap";
import { GapTreePairNode } from "../ds/gap-tree-pair";

export function Alg2(): void {
	Model.Instance.reset();
	const root = CreateRoot();
	PrintDebug(`Init Cable = ${root.consumedCable}`, { level: DEBUG_LEVEL.L3 });
	PrintDebug("################################################### Begin", { level: DEBUG_LEVEL.L3 });
	// window.requestAnimationFrame(DFSVisitLayer.bind(window, root));
	Model.Instance.openSet.push(root);
	const origin1 = Model.Instance.Robots[0].location;
	const origin2 = Model.Instance.Robots[1].location;
	AStar();
	Model.Instance.Robots[0].location = origin1;
	Model.Instance.Robots[1].location = origin2;
	PrintDebug(`################################################## ${Model.Instance.ITERATION}`, { level: DEBUG_LEVEL.L3 });
	if (Model.Instance.Solutions2) {
		PrintDebug(Model.Instance.Solutions2.pathString(), { level: DEBUG_LEVEL.L3 });
		Model.Instance.SolutionPaths[Model.Instance.Robots[0].name] = Path.CreateFromGapTreePairNode(Model.Instance.Solutions2, true);
		Model.Instance.SolutionPaths[Model.Instance.Robots[1].name] = Path.CreateFromGapTreePairNode(Model.Instance.Solutions2, false);
		// This solution contains information about both parts of the cable
		// We just need to traverse it right
		Model.Instance.CablePath = Cable.CreateFromVerts([Model.Instance.Solutions2.val.first.gap, ...Model.Instance.Solutions2.cableVerts, Model.Instance.Solutions2.val.second.gap]);
	} else {
		Renderer.Instance.render(true);
		PrintDebug("No Solutions", { level: DEBUG_LEVEL.L3 });
	}
}

function AStar(): void {
	let node: GapTreePairNode;
	while (Model.Instance.ITERATION !== Model.Instance.CONSTANTS.ITERATION_LIMIT && !Model.Instance.openSet.isEmpty()) {
		Model.Instance.ITERATION++;
		node = Model.Instance.openSet.pop();
		node.val.first.robot.location = node.val.first.gap.location;
		node.val.second.robot.location = node.val.second.gap.location;
		// Eliminates cycles in the paths
		node.val.first.gap.setVisitState(node.val.first.robot, VertexVisitState.VISITING);
		node.val.second.gap.setVisitState(node.val.second.robot, VertexVisitState.VISITING);
		Visit(node);
		node.children.forEach((n) => {
			Model.Instance.openSet.push(n);
		});
		node.val.first.gap.setVisitState(node.val.first.robot, VertexVisitState.UNVISITED);
		node.val.second.gap.setVisitState(node.val.second.robot, VertexVisitState.UNVISITED);
	}
}

function Visit(node: GapTreePairNode): void {
	// Search termination condition
	if (node.isAtDestination()) {
		PrintDebug("----------------------", { level: DEBUG_LEVEL.L2 });
		PrintDebug(`S -> ${node.pathString()}`, { level: DEBUG_LEVEL.L2 });
		Model.Instance.addSolutions2(node);
		return;
	}
	PrintDebug("----------------------");
	PrintDebug(node.pathString());
	// Don't expand if reached max depth
	if (node.depth === Model.Instance.CONSTANTS.DEPTH_LIMIT) {
		return;
	}
	// We should try anchoring if the robots both can see their destination
	// that's the shortest way
	// We should also try anchoring, if previous gap chasings have caused an anchor
	// THEY MUST HAVE ANCHORS AT THE SAME TIME. THAT'S THE WHOLE POINT
	if (node.val.first.anchor && node.val.second.anchor) {
		const r0Gaps = SingleGapFuncs.CreateLabeledGaps(node.val.first.robot, node.val.first.anchor);
		const r1Gaps = SingleGapFuncs.CreateLabeledGaps(node.val.second.robot, node.val.second.anchor);
		SingleGapFuncs.MakeGapTreePairNodes(r0Gaps, r1Gaps, node);
	} else {
		const gapPairs = GapPairFuncs.GetGapPairs();
		PrintDebug(gapPairs, { dontCallToString: true });
		GapPairFuncs.MakeGapTreePairNodes(gapPairs, node);
	}
}

function CreateRoot(): GapTreePairNode {
	let anchor0: Vertex | undefined = undefined;
	let anchor1: Vertex | undefined = undefined;
	const l = Model.Instance.InitialCableVerts.length;
	if (l > 0) {
		anchor0 = Model.Instance.InitialCableVerts[0];
		anchor1 = Model.Instance.InitialCableVerts[l - 1];
	}
	const l1 = new LabeledGap(Model.Instance.Robots[0], Model.Instance.Robots[0], anchor0);
	const l2 = new LabeledGap(Model.Instance.Robots[1], Model.Instance.Robots[1], anchor1);
	const g = new GapPairFuncs.GapPair(l1, l2);
	const root = new GapTreePairNode(g, Model.Instance.InitialCableVerts);
	return root;
}
