import { fabric } from 'fabric';
import { Entity } from "./entity";
import { GapTreeNode } from "../ds/gap-tree";

const STROKE_WIDTH = 3;

/**
 * This uses a hack for rendering a single shape
 * It goes on a loop for beginning to the end and back to the beginning again
 */
export class Path extends Entity {
	constructor(public solution: GapTreeNode) {
		super(`S-${solution.val.robot.name}`, solution.val.robot.color, new fabric.Polygon(Path.CreateFabricPointArray(solution), {
			fill: solution.val.robot.color,
		}), true);
	}

	public static CreateFabricPointArray(solution: GapTreeNode): fabric.Point[] {
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
}