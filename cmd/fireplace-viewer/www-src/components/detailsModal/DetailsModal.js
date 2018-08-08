import PropTypes from "prop-types";
import React, { Component } from "react";
import { deepEqual } from "fast-equals";
import { DetailsPropType } from "../../propTypes/DetailsPropType";

export class DetailsModal extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		$(`#${this.props.name}`).modal({
			show: false
		});

		$(`#${this.props.name}`).on("hidden.bs.modal", () => {
			this.props.updateDetails({
				...this.props.details,
				visible: false
			});
		});
	}

	componentWillReceiveProps(nextProps) {
		if (!deepEqual(this.props, nextProps)) {
			if (nextProps.details.visible) {
				$(`#${this.props.name}`).modal("show");
			}
		}
	}

	render() {
		return (
			<div className="modal fade" id={this.props.name} tabIndex="-1" role="dialog" aria-hidden="true">
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">Log Entry Details</h5>
							<button type="button" className="close" data-dismiss="modal" aria-label="close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>

						<div className="modal-body">
							<table className="table table-striped">
								<thead>
									<tr>
										<th scope="col">Key</th>
										<th scope="col">Value</th>
									</tr>
								</thead>
								<tbody>
									{this.props.details.logEntry && this.props.details.logEntry.details.map((details) => {
										return (
											<tr key={details.key}>
												<td>{details.key}</td>
												<td>{details.value}</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>

						<div className="modal-footer">
							<button type="button" className="btn btn-primary" data-dismiss="modal">Close</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

DetailsModal.propTypes = {
	name: PropTypes.string.isRequired,
	details: DetailsPropType,
	updateDetails: PropTypes.func
};