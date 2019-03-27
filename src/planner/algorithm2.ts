import * as GapPairFuncs from "./gap-pairs";
import Model from "../model/model-service";
import { VertexVisitState } from "../model/vertex";
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
	PrintDebug("################################################### Begin", { level: DEBUG_LEVEL.L3 });
	// window.requestAnimationFrame(DFSVisitLayer.bind(window, root));
	Model.Instance.openSet.push(root);
	const origin1 = Model.Instance.Robots[0].location;
	const origin2 = Model.Instance.Robots[1].location;
	AStar();
	Model.Instance.Robots[0].location = origin1;
	Model.Instance.Robots[1].location = origin2;
	PrintDebug(`################################################## ${Model.Instance.ITERATION}`, { level: DEBUG_LEVEL.L3 });
	if (Model.Instance.foundSolution()) {
		PrintDebug(Model.Instance.Solutions[Model.Instance.Robots[0].name].pathString(), { level: DEBUG_LEVEL.L3 });
		PrintDebug(Model.Instance.Solutions[Model.Instance.Robots[1].name].pathString(), { level: DEBUG_LEVEL.L3 });
		Model.Instance.SolutionPaths[Model.Instance.Robots[0].name] = new Path(Model.Instance.Solutions[Model.Instance.Robots[0].name]);
		Model.Instance.SolutionPaths[Model.Instance.Robots[1].name] = new Path(Model.Instance.Solutions[Model.Instance.Robots[1].name]);
		// This solution contains information about both parts of the cable
		// We just need to traverse it right
		Model.Instance.CablePath = new Cable(Model.Instance.Solutions[Model.Instance.Robots[1].name]);
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
		// @ts-ignore if they are both at destination then parent is not undefined
		Model.Instance.addSolutions(node, node.parent);
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
	const l1 = new LabeledGap(Model.Instance.Robots[0], Model.Instance.Robots[0], undefined);
	const l2 = new LabeledGap(Model.Instance.Robots[1], Model.Instance.Robots[1], undefined);
	const g = new GapPairFuncs.GapPair(l1, l2);
	const root = new GapTreePairNode(g);
	return root;
}
