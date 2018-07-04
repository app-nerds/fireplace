class Header extends React.Component {
	constructor(props) {
		super(props);

		this.filterVisible = false;

		this.onTitleClick = this.onTitleClick.bind(this);
		this.onApplicationSelect = this.onApplicationSelect.bind(this);
		this.onLevelSelect = this.onLevelSelect.bind(this);
		this.toggleFilter = this.toggleFilter.bind(this);
		this.onFilterClose = this.onFilterClose.bind(this);
		this.onRefresh = this.onRefresh.bind(this);

		this.state = {
			page: props.page,
			filterVisible: false,
			application: this.props.application,
			level: this.props.level
		};
	}

	onTitleClick(e) {
		e.preventDefault();
		window.location = "/";
	}

	onApplicationSelect(appliation) {
		this.props.onApplicationSelect(appliation);
	}

	onLevelSelect(level) {
		this.props.onLevelSelect(level);
	}

	toggleFilter() {
		this.filterVisible = !this.filterVisible;

		this.setState({
			filterVisible: this.filterVisible
		});
	}

	onFilterClose() {
		this.filterVisible = false;

		this.setState({
			filterVisible: this.filterVisible
		});
	}

	onRefresh(e) {
		e.preventDefault();
		this.props.onRefresh();
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			page: nextProps.page,
			application: nextProps.application,
			level: nextProps.level
		});
	}

	render() {
		return (
			<div>
				<Grommet.Header size="small" fixed={true}>
					<Grommet.Title onClick={this.onTitleClick}>Fireplace Viewer</Grommet.Title>
					<Grommet.Box flex={true} justify="end" direction="row" responsive={true}>
						{this.props.showEntryManagement &&
							<div>
								<Grommet.Search inline={true} fill={true} size="medium" placeHolder="Search" dropAlign={{ "right": "right" }} onDOMChange={this.props.onSearch} />
								<Grommet.Button icon={<Grommet.RefreshIcon onClick={this.onRefresh} />} />
								<Paging
									page={this.state.page}
									onNextPage={this.props.onNextPage}
									onPreviousPage={this.props.onPreviousPage} />
								<Grommet.Button icon={<Grommet.FilterIcon />} onClick={this.toggleFilter} />
							</div>
						}
						<Grommet.Menu icon={<Grommet.ActionsIcon />} dropAlign={{ "right": "right", "top": "bottom" }}>
							<Grommet.Anchor href="/deleteoldentries" label="Delete Old Entries" />
						</Grommet.Menu>
					</Grommet.Box>
				</Grommet.Header>

				<div>
					<Filter
						visible={this.state.filterVisible}
						onApplicationSelect={this.onApplicationSelect}
						onLevelSelect={this.onLevelSelect}
						onClose={this.onFilterClose}
						application={this.state.application}
						level={this.state.level} />
				</div>
			</div>
		);
	}
}

window.Header = Header;