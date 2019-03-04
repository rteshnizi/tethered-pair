// import { Button } from '@material-ui/core';
import * as React from 'react';
import { BindMemberMethods } from '../utils/react';
import Renderer from './renderer-service';

export const VIEWIER_CANVAS_ID = "viewer-canvas";

interface ViewerState {
	width: number;
	height: number;
}

export class Viewer extends React.Component<{}, ViewerState> {
	constructor(props: {}) {
		super(props);
		this.state = {
			height: 600,
			width: 400,
		};
		BindMemberMethods(Viewer.prototype, this);
		// Maybe remove this later and see if it affects anything.
		// Right now if I don't do this the canvas won't initialize correctly
		window.setTimeout(() => {
			const el = document.getElementsByClassName("viewer")[0];
			let width = 0;
			let height = 0;
			if (el) {
				width = el.clientWidth;
				height = el.clientHeight;
				this.setState({ width, height });
				window.setTimeout(() => { Renderer.Instance.render(); }, 200);
			}
		}, 500);
	}

	render() {
		return (
			<div className="viewer">
				<canvas id={VIEWIER_CANVAS_ID} width={`${this.state.width}px`} height={`${this.state.height}px`} />
				{/* <Button variant="contained" color="primary" onClick={() => { Renderer.Instance.render(); }}>Render</Button> */}
			</div>
		);
	}
}
