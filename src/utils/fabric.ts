import { fabric } from 'fabric';
import { trim } from 'lodash';

/**
 * Disable all mouse interactions with FabricJs object
 * @param shape The shape to be locked
 */
export function DisableFabricJsMouseEvents(shape: fabric.Object): void {
	shape.lockMovementX = true;
	shape.lockMovementY = true;
	shape.lockScalingX = true;
	shape.lockScalingY = true;
	shape.lockUniScaling = true;
	shape.lockRotation = true;
}

/**
 * Create Fabirc Point from string
 * @param val comma separated x,y
 */
export function CreateFabricPoint(val: string): fabric.Point | null {
	const parts = val.split(",");
	if (parts.length < 2) return null;
	const x = Number(trim(parts[0]));
	const y = Number(trim(parts[1]));
	if (isNaN(x) || isNaN(y)) return null;
	return new fabric.Point(x, y);
}

