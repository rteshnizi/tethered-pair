import { fabric } from 'fabric';
import { Entity } from './entity';
import { Obstacle } from './obstacle';
import Model from './model-service';
import { Edge } from './edge';
import Renderer from '../viewer/renderer-service';

const DEFAULT_FILL = 'rgba(0,0,0,0)';

export interface VertexOption {
	owner?: Obstacle;
	color: string;
	shouldFill?: boolean;
	renderRadius: number;
}

export class Vertex extends Entity {
	constructor(name: string, public location: fabric.Point, public options: VertexOption) {
		super(name, options.color, new fabric.Circle({
			radius: options.renderRadius,
			left: location.x - options.renderRadius,
			top: location.y - options.renderRadius,
			fill: options.shouldFill ? options.color : DEFAULT_FILL,
			stroke: options.color
		}));
	}

	isVisible(other: Vertex): boolean {
		let isVis = true;
		const line = new Edge(`${this.name}<->${other.name}`, this, other);
		const numObs = Object.keys(Model.Instance.Obstacles).length;
		let i = 0;
		for(; i < numObs; i++) {
			const o = Model.Instance.Obstacles[i];
			if (i > 0) Model.Instance.Obstacles[i - 1].deselect();
			o.select();
			if (this.options.owner && o.name === this.options.owner.name) continue;
			if (line.shape.intersectsWithObject(o.shape)) {
				isVis = false;
				line.remove();
				break;
			}
		}
		Model.Instance.Obstacles[i === numObs ? i - 1 : i].deselect();
		return isVis;
	}
}
