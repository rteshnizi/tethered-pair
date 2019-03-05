import * as React from 'react';
import { BindMemberMethods } from '../utils/react';


class InputState {
}

export class DestinationPicker extends React.Component<{}, InputState> {
	constructor(props: {}) {
		super(props);
		this.state = new InputState();
		BindMemberMethods(DestinationPicker.prototype, this);
	}

	render() {
		return <div className="input-area">Destination Picker</div>;
	}
}
