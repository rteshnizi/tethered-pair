import { fabric } from 'fabric';
import { Vertex } from './vertex';

const RENDER_RADIUS = 5;

export class Destination extends Vertex {
	constructor(name: string, location: fabric.Point, color: string) {
		super(name, location, { color, renderRadius: RENDER_RADIUS });
	}
}
