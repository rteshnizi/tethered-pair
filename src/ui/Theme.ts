import { createMuiTheme } from '@material-ui/core/styles';

const Theme = createMuiTheme(
	{
		palette: {
			background: {
				default: "#282c34",
				paper: "#697488",
			},
			primary: { main: "#673ab7" },
			secondary: { main: "#3d5afe"},
		},
	}
);

export default Theme;
