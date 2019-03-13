import Model from "../model/model-service";

export enum DEBUG_LEVEL {
	L1,
	L2,
	L3,
	DISABLE,
}

export function PrintDebug(msg: string | Object, level?: DEBUG_LEVEL): void {
	if (!level) level = DEBUG_LEVEL.L1;
	if (level < Model.Instance.CONSTANTS.DEBUG_LEVEL) return;
	if (typeof msg === "string") {
		console.log(msg);
	} else {
		console.log(msg.toString());
	}
}
