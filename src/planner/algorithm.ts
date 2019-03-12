import { GetGapPairs, LabeledGap, MakeGapTreeNodes } from "./gap-pairs";
import { GapTreeNode } from "../ds/gap-tree";
import Model from "../model/model-service";
import { VertexVisitState } from "../model/vertex";

export function Plan(): void {
	Model.Instance.reset();
	const root = CreateGapTreeRoot();
	VisitLayer(root);
	console.log(root);
}

function VisitLayer(node: GapTreeNode): void {
	const originalLocation = node.val.robot.location;
	node.val.robot.location = node.val.gap.location;
	node.val.gap.setVisitState(node.val.robot, VertexVisitState.VISITING);
	// Only search for gaps when we have decided for both robots
	if (node.val.robot.name === Model.Instance.Robots[1].name) {
		Visit(node);
	}
	for (let n of node.children) {
		VisitLayer(n);
	}
	node.val.robot.location = originalLocation;
	// Eliminates cycles in the paths
	node.val.gap.setVisitState(node.val.robot, VertexVisitState.UNVISITED);
}

function Visit(node: GapTreeNode): void {
	console.log(node.parent!.pathString());
	console.log(node.pathString());
	console.log("----------------------");
	// Search termination condition
	if (IsAtDestination(node)) {
		console.log("*******Solution*******");
		// console.log(node.parent!.pathString());
		// console.log(node.pathString());
		// @ts-ignore if they are both at destination then parent is not undefined
		Model.Instance.addSolutions(node, node.parent);
		return;
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
