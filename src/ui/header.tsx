import * as React from 'react';
import { BindMemberMethods } from '../utils/react';

export class Header extends React.Component {
	constructor(props: {}) {
		super(props);
		BindMemberMethods(Header.prototype, this);
	}

	render() {
		return (
		<header className="header">
			<p> Tethered Pair Simulator </p>
		</header>
		);
	}
}