import * as React from 'react';
import * as Mui from '@material-ui/core';
import { BindMemberMethods } from '../utils/react';
import Model from '../model/model-service';
import { CreateFabricPoint } from '../utils/fabric';
import { Destination } from '../model/destination';
import { AllPresets } from '../model/presets';


class InputState {
	public destinations: string[];
	public jsonState: string;

	constructor() {
		this.destinations = ["0, 0", "0, 0"];
		this.jsonState = "";
	}
}

export class DestinationPicker extends React.Component<{}, InputState> {
	constructor(props: {}) {
		super(props);
		this.state = new InputState();
		BindMemberMethods(DestinationPicker.prototype, this);
	}

	parseJson(): void {
		const parsed: InputState = JSON.parse(this.state.jsonState);
		this.setState(parsed);
		window.setTimeout(() => {
			Object.keys(parsed.destinations).forEach((ind) => { this.setDestination(Number(ind) as 0 | 1) });
		}, 500);
	}

	exportCurrentAsJson(): void {
		const selectedState = {
			destinations: this.state.destinations,
		};
		const jsonState = JSON.stringify(selectedState);
		this.setState({ jsonState });
	}

	getPresetSelector(): JSX.Element {
		return(
			<Mui.FormControl>
				<Mui.InputLabel htmlFor="preset-select">Presets</Mui.InputLabel>
				<Mui.Select
					value={this.state.jsonState}
					className="preset-select"
					inputProps={{ name: 'preset', id: 'preset-select' }}
					onChange={(e) => { this.setState({ jsonState: e.target.value }); }}
				>
					{
						AllPresets.map((preset, ind) => <Mui.MenuItem key={`sel-item-${ind}`} value={preset.json}>{preset.name}</Mui.MenuItem>)
					}
				</Mui.Select>
			</Mui.FormControl>
		);
	}

	getJsonTextArea(): JSX.Element {
		return (
			<div>
				<Mui.TextField
					multiline={true}
					rowsMax={5}
					value={this.state.jsonState}
					inputProps={{style: {fontFamily: "Consolas, 'Courier New', monospace", fontSize: 12}}}
					style={{width:"100%"}}
					onChange={(e) => { this.setState({ jsonState: e.target.value }) }}
					/>
				<Mui.Button className="button-with-margin" size="small" variant="contained" color="primary" aria-label="Parse" onClick={this.parseJson}>
					Parse JSON
				</Mui.Button>
				<Mui.Button className="button-with-margin" size="small" variant="contained" color="primary" aria-label="Export" onClick={this.exportCurrentAsJson}>
					Get Map as JSON
				</Mui.Button>
				{this.getPresetSelector()}
			</div>
		);
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
				<p>Import/Export</p>
				{this.getJsonTextArea()}
				<p>Destinations</p>
				{this.createDestinationInput(0)}
				{this.createDestinationInput(1)}
			</div>
		);
	}
}
