import * as React from 'react';
import { BindMemberMethods } from '../utils/react';
import Model from '../model/model-service';

class SimulationInfoState {
}

export class SimulationInfo extends React.Component<{}, SimulationInfoState> {
	constructor(props: {}) {
		super(props);
		this.state = new SimulationInfoState();
		BindMemberMethods(SimulationInfo.prototype, this);
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
			<div className="simulation-info">
				{this.getEntityList()}
			</div>
		);
	}
}
