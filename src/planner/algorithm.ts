import { GetGapPairs, LabeledGap, MakeGapTreeNodes } from "./gap-pairs";
import { GapTreeNode, GTNVisitState } from "../ds/gap-tree";
import Model from "../model/model-service";

export function Plan() {
	Model.Instance.Robots[0].reset();
	Model.Instance.Robots[1].reset();
	const root = CreateGapTreeRoot();
	VisitLayer(root);
}

function VisitLayer(node: GapTreeNode): void {
	node.visitState = GTNVisitState.VISITING;
	const originalLocation = node.val.robot.location;
	node.val.robot.location = node.val.gap.location;
	node.val.robot.addVertToVisited(node.val.gap);
	// Only search for gaps when we have decided for both robots
	if (node.val.robot.name === Model.Instance.Robots[1].name) {
		Visit(node);
	}
	for (let n of node.children) {
		VisitLayer(n);
	}
	node.visitState = GTNVisitState.VISITED;
	node.val.robot.location = originalLocation;
	node.val.robot.removeVertFromVisited(node.val.gap);
}

function Visit(node: GapTreeNode): void {
	const gapPairs = GetGapPairs();
	// console.log(gapPairs);

	MakeGapTreeNodes(gapPairs, node);
	// console.log(node);
}

function CreateGapTreeRoot(): GapTreeNode {
	const root = new GapTreeNode(new LabeledGap(Model.Instance.Robots[0], Model.Instance.Robots[0]));
	root.addChild(new GapTreeNode(new LabeledGap(Model.Instance.Robots[1], Model.Instance.Robots[1])));
	return root;
}
