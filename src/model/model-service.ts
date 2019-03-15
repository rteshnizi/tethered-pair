import { Entity } from "./entity";
import { Obstacle } from "./obstacle";
import { Robot } from "./robot";
import { Vertex, VertexVisitState } from "./vertex";
import { Destination } from "./destination";
import { forEach } from "lodash";
import { Geometry, Fabric2Pts } from "../utils/geometry";
import { GapTreeNode } from "../ds/gap-tree";
import { SimulationInfoState, SimulationInfo } from "../ui/simulation-info";
import { Path } from "./path";
import { GTNPriorityQueue } from "../ds/priority-queue";
import { DEBUG_LEVEL, PrintDebug } from "../utils/debug";
import { Cable } from "./cable";

type Robots = { [index: number]: Robot };
type Obstacles = { [index: number]: Obstacle };
type Paths = { [robotName: string]: Path };
type SolutionPair = { [robotName: string]: GapTreeNode };
type GapsPQPair = { [robotName: string]: GTNPriorityQueue };

export default class Model {
	// @ts-ignore Assigned in reset()
	public gapsPQPair: GapsPQPair;
	public CONSTANTS = {
		ITERATION_LIMIT: 5000,
		DEPTH_LIMIT: 10,
		DEBUG_LEVEL: DEBUG_LEVEL.L3,
	};
	public ITERATION = 0;
	// @ts-ignore Assigned in reset()
	public simulationInfo: SimulationInfo;
	/** Use addSolutions() to update solutions */
	// @ts-ignore Assigned in reset()
	public Solutions: SolutionPair;
	/** TODO: Cache the max when updating solution so you don't have to find it every time */
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
	/** TODO: Cache the min when updating solution so you don't have to find it every time */
	public getMinSolution(): GapTreeNode | undefined {
		let min: GapTreeNode;
		forEach(this.Solutions, (node) => {
			if (!min || node.cost <= min.cost) {
				min = node;
			}
		});
		// @ts-ignore the forEach assigns it
		return min;
	}

	public addSolutions(node1: GapTreeNode, node2: GapTreeNode): void {
		const update = (n1: GapTreeNode, n2: GapTreeNode) => {
			[n1, n2].forEach((node) => {
				this.Solutions[node.val.robot.name] = node;
			});
		}
		const max = node1.cost >  node2.cost ? node1 : node2;
		const min = node1.cost <= node2.cost ? node1 : node2;
		const currentMax = this.getMaxSolution();
		if (!currentMax || max.cost < currentMax.cost) {
			PrintDebug(`Minimized Max Solution (#${this.ITERATION})`, { level: DEBUG_LEVEL.L3 });
			update(node1, node2);
		} else if (currentMax && max.cost === currentMax.cost) {
			const currentMin = this.getMinSolution();
			if (!currentMin || min.cost < currentMin.cost) {
				PrintDebug(`Max is the same.. Minimized Min Solution (#${this.ITERATION})`, { level: DEBUG_LEVEL.L3 });
				update(node1, node2);
			}
		}
	}

	/** Use this reference to update the progress. Don't use it elsewhere */
	// @ts-ignore Initialized in src\ui\simulation-info.tsx
	private _simulationInfoReactComp: SimulationInfo;
	// @ts-ignore Initialized in src\ui\simulation-info.tsx
	private cachedTotalNodes: number;
	// @ts-ignore Initialized in src\ui\simulation-info.tsx
	private cachedExpandedNodes: number;
	public set simulationInfoReactComp(c: SimulationInfo) {
		this._simulationInfoReactComp = c;
		this.cachedExpandedNodes = c.state.expandedNodes;
		this.cachedTotalNodes = c.state.totalNodes;
	}
	private PROGRESS_UPDATE_MARGIN = 200;

	private static _instance: Model;
	public static get Instance() {
		return Model._instance || (Model._instance = new Model());
	}

	public AllEntities: Map<string, Entity>;

	private robots: Robots;
	public get Robots(): Readonly<Robots> { return this.robots; }

	private obstacles: Obstacles;
	public get Obstacles(): Readonly<Obstacles> { return this.obstacles; }

	/** This maps the `vertex.name` to its index in `this.Vertices` */
	private anchorsMap: Set<string>;
	public isAnchor(v: Vertex): boolean {
		// The line below is just to ensure we have populated the set.
		this.Anchors;
		return this.anchorsMap.has(v.name);
	}

	private anchors?: Vertex[];
	public get Anchors(): Vertex[] {
		if (this.anchors) return this.anchors;
		if (this.Robots[0].Destination === null) return [];
		if (this.Robots[1].Destination === null) return [];
		this.anchors = [];
		this.Vertices.forEach((v, ind) => {
			// @ts-ignore there is a null check above that TS is not seeing
			if (v.canAnchor(this.Robots[0].Destination, this.Robots[1].Destination, this.CableLength)) {
				this.anchorsMap.add(v.name);
				v.setAsGlobalAnchor();
				// @ts-ignore anchors is set above
				this.anchors.push(v);
			}
		});
		return this.anchors;
	}

	// @ts-ignore Assigned in reset()
	public SolutionPaths: Paths;
	public CablePath: Cable | undefined;

	private _cableLength: number;
	public set CableLength(l: number) { this._cableLength = l; }
	public get CableLength(): number { return this._cableLength; }

	private cable: Vertex[];
	private vertices: Vertex[] | null;
	/** Does not include Destinations and Robots */
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
		// TODO: Not sure if this is needed
		Geometry.SortPointsClockwise(boundingBoxPoints);
		const poly = Fabric2Pts.PolygonFabricPoints(boundingBoxPoints);
		let verts: Vertex[] = [];
		forEach(this.Obstacles, (o) => {
			if (o.fabricPoints.some((p) => Geometry.IsPointInsidePolygon(p, poly))) {
				verts = verts.concat(o.vertices);
			}
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
		this.anchorsMap = new Set();
		this.reset();
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
		this.removeObstacle(ind);
		this.obstacles[ind] = o;
	}

	/** I know you are reading this. So listen, make it happen okay? */
	public removeObstacle(ind: number): void {
		if (this.obstacles[ind]) {
			this.obstacles[ind].vertices.forEach((v) => { v.remove(); })
			this.obstacles[ind].remove();
		}
	}

	// TODO: Enhance this, this can use a map
	public getVertexByLocation(p: fabric.Point): Vertex | undefined {
		for (const v of this.Vertices) {
			if (p.eq(v.location)) return v;
		}
		if (p.eq(this.Robots[0].location)) return this.Robots[0];
		if (p.eq(this.Robots[1].location)) return this.Robots[1];
		return undefined;
	}

	// public simulationInfoIncreaseTotalNodes(): void {
	// 	this.cachedTotalNodes++;
	// 	if (this.cachedTotalNodes - this._simulationInfoReactComp.state.totalNodes > this.PROGRESS_UPDATE_MARGIN) {
	// 		this._simulationInfoReactComp.setState({
	// 			totalNodes: this.cachedTotalNodes,
	// 		});
	// 	}
	// }

	// public simulationInfoIncreaseExpandedNodes(): void {
	// 	this.cachedExpandedNodes++;
	// 	if (this.cachedExpandedNodes - this._simulationInfoReactComp.state.expandedNodes > this.PROGRESS_UPDATE_MARGIN) {
	// 		this._simulationInfoReactComp.setState({
	// 			totalNodes: this.cachedExpandedNodes,
	// 		});
	// 	}
	// }

	public foundSolution(): boolean {
		return !!this.Solutions[this.Robots[0].name] && !!this.Solutions[this.Robots[1].name];
	}

	public reset(): void {
		forEach(this.Robots, (r) => {
			r.reset();
			r.Destination!.setVisitState(r, VertexVisitState.UNVISITED);
			this.Vertices.forEach((v) => {
				v.setVisitState(r, VertexVisitState.UNVISITED);
			});
		});
		forEach(this.SolutionPaths, (path) => {
			path.remove();
		});
		if (this.CablePath) {
			this.CablePath.remove();
		}
		this.CablePath = undefined;
		this.SolutionPaths = {};
		this.Solutions = {};
		this.gapsPQPair = {};
		this.ITERATION = 0;
	}
}
