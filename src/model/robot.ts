import { fabric } from 'fabric';
import { Entity } from './entity';

const ROBOT_RENDER_RADIUS = 5;

export class Robot extends Entity {
	constructor(name: string, location: fabric.Point, color: string) {
		super(name, new fabric.Circle({
			radius: ROBOT_RENDER_RADIUS,
			left: location.x - 5,
			top: location.y - 5,
			fill: color
		}));
	}
}