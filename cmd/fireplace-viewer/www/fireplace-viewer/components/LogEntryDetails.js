class LogEntryDetails extends React.Component {
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
					<Grommet.Layer closer={true} overlayClose={true} onClose={this.onClose} align="right" flush={false}>
						<Grommet.Article pad="none" margin="none">
							<Grommet.Header>Details</Grommet.Header>

							<Grommet.Section>
								<Grommet.Table>
									<thead>
										<Grommet.TableRow>
											<th>Key</th>
											<th>Value</th>
										</Grommet.TableRow>
									</thead>
									<tbody>
										{this.state.selectedEntry.details.map((detail, index) => {
											return (
												<Grommet.TableRow key={index}>
													<td>{detail.key}</td>
													<td>{detail.value}</td>
												</Grommet.TableRow>
											);
										})}
									</tbody>
								</Grommet.Table>
							</Grommet.Section>
						</Grommet.Article>
					</Grommet.Layer>
				}
			</div>
		);
	}
}

window.LogEntryDetails = LogEntryDetails;