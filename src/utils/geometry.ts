import { fabric } from 'fabric';
import { Edge } from '../model/edge';
import { Obstacle } from '../model/obstacle';

export type AngledPoint = fabric.Point & { angle?: number };

// https://stackoverflow.com/a/45662872/750567
export function SortPointsClockwise(points: AngledPoint[]): AngledPoint[] {
	const center = GetCenterFromPoints(points);
	const angles: number[] = [];
	// Starting angle used to reference other angles
	let startAng = NaN;
	points.forEach(point => {
		var ang = Math.atan2(point.y - center.y,point.x - center.x);
		if(isNaN(startAng)) {
			startAng = ang;
		} else {
			// ensure that all points are clockwise of the start point
			if(ang < startAng) {
				ang += Math.PI * 2;
			}
		}
		point.angle = ang; // add the angle to the point
	});
	// Sort clockwise;
	// @ts-ignore I added the angles above
	points.sort((a, b) => a.angle - b.angle);
	return points;
}

// https://stackoverflow.com/a/45662872/750567
export function GetCenterFromPoints(points: fabric.Point[]): fabric.Point {
	// Find min max to get center
	// Sort from top to bottom
	points.sort((a, b) => a.y - b.y);
	// Get center y
	const cy = (points[0].y + points[points.length - 1].y) / 2;
	// Sort from right to left
	points.sort((a, b) => b.x - a.x);
	// Get center x
	const cx = (points[0].x + points[points.length - 1].x) / 2;

	return new fabric.Point(cx, cy);
}

type IntersectionResult = fabric.Intersection & {
	/** Intersection Points */
	points: fabric.Point[],
	/** There is no documentation for this. Maybe make a issue? I found this from their source code */
	status: undefined | 'Intersection',
}

export function IntersectEdgeAndObstacle(e: Edge, o: Obstacle): boolean {
	const p1 = e.v1.location;
	const p2 = e.v2.location;
	const ps = o.fabricPoints;
	const result = fabric.Intersection.intersectLinePolygon(e.v1.location, e.v2.location, o.fabricPoints) as IntersectionResult;
	if (result.status === "Intersection") {
		// check and see if there is any intersecting point that is not the two ends of the line
		for(let p of result.points) {
			if (p.eq(p1)) continue;
			if (p.eq(p2)) continue;
			return true;
		}
	}
	return false;
}

