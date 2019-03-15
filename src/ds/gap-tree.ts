import { LabeledGap } from "../planner/labeled-gap";
import Model from "../model/model-service";
import { GTNPriorityQueue } from "./priority-queue";
import { Vertex } from "../model/vertex";

export class GapTreeNode {
	private _children: Map<string, GapTreeNode>;
	/** The user has to cache this */
	public createChildrenPq(): GTNPriorityQueue {
		const pQ = new GTNPriorityQueue(GtnAStarComparator);
		this._children.forEach((n) => {
			pQ.push(n);
		});
		return pQ;
	}

	private _parent?: GapTreeNode;
	public get parent(): GapTreeNode | undefined { return this._parent; }

	private _depth: number;
	public get depth(): number { return this._depth; }

	private _cost: number;
	/** You can't set the cost directly, you need to add the node to its parent and it will automatically update the cost */
	public get cost(): number { return this._cost; }

	private _consumedCable: number;
	private get consumedCable(): number { return this._consumedCable; }

	constructor(public val: LabeledGap, public anchor: Vertex | undefined) {
		this._children = new Map();
		this._cost = 0;
		this._depth = 0;
		this._consumedCable = 0;
	}

	public addChild(node: GapTreeNode): boolean {
		const c = this.cableNeededForThisChild(node);
		if (this.consumedCable + c > Model.Instance.CableLength) {
			return false;
		}
		// Tested with current solution, didn't work well
		// const currentSolution = Model.Instance.Solutions[node.val.robot.name];
		// if (this.parent && currentSolution && currentSolution.cost < this.parent.cost + this.parent.val.gap.location.distanceFrom(node.val.gap.location)) {
		// If the node exists with a higher cost just update the parent and cost.
		const maxSolution = Model.Instance.getMaxSolution();
		// Not Interested in path longer than current solution
		if (this.parent && maxSolution && maxSolution.cost < this.parent.cost + this.parent.val.gap.location.distanceFrom(node.val.gap.location)) {
			return false;
		}
		this._children.set(node.toString(), node);
		node._parent = this;
		node._consumedCable = this.consumedCable + c;
		if (this.parent) node._depth = this.parent.depth + 1;
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

	private cableNeededForThisChild(node: GapTreeNode): number {
		if (!node.anchor) return 0;
		const cableNeededForThisStep = node.anchor.location.distanceFrom(node.val.gap.location);
		let cableNeededFromMyAnchorToTheOther = this.anchor ? this.anchor.location.distanceFrom(node.anchor.location) : 0;
		return cableNeededForThisStep + cableNeededFromMyAnchorToTheOther;
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

	public toLongString(): string {
		return `[${this.val.toString()}-C${this.cost.toFixed(1)}-H${this.heuristic().toFixed(1)}]`;
	}
	public toString(): string {
		return `${this.val.toString()}`;
	}
}

/** Lowest Cost First */
export function GtnCostComparator(n1: GapTreeNode, n2: GapTreeNode): boolean {
	return n1.cost < n2.cost;
}

/** Lowest Cost+H First */
export function GtnAStarComparator(n1: GapTreeNode, n2: GapTreeNode): boolean {
	return n1.cost + n1.heuristic() < n2.cost + n2.heuristic();
}
