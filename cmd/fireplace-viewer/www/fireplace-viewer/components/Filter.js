class Filter extends React.Component {
	constructor(props) {
		super(props);

		this.onApplicationSelect = this.onApplicationSelect.bind(this);
		this.onLevelSelect = this.onLevelSelect.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onClear = this.onClear.bind(this);

		this.state = {
			visible: false,
			application: props.application,
			level: props.level
		};
	}

	onApplicationSelect(application) {
		this.props.onApplicationSelect(application);
	}

	onLevelSelect(level) {
		this.props.onLevelSelect(level);
	}

	onClose() {
		this.props.onClose();
	}

	onClear() {
		this.setState({
			application: "All",
			level: ""
		});

		this.props.onApplicationSelect("All");
		this.props.onLevelSelect("");
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			visible: nextProps.visible,
			application: nextProps.application,
			level: nextProps.level
		});
	}

	render() {
		return (
			<div>
				{this.state.visible && (
					<Grommet.Layer closer={true} align="right" overlayClose={true} onClose={this.onClose}>
						<Grommet.Form pad="small">
							<Grommet.Header>
								<Grommet.Heading>Filter</Grommet.Heading>
							</Grommet.Header>

							<Grommet.FormFields>
								<ApplicationSelector onSelect={this.onApplicationSelect} value={this.state.application} />
								<LevelSelector onSelect={this.onLevelSelect} value={this.state.level} />
							</Grommet.FormFields>

							<Grommet.Footer pad={{ "vertical": "medium" }}>
								<Grommet.Button label="Close" type="button" primary={true} onClick={this.onClose} />
								<Grommet.Button label="Clear" type="button" onClick={this.onClear} />
							</Grommet.Footer>
						</Grommet.Form>
					</Grommet.Layer>
				)}
			</div>
		);
	}
}

window.Filter = Filter;