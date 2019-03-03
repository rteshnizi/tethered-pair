import * as Mui from '@material-ui/core';
import { fabric } from 'fabric';
import * as React from 'react';
import { AppSteps } from '../App';
import { BindMemberMethods } from '../utils/react';
import { StrPoint } from './geometry';
import { Robot } from '../model/robot';
import modelService from '../model/model-service';

interface InputAreaProps {
	activeStep: keyof AppSteps;
}

interface InputState {
	r1: StrPoint;
	r2: StrPoint;
}

export class InputArea extends React.Component<InputAreaProps, InputState> {
	constructor(props: InputAreaProps) {
		super(props);
		this.state = {
			r1: { x: "0", y: "0" },
			r2: { x: "0", y: "0" },
		};
		BindMemberMethods(InputArea.prototype, this);
	}

	setRobot(strR: StrPoint, robot: Robot): void {
		// modelService.
	}

	createRobotInput(strR: StrPoint, robot: Robot): JSX.Element {
		return (
			<div>
				<Mui.TextField
					className="point-input"
					label={`${robot.name}.X`}
					value={strR.x}
					onChange={() => { this.setRobot(strR, robot); }}
					margin="normal"
					/>
				<Mui.TextField
					className="point-input"
					label={`${robot.name}.Y`}
					value={strR.y}
					onChange={() => { this.setRobot(strR, robot); }}
					margin="normal"
					/>
			</div>
		);
	}

	render() {
		console.log(this.state.r1);
		return (
			<div className="input-area">
				{this.createRobotInput(this.state.r1, modelService.Robots()[0])}
				{this.createRobotInput(this.state.r2, modelService.Robots()[1])}
			</div>
		);
	}
}