import * as React from 'react';
import { HashRouter as Router, Link, Route, RouteComponentProps, Switch } from 'react-router-dom';
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
			<Router>
				<div className="App">
					<Switch>
						<Route exact={true} path="/" component={Home} />
						<Route render={this.render404} />
					</Switch>
				</div>
			</Router>
		);
	}

	private render404(props: RouteComponentProps): React.ReactNode {
		return (
			<div className="App-header">
				Page Not Found
				<Link className="App-header" to="/">Home</Link>
			</div>
		);
	}
}

export default App;
