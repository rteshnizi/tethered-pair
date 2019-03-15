import { GetGapPairs, MakeGapTreeNodes } from "./gap-pairs";
import { GapTreeNode } from "../ds/gap-tree";
import Model from "../model/model-service";
import { VertexVisitState } from "../model/vertex";
import { Path } from "../model/path";
import { PrintDebug, DEBUG_LEVEL } from "../utils/debug";
import Renderer from "../viewer/renderer-service";
import { Cable } from "../model/cable";
import { LabeledGap } from "./labeled-gap";

export function Plan(): void {
	Model.Instance.reset();
	const root = CreateGapTreeRoot();
	PrintDebug("################################################### Begin", { level: DEBUG_LEVEL.L3 });
	// window.requestAnimationFrame(DFSVisitLayer.bind(window, root));
	DFSVisitLayer(root);
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

function DFSVisitLayer(node: GapTreeNode): void {
	if (Model.Instance.ITERATION === Model.Instance.CONSTANTS.ITERATION_LIMIT) return;
	Model.Instance.ITERATION++;
	const originalLocation = node.val.robot.location;
	node.val.robot.location = node.val.gap.location;
	// Eliminates cycles in the paths
	node.val.gap.setVisitState(node.val.robot, VertexVisitState.VISITING);
	// Only search for gaps when we have decided for both robots
	if (node.val.robot.name === Model.Instance.Robots[1].name) {
		Visit(node);
	}
	const children = node.createChildrenPq();
	while (!children.isEmpty()) {
		const n = children.pop();
		// window.requestAnimationFrame(DFSVisitLayer.bind(window, n));
		DFSVisitLayer(n);
	}
	node.val.robot.location = originalLocation;
	node.val.gap.setVisitState(node.val.robot, VertexVisitState.UNVISITED);
}

function Visit(node: GapTreeNode): void {
	// Search termination condition
	if (IsAtDestination(node)) {
		PrintDebug("----------------------", { level: DEBUG_LEVEL.L2 });
		PrintDebug(`S -> ${node.parent!.pathString()}`, { level: DEBUG_LEVEL.L2 });
		PrintDebug(`S -> ${node.pathString()}`, { level: DEBUG_LEVEL.L2 });
		// @ts-ignore if they are both at destination then parent is not undefined
		Model.Instance.addSolutions(node, node.parent);
		return;
	}
	PrintDebug("----------------------");
	PrintDebug(node.parent!.pathString());
	PrintDebug(node.pathString());
	// Don't expand if reached max depth
	if (node.depth === Model.Instance.CONSTANTS.DEPTH_LIMIT) {
		return;
	}
	const r0 = Model.Instance.Robots[0];
	const r1 = Model.Instance.Robots[1];
	r0.findGaps();
	r1.findGaps();
	if (node.anchor) {
		// MakeGapTreeNodes(gapPairs, node);
	} else {
		const gapPairs = GetGapPairs();
		PrintDebug(gapPairs, { dontCallToString: true });
		MakeGapTreeNodes(gapPairs, node);
	}
}

function CreateGapTreeRoot(): GapTreeNode {
	const root = new GapTreeNode(new LabeledGap(Model.Instance.Robots[0], Model.Instance.Robots[0], undefined), undefined);
	root.addChild(new GapTreeNode(new LabeledGap(Model.Instance.Robots[1], Model.Instance.Robots[1], undefined), undefined));
	return root;
}

/** When we are visiting the gap tree node belongs to R1 and the parent belongs to R0 */
function IsAtDestination(node: GapTreeNode): boolean {
	// Since we are at R1, there always is a parent
	return node.isAtDestination() && node.parent!.isAtDestination();
}
