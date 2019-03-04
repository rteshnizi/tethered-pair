import { Robot } from "./robot";
import { Entity } from "./entity";
import { Obstacle } from "./obstacle";

export default class Model {
	private static _instance: Model;
	public static get Instance() {
		return Model._instance || (Model._instance = new Model());
	}

	private robots: { [index: number]: Robot };
	private obstacles: { [index: number]: Obstacle };

	private constructor() {
		this.robots = {};
		this.obstacles = {};
	}

	public setRobot(r: Robot, ind: 1 | 2): void {
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
}
