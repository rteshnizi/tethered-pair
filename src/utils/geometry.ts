import { fabric } from 'fabric';
import { Group, Line, Polygon, Pt, PtLike } from 'pts';
import { Edge } from '../model/edge';
import { Obstacle } from '../model/obstacle';
import { EntityWithLocation } from '../model/entity';
import { Vertex } from '../model/vertex';
import { Robot } from '../model/robot';
import { GetFabricPointFromVertex } from './fabric';
import { LabeledGap } from '../planner/gap-pairs';
import Model from '../model/model-service';

export type AngledPoint = fabric.Point & { angle?: number };

export class Geometry {
	/** It's just a very bug number */
	private static HUGE_NUMBER_LOL = 1000000000;

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

	public static SortGapsClockwiseByEdge(points: EntityWithLocation[], edge: Edge): void {
		points.sort((a: EntityWithLocation, b: EntityWithLocation) => SortCriteria.ByAngle(a.location, b.location, edge));
	}

	public static SortLabeledGapsClockwiseByEdge(points: LabeledGap[], edge: Edge): void {
		points.sort((a, b) => SortCriteria.ByAngle(a.gap.location, b.gap.location, edge));
	}

	// https://stackoverflow.com/a/45662872/750567
	public static GetCenterFromPoints(points: fabric.Point[] | EntityWithLocation[]): fabric.Point {
		if (points.length === 0) return new fabric.Point(0, 0);
		const lastInd = points.length - 1;
		// Find min max to get center
		// Sort from top to bottom
		points.sort((a: fabric.Point | EntityWithLocation, b: fabric.Point | EntityWithLocation) => SortCriteria.ByDimension(a, b, 'y'));
		// Get center y
		let p1 = GetFabricPointFromVertex(points[0]);
		let p2 = GetFabricPointFromVertex(points[lastInd]);
		const cy = (p1.y + p2.y) / 2;
		// Sort from right to left
		points.sort((a: fabric.Point | EntityWithLocation, b: fabric.Point | EntityWithLocation) => SortCriteria.ByDimension(a, b, 'x'));
		// Get center x
		p1 = GetFabricPointFromVertex(points[0]);
		p2 = GetFabricPointFromVertex(points[lastInd]);
		const cx = (p1.x + p2.x) / 2;

		return new fabric.Point(cx, cy);
	}

	/**
	 * Check whether the visibility edge intersects the given polygon
	 * @param e The visibility edge (Line Segment)
	 * @param o The Obstacle (Convex Polygon)
	 */
	public static IntersectEdgeAndObstacle(e: Edge, o: Obstacle): boolean {
		if (o.isMyEdge(e)) return false;

		// To increase performance, check if the bounding boxes intersect first, using fabricJs
		if (!e.shape.intersectsWithObject(o.shape)) return false;

		// Now that we know they are intersecting, use Pts for more complicated calculation
		const polygon = Fabric2Pts.PolygonFromObstacle(o);

		// THIS IS FOR A SPECIFIC BUG
		// WE ASSUME OBSTACLES ARE CONVEX
		// If the midpoint of the edge is inside the obstacle then, this line is connecting two vertices of the obstacle
		const mid = e.v1.location.midPointFrom(e.v2.location);
		if (Geometry.IsPointInsidePolygon(mid, polygon)) return true;

		const line = Fabric2Pts.Line(e);
		const intersections = Line.intersectPolygon2D(line, polygon);
		if (!intersections || intersections.length === 0) return false;
		const isOwner = e.v1.isOwnedBy(o) || e.v2.isOwnedBy(o);
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

	public static IsPointInsidePolygon(p: fabric.Point, poly: Group): boolean {
		return Polygon.hasIntersectPoint(poly, Fabric2Pts.Pt(p));
	}

	/**
	 * We check two conditions:
	 * 1. If the robot is already there, it's not a gap
	 * 2. Gap is a discontinuity is the distance. I test this by pushing the obstacle vertex slightly in the same direction
	 * as the visibility edge and see if it falls inside the Obstacle.
	 * That is, by extending the edge slightly and see if the end of the edge is inside the obstacle (the owner of the vertex)
	 */
	public static IsVertexAGap(r: Robot, v: Vertex, o: Obstacle): boolean {
		if (r.location.eq(v.location)) return false;
		// We only need to test this for the vertex whose owner is the given Obstacle
		const vec = Geometry.GetEpsilonVector(r, v);
		const moved = v.location.add(vec);
		const poly = Fabric2Pts.PolygonFromObstacle(o);
		return !Geometry.IsPointInsidePolygon(moved, poly);
	}

	public static GetEpsilonVector(start: Vertex, end: Vertex): fabric.Point {
		return end.location.subtract(start.location).divideEquals(Geometry.HUGE_NUMBER_LOL);
	}

	/** Uses Model.Instance */
	public static IsPolygonEmpty(polygonVerts: fabric.Point[]): boolean {
		const poly = Fabric2Pts.PolygonFabricPoints(polygonVerts);
		const isAPolygonVertex = (v: fabric.Point) => {
			// @ts-ignore @types is wrong for these functions
			return polygonVerts.some((p) => {
				return v.eq(p);
			});
		}
		for (let i = 0; i < Model.Instance.Vertices.length; i++) {
			const vert = Model.Instance.Vertices[i].location;
			if(isAPolygonVertex(vert)) continue;
			if (Polygon.hasIntersectPoint(poly, Fabric2Pts.Pt(vert))) return false;
		}
		return true;
	}
}

class SortCriteria {
	static ByDimension(a: fabric.Point | EntityWithLocation, b: fabric.Point | EntityWithLocation, axis: 'y' | 'x'): number {
		const pa = GetFabricPointFromVertex(a);
		const pb = GetFabricPointFromVertex(b);
		return pa[axis] - pb[axis];
	}

	// https://stackoverflow.com/a/7775459/750567
	static ByAngle(a: fabric.Point | EntityWithLocation, b: fabric.Point | EntityWithLocation, e: Edge): number {
		const pa = GetFabricPointFromVertex(a);
		const pb = GetFabricPointFromVertex(b);
		let m_origin: fabric.Point = e.v1.location;
		let m_dreference: fabric.Point = e.v2.location;

		// z-coordinate of cross-product, aka determinant
		const xp = (p1: fabric.Point, p2: fabric.Point) => p1.x * p2.y - p1.y * p2.x;

		const da = pa.subtract(m_origin)
		const db = pb.subtract(m_origin);
		const detb = xp(m_dreference, db);

		// nothing is less than zero degrees
		if (detb === 0 && db.x * m_dreference.x + db.y * m_dreference.y >= 0) return 1;

		const deta = xp(m_dreference, da);

		// zero degrees is less than anything else
		if (deta == 0 && da.x * m_dreference.x + da.y * m_dreference.y >= 0) return -1;

		if (deta * detb >= 0) {
			// both on same side of reference, compare to each other
			return xp(da, db);
		}

		// vectors "less than" zero degrees are actually large, near 2 pi
		return deta;
	}
}

class Fabric2Pts {
	public static Pt(p: fabric.Point): PtLike {
		return [p.x, p.y];
	}

	public static Line(e: Edge): Group {
		return Group.fromArray([
			[e.v1.location.x, e.v1.location.y],
			[e.v2.location.x, e.v2.location.y],
		]);
	}

	public static PolygonFromObstacle(o: Obstacle): Group {
		return Fabric2Pts.PolygonFabricPoints(o.fabricPoints);
	}

	public static PolygonFabricPoints(ps: fabric.Point[]): Group {
		const pointArr: number[][] = ps.map((p) => [p.x, p.y]);
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
