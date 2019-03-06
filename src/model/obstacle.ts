import { fabric } from 'fabric';
import { Entity } from './entity';
import { Vertex } from './vertex';

type Vertices = Vertex[];

const VERTEX_COLOR = "purple";
const VERTEX_RADIUS = 3;

export class Obstacle extends Entity {
	public vertices: Vertices;
	// TODO: Build list of edges as well
	constructor(name: string, fabricPoints: fabric.Point[]/*, public left: number, public top: number*/) {
		super(name, new fabric.Polygon(fabricPoints, {
			// left,
			// top,
			fill: "grey"
		}));
		this.vertices = this.createVertices(fabricPoints);
	}

	public createVertices(fabricPoints: fabric.Point[]): Vertices {
		const verts: Vertices = [];
		let i = 1;
		fabricPoints.forEach((p) => {
			verts.push(new Vertex(`${this.name}-${i}`, p, VERTEX_COLOR, false, VERTEX_RADIUS));
		});
		return verts;
	}
}
