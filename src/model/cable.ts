import { fabric } from 'fabric';
import { Entity } from "./entity";
import { GapTreeNode } from "../ds/gap-tree";
import Model from './model-service';
import { GapTreePairNode } from '../ds/gap-tree-pair';
import { Vertex } from './vertex';
import * as FabricUtils from '../utils/fabric';

const STROKE_WIDTH = 4;
const CABLE_COLOR = "DarkGreen";

/**
 * This uses a hack for rendering a single shape
 * It goes on a loop for beginning to the end and back to the beginning again
 */
export class Cable extends Entity {
	/**
	 * @param solution Solution to R1, we obtain solution to R0 ourselves in here
	 */
	private constructor(public solution: fabric.Point[]) {
		super(`cable`, CABLE_COLOR, new fabric.Polygon(solution, {
			fill: CABLE_COLOR,
		}), true);
	}

	private static createCablePoints(oneWay: fabric.Point[]): fabric.Point[] {
		const points: fabric.Point[] = [];
		for (let i = 0; i < oneWay.length; i++) {
			points.push(oneWay[i]);
		}
		for (let i = oneWay.length - 1; i >= 0; i--) {
			points.push(new fabric.Point(oneWay[i].x + STROKE_WIDTH, oneWay[i].y + STROKE_WIDTH));
		}
		return points;
	}

	/**
	 * @param solution Solution to R1
	 */
	private static CreateFabricPointArrayFromGapTreeNode(solution: GapTreeNode): fabric.Point[] {
		// we start from R1 and then append R0 to the other end
		let oneWay: fabric.Point[] = [Model.Instance.Robots[1].Destination!.location];
		let section: fabric.Point[];
		section = Cable.CreateFabricPointArrayForOneRobotGTN(solution);
		oneWay = oneWay.concat(section);
		// we need to reverse R0 section before appending to the other section
		section = Cable.CreateFabricPointArrayForOneRobotGTN(solution.parent).reverse();
		oneWay = oneWay.concat(section);
		// Now we append R0
		oneWay.push(Model.Instance.Robots[0].Destination!.location);
		return this.createCablePoints(oneWay);
	}

	private static CreateFabricPointArrayForOneRobotGTN(solution: GapTreeNode | undefined): fabric.Point[] {
		const oneWay: fabric.Point[] = [];
		while (solution) {
			if (solution.anchor) {
				oneWay.push(solution.anchor.location);
			}
			solution = solution.parent;
			if (!solution) break;
			solution = solution.parent;
		}
		return oneWay;
	}

	public static CreateFromGapTreeNode(solution: GapTreeNode): Cable {
		return new Cable(this.CreateFabricPointArrayFromGapTreeNode(solution));
	}

	/**
	 * @param solution Solution to R1
	 */
	private static CreateFabricPointArrayFromGapTreePairNode(solution: GapTreePairNode): fabric.Point[] {
		// we start from R1 and then append R0 to the other end
		let oneWay: fabric.Point[] = [Model.Instance.Robots[1].Destination!.location];
		const points: fabric.Point[] = [];
		let section: fabric.Point[];
		section = Cable.CreateFabricPointArrayForOneRobotGTPN(solution, false);
		oneWay = oneWay.concat(section);
		// we need to reverse R0 section before appending to the other section
		section = Cable.CreateFabricPointArrayForOneRobotGTPN(solution, true).reverse();
		oneWay = oneWay.concat(section);
		// Now we append R0
		oneWay.push(Model.Instance.Robots[0].Destination!.location);
		return this.createCablePoints(oneWay);
	}

	private static CreateFabricPointArrayForOneRobotGTPN(solution: GapTreePairNode | undefined, isFirst: boolean): fabric.Point[] {
		const oneWay: fabric.Point[] = [];
		while (solution) {
			const anchor = isFirst ? solution.val.first.anchor : solution.val.second.anchor;
			if (anchor) {
				oneWay.push(anchor.location);
			}
			solution = solution.parent;
		}
		return oneWay;
	}

	public static CreateFromGapTreePairNode(solution: GapTreePairNode): Cable {
		return new Cable(this.CreateFabricPointArrayFromGapTreePairNode(solution));
	}

	public static CreateFromVerts(verts: Vertex[]) {
		return new Cable(this.createCablePoints(FabricUtils.GetFabricPointsFromVertexArray(verts)));
	}
}
