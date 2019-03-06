import * as Mui from '@material-ui/core';
import { map } from 'lodash';
import * as React from 'react';
import { BindMemberMethods } from './utils/react';
import { Viewer } from './viewer/viewer';
import { InputArea } from './ui/input-area';
import Theme from './ui/theme';
import { Header } from './ui/header';
import { MakeGapStrings } from './planner/algorithm';
import Model from './model/model-service';

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

	nextStep(): void {
		switch (this.state.activeStep) {
			case 0:
				this.setState({ activeStep: 1 })
				break;
			case 1:
				this.setState({ activeStep: 2 })
				break;
			default:
				break;
		}
	}

	handleStepClick(activeStep: keyof AppSteps): void {
		this.setState({ activeStep });
	}

	simulate(): void {
		MakeGapStrings();
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

	nextStepBtnCallback(): void {
		if (this.state.activeStep < 2) {
			this.nextStep();
		} else {
			this.simulate();
		}
	}

	readyToSimulate(): boolean {
		return (
			this.state.activeStep < 2 ||
			(
				!!Model.Instance.Robots[0].Destination &&
				!!Model.Instance.Robots[1].Destination
			)
		);
	}

	getStepperButton(): JSX.Element {
		return (
			<div>
				<Mui.Button
					className="button-with-margin"
					size="small"
					variant="contained"
					color="primary"
					aria-label="Next Step"
					disabled={!this.readyToSimulate()}
					onClick={this.nextStepBtnCallback}
					>
						{this.state.activeStep < 2 ? "Next Step" : "Simulate"}
				</Mui.Button>
			</div>
		);
	}

	render() {
		return (
			<Mui.MuiThemeProvider theme={Theme}>
				<Header />
				{this.getStepper()}
				{this.getStepperButton()}
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
