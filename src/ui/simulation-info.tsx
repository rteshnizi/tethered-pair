import * as React from 'react';
import { BindMemberMethods } from '../utils/react';
import Model from '../model/model-service';
import * as Mui from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

export class SimulationInfoState {
	public expandedNodes: number;
	public totalNodes: number;
	public iteration: number;
	constructor() {
		this.expandedNodes = 0;
		this.totalNodes = 0;
		this.iteration = 0;
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

	render() {
		return (
			<div>
				{/* <Mui.LinearProgress variant="buffer" value={this.state.expandedNodes} valueBuffer={this.state.totalNodes} /> */}
				{/* <Mui.LinearProgress variant="determinate" value={this.state.expandedNodes} /> */}
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
