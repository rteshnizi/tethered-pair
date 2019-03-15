import * as React from 'react';
import { BindMemberMethods } from '../utils/react';
import Model from '../model/model-service';
import * as Mui from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DEBUG_LEVEL } from '../utils/debug';
import { map } from 'lodash';

export class SimulationInfoState {
	public expandedNodes: number;
	public totalNodes: number;
	public iteration: number;
	public maxIterations: string;
	public maxDepth: string;
	public debugLevel: DEBUG_LEVEL;
	constructor() {
		this.expandedNodes = 0;
		this.totalNodes = 0;
		this.iteration = 0;
		this.maxIterations = `${Model.Instance.CONSTANTS.ITERATION_LIMIT}`;
		this.maxDepth = `${Model.Instance.CONSTANTS.DEPTH_LIMIT}`;
		this.debugLevel = Model.Instance.CONSTANTS.DEBUG_LEVEL;
	}
}

export class SimulationInfo extends React.Component<{}, SimulationInfoState> {
	constructor(props: {}) {
		super(props);
		this.state = new SimulationInfoState();
		BindMemberMethods(SimulationInfo.prototype, this);
		// Model.Instance.simulationInfoReactComp = this;
	}

	getEntityList(): JSX.Element[] {
		const elems: JSX.Element[] = [];
		Model.Instance.AllEntities.forEach((e, name) => {
			elems.push(
				<div key={`sim-inf-${name}`} className="simulation-info-elem" onMouseEnter={() => { e.select(); }} onMouseLeave={() => { e.deselect(); }}>
					{name}
				</div>
			);
		});
		return elems;
	}

	private handleMaxIterChange(value: string): any {
		Model.Instance.CONSTANTS.ITERATION_LIMIT = Number(value);
		this.setState({ maxIterations: value });
	}

	private handleMaxDepthChange(value: string): any {
		Model.Instance.CONSTANTS.DEPTH_LIMIT = Number(value);
		this.setState({ maxDepth: value });
	}

	render() {
		return (
			<div>
				{/* <Mui.LinearProgress variant="buffer" value={this.state.expandedNodes} valueBuffer={this.state.totalNodes} /> */}
				{/* <Mui.LinearProgress variant="determinate" value={this.state.expandedNodes} /> */}
				<div>
					<Mui.FormControl style={{ width: "100%" }}>
						<Mui.InputLabel htmlFor="debug-level">Debug Verbosity</Mui.InputLabel>
						<Mui.Select
							value={this.state.debugLevel}
							inputProps={{ name: 'preset', id: 'preset-select' }}
							onChange={(e) => {
								// @ts-ignore value is a number not a string
								const val = e.target.value as DEBUG_LEVEL;
								Model.Instance.CONSTANTS.DEBUG_LEVEL = val;
								this.setState({ debugLevel: val });
							}}
						>
							{
								Object.keys(DEBUG_LEVEL).
									filter((str) => isNaN(Number(str))).
									map((level, ind) => <Mui.MenuItem key={`sel-item-${ind}`} value={ind}>{level}</Mui.MenuItem>)
								// map(DEBUG_LEVEL, (level, name) => <Mui.MenuItem key={`sel-item-${name}`} value={level}>{name}</Mui.MenuItem>)
							}
						</Mui.Select>
					</Mui.FormControl>
					<Mui.Tooltip title="Max Iterations" placement="top">
						<Mui.TextField
							fullWidth={true}
							label="Max Iteration"
							value={this.state.maxIterations}
							margin="dense"
							inputProps={{style: {fontFamily: "Consolas, 'Courier New', monospace"}}}
							onChange={(e) => { this.handleMaxIterChange(e.target.value); }}
							/>
					</Mui.Tooltip>
				</div>
				<div>
					<Mui.Tooltip title="Max Depth" placement="top">
						<Mui.TextField
							fullWidth={true}
							label="Max Depth"
							value={this.state.maxDepth}
							margin="dense"
							inputProps={{style: {fontFamily: "Consolas, 'Courier New', monospace"}}}
							onChange={(e) => { this.handleMaxDepthChange(e.target.value); }}
							/>
					</Mui.Tooltip>
				</div>
				<Mui.ExpansionPanel>
					<Mui.ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
						<h4>Entity Explorer</h4>
					</Mui.ExpansionPanelSummary>
					<Mui.ExpansionPanelDetails>
						<div className="simulation-info">
							{this.getEntityList()}
						</div>
					</Mui.ExpansionPanelDetails>
				</Mui.ExpansionPanel>
			</div>
		);
	}
}
