import { fabric } from 'fabric';
import Model from './model-service';
import { forEach } from 'lodash';
import { Vertex } from './vertex';
import Renderer from '../viewer/renderer-service';
import { Gap } from './gap';
import { Destination } from './destination';
import { Geometry } from '../utils/geometry';

const RENDER_RADIUS = 5;

export class Robot extends Vertex {
	private _renderedGaps: Gap[];
	public gaps: Vertex[];
	private _destination: Destination | null;
	public set Destination(d: Destination | null) {
		if (this._destination) {
			this._destination.remove();
		}
		this._destination = d;
	}
	public get Destination(): Destination | null {
		return this._destination;
	}

	constructor(name: string, public location: fabric.Point, color: string) {
		super(name, location, {
			color,
			shouldFill: true,
			renderRadius: RENDER_RADIUS
		});
		this._destination = null;
		this.gaps = [];
		this._renderedGaps = [];
	}

	public findGaps(): void {
		this.clearGaps();
		this.gaps = [];
		const checkGap = (vert: Vertex) => {
			if (vert.isVisible(this) && vert.options.owner && Geometry.IsVertexAGap(this, vert, vert.options.owner)) {
				this._renderedGaps.push(new Gap(`${this.name}-${this.gaps.length + 1}`, vert.location, { robot: this }));
				this.gaps.push(vert);
			}
		};
		if (this.Destination) {
			checkGap(this.Destination);
		}
		Model.Instance.Vertices.forEach((vert) => { checkGap(vert); });
	}

	public renderGaps(): void {
		this._renderedGaps.forEach((gap) => { Renderer.Instance.addEntity(gap); });
	}

	public clearGaps(): void {
		this._renderedGaps.forEach((gap) => { Renderer.Instance.removeEntity(gap); });
	}

}
