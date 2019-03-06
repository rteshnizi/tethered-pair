import { fabric } from 'fabric';
import { Group, Line, Polygon, Pt } from 'pts';
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

/**
 * Check whether the visibility edge intersects the given polygon
 * @param e The visibility edge (Line Segment)
 * @param o The Obstacle (Convex Polygon)
 */
export function IntersectEdgeAndObstacle(e: Edge, o: Obstacle): boolean {
	// To increase performance, check if the bounding boxes intersect first, using fabricJs
	if (!e.shape.intersectsWithObject(o.shape)) return false;

	// Now that we know they are intersecting using Pts for more complicated calculation
	const polygon = Fabric2Pts.Polygon(o);
	const line = Fabric2Pts.Line(e);
	const intersections = Line.intersectPolygon2D(line, polygon);
	if (!intersections || intersections.length === 0) return false;
	const isOwner = e.v1.isOwner(o) || e.v2.isOwner(o);
	if (!isOwner) return true;
	const points = intersections.map(Pts2Fabric.Point);
	// If this is the owner Obstacle, in our context, we don't count it as intersection if the edge ends on the obstacle.
	// i.e., the end of the visibility edge is a vertex of the polygon **AND** it does not go through the obstacle
	for(let p of points) {
		if (p.eq(e.v1.location)) continue;
		if (p.eq(e.v2.location)) continue;
		return true;
	}
	return false;
}

class Fabric2Pts {
	public static Line(e: Edge): Group {
		return Group.fromArray([
			[e.v1.location.x, e.v1.location.y],
			[e.v2.location.x, e.v2.location.y],
		]);
	}

	public static Polygon(o: Obstacle): Group {
		const pointArr: number[][] = o.fabricPoints.map((p) => [p.x, p.y]);
		// TODO: I am assuming all obstacles are convex just because that's how I draw them.
		// If that causes issues, uncomment the line below
		return Group.fromArray(pointArr);
		// return Polygon.convexHull(Group.fromArray(pointArr));
	}
}

class Pts2Fabric {
	public static Point(pt: Pt): fabric.Point {
		return new fabric.Point(pt[0], pt[1]);
	}
}
