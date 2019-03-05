import { fabric } from "fabric";
import { Entity } from "../model/entity";
import { VIEWIER_CANVAS_ID } from "./viewer";

export default class Renderer {
	private static _instance: Renderer;
	public static get Instance() {
		return Renderer._instance || (Renderer._instance = new Renderer(VIEWIER_CANVAS_ID));
	}

	private canvas: fabric.Canvas;
	private shapes: Map<string, Entity>;

	private constructor(canvasId: string) {
		this.canvas = new fabric.Canvas(canvasId);
		this.shapes = new Map();
	}

	addEntity(e: Entity): void {
		// this.shapes.set(e.name, e);
		this.canvas.add(e.shape);
	}

	removeEntity(e: Entity): void{
		this.canvas.remove(e.shape);
	}

	render(): void {
		// this.shapes.forEach((e) => {
		// 	if (e.dirty) {

		// 	}
		// });
		this.canvas.renderAll();
	}
}
