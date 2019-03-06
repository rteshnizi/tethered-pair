import { fabric } from 'fabric';
import Model from './model-service';
import { forEach } from 'lodash';
import { Vertex } from './vertex';

const RENDER_RADIUS = 5;

export class Robot extends Vertex {
	constructor(name: string, public location: fabric.Point, color: string) {
		super(name, location, color, true, RENDER_RADIUS);
	}

	getGaps(): Vertex[] {
		const gaps: Vertex[] = [];
		forEach(Model.Instance.Obstacles, (obs) => {
			obs.vertices.forEach((vert) => {
				const line = new fabric.Line(undefined, { x1: this.location.x, x2: vert.location.x, y1: this.location.y, y2: vert.location.y });
				let shouldAdd = true;
				for(let i = 0; i < Object.keys(Model.Instance.Obstacles).length; i++) {
					const o = Model.Instance.Obstacles[i];
					if (o.name === obs.name) continue;
					if (line.intersectsWithObject(o.shape)) {
						shouldAdd = false;
						break;
					}
				}
				if (shouldAdd) {
					gaps.push(vert);
				}
			});
		});
		return gaps;
	}
}
