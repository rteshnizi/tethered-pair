// import { Button } from '@material-ui/core';
import * as React from 'react';
import { BindMemberMethods } from '../utils/react';
import Renderer from './renderer-service';

export const VIEWIER_CANVAS_ID = "viewer-canvas";

export class Viewer extends React.Component {
	constructor(props: {}) {
		super(props);
		BindMemberMethods(Viewer.prototype, this);
		window.setTimeout(() => { Renderer.Instance.render(); }, 400);	// Maybe remove this later and see if it affects anything.
																		// Right now if I don't do this the canvas won't initialize correctly
	}

	render() {
		return (
			<div className="viewer">
				<canvas id={VIEWIER_CANVAS_ID} width="400px" height="600px" />
				{/* <Button variant="contained" color="primary" onClick={() => { Renderer.Instance.render(); }}>Render</Button> */}
			</div>
		);
	}
}
