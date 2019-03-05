import { fabric } from 'fabric';

/**
 * Disable all mouse interactions with FabricJs object
 * @param shape The shape to be locked
 */
export function DisableFabricJsMouseEvents(shape: fabric.Object) {
	shape.lockMovementX = true;
	shape.lockMovementY = true;
	shape.lockScalingX = true;
	shape.lockScalingY = true;
	shape.lockUniScaling = true;
	shape.lockRotation = true;
}