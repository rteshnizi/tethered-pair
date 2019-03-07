import Model from "../model/model-service";
import { forEach } from "lodash";
import { Geometry } from "../utils/geometry";

export function MakeGapStrings(): void {
	forEach(Model.Instance.Robots, (robot) => {
		robot.findGaps();
	});
	Model.Instance.Robots[1].clearGaps();
	const allGaps = [...Model.Instance.Robots[0].gaps, ...Model.Instance.Robots[1].gaps];
	let sortedGaps = allGaps.filter((g) => g.isVisible(Model.Instance.Robots[0]));
	Geometry.SortPointsClockwise(sortedGaps, Model.Instance.Robots[0].location);
	sortedGaps.forEach((v) => {
		v.select();
	});
}