export class LevelSelector extends React.Component {
	constructor(props) {
		super(props);

		this.onSelect = this.onSelect.bind(this);

		this.state = {
			levels: [
				{ label: "All", value: "" },
				{ label: "Debug", value: "debug" },
				{ label: "Info", value: "info" },
				{ label: "Warning", value: "warn" },
				{ label: "Error", value: "error" },
				{ label: "Fatal", value: "fatal" },
				{ label: "Panic", value: "panic" },
			],
			selected: this.props.value
		};
	}

	onSelect(e) {
		this.setState({ selected: e.target.value });
		this.props.onSelect(e.target.value);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ selected: nextProps.value });
	}

	render() {
		return (
			<div>
				<select onChange={this.onSelect} value={this.state.selected}>
					{this.state.levels.map((level) => {
						return <option value={level.value} key={level.value}>{level.label}</option>;
					})}
				</select>
			</div>
		);
	}
}

//window.LevelSelector = LevelSelector;