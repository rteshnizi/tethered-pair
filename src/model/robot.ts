import { fabric } from 'fabric';
import Model from './model-service';
import { forEach } from 'lodash';
import { Vertex, VertexVisitState } from './vertex';
import Renderer from '../viewer/renderer-service';
import { Gap } from './gap';
import { Destination } from './destination';
import { Geometry } from '../utils/geometry';

const RENDER_RADIUS = 5;

export class Robot extends Vertex {
	private _renderedGaps: Gap[];
	public gaps: Vertex[];
	/** Holds the `names`s of the visited vertices */
	private visited: Set<string>;

	private _destination: Destination | null;
	public set Destination(d: Destination | null) {
		if (this._destination) {
			this._destination.remove();
		}
		this._destination = d;
	}
	public get Destination(): Destination | null { return this._destination; }


	constructor(name: string, public location: fabric.Point, color: string) {
		super(name, location, {
			color,
			shouldFill: true,
			renderRadius: RENDER_RADIUS
		});
		this._destination = null;
		this.gaps = [];
		this._renderedGaps = [];
		this.visited = new Set();
	}

	public reset(): void {
		this.gaps = [];
		this.visited.clear();
		this.clearGaps();
		this._renderedGaps = [];
	}

	public findGaps(): void {
		this.clearGaps();
		this.gaps = [];
		const checkGap = (vert: Vertex, _ind: number, _arr: Vertex[]) => {
			if (vert.getVisitState(this) !== VertexVisitState.UNVISITED) return; // Don't fall into a cycle
			if (!vert.isVisible(this)) return;
			// If it doesn't have owner, then it's a destination in which case we don't need to check for being a gap
			if (vert.options.owner && !Geometry.IsVertexAGap(this, vert, vert.options.owner)) return;

			// this._renderedGaps.push(new Gap(`${this.name}-${this.gaps.length + 1}`, vert.location, { robot: this }));
			this.gaps.push(vert);
		};
		// If already at destination don't look for more gaps because where are you gonna go silly?
		if (this.Destination && this.location.eq(this.Destination.location)) {
			this.gaps.push(this.Destination);
			return;
		}
		if (this.Destination) {
			checkGap(this.Destination, 0, []);
		}
		Model.Instance.getVerticesInBoundingBox().forEach(checkGap);
	}

	public addVertToVisited(v: Vertex): void {
		this.visited.add(v.name);
	}

	public removeVertFromVisited(v: Vertex): void {
		this.visited.delete(v.name);
	}

	// public hasVisited(v: Vertex): boolean {
	// 	return this.visited.has(v.name);
	// }

	public renderGaps(): void {
		this._renderedGaps.forEach((gap) => { Renderer.Instance.addEntity(gap); });
	}

	public clearGaps(): void {
		this._renderedGaps.forEach((gap) => { Renderer.Instance.removeEntity(gap); });
	}

}
