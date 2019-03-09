import Model from "../model/model-service";
import { forEach } from "lodash";
import { Geometry } from "../utils/geometry";
import { Vertex } from "../model/vertex";
import { Robot } from "../model/robot";
import { Edge } from "../model/edge";

/** use this to identify which gap belongs to which robot */
export interface GapString {
	gapNames: string[];
	robotNames: string[];
}

export function MakeGapStrings(): GapString[] {
	forEach(Model.Instance.Robots, (robot) => {
		robot.findGaps();
	});
	const r0 = Model.Instance.Robots[0];
	const r1 = Model.Instance.Robots[1];
	const r0String = MakeGapString(r0, r1);
	const r1String = MakeGapString(r1, r0);
	console.log([r0String, r1String]);
	return [r0String, r1String];
}

function MakeGapString(main: Robot, other: Robot): GapString {
	const allGaps = GetAllGaps(main, other);
	const edgeRef = new Edge(`${main.toString()}->${other.toString()}`, main, other);
	const sortedGaps = Array.from(allGaps.keys()).map((name) => Model.Instance.AllEntities.get(name) as Vertex);
	Geometry.SortPointsClockwiseByEdge(sortedGaps, edgeRef);
	return CreateGapStringsFromSortedGaps(allGaps, sortedGaps);
}

function GetAllGaps(main: Robot, other: Robot): Map<string, string> {
	const map: Map<string, string> = new Map();
	const addGap = (g: Vertex, label: string) => { map.set(g.name, label); };
	// Main comes after because the vertex that belongs to main has to remain labeled to main
	other.gaps.forEach((g: Vertex) => {
		// Only add visible ones to the map
		if (main.isVisible(g)) {
			addGap(g, other.name);
		}
	});
	main.gaps.forEach((g: Vertex) => { addGap(g, main.name); });
	return map;
}

function CreateGapStringsFromSortedGaps(allGaps: Map<string, string>, sortedGaps: Vertex[]): GapString {
	const gapNames: string[] = [];
	const robotNames: string[] = [];
	sortedGaps.forEach((v) => {
		gapNames.push(v.name);
		robotNames.push(allGaps.get(v.name) as string);
	});
	return { gapNames, robotNames };
}
