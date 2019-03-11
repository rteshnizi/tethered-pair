import { LabeledGap } from "../planner/gap-pairs";

export enum GTNVisitState {
	UNVISITED,
	VISITING,
	VISITED,
}

export class GapTreeNode {
	private _children: Map<string, GapTreeNode>;
	public get children(): GapTreeNode[] { return Array.from(this._children.values()); }

	private _parent?: GapTreeNode;
	public get parent(): GapTreeNode | undefined { return this._parent; }

	public visitState: GTNVisitState;

	constructor(public val: LabeledGap) {
		this._children = new Map();
		this.visitState = GTNVisitState.UNVISITED;
	}

	public addChild(node: GapTreeNode): void {
		node._parent = this;
		this._children.set(node.val.toString(), node);
	}

	public isChild(gap: LabeledGap): GapTreeNode | undefined {
		return this._children.get(gap.toString());
	}

	public isAtDestination(): boolean {
		// @ts-ignore @types is wrong for these functions
		return this.val.gap.location.eq(this.val.robot.Destination!.location);
	}
}