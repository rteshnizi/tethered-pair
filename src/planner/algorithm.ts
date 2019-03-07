import Model from "../model/model-service";
import { forEach } from "lodash";
import { Geometry } from "../utils/geometry";
import { Vertex } from "../model/vertex";
import { Robot } from "../model/robot";

export function MakeGapStrings(): Vertex[][] {
	const strings: Vertex[][] = [[], []];
	forEach(Model.Instance.Robots, (robot) => {
		robot.findGaps();
	});
	const allGaps = [...Model.Instance.Robots[0].gaps, ...Model.Instance.Robots[1].gaps];
	forEach(Model.Instance.Robots, (robot, ind) => {
		strings[Number(ind)] = MakeGapString(robot, allGaps);
	});
	return strings;
}

function MakeGapString(r: Robot, allGaps: Vertex[]): Vertex[] {
	// This is inefficient, only do this for the gaps of the other robot
	let sortedGaps = allGaps.filter((g) => r.isVisible(g));
	Geometry.SortPointsClockwise(sortedGaps, r.location);
	console.log(r.toString());
	console.log(sortedGaps);
	return sortedGaps;
}
