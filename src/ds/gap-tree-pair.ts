import { LabeledGap } from "../planner/labeled-gap";
import Model from "../model/model-service";
import * as Anchoring from "../planner/anchoring";
import { PriorityQueue } from "./priority-queue";
import { Vertex } from "../model/vertex";
import { GapPair } from "../planner/gap-pairs";
import { Geometry } from "../utils/geometry";
import { Robot } from "../model/robot";

class Costs {
	constructor(public first: number, public second: number) {}
	public get max(): number { return Math.max(this.first, this.second); }
	public get min(): number { return Math.min(this.first, this.second); }
	public get maxInd(): number { return this.first > this.second ? 0 : 1; }
	public get minInd(): number { return this.first < this.second ? 0 : 1; }
};

export class GapTreePairNode {
	private _children: Map<string, GapTreePairNode>;
	/** The user has to cache this */
	public get children(): GapTreePairNode[] {
		return Array.from(this._children.values());
	}

	/** cableVerts[0] is closest to R0 and cableVert[length -1] is closest to R1 */
	public cableVerts: Vertex[];
	/** cableVert closest to R0 */
	public get firstCableVert(): Vertex { return this.cableVerts[0]; };
	/** cableVert closest to R1 */
	public get lastCableVert(): Vertex { return this.cableVerts[this.cableVerts.length - 1]; };

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

	public get isStaying(): boolean[] {
		return [
			// @ts-ignore eq has wrong type def
			this.val.first.gap.location.eq(this.val.first.robot.location) as boolean,
			// @ts-ignore eq has wrong type def
			this.val.second.gap.location.eq(this.val.second.robot.location) as boolean,
		];
	}

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

	public addChild(child: GapTreePairNode): boolean {
		// if (this.parent) {
		// 	if (!this.checkAnchor(node.val.first, this.parent.val.first)) return false;
		// 	if (!this.checkAnchor(node.val.second, this.parent.val.second)) return false;
		// }
		child._parent = this;
		if (this.parent) child._depth = this.parent.depth + 1;
		child.updateCost();
		// Not Interested in path longer than current solution
		if (child.potentialCostIsHigherThanMaxCost()) return false;

		this.checkAnchor2(child);
		if (child.thereIsNotEnoughCable2()) return false;

		this._children.set(child.toString(), child);
		// node._consumedCable = this.consumedCable + cableCheck.c2;
		return true;
	}

	private thereIsNotEnoughCable2(): boolean {
		this.updateConsumedCable();
		if (this.cableVerts.length === 0) {
			return this.val.first.gap.location.distanceFrom(this.val.second.gap.location) > Model.Instance.CableLength;
		}
		const r0End = this.firstCableVert.location.distanceFrom(this.val.first.gap.location);
		const r1End = this.lastCableVert.location.distanceFrom(this.val.second.gap.location);
		return r0End + r1End > Model.Instance.CableLength;
	}

	private costIsHigherThanMaxCost(): boolean {
		if (Model.Instance.Solutions2) {
			const maxSolution = Model.Instance.Solutions2.cost.max;
			return (maxSolution < this.cost.max);
		}
		return false;
	}

	private potentialCostIsHigherThanMaxCost(): boolean {
		if (Model.Instance.Solutions2) {
			const maxSolution = Model.Instance.Solutions2.cost.max;
			return (maxSolution < this.cost.max + this.heuristic()[this.cost.maxInd]);
		}
		return false;
	}

	/** Verify cable configuration */
	private checkAnchor2(child: GapTreePairNode): void {
		for (const v of this.cableVerts) {
			child.cableVerts.push(v);
		}
		let pushed = false;
		pushed = pushed || this.fixAnchors2(child, true);
		pushed = pushed || this.fixAnchors2(child, false);
		// Special case
		if (!pushed && child.cableVerts.length === 1) {
			if (Anchoring.ShouldPop(child.val.first.gap, child.cableVerts[0], child.val.second.gap)) {
				// child.val.first.anchor = undefined;
				// child.val.second.anchor = undefined;
				child.cableVerts = [];
			}
		}
	}

	private fixAnchors(child: GapTreePairNode, isFirst: boolean): boolean {
		const labeledGap = isFirst ? child.val.first : child.val.second;
		const pushed = child.pushAnchorIfNeeded(labeledGap, isFirst);
		if (child.cableVerts.length === 0) return pushed;
		// special case of last anchor
		// We fix this outside
		if (child.cableVerts.length === 1) return pushed;

		// The logic here gets a bit messy
		// This all for making sure we are not pushing and popping
		let ind = 0;
		let step = +1;
		let vert = labeledGap.gap;
		if (isFirst) {
			step = +1;
			ind = 0;
			// let me try to explain it
			// if I pushed I should start checking for pops from the last anchor before the pushed one
			// if I didn't I should begin with the gap I am chasing
			if (pushed) {
				vert = child.firstCableVert;
				ind += step;
			}
		} else {
			step = -1;
			ind = child.cableVerts.length - 1;
			if (pushed) {
				vert = child.lastCableVert;
				ind += step;
			}
		}
		while (ind + step < child.cableVerts.length && ind + step >= 0 && ind < child.cableVerts.length && ind >= 0) {
			if (Anchoring.ShouldPop(vert, child.cableVerts[ind], child.cableVerts[ind + step])) {
				child.popAnchor(ind, isFirst);
			} else {
				ind += step;
			}
		}
		return pushed;
	}

	private fixAnchors2(child: GapTreePairNode, isFirst: boolean): boolean {
		const labeledGap = isFirst ? child.val.first : child.val.second;
		const pushed = child.pushAnchorIfNeeded(labeledGap, isFirst);
		if (child.cableVerts.length === 0) return pushed;
		// special case of last anchor
		// We fix this outside
		if (child.cableVerts.length === 1) return pushed;
		if (pushed) return pushed;

		Anchoring.PopAsNeeded(child, this, isFirst);
		return false;
	}

	public popAnchor(ind: number, isFirst: boolean): Vertex {
		return this.cableVerts.splice(ind, 1)[0];
		// const gap = isFirst ? this.val.first.gap : this.val.second.gap;
		// const result = Geometry.IsPolygonEmpty([gap, ]);
		// if (result.state === IsPolygonEmptyState.NotEmpty) continue;
		// result.innerPermissibleVerts.forEach((p) => {
		// 	// if (CanAnchorFromVertexPair(g1, g2, p) && CanAnchorFromVertexPair(r0, r1, p)) possibleAnchors.push(p);
		// 	if (CanAnchorFromVertices([g1, g2, r0, r1], p)) {
		// 	}
		// }
	}

	private pushAnchorIfNeeded(child: LabeledGap, isFirst: boolean): boolean {
		let prevAnchor: Vertex | undefined = undefined;
		if (this.cableVerts.length > 0) {
			prevAnchor = isFirst ? this.firstCableVert : this.lastCableVert;
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

	/** Update the cost of this node using parent's cost. */
	private updateCost() {
		if (!this.parent) return;
		// There is a bug since we move tha actual robot during the algorithm
		// Sometimes once it's at the destination, the cost will be zero
		// So in order to get around that, we get myVertex when gap is R0 or R1
		const c1 = this.parent.cost.first + this.costPerRobot(this.parent.val.first.gap, this.val.first.gap, this.val.first.robot, true);
		const c2 = this.parent.cost.second + this.costPerRobot(this.parent.val.second.gap, this.val.second.gap, this.val.second.robot, false);
		this._cost = new Costs(c1, c2);
	}

	private costPerRobot(src: Vertex, dst:Vertex, r: Robot, isFirst: boolean): number {
		const actualLocation = src.name === r.name ? Model.Instance.origins[isFirst ? 0 : 1] : src.location;
		return actualLocation.distanceFrom(dst.location);
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

	public heuristic(): number[] {
		return this.heuristic2();
	}

	private heuristic1(): number[] {
		return [
			this.val.first.gap.location.distanceFrom(this.val.first.robot.Destination!.location),
			this.val.second.gap.location.distanceFrom(this.val.second.robot.Destination!.location),
		];
	}

	private heuristic2(): number[] {
		const h = this.heuristic1();
		return h.map((h) => 1.5 * h);
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
	let h = n1.heuristic();
	const c1 = Math.max(n1.cost.first + h[0], n1.cost.second + h[1]);
	h = n2.heuristic();
	const c2 = Math.max(n2.cost.first + h[0], n2.cost.second + h[1]);
	// const c1 = Math.max(n1.cost.first + n1.heuristic(n1.val.first), n1.cost.second + n1.heuristic(n1.val.second));
	// const c2 = Math.max(n2.cost.first + n2.heuristic(n2.val.first), n2.cost.second + n2.heuristic(n2.val.second));
	return c1 < c2;
}

interface CableCheckResult {
	/** From the potential node's anchors to the gap it's chasing */
	c1: number;
	/** From the potential node's anchors to their parent's anchors */
	c2: number;
	thereIsNotEnoughCable: boolean;
}