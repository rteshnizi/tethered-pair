import { Vertex } from "../model/vertex";
import { Robot } from "../model/robot";

export class LabeledGap {
	constructor(public gap: Vertex, public robot: Robot, public anchor: Vertex | undefined) { }

	public eq(other: LabeledGap): boolean {
		// we don't need to check the robots because first always belongs to R0 and second to R1
		if (this.gap.name !== other.gap.name) return false;
		if (this.gap.name !== other.gap.name) return false;
		return true;
	}

	public toString(): string {
		return `(${this.robot.name},${this.gap.name})`;
	}
}

