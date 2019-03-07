import * as React from 'react';
import { AppSteps } from '../App';
import { BindMemberMethods } from '../utils/react';
import { InitialConfig } from './initial-config';
import { DestinationPicker } from './destination-picker';
import { SimulationInfo } from './simulation-info';

interface InputAreaProps {
	activeStep: keyof AppSteps;
}

class InputState {
}

export class InputArea extends React.Component<InputAreaProps, InputState> {
	constructor(props: InputAreaProps) {
		super(props);
		this.state = new InputState();
		BindMemberMethods(InputArea.prototype, this);
	}

	getForm(): JSX.Element {
		switch (this.props.activeStep) {
			case 0:
				return <InitialConfig />;
			case 1:
				return <DestinationPicker />;
			default:
				return <SimulationInfo />
		}
	}

	render() {
		return <div className="input-area">{this.getForm()}</div>;
	}
}
