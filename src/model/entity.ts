import { fabric } from 'fabric';
import Renderer from '../viewer/renderer-service';
import { DisableFabricJsMouseEvents } from '../utils/fabric';
import Model from './model-service';
import { PrintDebug, DEBUG_LEVEL } from '../utils/debug';

const SELECT_COLOR = '#FF1493';
const SELECT_WIDTH = 3;

export abstract class Entity {
	private isRendered: boolean;
	private _shape: fabric.Object;
	set shape(s: fabric.Object) { this._shape = s; }
	get shape() { return this._shape; }

	private prevStrokeColor: string | undefined;
	private prevStrokeWidth?: number;

	constructor(public name: string, public color: string, shape: fabric.Object, renderInCtor: boolean) {
		this._shape = shape;
		this.prevStrokeColor = undefined;
		this.prevStrokeWidth = NaN; // Means it's not selected (undefined it is distinguishable from undefined)
		this.isRendered = false;

		DisableFabricJsMouseEvents(this._shape);
		Model.Instance.AllEntities.set(this.name, this);
		if (renderInCtor){
			this.render();
		}
	}

	public reset(): void {
		PrintDebug("RESET NOT OVERRIDEN");
	}

	public isSelected(): boolean {
		return this.prevStrokeWidth === undefined || !isNaN(this.prevStrokeWidth);
	}

	/** Highlight the Entity */
	public select(): void {
		if (!this.isSelected()) {
			this.prevStrokeColor = this.shape.stroke;
			this.prevStrokeWidth = this.shape.strokeWidth;
			this.shape.set('stroke', SELECT_COLOR);
			this.shape.strokeWidth = SELECT_WIDTH;
			Renderer.Instance.render(true);
		}
	}

	public deselect(): void {
		if (this.isSelected()) {
			this.shape.set('stroke', this.prevStrokeColor);
			this.shape.strokeWidth = this.prevStrokeWidth;
			this.prevStrokeColor = undefined;
			this.prevStrokeWidth = NaN;
			Renderer.Instance.render(true);
		}
	}

	public remove(): void {
		Model.Instance.AllEntities.delete(this.name);
		Renderer.Instance.removeEntity(this, true);
	}

	public render(): void {
		Renderer.Instance.addEntity(this);
		Renderer.Instance.render();
		this.isRendered = true;
	}

	public toString(): string {
		return this.name;
	}
}

export abstract class EntityWithLocation extends Entity {
	/** The value in angle is meaningless outside of the context it is set */
	public angle: number;
	protected _location: fabric.Point;
	public set location(l: fabric.Point) {
		const diff = l.subtract(this._location);
		const deltaTop = diff.y;
		const deltaLeft = diff.x;
		const currentTop = this.shape.top ? this.shape.top : 0; // The zero case should never happen, it's just here for TS compiler
		const currentLeft = this.shape.left ? this.shape.left : 0;
		this.shape.set({
			top: currentTop + deltaTop,
			left: currentLeft + deltaLeft,
		});
		this._location = l;
		// Renderer.Instance.render(true);
	}
	public get location(): fabric.Point { return this._location; }

	constructor(name: string, location: fabric.Point, public color: string, shape: fabric.Object, renderInCtor: boolean) {
		super(name, color, shape, renderInCtor);
		this.angle = NaN;
		this._location = location;
	}
};