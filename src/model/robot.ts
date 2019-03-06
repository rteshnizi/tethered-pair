import { fabric } from 'fabric';
import Model from './model-service';
import { forEach } from 'lodash';
import { Vertex } from './vertex';
import Renderer from '../viewer/renderer-service';
import { Gap } from './gap';
import { Destination } from './destination';

const RENDER_RADIUS = 5;

export class Robot extends Vertex {
	private gaps: Gap[];
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
	}

	public findGaps(): Gap[] {
		const gaps: Gap[] = [];
		const checkGap = (vert: Vertex) => {
			if (vert.isVisible(this)) {
				gaps.push(new Gap(`${this.name}-${gaps.length + 1}`, vert.location, { robot: this }));
			}
		};
		if (this.Destination)
			checkGap(this.Destination);
		forEach(Model.Instance.Obstacles, (obs) => {
			obs.vertices.forEach(checkGap);
		});
		return gaps;
	}

	public renderGaps(): void {
		this.gaps.forEach((gap) => { Renderer.Instance.addEntity(gap); });
	}

	public clearGaps(): void {
		this.gaps.forEach((gap) => { Renderer.Instance.removeEntity(gap); });
	}

}
