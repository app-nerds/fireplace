class Header extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<Grommet.Header size="small" fixed={true}>
				<Grommet.Title>Fireplace Viewer</Grommet.Title>
				<Grommet.Box flex={true} justify="end" direction="row" responsive={true}>
					<Grommet.Search inline={true} fill={true} size="medium" placeHolder="Search" dropAlign={{ "right": "right" }} />
					<Grommet.Button icon={<Grommet.RefreshIcon onClick={this.props.onRefresh} />} />
					<Grommet.Button icon={<Grommet.CaretPreviousIcon onClick={this.props.onPreviousPage} />} />
					<Grommet.Button icon={<Grommet.CaretNextIcon onClick={this.props.onNextPage} />} />
				</Grommet.Box>
			</Grommet.Header>
		);
	}
}

window.Header = Header;