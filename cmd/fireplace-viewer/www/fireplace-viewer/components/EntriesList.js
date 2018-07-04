class EntriesList extends React.Component {
	constructor(props) {
		super(props);

		this.onShowDetails = this.onShowDetails.bind(this);

		this.state = {
			entries: props.entries
		};
	}

	onShowDetails(selectedIndex) {
		let entry = this.state.entries[selectedIndex];
		this.props.onShowDetails(entry);
	}

	componentDidMount() {
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			entries: nextProps.entries
		});
	}

	render() {
		let control;

		if (this.state.entries.length <= 0) {
			control = <p>No log entries to display</p>;
		} else {
			control = (
				<Grommet.List selectable={true} onSelect={this.onShowDetails}>
					{this.state.entries.map((entry) => {
						return (
							<EntryListItem entry={entry} key={entry.id} />
						);
					})}
				</Grommet.List>
			);
		}

		return control;
	}
}

window.EntriesList = EntriesList;