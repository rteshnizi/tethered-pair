import { Button } from '@material-ui/core';
import * as React from 'react';
import { BindMemberMethods } from '../utils/react';
import rendererService from './renderer-service';

export const VIEWIER_CANVAS_ID = "viewer-canvas";

export class Viewer extends React.Component {
	constructor(props: {}) {
		super(props);
		BindMemberMethods(Viewer.prototype, this);
	}

	render() {
		return (
			<div className="viewer">
				<canvas id={VIEWIER_CANVAS_ID} />
				<Button variant="outlined" color="primary" onClick={() => { rendererService.render(); }}>Render</Button>
			</div>
		);
	}
}
