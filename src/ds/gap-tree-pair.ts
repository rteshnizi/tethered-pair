import { LabeledGap } from "../planner/labeled-gap";
import Model from "../model/model-service";
import * as Anchoring from "../planner/anchoring";
import { PriorityQueue } from "./priority-queue";
import { Vertex } from "../model/vertex";
import { GapPair } from "../planner/gap-pairs";

class Costs {
	constructor(public first: number, public second: number) {}
	public get max(): number { return Math.max(this.first, this.second); }
	public get min(): number { return Math.min(this.first, this.second); }
};

export class GapTreePairNode {
	private _children: Map<string, GapTreePairNode>;
	/** The user has to cache this */
	public get children(): GapTreePairNode[] {
		return Array.from(this._children.values());
	}

	/** cableVerts[0] is closest to R0 and cableVert[length -1] is closest to R1 */
	public cableVerts: Vertex[];

	private _parent?: GapTreePairNode;
	public get parent(): GapTreePairNode | undefined { return this._parent; }

	private _depth: number;
	public get depth(): number { return this._depth; }

	private _cost: Costs;
	/** You can't set the cost directly, you need to add the node to its parent and it will automatically update the cost */
	public get cost(): Readonly<Costs> { return this._cost; }

	/** From the first anchor on the other end up to my anchor */
	private _consumedCable: number;
	/** From the first anchor on the other end up to my anchor */
	public get consumedCable(): number { return this._consumedCable; }

	/**
	 * @param val Node Val
	 * @param cableVerts Only used for root, Other nodes will figure it out on their own.
	 */
	constructor(public val: GapPair, cableVerts?: Vertex[]) {
		this._children = new Map();
		this._cost = new Costs(0, 0);
		this._depth = 0;
		this._consumedCable = 0;
		this.cableVerts = [];
		if (cableVerts) {
			for (const v of cableVerts) {
				this.cableVerts.push(v);
			}
		}
		this.updateConsumedCable();
	}

	public addChild(node: GapTreePairNode): boolean {
		// if (this.parent) {
		// 	if (!this.checkAnchor(node.val.first, this.parent.val.first)) return false;
		// 	if (!this.checkAnchor(node.val.second, this.parent.val.second)) return false;
		// }
		this.checkAnchor2(node);

		// const cableCheck = this.thereIsNotEnoughCable(node);
		// if (cableCheck.thereIsNotEnoughCable) return false;
		if (node.thereIsNotEnoughCable2()) return false;

		// Not Interested in path longer than current solution
		if (this.costIsHigherThanMaxCost(node)) return false;

		this._children.set(node.toString(), node);
		node._parent = this;
		// node._consumedCable = this.consumedCable + cableCheck.c2;
		if (this.parent) node._depth = this.parent.depth + 1;
		node.updateCost();
		return true;
	}

	private thereIsNotEnoughCable2(): boolean {
		this.updateConsumedCable();
		if (this.cableVerts.length === 0) {
			return this.val.first.gap.location.distanceFrom(this.val.second.gap.location) > Model.Instance.CableLength;
		}
		const r0End = this.cableVerts[0].location.distanceFrom(this.val.first.gap.location);
		const r1End = this.cableVerts[this.cableVerts.length - 1].location.distanceFrom(this.val.second.gap.location);
		return r0End + r1End > Model.Instance.CableLength;
	}

	private thereIsNotEnoughCable(node: GapTreePairNode): CableCheckResult {
		const c1 = this.cableNeededFromAnchorToGap(node);
		const c2 = this.cableNeededFromTheirAnchorToNextAnchorsOnTheCable(node);
		if (c1 + c2 + this.consumedCable > Model.Instance.CableLength) {
			return { c1, c2, thereIsNotEnoughCable: true };
		}
		return { c1, c2, thereIsNotEnoughCable: false };
	}

	private costIsHigherThanMaxCost(node: GapTreePairNode): boolean {
		const maxSolution = Model.Instance.getMaxSolution();
		if (this.parent && maxSolution) {
			const c1 = this.parent.cost.first + this.parent.val.first.gap.location.distanceFrom(node.val.first.gap.location);
			const c2 = this.parent.cost.second + this.parent.val.second.gap.location.distanceFrom(node.val.second.gap.location);
			const max = Math.max(c1, c2);
			return (maxSolution.cost < max);
		}
		return false;
	}

	/** Verify cable configuration */
	private checkAnchor2(child: GapTreePairNode): void {
		for (const v of this.cableVerts) {
			child.cableVerts.push(v);
		}
		this.fixAnchors(child, true);
		this.fixAnchors(child, false);
		// Special case
		if (child.cableVerts.length === 1) {
			if (Anchoring.ShouldPop(child.val.first.gap, child.cableVerts[0], child.val.second.gap)) {
				child.val.first.anchor = undefined;
				child.val.second.anchor = undefined;
				child.cableVerts = [];
			}
		}
	}

	private fixAnchors(child: GapTreePairNode, isFirst: boolean): void {
		const labeledGap = isFirst ? child.val.first : child.val.second;
		const pushed = this.pushAnchorIfNeeded(labeledGap, isFirst);
		if (child.cableVerts.length === 0) return;
		// special case of last anchor
		// We fix this outside
		if (child.cableVerts.length === 1) return;

		// The logic here gets a bit messy
		// This all for making sure we are not pushing and popping
		let ind = 0;
		let step = +1;
		let vert = labeledGap.gap;
		if (isFirst) {
			step = +1;
			// let me try to explain it
			// if I pushed I should start checking for pops from the last anchor before the pushed one
			// if I didn't I should begin with the gap I am chasing
			if (pushed) {
				vert = child.cableVerts[0];
				ind += step;
			}
		} else {
			step = -1;
			ind = child.cableVerts.length - 1;
			if (pushed) {
				vert = child.cableVerts[child.cableVerts.length - 1];
				ind += step;
			}
		}
		while (ind + step < child.cableVerts.length && ind + step >= 0) {
			if (Anchoring.ShouldPop(vert, child.cableVerts[ind], child.cableVerts[ind + step])) {
				child.popAnchor(ind);
			}
			ind += step;
		}
	}

	private popAnchor(ind: number) {
		this.cableVerts.splice(ind, 1);
	}

	private pushAnchorIfNeeded(child: LabeledGap, isFirst: boolean): boolean {
		let prevAnchor: Vertex | undefined = undefined;
		if (this.cableVerts.length > 0) {
			prevAnchor = isFirst ? this.cableVerts[0] : this.cableVerts[this.cableVerts.length - 1];
		}

		if (child.anchor) {
			if (prevAnchor && child.anchor.name === prevAnchor.name) return false;
			if (isFirst) {
				this.cableVerts.splice(0, 0, child.anchor);
			} else {
				this.cableVerts.push(child.anchor);
			}
			return true;
		}
		return false;
	}

	private checkAnchor(labeledGap: LabeledGap, parent: LabeledGap): boolean {
		// FIXME: This might change for the bottom field because we might need this tree node for popping
		// I actually think this is okay, I just need to add the logic for popping in here
		// But since I don't have the logic, I am preventing it for now.
		// In the case of consecutive push and pops the fact that that is extra cost will prevent such a node to be chosen
		if (labeledGap.anchor && parent.anchor) {
			if (labeledGap.gap.location.eq(labeledGap.anchor.location) && labeledGap.anchor.name === parent.anchor.name) {
				return false; // This should be updated to popping. read above
			}
		}
		return true;
	}

	private cableNeededFromAnchorToGapPerRobot(labeledGap: LabeledGap): number {
		if (!labeledGap.anchor) return 0;
		const cableNeededForThisStep = labeledGap.anchor.location.distanceFrom(labeledGap.gap.location);
		return cableNeededForThisStep;
	}

	private cableNeededFromAnchorToGap(node: GapTreePairNode): number {
		const c1 = this.cableNeededFromAnchorToGapPerRobot(node.val.first);
		const c2 = this.cableNeededFromAnchorToGapPerRobot(node.val.second);
		return c1 + c2;
	}

	private cableNeededFromTheirAnchorToNextAnchorsOnTheCablePerRobot(labeledGap: LabeledGap, parent: LabeledGap): number {
		if (!labeledGap.anchor) return 0;
		if (!parent.anchor) return 0;
		const cableNeededUpToAnchor = labeledGap.anchor.location.distanceFrom(parent.anchor.location);
		return cableNeededUpToAnchor;
	}

	private cableNeededFromTheirAnchorToNextAnchorsOnTheCable(node: GapTreePairNode): number {
		if (!this.parent) return 0;
		const c1 = this.cableNeededFromTheirAnchorToNextAnchorsOnTheCablePerRobot(node.val.first, this.parent.val.first);
		const c2 = this.cableNeededFromTheirAnchorToNextAnchorsOnTheCablePerRobot(node.val.second, this.parent.val.second);
		return c1 + c2;
	}

	public isChild(gap: LabeledGap): GapTreePairNode | undefined {
		return this._children.get(gap.toString());
	}

	public isAtDestination(): boolean {
		// @ts-ignore @types is wrong for these functions
		const b1 = this.val.first.gap.location.eq(this.val.first.robot.Destination!.location);
		// @ts-ignore @types is wrong for these functions
		const b2 = this.val.second.gap.location.eq(this.val.second.robot.Destination!.location);
		// @ts-ignore @types is wrong for these functions
		return b1 && b2;
	}

	/** Update the cost of this node and all its decedents recursively. */
	private updateCost() {
		if (!this.parent) return;
		const c1 = this.parent.cost.first + this.parent.val.first.gap.location.distanceFrom(this.val.first.gap.location);
		const c2 = this.parent.cost.second + this.parent.val.second.gap.location.distanceFrom(this.val.second.gap.location);
		this._cost = new Costs(c1, c2);
	}

	private updateConsumedCable(): void {
		if (this.cableVerts.length < 2) return;
		for (let i = 0; i < this.cableVerts.length - 1; i++) {
			this._consumedCable += this.cableVerts[i].location.distanceFrom(this.cableVerts[i + 1].location);
		}
	}

	public pathString(): string {
		let str1 = "";
		let str2 = "";
		let node: GapTreePairNode | undefined = this;
		while (node) {
			str1 = `${node.val.first.toString()} -> ${str1}`;
			str2 = `${node.val.second.toString()} -> ${str2}`;
			node = node.parent;
		}
		return `(#${this.cost.first.toFixed(3)}) -> ${str1}\n(#${this.cost.second.toFixed(3)}) -> ${str2}\n`;
	}

	public heuristic(labeledGap: LabeledGap): number {
		return this.heuristic1(labeledGap);
	}

	private heuristic1(labeledGap: LabeledGap): number {
		return labeledGap.gap.location.distanceFrom(labeledGap.robot.Destination!.location);
	}

	// public toLongString(): string {
	// 	return `[${this.val.toString()}-C${this.cost.toFixed(1)}-H${this.heuristic().toFixed(1)}]`;
	// }
	public toString(): string {
		return `${this.val.toString()}`;
	}
}

/** Lowest Cost First */
export function GtnpCostComparator(n1: GapTreePairNode, n2: GapTreePairNode): boolean {
	return n1.cost < n2.cost;
}

/** Lowest Cost+H First */
export function GtnpAStarComparator(n1: GapTreePairNode, n2: GapTreePairNode): boolean {
	const c1 = Math.max(n1.cost.first + n1.heuristic(n1.val.first), n1.cost.second + n1.heuristic(n1.val.second));
	const c2 = Math.max(n2.cost.first + n2.heuristic(n2.val.first), n2.cost.second + n2.heuristic(n2.val.second));
	return c1 < c2;
}

interface CableCheckResult {
	/** From the potential node's anchors to the gap it's chasing */
	c1: number;
	/** From the potential node's anchors to their parent's anchors */
	c2: number;
	thereIsNotEnoughCable: boolean;
}