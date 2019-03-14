import Model from "../model/model-service";

export enum DEBUG_LEVEL {
	L1,
	L2,
	L3,
	DISABLE,
}

interface PrintOptions {
	dontCallToString?: boolean;
	level?: DEBUG_LEVEL;
}

export function PrintDebug(msg: string | Object, opts?: PrintOptions): void {
	opts = Object.assign({ level: DEBUG_LEVEL.L1, dontCallToString: false }, opts);
	if (opts.level !== undefined && opts.level < Model.Instance.CONSTANTS.DEBUG_LEVEL) return;
	if (opts.dontCallToString) {
		console.log(msg);
	} else {
		const str = msg.toString();
		if (str.length > 0) {
			console.log(str);
		}
	}
}
