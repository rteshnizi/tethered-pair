import { fabric } from 'fabric';
import { Entity } from './entity';
import { Vertex } from './vertex';

const STROKE_WIDTH = 2;
const COLOR = 'DarkGreen';

export class Edge extends Entity {
	constructor(name: string, public v1: Vertex, public v2: Vertex) {
		// https://github.com/fabricjs/fabric.js/blob/master/src/shapes/line.class.js#L67
		// Very confusing
		super(name, COLOR, new fabric.Line([
			v1.location.x,
			v1.location.y,
			v2.location.x,
			v2.location.y,
		], {
			stroke: COLOR,
			strokeWidth: STROKE_WIDTH,
		}));
	}
}
