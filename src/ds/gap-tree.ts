import { LabeledGap } from "../planner/gap-pairs";

export class GapTreeNode {
	public children: Set<GapTreeNode>;
	constructor(public val: LabeledGap, public parent: GapTreeNode) {
		this.children = new Set();
	}
}