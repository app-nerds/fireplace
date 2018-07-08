import Article from "grommet/components/Article";
import Header from "grommet/components/Header";
import Layer from "grommet/components/Layer";
import Section from "grommet/components/Section";
import Table from "grommet/components/Table";
import TableRow from "grommet/components/TableRow";
import React, { Component } from "react";

export default class LogEntryDetails extends Component {
	constructor(props) {
		super(props);

		this.onClose = this.onClose.bind(this);

		this.state = {
			active: props.active,
			selectedEntry: props.selectedEntry
		};
	}

	onClose() {
		this.props.onClose();
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			active: nextProps.active,
			selectedEntry: nextProps.selectedEntry
		});
	}

	render() {
		return (
			<div>
				{this.state.active &&
					<Layer closer={true} overlayClose={true} onClose={this.onClose} align="right" flush={false}>
						<Article pad="none" margin="none">
							<Header>Details</Header>

							<Section>
								<Table>
									<thead>
										<TableRow>
											<th>Key</th>
											<th>Value</th>
										</TableRow>
									</thead>
									<tbody>
										{this.state.selectedEntry.details.map((detail, index) => {
											return (
												<TableRow key={index}>
													<td>{detail.key}</td>
													<td>{detail.value}</td>
												</TableRow>
											);
										})}
									</tbody>
								</Table>
							</Section>
						</Article>
					</Layer>
				}
			</div>
		);
	}
}

//window.LogEntryDetails = LogEntryDetails;