import { fabric } from 'fabric';
import { Group, Line, Pt } from 'pts';
import { Edge } from '../model/edge';
import { Obstacle } from '../model/obstacle';
import { EntityWithLocation } from '../model/entity';

export type AngledPoint = fabric.Point & { angle?: number };

export class Geometry {
	private static const HUGE_NUMBER_LOL = 1000000000;

	// https://stackoverflow.com/a/45662872/750567
	public static SortPointsClockwise(points: AngledPoint[] | EntityWithLocation[], center?: fabric.Point): void {
		center = center ? center : Geometry.GetCenterFromPoints(points);
		// Starting angle used to reference other angles
		let startAng = NaN;
		points.forEach((point: AngledPoint | EntityWithLocation) => {
			// @ts-ignore center is not undefined because of the first line
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
	}

	// https://stackoverflow.com/a/45662872/750567
	public static GetCenterFromPoints(points: fabric.Point[] | EntityWithLocation[]): fabric.Point {
		if (points.length === 0) return new fabric.Point(0, 0);
		const lastInd = points.length - 1;
		// Find min max to get center
		// Sort from top to bottom
		points.sort((a: fabric.Point | EntityWithLocation, b: fabric.Point | EntityWithLocation) => Geometry.SortCriteriaByAxis(a, b, 'y'));
		// Get center y
		let p1 = Geometry.GetFabricPoint(points[0]);
		let p2 = Geometry.GetFabricPoint(points[lastInd]);
		const cy = (p1.y + p2.y) / 2;
		// Sort from right to left
		points.sort((a: fabric.Point | EntityWithLocation, b: fabric.Point | EntityWithLocation) => Geometry.SortCriteriaByAxis(a, b, 'x'));
		// Get center x
		p1 = Geometry.GetFabricPoint(points[0]);
		p2 = Geometry.GetFabricPoint(points[lastInd]);
		const cx = (p1.x + p2.x) / 2;

		return new fabric.Point(cx, cy);
	}

	private static GetFabricPoint(p: fabric.Point | EntityWithLocation): fabric.Point {
		return(p as fabric.Point).scalarAdd ? (p as fabric.Point) : (p as EntityWithLocation).location
	}

	private static SortCriteriaByAxis(a: fabric.Point | EntityWithLocation, b: fabric.Point | EntityWithLocation, axis: 'y' | 'x'): number {
		const pa = Geometry.GetFabricPoint(a);
		const pb = Geometry.GetFabricPoint(b);
		return pa[axis] - pb[axis];
	}

	/**
	 * Check whether the visibility edge intersects the given polygon
	 * @param e The visibility edge (Line Segment)
	 * @param o The Obstacle (Convex Polygon)
	 */
	public static IntersectEdgeAndObstacle(e: Edge, o: Obstacle): boolean {
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

	/**
	 * Gap is a discontinuity is the distance.
	 * I test this by extending the edge slightly and see if the end of the edge is inside the obstacle (the owner of the vertex)
	 */
	public static IsVertexAGap(e: Edge, o: Obstacle): boolean {
		e.shape.
	}

	public static GetEpsilonVector(e: Edge): fabric.Point {
		const v = e.v1.location.subtract(e.v2.location);
		return v.divideEquals(Geometry.HUGE_NUMBER_LOL);
	}
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
