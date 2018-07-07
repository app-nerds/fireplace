export class ApplicationSelector extends React.Component {
	constructor(props) {
		super(props);

		this.onSelect = this.onSelect.bind(this);

		this.state = {
			applicationNames: [],
			selected: this.props.value
		};
	}

	getApplicationList() {
		let options = {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		};

		fetch("/applicationname", options)
			.then(response => response.json())
			.then((result) => {
				result.unshift("All");

				this.setState({
					applicationNames: result
				});
			})
			.catch((err) => {
				console.log(err);
				alert("There was an error getting application names");
			});
	}

	onSelect(e) {
		this.setState({ selected: e.target.value });
		this.props.onSelect(e.target.value);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ selected: nextProps.value });
		this.getApplicationList();
	}

	componentDidMount() {
		this.getApplicationList();
	}

	render() {
		return (
			<div>
				<select onChange={this.onSelect} value={this.state.selected}>
					{this.state.applicationNames.map((value) => {
						return <option value={value} key={value}>{value}</option>;
					})}
				</select>
			</div>
		);
	}
}

//window.ApplicationSelector = ApplicationSelector;