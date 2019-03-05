import { fabric } from 'fabric';
import { Vertex } from './vertex';

export class Destination extends Vertex {
	constructor(name: string, location: fabric.Point, color: string) {
		super(name, location, color);
	}
}
