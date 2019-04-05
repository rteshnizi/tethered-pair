import { fabric } from 'fabric';
import { Entity } from "./entity";
import { GapTreeNode } from "../ds/gap-tree";
import { GapTreePairNode } from '../ds/gap-tree-pair';
import { Robot } from './robot';

const STROKE_WIDTH = 3;

/**
 * This uses a hack for rendering a single shape
 * It goes on a loop for beginning to the end and back to the beginning again
 */
export class Path extends Entity {
	private constructor(rName: string, rColor: string, public solution: fabric.Point[]) {
		super(`S-${rName}`, rColor, new fabric.Polygon(solution, {
			fill: rColor,
		}), true);
	}

	private static CreateFabricPointArrayFromGapTreeNode(solution: GapTreeNode): fabric.Point[] {
		const oneWay: fabric.Point[] = [];
		const points: fabric.Point[] = [];
		let node: GapTreeNode | undefined = solution;
		while (node) {
			oneWay.push(node.val.gap.location);
			node = node.parent;
			if (!node) break;
			node = node.parent;
		}
		for (let i = 0; i < oneWay.length; i++) {
			points.push(oneWay[i]);
		}
		for (let i = oneWay.length - 1; i >= 0; i--) {
			points.push(new fabric.Point(oneWay[i].x + STROKE_WIDTH, oneWay[i].y));
		}
		return points;
	}

	private static CreateFabricPointArrayFromGapTreePairNode(solution: GapTreePairNode, isFirst: boolean): fabric.Point[] {
		const oneWay: fabric.Point[] = [];
		const points: fabric.Point[] = [];
		let node: GapTreePairNode | undefined = solution;
		while (node) {
			const loc = isFirst ? node.val.first.gap.location : node.val.second.gap.location;
			oneWay.push(loc);
			node = node.parent;
		}
		for (let i = 0; i < oneWay.length; i++) {
			points.push(oneWay[i]);
		}
		for (let i = oneWay.length - 1; i >= 0; i--) {
			points.push(new fabric.Point(oneWay[i].x + STROKE_WIDTH, oneWay[i].y));
		}
		return points;
	}

	public static CreateFromGapTreeNode(solution: GapTreeNode): Path {
		return new Path(solution.val.robot.name, solution.val.robot.color, this.CreateFabricPointArrayFromGapTreeNode(solution));
	}

	public static CreateFromGapTreePairNode(solution: GapTreePairNode, isFirst: boolean): Path {
		const r = isFirst ? solution.val.first.robot : solution.val.second.robot;
		return new Path(r.name, r.color, this.CreateFabricPointArrayFromGapTreePairNode(solution, isFirst));
	}
}
