import { fabric } from 'fabric';
import { Entity } from './entity';
import { Obstacle } from './obstacle';
import Model from './model-service';

export interface VertexOption {
	owner?: Obstacle;
	color: string;
	shouldFill?: boolean;
	renderRadius: number;
}

export class Vertex extends Entity {
	constructor(name: string, public location: fabric.Point, public options: VertexOption) {
		super(name, new fabric.Circle({
			radius: options.renderRadius,
			left: location.x - options.renderRadius,
			top: location.y - options.renderRadius,
			fill: options.shouldFill ? options.color : "white",
			stroke: options.color
		}));
	}

	isVisible(other: Vertex): boolean {
		const line = new fabric.Line(undefined, { x1: this.location.x, x2: other.location.x, y1: this.location.y, y2: other.location.y });
		for(let i = 0; i < Object.keys(Model.Instance.Obstacles).length; i++) {
			const o = Model.Instance.Obstacles[i];
			if (this.options.owner && o.name === this.options.owner.name) continue;
			if (line.intersectsWithObject(o.shape)) {
				return false
			}
		}
		return true;
	}
}
