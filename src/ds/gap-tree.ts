import { LabeledGap } from "../planner/gap-pairs";
import Model from "../model/model-service";
import { GTNPriorityQueue } from "./priority-queue";

export class GapTreeNode {
	private _children: Map<string, GapTreeNode>;
	/** The user has to cache this */
	public createChildrenPq(): GTNPriorityQueue {
		const pQ = new GTNPriorityQueue(GtnCostComparator);
		this._children.forEach((n) => {
			pQ.push(n);
		});
		return pQ;
	}

	private _parent?: GapTreeNode;
	public get parent(): GapTreeNode | undefined { return this._parent; }

	private _cost: number;
	/** You can't set the cost directly, you need to add the node to its parent and it will automatically update the cost */
	public get cost(): number { return this._cost; }

	constructor(public val: LabeledGap) {
		this._children = new Map();
		this._cost = 0;
	}

	public addChild(node: GapTreeNode): boolean {
		// Before Adding this child just check the global node map
		// If the node exists with a higher cost just update the parent and cost.
		const maxSolution = Model.Instance.getMaxSolution();
		// Not Interested in path longer than current solution
		if (this.parent && maxSolution && maxSolution.cost < this.parent.cost + this.parent.val.gap.location.distanceFrom(node.val.gap.location)) {
			return false;
		}
		this._children.set(node.toString(), node);
		node._parent = this;
		node.updateCost();
		return true;
		// // Before Adding this child just check the global node map
		// // If the node exists with a higher cost just update the parent and cost.
		// let current = Model.Instance.GlobalGapTreeMap.get(node.toString());
		// if (!current) {
		// 	Model.Instance.GlobalGapTreeMap.set(node.toString(), node);
		// 	this._children.set(node.toString(), node);
		// 	node._parent = this;
		// 	node.updateCost();
		// 	return;
		// }
		// if (!this.parent) return;
		// // If changing parent would reduce cost, then update the parent
		// // (Remember that the node alternate robots, so to calculate the cost for current robot I have to check this.parent)
		// if (current.cost > this.parent.cost + this.parent.val.gap.location.distanceFrom(node.val.gap.location)) {
		// 	if (current.parent) {
		// 		current.parent._children.delete(current.toString());
		// 	}
		// 	current._parent = this;
		// 	this._children.set(node.toString(), node);
		// 	current.updateCost();
		// }
	}

	public isChild(gap: LabeledGap): GapTreeNode | undefined {
		return this._children.get(gap.toString());
	}

	public isAtDestination(): boolean {
		// @ts-ignore @types is wrong for these functions
		return this.val.gap.location.eq(this.val.robot.Destination!.location);
	}

	/**
	 * Update the cost of this node and all its decedents recursively.
	 * (Remember that the node alternate robots, so to calculate the cost for current robot I have to check this.parent.parent)
	 */
	private updateCost() {
		if (!this.parent) return;
		if (!this.parent.parent) return;
		this._cost = this.parent.parent.cost + this.parent.parent.val.gap.location.distanceFrom(this.val.gap.location);
		// this.children.forEach((c) => c.updateCost());
	}

	public pathString(): string {
		let str = "";
		let node: GapTreeNode | undefined = this;
		while (node) {
			str = `${node.toString()} -> ${str}`;
			node = node.parent;
			if (!node) break;
			node = node.parent;
		}
		return `(#${this.cost.toFixed(5)}) -> ${str}`;
	}

	public heuristic(): number {
		return this.heuristic1();
	}

	private heuristic1(): number {
		return this.val.gap.location.distanceFrom(this.val.robot.Destination!.location);
	}

	public toString(): string {
		return this.val.toString();
	}
}

/** Lowest Cost First */
function GtnCostComparator(n1: GapTreeNode, n2: GapTreeNode): boolean {
	return n1.cost < n2.cost;
}

/** Lowest Cost+H First */
function GtnAStarComparator(n1: GapTreeNode, n2: GapTreeNode): boolean {
	return n1.cost + n1.heuristic() < n2.cost + n2.heuristic();
}
