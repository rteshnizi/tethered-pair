import { fabric } from 'fabric';
import { Entity } from './entity';
import { Vertex } from './vertex';

type Vertices = Vertex[];

const VERTEX_COLOR = "purple";
const VERTEX_RADIUS = 3;
const COLOR = "grey";

export class Obstacle extends Entity {
	public vertices: Vertices;
	// TODO: Build list of edges as well
	constructor(name: string, fabricPoints: fabric.Point[]/*, public left: number, public top: number*/) {
		super(name, COLOR, new fabric.Polygon(fabricPoints, {
			fill: COLOR
		}));
		this.vertices = this.createVertices(fabricPoints);
	}

	public createVertices(fabricPoints: fabric.Point[]): Vertices {
		const verts: Vertices = [];
		let i = 1;
		fabricPoints.forEach((p) => {
			verts.push(new Vertex(`${this.name}-${i}`, p, {
				color: VERTEX_COLOR,
				owner: this,
				renderRadius: VERTEX_RADIUS
			}));
		});
		return verts;
	}
}
