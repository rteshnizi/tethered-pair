import { fabric } from 'fabric';
import { EntityWithLocation } from './entity';
import { Obstacle } from './obstacle';
import Model from './model-service';
import { Edge } from './edge';
import { Geometry } from '../utils/geometry';
import { Robot } from './robot';

const DEFAULT_FILL = 'rgba(0,0,0,0)';
const ANCHOR_FILL = 'DarkGreen';

export enum VertexVisitState {
	UNVISITED,
	VISITING,
	VISITED,
}

export interface VertexOption {
	owner?: Obstacle;
	color: string;
	shouldFill?: boolean;
	fillColor?: string;
	renderRadius: number;
}

export class VertexPair {
	constructor(public v1: Vertex, public v2: Vertex) {}
}

export interface VisibilityResult {
	obstacle: Obstacle;
	edges: VertexPair[];
}

export class Vertex extends EntityWithLocation {
	/** One State per Robot */
	private _visitState: { [robotName: string]: VertexVisitState };
	public setVisitState(r: Robot, state: VertexVisitState): void { this._visitState[r.name] = state; }
	public getVisitState(r: Robot): VertexVisitState { return this._visitState[r.name]; }

	constructor(name: string, location: fabric.Point, public options: VertexOption) {
		super(name, location, options.color, new fabric.Circle({
			radius: options.renderRadius,
			left: location.x - options.renderRadius,
			top: location.y - options.renderRadius,
			fill: options.shouldFill ? (options.fillColor ? options.fillColor : options.color) : DEFAULT_FILL,
			stroke: options.color
		}), true);
		this._visitState = {};
	}

	/**
	 * @param other The target vertex to check visibility for from this vertex
	 * @param results If provided, you will get additional information back in the array if the return value is false
	 */
	public isVisible(other: Vertex, results?: VisibilityResult[]): boolean {
		let isVis = true;
		const edge = new Edge(`${this.name}<->${other.name}`, this, other);
		const numObs = Object.keys(Model.Instance.Obstacles).length;
		let i = 0;
		for (; i < numObs; i++) {
			const o = Model.Instance.Obstacles[i];
			// if (i > 0) Model.Instance.Obstacles[i - 1].deselect();
			// o.select();
			if (Geometry.IntersectEdgeAndObstacle(edge, o)) {
				isVis = false;
				if (results) {
					const edges = o.getIntersectingEdges(edge);
					results.push({
						obstacle: o,
						edges
					});
				} else {
					break;
				}
			}
		}
		edge.remove();
		// Model.Instance.Obstacles[i === numObs ? i - 1 : i].deselect();
		return isVis;
	}

	public isOwnedBy(o: Obstacle): boolean {
		// fast check
		if (!!this.options.owner && (o.name === this.options.owner.name)) return true;
		// detailed check
		// @ts-ignore @types is wrong for these functions
		return o.fabricPoints.some((p) => this.location.eq(p));
	}

	/** A very simple check whether the sum of distances from the two given destinations is less than or cableLength */
	public canAnchor(dest1: Vertex, dest2: Vertex, cableLength: number): boolean {
		// this.select();
		return (this.location.distanceFrom(dest1.location) + this.location.distanceFrom(dest2.location)) <= cableLength;
		// this.deselect();
	}

	/** Whether we can possibly anchor around this point to get to the destinations */
	public get isGlobalAnchor(): boolean {
		return Model.Instance.isAnchor(this);
	}

	/** This is just a visualization. Does not change Object's properties. */
	public setAsGlobalAnchor(): void {
		this.shape.set('fill', ANCHOR_FILL);
	}
}
