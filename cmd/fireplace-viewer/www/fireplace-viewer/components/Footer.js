class Footer extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<Grommet.Footer primary={true} justify="between">
				<Grommet.Box direction="row" align="center" pad={{ "between": "medium" }}>
					<Grommet.Paragraph margin="none">
						&copy; 2018 Adam Presley
					</Grommet.Paragraph>
				</Grommet.Box>
			</Grommet.Footer>
		);
	}
}

window.Footer = Footer;