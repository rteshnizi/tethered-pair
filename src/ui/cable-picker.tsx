import * as React from 'react';
import { BindMemberMethods } from '../utils/react';
import Model from '../model/model-service';
import * as Mui from '@material-ui/core';

export class CablePicker extends React.Component<{}, {}> {
	constructor(props: {}) {
		super(props);
		BindMemberMethods(CablePicker.prototype, this);
	}

	getVertices(): JSX.Element[] {
		const elems: JSX.Element[] = [];
		Model.Instance.Vertices.forEach((e) => {
			elems.push(
				<div
					key={`cable-picker-${e.name}`}
					className="cable-picker-elem"
					onMouseEnter={() => { e.select(); }}
					onMouseLeave={() => { e.deselect(); }}>
					{e.name}
				</div>
			);
		});
		return elems;
	}

	render() {
		return (
			<div className="cable-picker">
				{this.getVertices()}
			</div>
		);
	}
}
