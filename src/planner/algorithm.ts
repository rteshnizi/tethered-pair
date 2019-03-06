import Model from "../model/model-service";
import { forEach } from "lodash";

export function MakeGapStrings(): void {
	forEach(Model.Instance.Robots, (robot) => {
		robot.findGaps();
		robot.renderGaps();
	});
}