import { GetGapPairs, LabeledGap, MakeGapTreeNodes } from "./gap-pairs";
import { GapTreeNode } from "../ds/gap-tree";
import Model from "../model/model-service";
import { VertexVisitState } from "../model/vertex";
import Renderer from "../viewer/renderer-service";
import { Path } from "../model/path";

const PRINT_DEBUG = false;

export function Plan(): void {
	Model.Instance.reset();
	const root = CreateGapTreeRoot();
	VisitLayer(root);
	console.log(`################################################### ${Model.Instance.ITERATION}`);
	console.log(Model.Instance.Solutions[Model.Instance.Robots[0].name].pathString());
	console.log(Model.Instance.Solutions[Model.Instance.Robots[1].name].pathString());
	Model.Instance.SolutionPaths[Model.Instance.Robots[0].name] = new Path(Model.Instance.Solutions[Model.Instance.Robots[0].name]);
	Model.Instance.SolutionPaths[Model.Instance.Robots[1].name] = new Path(Model.Instance.Solutions[Model.Instance.Robots[1].name]);
}

function VisitLayer(node: GapTreeNode): void {
	if (Model.Instance.ITERATION === Model.Instance.DEBUG_HARD_ITERATION_LIMIT) return;
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
		VisitLayer(n);
	}
	node.val.robot.location = originalLocation;
	node.val.gap.setVisitState(node.val.robot, VertexVisitState.UNVISITED);
}

function Visit(node: GapTreeNode): void {
	// Search termination condition
	if (IsAtDestination(node)) {
		console.log("----------------------");
		console.log(`S -> ${node.parent!.pathString()}`);
		console.log(`S -> ${node.pathString()}`);
		// @ts-ignore if they are both at destination then parent is not undefined
		Model.Instance.addSolutions(node, node.parent);
		return;
	}
	if (PRINT_DEBUG) {
		console.log("----------------------");
		console.log(node.parent!.pathString());
		console.log(node.pathString());
	}
	const gapPairs = GetGapPairs();
	// console.log(gapPairs);
	MakeGapTreeNodes(gapPairs, node);
}

function CreateGapTreeRoot(): GapTreeNode {
	const root = new GapTreeNode(new LabeledGap(Model.Instance.Robots[0], Model.Instance.Robots[0]));
	root.addChild(new GapTreeNode(new LabeledGap(Model.Instance.Robots[1], Model.Instance.Robots[1])));
	return root;
}

/** When we are visiting the gap tree node belongs to R1 and the parent belongs to R0 */
function IsAtDestination(node: GapTreeNode): boolean {
	// Since we are at R1, there always is a parent
	return node.isAtDestination() && node.parent!.isAtDestination();
}
