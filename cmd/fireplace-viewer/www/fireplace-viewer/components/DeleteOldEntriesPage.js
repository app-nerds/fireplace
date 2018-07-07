import { Header } from "./Header";

export class DeleteOldEntriesPage extends React.Component {
	constructor(props) {
		super(props);

		this.onDelete = this.onDelete.bind(this);
		this.onFromDateChange = this.onFromDateChange.bind(this);

		this.state = {
			fromDate: ""
		};

	}

	onDelete(e) {
		e.preventDefault();

		let options = {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			}
		};

		fetch("/logentry?fromDate=" + this.state.fromDate, options)
			.then(response => response.text())
			.then((result) => {
				alert(result);
			})
			.catch((err) => {
				alert("Error deleting log entries: " + err);
			});
	}

	onFromDateChange(e) {
		this.setState({
			fromDate: e
		});
	}

	componentDidMount() {
	}

	render() {
		return (
			<Grommet.App centered={false}>
				<Header showEntryManagement={false} />
				<Grommet.Box flex={true}>
					<Grommet.Notification message="Select a date to delete entries from. Fireplace will delete all entries older than this date." status="ok" />

					<Grommet.Box pad="small">
						<Grommet.Form>
							<Grommet.FormFields>
								<Grommet.DateTime id="fromDate" name="fromDate" format="M/D/YYYY" onChange={this.onFromDateChange} value={this.state.fromDate} />
							</Grommet.FormFields>
							<Grommet.Footer pad={{ "vertical": "medium" }}>
								<Grommet.Button label="Delete" type="button" primary={true} onClick={this.onDelete} />
							</Grommet.Footer>
						</Grommet.Form>
					</Grommet.Box>
				</Grommet.Box>
			</Grommet.App>
		);
	}
}

ReactDOM.render(<DeleteOldEntriesPage />, document.getElementById("content"));