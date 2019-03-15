import { Vertex } from "../model/vertex";
import { Robot } from "../model/robot";

export class LabeledGap {
	constructor(public gap: Vertex, public robot: Robot, public anchor: Vertex | undefined) { }

	public eq(other: LabeledGap): boolean {
		// we don't need to check the robots because first always belongs to R0 and second to R1
		if (this.gap.name !== other.gap.name) return false;
		if (this.gap.name !== other.gap.name) return false;
		// If one or the other doesn't have anchors they are not eq
		if (!this.anchor && other.anchor) return false;
		if (this.anchor && !other.anchor) return false;
		// If they both have anchors but with different names they are not eq
		if (this.anchor && other.anchor && this.anchor.name !== other.anchor.name) return false;
		return true;
	}

	public toString(): string {
		const anchorStr = this.anchor ? `x${this.anchor.toString()}` : "";
		return `(${this.robot.name},${this.gap.name}${anchorStr})`;
	}
}

