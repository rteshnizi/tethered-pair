import { fabric } from "fabric";
import { Entity } from "../model/entity";
import { VIEWIER_CANVAS_ID } from "./viewer";

const RENDER_ON_CHANGE = true;

export default class Renderer {
	private static _instance: Renderer;
	public static get Instance() {
		return Renderer._instance || (Renderer._instance = new Renderer(VIEWIER_CANVAS_ID));
	}

	private canvas: fabric.Canvas;
	private shapes: Map<string, Entity>;

	private constructor(canvasId: string) {
		this.canvas = new fabric.Canvas(canvasId);
		this.canvas.renderOnAddRemove = RENDER_ON_CHANGE;
		this.shapes = new Map();
	}

	addEntity(e: Entity, forceRender?: boolean): void {
		// this.shapes.set(e.name, e);
		this.canvas.add(e.shape);
	}

	removeEntity(e: Entity, forceRender?: boolean): void{
		this.canvas.remove(e.shape);
		this.render(forceRender);
	}

	render(force?: boolean): void {
		// this.shapes.forEach((e) => {
		// 	if (e.dirty) {

		// 	}
		// });
		if (force || !RENDER_ON_CHANGE) {
			this.canvas.renderAll();
		}
	}
}
