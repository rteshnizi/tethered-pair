import * as React from 'react';
import { BindMemberMethods } from '../utils/react';

export class Viewer extends React.Component {
	constructor(props: {}) {
		super(props);
		BindMemberMethods(Viewer.prototype, this);
	}

	render() {
		return (
			<div>
				<header className="header">
					<p> Reza Teshnizi </p>
					<p> Content will be added here! </p>
				</header>
			</div>
		);
	}
}