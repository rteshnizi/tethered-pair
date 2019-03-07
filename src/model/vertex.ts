import { fabric } from 'fabric';
import { EntityWithLocation } from './entity';
import { Obstacle } from './obstacle';
import Model from './model-service';
import { Edge } from './edge';
import { Geometry } from '../utils/geometry';
import { Destination } from './destination';

const DEFAULT_FILL = 'rgba(0,0,0,0)';
const ANCHOR_FILL = 'LightGreen';

export interface VertexOption {
	owner?: Obstacle;
	color: string;
	shouldFill?: boolean;
	fillColor?: string;
	renderRadius: number;
}

export class Vertex extends EntityWithLocation {
	private anchorChecked = false;
	private _canAnchor: boolean;

	constructor(name: string, location: fabric.Point, public options: VertexOption) {
		super(name, location, options.color, new fabric.Circle({
			radius: options.renderRadius,
			left: location.x - options.renderRadius,
			top: location.y - options.renderRadius,
			fill: options.shouldFill ? (options.fillColor ? options.fillColor : options.color) : DEFAULT_FILL,
			stroke: options.color
		}));
		this._canAnchor = false;
	}

	isVisible(other: Vertex): boolean {
		let isVis = true;
		const edge = new Edge(`${this.name}<->${other.name}`, this, other);
		const numObs = Object.keys(Model.Instance.Obstacles).length;
		let i = 0;
		for(; i < numObs; i++) {
			const o = Model.Instance.Obstacles[i];
			if (i > 0) Model.Instance.Obstacles[i - 1].deselect();
			o.select();
			if (Geometry.IntersectEdgeAndObstacle(edge, o)) {
				isVis = false;
				break;
			}
		}
		edge.remove();
		Model.Instance.Obstacles[i === numObs ? i - 1 : i].deselect();
		return isVis;
	}

	isOwnedBy(o: Obstacle): boolean {
		return !!this.options.owner && (o.name === this.options.owner.name);
	}

	canAnchor(d1: Destination, d2: Destination, cableLength: number): boolean {
		if (this.anchorChecked) return this._canAnchor;
		this.select();
		this._canAnchor = (this.location.distanceFrom(d1.location) + this.location.distanceFrom(d2.location)) <= cableLength;
		this.anchorChecked = true;
		this.deselect();
		return this._canAnchor;
	}

	setAsAnchor(): void {
		this.shape.set('fill', ANCHOR_FILL);
	}
}
