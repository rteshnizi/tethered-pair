import * as React from 'react';
import { BindMemberMethods } from './utils/react';
import { Home } from './home/home';

interface AppState {
	MenuIsOpen: boolean;
}

class App extends React.Component<{}, AppState> {
	constructor(props: {}) {
		super(props);
		this.state = {
			MenuIsOpen: false,
		};
		BindMemberMethods(App.prototype, this);
	}

	render() {
		return (
		<div className="App">
			<Home />
		</div>
		);
	}
}

export default App;
