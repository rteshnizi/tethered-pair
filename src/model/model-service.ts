import { Entity } from "./entity";
import { Obstacle } from "./obstacle";
import { Robot } from "./robot";
import { Vertex } from "./vertex";

export default class Model {
	private static _instance: Model;
	public static get Instance() {
		return Model._instance || (Model._instance = new Model());
	}

	private robots: { [index: number]: Robot };
	private obstacles: { [index: number]: Obstacle };
	private _cableLength: number;
	public set cableLength(l: number) { this._cableLength = l; }
	private cable: Vertex[];

	private constructor() {
		this.robots = {};
		this.obstacles = {};
		this._cableLength = 0;
		this.cable = [];
	}

	public setRobot(r: Robot, ind: 0 | 1): void {
		if (this.robots[ind]) {
			this.robots[ind].remove();
		}
		this.robots[ind] = r;
	}

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
}
