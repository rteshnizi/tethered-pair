import * as React from 'react';
import { AppSteps } from '../App';
import { BindMemberMethods } from '../utils/react';

interface InputAreaProps {
	activeStep: keyof AppSteps;
}

export class InputArea extends React.Component<InputAreaProps, {}> {
	constructor(props: InputAreaProps) {
		super(props);
		BindMemberMethods(InputArea.prototype, this);
	}

	render() {
		return (
			<div>
				Input Area
			</div>
		);
	}
}