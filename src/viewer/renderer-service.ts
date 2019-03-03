import { fabric } from "fabric";
import { Entity } from "../model/entity";
import { VIEWIER_CANVAS_ID } from "./Viewer";

class Renderer {
	private canvas: fabric.Canvas;
	private shapes: Map<string, Entity>;
	constructor(canvasId: string) {
		this.canvas = new fabric.Canvas(canvasId);
		this.shapes = new Map();
	}

	addEntity(e: Entity): void {
		this.shapes.set(e.name, e);
		this.canvas.add(e.shape);
	}

	render(): void {
		// this.shapes.forEach((e) => {
		// 	if (e.dirty) {

		// 	}
		// });
		this.canvas.renderAll();
	}
}

export default new Renderer(VIEWIER_CANVAS_ID);