import { fabric } from 'fabric';
import { Entity } from './entity';

export class Obstacle extends Entity {
	constructor(name: string, public vertices: fabric.Point[]/*, public left: number, public top: number*/) {
		super(name, new fabric.Polygon(vertices, {
			// left,
			// top,
			fill: "grey"
		}));
	}
}