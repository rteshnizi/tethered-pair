export enum DEBUG_LEVEL {
	L1,
	L2,
	L3,
	DISABLE,
}

const MIN_DEBUG_LEVEL = DEBUG_LEVEL.L2;

export function PrintDebug(msg: string | Object, level?: DEBUG_LEVEL): void {
	if (!level) level = DEBUG_LEVEL.L1;
	if (level < MIN_DEBUG_LEVEL) return;
	if (typeof msg === "string") {
		console.log(msg);
	} else {
		console.log(msg.toString());
	}
}
