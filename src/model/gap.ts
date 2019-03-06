import { fabric } from 'fabric';
import { Entity } from './entity';
import { Obstacle } from './obstacle';
import { Robot } from './robot';

const EDGE_LENGTH = 4;
const DEFAULT_COLOR = 'orange';

export interface GapOption {
	robot: Robot;
	obstacle?: Obstacle
}

export class Gap extends Entity {
	constructor(name: string, public location: fabric.Point, public options?: GapOption) {
		super(name, options ? options.robot.options.color : DEFAULT_COLOR, new fabric.Rect({
			left: location.x - (EDGE_LENGTH / 2),
			top: location.y - (EDGE_LENGTH / 2),
			width: EDGE_LENGTH,
			height: EDGE_LENGTH,
			stroke: options ? options.robot.options.color : DEFAULT_COLOR }));
	}
}
