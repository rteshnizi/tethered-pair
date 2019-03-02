import * as React from 'react';
import { BindMemberMethods } from '../utils/react';

export class Viewer extends React.Component {
	constructor(props: {}) {
		super(props);
		BindMemberMethods(Viewer.prototype, this);
	}

	render() {
		return (
			<div className="viewer">
				Viewer
			</div>
		);
	}
}