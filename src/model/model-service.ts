import { Robot } from "./robot";
import { Entity } from "./entity";

export default class Model {
	private static _instance: Model;
	public static get Instance() {
		return Model._instance || (Model._instance = new Model());
	}

	private robots: { [index: number]: Robot };

	private constructor() {
		this.robots = {};
	}

	public setRobot(r: Robot, ind: 1 | 2): void {
		if (this.robots[ind]) {
			this.robots[ind].remove();
		}
		this.robots[ind] = r;
	}
}
