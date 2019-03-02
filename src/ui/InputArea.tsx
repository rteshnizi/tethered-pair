import * as Mui from '@material-ui/core';
import { fabric } from 'fabric';
import * as React from 'react';
import { AppSteps } from '../App';
import { BindMemberMethods } from '../utils/react';

interface InputAreaProps {
	activeStep: keyof AppSteps;
}

interface InputState {
	r1: fabric.Point;
}

export class InputArea extends React.Component<InputAreaProps, InputState> {
	constructor(props: InputAreaProps) {
		super(props);
		this.state = {
			r1: new fabric.Point(0, 0),

		};
		BindMemberMethods(InputArea.prototype, this);
	}

	setR1(e: any): void {
		this.setState({r1: new fabric.Point(e.target.val, this.state.r1.y)});
	}

	render() {
		console.log(this.state.r1);
		return (
			<div className="input-area">
				<Mui.TextField
					label="R1.X"
					value={this.state.r1.x}
					onChange={this.setR1}
				/>
			</div>
		);
	}
}