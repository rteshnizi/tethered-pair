import * as React from 'react';

/**
 * Bind member Methods since their `this` will need to be bound so they work when events are triggered
 * @param componentPrototype The prototype of the component we want to bind the members of.
 * It is basically `MyComponent.prototype`
 * @param thisArg The current instance of the component. Pass `this`.
 */
export function BindMemberMethods<T extends React.Component>(componentPrototype: T, thisArg: T): void {
	Object.getOwnPropertyNames(componentPrototype).forEach((methodName) => {
		(thisArg as any)[methodName] = (thisArg as any)[methodName].bind(thisArg);
	});
}
