import { Entity } from "./entity";
import { Obstacle } from "./obstacle";
import { Robot } from "./robot";
import { Vertex, VertexVisitState } from "./vertex";
import { Destination } from "./destination";
import { forEach } from "lodash";
import { Geometry, Fabric2Pts } from "../utils/geometry";
import { GapTreeNode } from "../ds/gap-tree";

type Robots = { [index: number]: Robot };
type Obstacles = { [index: number]: Obstacle };
type SolutionPair = { [robotName: string]: GapTreeNode };

export default class Model {
	/** Use addSolutions() to update solutions */
	public Solutions: SolutionPair;
	public getMaxSolution(): GapTreeNode | undefined {
		let max: GapTreeNode;
		forEach(this.Solutions, (node) => {
			if (!max || node.cost > max.cost) {
				max = node;
			}
		});
		// @ts-ignore the forEach assigns it
		return max;
	}
	public addSolutions(node1: GapTreeNode, node2: GapTreeNode): void {
		const max = node1.cost > node2.cost ? node1 : node2;
		const currentMax = this.getMaxSolution();
		if (!currentMax || max.cost < currentMax.cost) {
			console.log("Minimized Max Solution");
			[node1, node2].forEach((node) => {
				this.Solutions[node.val.robot.name] = node;
			});
		}
	}

	private static _instance: Model;
	public static get Instance() {
		return Model._instance || (Model._instance = new Model());
	}

	public AllEntities: Map<string, Entity>;

	private robots: Robots;
	public get Robots(): Readonly<Robots> { return this.robots; }

	private obstacles: Obstacles;
	public get Obstacles(): Readonly<Obstacles> { return this.obstacles; }

	private anchors?: Vertex[];
	public get Anchors(): Vertex[] {
		const d1 = this.Robots[0].Destination;
		const d2 = this.Robots[1].Destination;
		if (!d1 || !d2) return [];
		if (this.anchors) return this.anchors;
		this.anchors = [];
		this.Vertices.forEach((v) => {
			if (v.canAnchor(d1, d2, this.CableLength)) {
				v.setAsAnchor();
				// @ts-ignore anchors is set above
				this.anchors.push(v);
			}
		});
		return this.anchors;
	}

	private _cableLength: number;
	public set CableLength(l: number) { this._cableLength = l; }
	public get CableLength(): number { return this._cableLength; }

	private cable: Vertex[];
	private vertices: Vertex[] | null;
	public get Vertices(): Vertex[] {
		if (!this.vertices) {
			this.vertices = [];
			forEach(this.Obstacles, (obs) => {
				// @ts-ignore we set vertices up there
				obs.vertices.forEach((vert) => { this.vertices.push(vert); });
			});
		}
		return this.vertices;
	}

	/**
	 * This method returns the vertices of the obstacles that are inside or partially inside the bounding box
	 * made by the two robot and their respective destination.
	 */
	public getVerticesInBoundingBox(): Vertex[] {
		const boundingBoxPoints = [
			this.Robots[0].location,
			this.Robots[1].location,
			this.Robots[1].Destination!.location,
			this.Robots[0].Destination!.location,
		];
		const poly = Fabric2Pts.PolygonFabricPoints(boundingBoxPoints);
		let verts: Vertex[] = [];
		forEach(this.Obstacles, (o) => {
			o.fabricPoints.some((p) => Geometry.IsPointInsidePolygon(p, poly));
			verts = verts.concat(o.vertices);
		});
		return verts;
	}

	private constructor() {
		this.robots = {};
		this.obstacles = {};
		this._cableLength = 0;
		this.cable = [];
		this.vertices = null;
		this.AllEntities = new Map();
		this.Solutions = {};
	}

	/** This method is used when building initial config when user changes size and location of robots */
	public setRobot(r: Robot, ind: 0 | 1): void {
		if (this.robots[ind]) {
			this.robots[ind].remove();
		}
		this.robots[ind] = r;
	}

	/** This method is used when building initial config when user changes size and location of obstacles */
	public setObstacle(o: Obstacle, ind: number): void {
		if (this.obstacles[ind]) {
			this.obstacles[ind].remove();
		}
		this.obstacles[ind] = o;
	}

	public removeObstacle(ind: number): void {
		if (this.obstacles[ind]) {
			this.obstacles[ind].remove();
			delete this.obstacles[ind];
		}
	}

	public reset(): void {
		forEach(this.Robots, (r) => {
			r.reset();
			r.Destination!.setVisitState(r, VertexVisitState.UNVISITED);
			this.Vertices.forEach((v) => {
				v.setVisitState(r, VertexVisitState.UNVISITED);
			});
		});
		this.Solutions = {};
	}
}
