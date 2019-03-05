import * as Mui from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Clear';
import { fabric } from 'fabric';
import * as React from 'react';
import { BindMemberMethods } from '../utils/react';
import { Robot } from '../model/robot';
import Model from '../model/model-service';
import { trim } from 'lodash';
import { Obstacle } from '../model/obstacle';
import { SortPointsClockwise } from '../utils/geometry';
import { AllPresets } from '../model/presets';

class InputState {
	public robots: string[];
	public obstacles: string[][];
	public cableLength: string;
	public jsonState: string;

	constructor() {
		this.robots = ["0, 0", "0, 0"];
		this.obstacles = [];
		this.cableLength = "0";
		this.jsonState = "";
	}
}

export class InitialConfig extends React.Component<{}, InputState> {
	constructor(props: {}) {
		super(props);
		this.state = new InputState();
		BindMemberMethods(InitialConfig.prototype, this);
	}

	parseJson(): void {
		let partialState: Pick<InputState, "robots" | "obstacles" | "cableLength">;
		partialState = JSON.parse(this.state.jsonState);
		this.state.obstacles.forEach((obs, ind) => { Model.Instance.removeObstacle(ind); });
		this.setState(partialState);
		window.setTimeout(() => {
			Object.keys(partialState.robots).forEach((ind) => { this.setRobot(Number(ind) as 0 | 1) });
			Object.keys(partialState.obstacles).forEach((ind) => { this.setObstacle(Number(ind)) });
		}, 500);
	}

	exportCurrentAsJson(): void {
		const selectedState = {
			robots: this.state.robots,
			obstacles: this.state.obstacles,
			cableLength: Number(this.state.cableLength),
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

	updateCableLength(val: string): void {
		const l = Number(val);
		if (!isNaN(l)) {
			Model.Instance.cableLength = l;
		}
		this.setState({ cableLength: val })
	}

	createCableLengthInput(): JSX.Element {
		return (
			<Mui.TextField
				className="point-input"
				label="Cable Length"
				value={this.state.cableLength}
				margin="dense"
				inputProps={{style: {fontFamily: "Consolas, 'Courier New', monospace"}}}
				onChange={(e) => { this.updateCableLength(e.target.value) }}
				/>
		);
	}

	createFabricPoint(val: string): fabric.Point | null {
		const parts = val.split(",");
		if (parts.length < 2) return null;
		const x = Number(trim(parts[0]));
		const y = Number(trim(parts[1]));
		if (isNaN(x) || isNaN(y)) return null;
		return new fabric.Point(x, y);
	}

	setRobot(ind: 0 | 1): void {
		const center = this.createFabricPoint(this.state.robots[ind]);
		if (center) {
			Model.Instance.setRobot(new Robot(`R${ind}`, center, ind === 0 ? "red" : "blue"), ind);
		}
	}

	handleRobotChange(val: string, ind: 0 | 1): void {
		const currentRobots = this.state.robots;
		currentRobots[ind] = val;
		this.setState({ robots: currentRobots });
		this.setRobot(ind);
	}

	createRobotInput(ind: 0 | 1): JSX.Element {
		return (
			<div>
				<Mui.Tooltip title="Comma separated X, Y" placement="top">
					<Mui.TextField
						className="point-input"
						label={`Robot ${ind + 1}`}
						value={this.state.robots[ind]}
						margin="dense"
						inputProps={{style: {fontFamily: "Consolas, 'Courier New', monospace"}}}
						onChange={(e) => { this.handleRobotChange(e.target.value, ind); }}
						/>
				</Mui.Tooltip>
			</div>
		);
	}

	setObstacle(ind: number): void {
		const verts: fabric.Point[] = [];
		this.state.obstacles[ind].forEach((vertStr) => {
			const vert = this.createFabricPoint(vertStr);
			if (vert) {
				verts.push(vert);
			}
		});
		SortPointsClockwise(verts);
		Model.Instance.setObstacle(new Obstacle(`O${ind}`, verts), ind);
	}

	addPointToObstacle(obsInd: number): void {
		const currentObs = this.state.obstacles;
		currentObs[obsInd].push("0, 0");
		this.setState({ obstacles: currentObs });
		this.setObstacle(obsInd)
	}

	updatePointInObstacle(val: string, obsInd: number, verInd: number): void {
		const currentObs = this.state.obstacles;
		currentObs[obsInd][verInd] = val;
		this.setState({ obstacles: currentObs });
		this.setObstacle(obsInd)
	}

	removePointFromObstacle(obsInd: number, verInd: number): void {
		const currentObs = this.state.obstacles;
		currentObs[obsInd].splice(verInd, 1);
		this.setState({ obstacles: currentObs });
		this.setObstacle(obsInd)
	}

	createObstaclePointInputs(obstacle: string[], obsInd: number): JSX.Element {
		return (
			<div key={`div-O-${obsInd}`}>
				<p>
					{`Obstacle ${obsInd + 1}`}
					<Mui.Tooltip title="Remove Obstacle" placement="top">
						<Mui.IconButton aria-label="Toggle password visibility" onClick={() => { this.removeObstacle(obsInd) }}>
							<RemoveIcon fontSize="small" />
						</Mui.IconButton>
					</Mui.Tooltip>
				</p>
				{obstacle.map((val: string, vertInd: number) => (
					<Mui.Tooltip key={`O${obsInd}-${vertInd}`} title="Comma separated X, Y" placement="top">
						<Mui.TextField
							className="point-input"
							label={`V${vertInd + 1}`}
							value={val}
							margin="dense"
							inputProps={{style: {fontFamily: "Consolas, 'Courier New', monospace"}}}
							InputProps={vertInd > 2 ? {
								endAdornment: (
								<Mui.InputAdornment position="end">
									<Mui.Tooltip title="Remove Vertex" placement="bottom">
										<Mui.IconButton aria-label="Toggle password visibility" onClick={() => { this.removePointFromObstacle(obsInd, vertInd) }}>
											<RemoveIcon fontSize="small" />
										</Mui.IconButton>
									</Mui.Tooltip>
								</Mui.InputAdornment>
								)
							} : {}}
							onChange={(e) => { this.updatePointInObstacle(e.target.value, obsInd, vertInd) }}
							/>
					</Mui.Tooltip>
				))}
				<Mui.Tooltip title="Add Vertex" placement="top">
					<Mui.IconButton className="inline-button" color="primary" aria-label="Add Vertex" onClick={() => { this.addPointToObstacle(obsInd) }}>
						<AddIcon fontSize="small" />
					</Mui.IconButton>
				</Mui.Tooltip>
			</div>
		);
	}

	createRowsForAddedObstacles(): JSX.Element {
		return (
			<div>
				{this.state.obstacles.map(this.createObstaclePointInputs)}
			</div>
		);
	}

	addObstacle(): void {
		const currentObs = this.state.obstacles;
		currentObs.push(["0, 0", "0, 0", "0, 0"]); // min obstacle is triangle, we only work with polygonal obstacles
		this.setState({ obstacles: currentObs });
	}

	removeObstacle(ind: number): void {
		const currentObs = this.state.obstacles;
		currentObs.splice(ind, 1);
		this.setState({ obstacles: currentObs });
		Model.Instance.removeObstacle(ind);
	}

	createObstacleInput(): JSX.Element {
		return (
			<div>
				{this.createRowsForAddedObstacles()}
				<Mui.Button variant="contained" color="primary" size="small" onClick={this.addObstacle}>Create New Obstacle</Mui.Button>
			</div>
		);
	}

	render() {
		return (
			<div>
				<p>Import/Export</p>
				{this.getJsonTextArea()}
				<p>Cable Length</p>
				{this.createCableLengthInput()}
				<p>Robots</p>
				{this.createRobotInput(0)}
				{this.createRobotInput(1)}
				<p>Obstacles</p>
				{this.createObstacleInput()}
			</div>
		);
	}
}
