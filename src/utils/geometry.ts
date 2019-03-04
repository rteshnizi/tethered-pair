import { fabric } from 'fabric';

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