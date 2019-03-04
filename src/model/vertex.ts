import { fabric } from 'fabric';
import { Entity } from './entity';

const RADIUS = 2;

export class Vertex extends Entity {
	constructor(name: string, location: fabric.Point, color: string) {
		super(name, new fabric.Circle({
			radius: RADIUS,
			left: location.x - RADIUS,
			top: location.y - RADIUS,
			fill: color
		}));
	}
}
