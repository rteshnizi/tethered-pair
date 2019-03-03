import { fabric } from "fabric";
import { Robot } from "./robot";
import { Entity } from "./entity";

class Model {
	public robot1: Robot;
	public robot2: Robot;

	constructor() {
		this.robot1 = new Robot("R1", new fabric.Point(100, 50), "red");
		this.robot2 = new Robot("R2", new fabric.Point(80, 250), "green");
	}

	public Robots(): Robot[] {
		return [this.robot1, this.robot2];
	}
}

export default new Model();