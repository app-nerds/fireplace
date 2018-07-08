import Box from "grommet/components/Box";
import Button from "grommet/components/Button";
import DateTime from "grommet/components/DateTime";
import Footer from "grommet/components/Footer";
import Form from "grommet/components/Form";
import FormFields from "grommet/components/FormFields";
import Notification from "grommet/components/Notification";
import React, { Component } from "react";

export default class DeleteOldEntriesPage extends Component {
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
			<div>
				<Notification message="Select a date to delete entries from. Fireplace will delete all entries older than this date." status="ok" />

				<Box pad="small">
					<Form>
						<FormFields>
							<DateTime id="fromDate" name="fromDate" format="M/D/YYYY" onChange={this.onFromDateChange} value={this.state.fromDate} />
						</FormFields>
						<Footer pad={{ "vertical": "medium" }}>
							<Button label="Delete" type="button" primary={true} onClick={this.onDelete} />
						</Footer>
					</Form>
				</Box>
			</div>
		);
	}
}

//ReactDOM.render(<DeleteOldEntriesPage />, document.getElementById("content"));