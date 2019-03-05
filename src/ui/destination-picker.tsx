import * as React from 'react';
import * as Mui from '@material-ui/core';
import { BindMemberMethods } from '../utils/react';
import Model from '../model/model-service';
import { CreateFabricPoint } from '../utils/fabric';
import { Destination } from '../model/destination';


class InputState {
	public destinations: string[];

	constructor() {
		this.destinations = ["0, 0", "0, 0"];
	}
}

export class DestinationPicker extends React.Component<{}, InputState> {
	constructor(props: {}) {
		super(props);
		this.state = new InputState();
		BindMemberMethods(DestinationPicker.prototype, this);
	}

	setDestination(ind: 0 | 1): void {
		const center = CreateFabricPoint(this.state.destinations[ind]);
		if (center) {
			Model.Instance.setDestination(new Destination(`D${ind}`, center, ind === 0 ? "red" : "blue"), ind);
		}
	}

	handleDestinationChange(val: string, ind: 0 | 1): void {
		const current = this.state.destinations;
		current[ind] = val;
		this.setState({ destinations: current });
		this.setDestination(ind);
	}

	createDestinationInput(ind: 0 | 1): JSX.Element {
		return (
			<div>
				<Mui.Tooltip title="Comma separated X, Y" placement="top">
					<Mui.TextField
						className="point-input"
						label={`Destination ${ind + 1}`}
						value={this.state.destinations[ind]}
						margin="dense"
						inputProps={{style: {fontFamily: "Consolas, 'Courier New', monospace"}}}
						onChange={(e) => { this.handleDestinationChange(e.target.value, ind); }}
						/>
				</Mui.Tooltip>
			</div>
		);
	}

	render() {
		return (
			<div className="input-area">
				{this.createDestinationInput(0)}
				{this.createDestinationInput(1)}
			</div>
		);
	}
}
