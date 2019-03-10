import { GetGapPairs, LabeledGap, MakeGapTreeNodes } from "./gap-pairs";
import { Vertex } from "../model/vertex";
import { GapTreeNode } from "../ds/gap-tree";
import Model from "../model/model-service";

export function Plan() {
	const root = CreateGapTreeRoot();
	const path0: Vertex[] = [];
	const path1: Vertex[] = [];
	const gapPairs = GetGapPairs();

	// console.log(gapPairs);
	MakeGapTreeNodes(gapPairs, root.children[0]);
	console.log(root);
}

function CreateGapTreeRoot(): GapTreeNode {
	const root = new GapTreeNode(new LabeledGap(Model.Instance.Robots[0], Model.Instance.Robots[0]));
	root.addChild(new GapTreeNode(new LabeledGap(Model.Instance.Robots[1], Model.Instance.Robots[1])));
	return root;
}
