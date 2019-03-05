// import * as Mui from '@material-ui/core';
// import * as React from 'react';

export class Presets {
// 	parseJson(callback: () => void): void {
// 		let partialState: Pick<InputState, "robots" | "obstacles" | "cableLength">;
// 		partialState = JSON.parse(this.state.jsonState);
// 		this.state.obstacles.forEach((obs, ind) => { Model.Instance.removeObstacle(ind); });
// 		this.setState(partialState);
// 		window.setTimeout(() => {
// 			Object.keys(partialState.robots).forEach((ind) => { this.setRobot(Number(ind) as 0 | 1) });
// 			Object.keys(partialState.obstacles).forEach((ind) => { this.setObstacle(Number(ind)) });
// 		}, 500);
// 	}

// 	exportCurrentAsJson(): void {
// 		const selectedState = {
// 			robots: this.state.robots,
// 			obstacles: this.state.obstacles,
// 			cableLength: Number(this.state.cableLength),
// 		};
// 		const jsonState = JSON.stringify(selectedState);
// 		this.setState({ jsonState });
// 	}

// 	getPresetSelector(): JSX.Element {
// 		return(
// 			<Mui.FormControl>
// 				<Mui.InputLabel htmlFor="preset-select">Presets</Mui.InputLabel>
// 				<Mui.Select
// 					value={this.state.jsonState}
// 					className="preset-select"
// 					inputProps={{ name: 'preset', id: 'preset-select' }}
// 					onChange={(e) => { this.setState({ jsonState: e.target.value }); }}
// 				>
// 					{
// 						AllPresets.map((preset, ind) => <Mui.MenuItem key={`sel-item-${ind}`} value={preset.json}>{preset.name}</Mui.MenuItem>)
// 					}
// 				</Mui.Select>
// 			</Mui.FormControl>
// 		);
// 	}

// 	getJsonTextArea(): JSX.Element {
// 		return (
// 			<div>
// 				<Mui.TextField
// 					multiline={true}
// 					rowsMax={5}
// 					value={this.state.jsonState}
// 					inputProps={{style: {fontFamily: "Consolas, 'Courier New', monospace", fontSize: 12}}}
// 					style={{width:"100%"}}
// 					onChange={(e) => { this.setState({ jsonState: e.target.value }) }}
// 					/>
// 				<Mui.Button className="button-with-margin" size="small" variant="contained" color="primary" aria-label="Parse" onClick={this.parseJson}>
// 					Parse JSON
// 				</Mui.Button>
// 				<Mui.Button className="button-with-margin" size="small" variant="contained" color="primary" aria-label="Export" onClick={this.exportCurrentAsJson}>
// 					Get Map as JSON
// 				</Mui.Button>
// 				{this.getPresetSelector()}
// 			</div>
// 		);
// 	}
}
