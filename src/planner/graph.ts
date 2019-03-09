import { Vertex } from '../model/vertex';

export class VisibilityGraph {
	public edges: Map<Vertex, Set<Vertex>>;
	constructor(public vertices: Vertex[]) {
		this.edges = new Map();
		this.buildEdges();
	}

	private buildEdges(): void {
		for (let i = 0; i < this.vertices.length; i++) {
			const v1 = this.vertices[i];
			for (let j = i + 1; j < this.vertices.length; j++) {
				const v2 = this.vertices[j];
				if (v1.isVisible(v2)) {
					this.makeSetIfNeeded(v1);
					this.makeSetIfNeeded(v2);
					this.edges.get(v1)!.add(v2);
					this.edges.get(v2)!.add(v1);
				}
			}
		}
	}

	private makeSetIfNeeded(v: Vertex): void {
		if (this.edges.has(v)) return;
		this.edges.set(v, new Set());
	}

	public hasEdge(v1: Vertex, v2: Vertex): boolean {
		if (!this.edges.has(v1)) return false;
		if (this.edges.get(v1)!.has(v2)) return true;
		return false;
	}
}
