import * as Mui from '@material-ui/core';
import RightArrowIcon from '@material-ui/icons/ArrowRightAlt';
import EditIcon from '@material-ui/icons/Edit';
import { fabric } from 'fabric';
import * as React from 'react';
import { AppSteps } from '../App';
import { BindMemberMethods } from '../utils/react';
import { StrPoint } from './geometry';
import { Robot } from '../model/robot';
import Model from '../model/model-service';

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

	setRobot(strR: StrPoint, ind: 1 | 2): void {
		const center = new fabric.Point(Number(strR.x), Number(strR.y));
		Model.Instance.setRobot(new Robot(`R${ind}`, center, ind === 1 ? "red" : "blue"), ind);
	}

	handleRobotChange(val: string, strR: StrPoint, isX: boolean, ind: 1 | 2): void {
		let obj = {};
		if (isX) {
			strR.x = val;
		} else {
			strR.y = val;
		}
		if (ind === 1) {
			obj = { r1: strR };
		} else {
			obj = { r2: strR };
		}
		this.setState(obj);
	}

	createRobotInput(strR: StrPoint, ind: 1 | 2): JSX.Element {
		return (
			<div>
				<Mui.TextField
					className="point-input"
					label={`R${ind}.X`}
					value={strR.x}
					margin="normal"
					onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { this.handleRobotChange(e.target.value, strR, true, ind); }}
					/>
				<Mui.TextField
					className="point-input"
					label={`R${ind}.Y`}
					value={strR.y}
					margin="normal"
					onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { this.handleRobotChange(e.target.value, strR, false, ind); }}
					/>
				<Mui.IconButton className="inline-button" color="primary" aria-label="Add" onClick={() => { this.setRobot(strR, ind); }}>
					<RightArrowIcon fontSize="small" />
				</Mui.IconButton>
			</div>
		);
	}

	render() {
		return (
			<div className="input-area">
				{this.createRobotInput(this.state.r1, 1)}
				{this.createRobotInput(this.state.r2, 2)}
			</div>
		);
	}
}