import { FormatDateTime } from "./FormatDateTime";
export class EntryListItem extends React.Component {
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
			<Grommet.ListItem justify="between" separator="horizontal" key={this.state.entry.id}>
				<Grommet.Table responsive={true} className="message-table">
					<tbody>
						<Grommet.TableRow>
							<td style={{ "width": "10%" }}><Grommet.Icons.Status value={statusIcon} /></td>
							<td>{this.state.entry.message}</td>
						</Grommet.TableRow>
					</tbody>
				</Grommet.Table>

				<span className="secondary"><FormatDateTime date={this.state.entry.time} /></span>
			</Grommet.ListItem>
		);
	}
}

//window.EntryListItem = EntryListItem;