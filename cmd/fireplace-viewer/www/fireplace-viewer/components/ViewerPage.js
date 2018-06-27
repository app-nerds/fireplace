class ViewerPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			entries: [],
			selectedEntry: undefined,
			error: undefined,
			detailsActive: false,
			recordCount: 0,
			page: 1
		};

		this.onRefresh = this.onRefresh.bind(this);
		this.onShowDetails = this.onShowDetails.bind(this);
		this.handleDetailsOnClose = this.handleDetailsOnClose.bind(this);
		this.onNextPage = this.onNextPage.bind(this);
		this.onPreviousPage = this.onPreviousPage.bind(this);
	}

	getLogEntries(search) {
		let options = {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		};

		fetch("/logentry", options)
			.then(response => response.json())
			.then((result) => {
				this.setState({ entries: result, error: undefined })
			})
			.catch((err) => {
				console.log(err);
				this.setState({ entries: [], error: err });
			});
	}

	getLogEntry(id) {
		let options = {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		};

		return new Promise((resolve, reject) => {
			fetch("/logentry/" + id, options)
				.then(response => response.json())
				.then(entry => this.setState({ selectedEntry: entry, error: undefined }))
				.then(() => {
					return resolve();
				})
				.catch((err) => {
					this.setState({ error: err });
					return reject(err);
				});
		})
	}

	handleDetailsOnClose() {
		this.setState({ detailsActive: false });
	}

	onRefresh(e) {
		e.preventDefault();
		this.getLogEntries();
	}

	onShowDetails(e) {
		e.preventDefault();

		var id = e.currentTarget.dataset.id;
		this.getLogEntry(id)
			.then(() => {
				this.setState({ detailsActive: true });
			});
	}

	onNextPage(e) {
		e.preventDefault();
	}

	onPreviousPage(e) {
		e.preventDefault();
	}

	componentDidMount() {
		this.getLogEntries();
	}

	render() {
		return (
			<Grommet.App centered={false}>
				<Header onRefresh={this.onRefresh} onNextPage={this.onNextPage} onPreviousPage={this.onPreviousPage} />
				<Grommet.Box flex={true}>
					{this.state.detailsActive &&
						<Grommet.Layer closer={true} overlayClose={true} onClose={this.handleDetailsOnClose}>
							<Grommet.Article full={true}>
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

					<Grommet.Table>
						<tbody>
							{this.state.entries.map((entry) => {
								let backgroundColor = "neutral-1";
								let details = entry.details;

								if (entry.level === "error") {
									backgroundColor = "critical";
								}

								if (entry.level === "debug") {
									backgroundColor = "accent-2-t";
								}

								return (
									<Grommet.TableRow key={entry.id}>
										{details ? <td style={{ "width": "2%" }}><Grommet.Button icon={<Grommet.FormNextLinkIcon />} onClick={this.onShowDetails} data-id={entry.id} /></td> : <td>&nbsp;</td>}
										<td style={{ "width": "15%" }}>{entry.application}</td>
										<td style={{ "width": "5%" }}><Grommet.Box colorIndex={backgroundColor}>{entry.level}</Grommet.Box></td>
										<td style={{ "width": "58%" }}>{entry.message}</td>
										<td style={{ "width": "25%" }}><FormatDateTime date={entry.time} /></td>
									</Grommet.TableRow>
								);
							})}
						</tbody>
					</Grommet.Table>
				</Grommet.Box>
			</Grommet.App>
		);
	}
}

ReactDOM.render(<ViewerPage />, document.getElementById("content"));