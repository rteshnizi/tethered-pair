import * as React from 'react';
import { BindMemberMethods } from '../utils/react';

export class Home extends React.Component {
	constructor(props: {}) {
		super(props);
		BindMemberMethods(Home.prototype, this);
	}

	render() {
		return (
			<div>
				<header className="App-header">
					<p> Reza Teshnizi </p>
					<p> Content will be added here! </p>
				</header>
			</div>
		);
	}
}