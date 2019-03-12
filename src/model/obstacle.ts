import { fabric } from 'fabric';
import { Entity } from './entity';
import { Vertex } from './vertex';
import { Edge } from './edge';

type Vertices = Vertex[];

const VERTEX_COLOR = "purple";
const VERTEX_RADIUS = 3;
const COLOR = "grey";

/**
 * Assumes the vertices passed in are sorted
 * TODO: sort vertices inside the ctor instead of the viewier
 */
export class Obstacle extends Entity {
	public vertices: Vertices;
	// public edges: Edge[];
	// TODO: Build list of edges as well -> Use Geometry function
	constructor(name: string, public fabricPoints: fabric.Point[]/*, public left: number, public top: number*/) {
		super(name, COLOR, new fabric.Polygon(fabricPoints, {
			fill: COLOR
		}), true);
		this.vertices = this.createVertices(fabricPoints);
		// this.edges = this.createEdges();
	}

	private createVertices(fabricPoints: fabric.Point[]): Vertices {
		const verts: Vertices = [];
		let i = 1;
		fabricPoints.forEach((p) => {
			verts.push(new Vertex(`${this.name}-${i++}`, p, {
				color: VERTEX_COLOR,
				owner: this,
				renderRadius: VERTEX_RADIUS
			}));
		});
		return verts;
	}

	// private createEdges(): Edge[] {
	// 	const edges: Edge[] = [];
	// 	for (let i = 1; i < this.vertices.length; i++) {
	// 		const v1 = this.vertices[i - 1];
	// 		const v2 = this.vertices[i];
	// 		edges.push(new Edge(`${this.name}-${v1.name}${v2.name}`, v1, v2));
	// 	}
	// 	return edges;
	// }

	/** Checks whether this edge lies on the boundary of the obstacle */
	// We don't need to calculate the edges for this because the list of vertices are sorted.
	// TODO: If we cache the edges using a map this can have performance enhancement
	public isMyEdge(edge: Edge): boolean {
		for (let i = 1; i < this.vertices.length; i++) {
			if (this.isItThisEdge(edge, i - 1, i)) return true;
		}
		// check the last edge
		if (this.isItThisEdge(edge, this.vertices.length - 1, 0)) return true;
		return false;
	}

	private isItThisEdge(edge: Edge, v1Ind: number, v2Ind: number): boolean {
		const v1 = this.vertices[v1Ind];
		const v2 = this.vertices[v2Ind];
		if (edge.v1.location.eq(v1.location) && edge.v2.location.eq(v2.location)) return true;
		if (edge.v2.location.eq(v1.location) && edge.v1.location.eq(v2.location)) return true;
		return false;
	}
}
