import { fabric } from 'fabric';
import Renderer from '../viewer/renderer-service';
import { DisableFabricJsMouseEvents } from '../utils/fabric';
import Model from './model-service';

const SELECT_COLOR = '#FF1493';
const SELECT_WIDTH = 3;

export abstract class Entity {
	private isRendered: boolean;
	private _shape: fabric.Object;
	set shape(s: fabric.Object) { this._shape = s; }
	get shape() { return this._shape; }

	private prevStrokeColor: string | undefined;
	private prevStrokeWidth?: number;

	constructor(public name: string, public color: string, shape: fabric.Object, doNotRenderInCtor?: boolean) {
		this._shape = shape;
		this.prevStrokeColor = undefined;
		this.prevStrokeWidth = NaN; // Means it's not selected (undefined it is distinguishable from undefined)
		this.isRendered = false;

		DisableFabricJsMouseEvents(this._shape);
		Model.Instance.AllEntities.set(this.name, this);
		if (!doNotRenderInCtor){
			this.render();
		}
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
}

export abstract class EntityWithLocation extends Entity {
	/** The value in angle is meaningless outside of the context it is set */
	public angle: number;
	constructor(name: string, public location: fabric.Point, public color: string, shape: fabric.Object) {
		super(name, color, shape);
		this.angle = NaN;
	}
};