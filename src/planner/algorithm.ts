import Model from "../model/model-service";
import { forEach } from "lodash";

export function MakeGapStrings(): void {
	forEach(Model.Instance.Robots, (robot) => {
		const anchors = Model.Instance.Anchors;
		robot.findGaps();
		// robot.renderGaps();
	});
}