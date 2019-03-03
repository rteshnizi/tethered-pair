import * as Mui from '@material-ui/core';
import { map } from 'lodash';
import * as React from 'react';
import { BindMemberMethods } from './utils/react';
import { Viewer } from './viewer/Viewer';
import { InputArea } from './ui/InputArea';
import Theme from './ui/Theme';
import { Header } from './ui/header';

export class AppSteps {
	0 = "Initial Configuration";
	1 = "Pick Destination";
	2 = "Simulate";
}

interface AppState {
	activeStep: keyof AppSteps;
}

class App extends React.Component<{}, AppState> {
	private steps: AppSteps;
	constructor(props: {}) {
		super(props);
		this.steps = new AppSteps();
		this.state = {
			activeStep: 0,
		};
		BindMemberMethods(App.prototype, this);
	}

	handleStepClick(activeStep: keyof AppSteps) {
		this.setState({ activeStep });
	}

	getStepper(): JSX.Element {
		return (
			<Mui.Stepper activeStep={this.state.activeStep}>
			{
				map(this.steps, (stepName, ind) => (
					<Mui.Step key={stepName}>
						<Mui.StepButton onClick={() => {this.handleStepClick(Number(ind) as keyof AppSteps)}}>
							{stepName}
						</Mui.StepButton>
					</Mui.Step>
				))
			}
			</Mui.Stepper>
		);
	}

	render() {
		return (
			<Mui.MuiThemeProvider theme={Theme}>
				{this.getStepper()}
				<Header />
				<div className="app">
					<div className="input-area-container">
						<InputArea activeStep={this.state.activeStep} />
					</div>
					<div className="viewer-container">
						<Viewer />
					</div>
				</div>
			</Mui.MuiThemeProvider>
		);
	}
}

export default App;
