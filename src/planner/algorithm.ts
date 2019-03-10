import { GetGapPairs, LabeledGap, MakeGapTreeNodes } from "./gap-pairs";
import { Vertex } from "../model/vertex";
import { GapTreeNode } from "../ds/gap-tree";

export function Plan() {
	const path0: Vertex[] = [];
	const path1: Vertex[] = [];
	const gapPairs = GetGapPairs();
	console.log(gapPairs);
	const root = MakeGapTreeNodes(gapPairs);
	console.log(root);
}
