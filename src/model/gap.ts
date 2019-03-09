import { fabric } from 'fabric';
import { EntityWithLocation } from './entity';
import { Obstacle } from './obstacle';
import { Robot } from './robot';

const EDGE_LENGTH = 6;
const DEFAULT_COLOR = 'orange';

export interface GapOption {
	robot: Robot;
	obstacle?: Obstacle;
}

/** For Visualization ONLY */
export class Gap extends EntityWithLocation {
	/** Only used in sorting */
	public angle: number;
	constructor(name: string, location: fabric.Point, public options?: GapOption) {
		super(name, location,
			options ? options.robot.options.color : DEFAULT_COLOR,
			new fabric.Rect({
				left: location.x - (EDGE_LENGTH / 2),
				top: location.y - (EDGE_LENGTH / 2),
				width: EDGE_LENGTH,
				height: EDGE_LENGTH,
				fill: 'rgba(0,0,0,0)',
				stroke: options ? options.robot.options.color : DEFAULT_COLOR ,
			}),
			false);
		this.angle = NaN;
	}
}
