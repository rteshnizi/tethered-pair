import { fabric } from 'fabric';
import { Entity } from './entity';

export class Vertex extends Entity {
	constructor(name: string, public location: fabric.Point, color: string, shouldFill: boolean, private renderRadius: number) {
		super(name, new fabric.Circle({
			radius: renderRadius,
			left: location.x - renderRadius,
			top: location.y - renderRadius,
			fill: shouldFill ? color : "white",
			stroke: color
		}));
	}
}
