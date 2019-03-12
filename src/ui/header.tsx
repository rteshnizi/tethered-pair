import * as React from 'react';
import { BindMemberMethods } from '../utils/react';
import pkg from '../../package.json';

export class Header extends React.Component {
	constructor(props: {}) {
		super(props);
		BindMemberMethods(Header.prototype, this);
	}

	render() {
		return (
			<div>
				<header className="header">
					<p> Tethered Pair Simulator </p>
					<div className="subheader">
						<sub>
							v {pkg.version}
							<br/>
							By Reza Teshnizi
						</sub>
					</div>
				</header>
			</div>
		);
	}
}