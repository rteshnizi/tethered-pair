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

export function IsValidGapPair(gapPairs: Set<string>, g1: string, g2: string): boolean {
	return gapPairs.has(`${g1}-${g2}`) || gapPairs.has(`${g2}-${g1}`);
}

export function GetGapPairs(): Set<string> {
	const s: Set<string> = new Set();
	const processGapString = (gapString: GapString) => {
		for(let i = 0; i < gapString.gapNames.length; i++) {
			const g1 = gapString.gapNames[i];
			let g2 = gapString.gapNames[i];
			// go forward until you see a gap of the the other robot
			for(let j = i + 1; j < gapString.gapNames.length; j++) {
				g2 = gapString.gapNames[j];
				if (gapString.robotNames[j] !== gapString.robotNames[i]) break;
			}
			if (g1 !== g2 && GetVertexByName(g1).isVisible(GetVertexByName(g2))) {
				s.add(`${g1}-${g2}`);
				s.add(`${g2}-${g1}`);
			}
		}
	};
	MakeGapStrings().forEach(processGapString);
	return s;
}

function MakeGapStrings(): GapString[] {
	forEach(Model.Instance.Robots, (robot) => {
		robot.findGaps();
	});
	const r0 = Model.Instance.Robots[0];
	const r1 = Model.Instance.Robots[1];
	const r0String = MakeGapString(r0, r1);
	const r1String = MakeGapString(r1, r0);
	return [r0String, r1String];
}

function MakeGapString(main: Robot, other: Robot): GapString {
	const allGaps = GetAllGaps(main, other);
	const edgeRef = new Edge(`${main.toString()}->${other.toString()}`, main, other);
	const sortedGaps = Array.from(allGaps.keys()).map((name) => GetVertexByName(name));
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

/** You MUST be confident that the name is a valid Vertex, otherwise it will break the code */
function GetVertexByName(name: string): Vertex {
	return Model.Instance.AllEntities.get(name) as Vertex;
}
