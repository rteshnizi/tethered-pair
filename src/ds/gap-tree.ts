import { LabeledGap } from "../planner/gap-pairs";

export class GapTreeNode {
	public children: Map<string, GapTreeNode>;
	constructor(public val: LabeledGap) {
		this.children = new Map();
	}
}