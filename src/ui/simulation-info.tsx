import * as React from 'react';
import { BindMemberMethods } from '../utils/react';
import Model from '../model/model-service';
import * as Mui from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

export class SimulationInfoState {
	public expandedNodes: number;
	public totalNodes: number;
	public iteration: number;
	public maxIterations: string;
	constructor() {
		this.expandedNodes = 0;
		this.totalNodes = 0;
		this.iteration = 0;
		this.maxIterations = `${Model.Instance.DEBUG_HARD_ITERATION_LIMIT}`;
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
		Model.Instance.DEBUG_HARD_ITERATION_LIMIT = Number(value);
		this.setState({ maxIterations: value });
	}

	render() {
		return (
			<div>
				{/* <Mui.LinearProgress variant="buffer" value={this.state.expandedNodes} valueBuffer={this.state.totalNodes} /> */}
				{/* <Mui.LinearProgress variant="determinate" value={this.state.expandedNodes} /> */}
				<div>
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
