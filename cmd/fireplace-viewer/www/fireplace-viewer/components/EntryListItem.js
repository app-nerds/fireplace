import Status from "grommet/components/icons/Status";
import ListItem from "grommet/components/ListItem";
import Table from "grommet/components/Table";
import TableRow from "grommet/components/TableRow";
import React, { Component } from "react";
import FormatDateTime from "./FormatDateTime";

export default class EntryListItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
			entry: props.entry
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			entry: nextProps.entry
		});
	}

	render() {
		let statusIcon = "";

		switch (this.state.entry.level) {
			case "panic":
			case "fatal":
			case "error":
				statusIcon = "critical";
				break;

			case "warning":
				statusIcon = "warning";
				break;

			case "debug":
				statusIcon = "disabled";
				break;

			default:
				statusIcon = "ok";
				break;
		}

		return (
			<ListItem justify="between" separator="horizontal" key={this.state.entry.id}>
				<Table responsive={true} className="message-table">
					<tbody>
						<TableRow>
							<td style={{ "width": "10%" }}><Status value={statusIcon} /></td>
							<td>{this.state.entry.message}</td>
						</TableRow>
					</tbody>
				</Table>

				<span className="secondary"><FormatDateTime date={this.state.entry.time} /></span>
			</ListItem>
		);
	}
}

//window.EntryListItem = EntryListItem;