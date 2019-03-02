import { createMuiTheme } from '@material-ui/core/styles';

const Theme = createMuiTheme(
	{
		palette: {
			type: "dark",
			background: {
				default: "#212121",
				paper: "#303030",
			},
		},
	}
);

export default Theme;
