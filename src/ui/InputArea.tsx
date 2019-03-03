import * as Mui from '@material-ui/core';
import RightArrowIcon from '@material-ui/icons/ArrowRightAlt';
import { fabric } from 'fabric';
import * as React from 'react';
import { AppSteps } from '../App';
import { BindMemberMethods } from '../utils/react';
import { StrPoint } from './geometry';
import { Robot } from '../model/robot';
import Model from '../model/model-service';
import { trim } from 'lodash';

interface InputAreaProps {
	activeStep: keyof AppSteps;
}

interface InputState {
	robots: string[];
}

export class InputArea extends React.Component<InputAreaProps, InputState> {
	constructor(props: InputAreaProps) {
		super(props);
		this.state = {
			robots: ["0, 0", "0, 0"],
		};
		BindMemberMethods(InputArea.prototype, this);
	}

	setRobot(ind: 1 | 2): void {
		const parts = this.state.robots[ind - 1].split(",");
		if (parts.length < 2) return;
		const x = Number(trim(parts[0]));
		const y = Number(trim(parts[1]));
		if (isNaN(x) || isNaN(y)) return;
		const center = new fabric.Point(x, y);
		Model.Instance.setRobot(new Robot(`R${ind}`, center, ind === 1 ? "red" : "blue"), ind);
	}

	handleRobotChange(val: string, ind: 1 | 2): void {
		const currentRobots = this.state.robots;
		currentRobots[ind - 1] = val;
		this.setState({ robots: currentRobots });
	}

	createRobotInput(ind: 1 | 2): JSX.Element {
		return (
			<div>
				<Mui.Tooltip title="Comma separated X, Y" placement="top">
					<Mui.TextField
						className="point-input"
						label={`Robot ${ind}`}
						value={this.state.robots[ind - 1]}
						margin="dense"
						onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { this.handleRobotChange(e.target.value, ind); }}
						/>
				</Mui.Tooltip>
				<Mui.IconButton className="inline-button" color="primary" aria-label="Add" onClick={() => { this.setRobot(ind); }}>
					<RightArrowIcon fontSize="small" />
				</Mui.IconButton>
			</div>
		);
	}

	createRowsForAddedObstacles(): JSX.Element {
		return (
			<div>
				HELLO
			</div>
		);
	}

	createObstacleInput(): JSX.Element {
		return (
			<div>
				{this.createRowsForAddedObstacles()}
				<Mui.Button variant="contained" color="primary" size="small">Create New Obstacle</Mui.Button>
			</div>
		);
	}

	render() {
		return (
			<div className="input-area">
				<p>Robots</p>
				{this.createRobotInput(1)}
				{this.createRobotInput(2)}
				<p>Obstacles</p>
				{this.createObstacleInput()}
			</div>
		);
	}
}