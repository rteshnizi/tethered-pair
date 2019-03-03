import { fabric } from 'fabric';
import Renderer from '../viewer/renderer-service';

export abstract class Entity {
	// private _center: fabric.Point;
	// set center(l: fabric.Point) {
	// 	this._center = l;
	// 	this.dirty= true;
	// }

	// get center() {
	// 	return this._center;
	// }

	private _shape: fabric.Object;
	set shape(s: fabric.Object) {
		this._shape = s;
		this.dirty = true;
	}

	get shape() {
		return this._shape;
	}

	/** True if re-rendering is needed */
	public dirty: boolean;
	constructor(public name: string, shape: fabric.Object) {
		// this._center = center;
		this._shape = shape;
		this.dirty = true;
		Renderer.Instance.addEntity(this);
		Renderer.Instance.render();
	}

	public remove(): void {
		Renderer.Instance.removeEntity(this);
	}

	public render(): void {
		this.dirty = false;
	}
}