import PropTypes from "prop-types";
import React, { Component } from "react";
import { deepEqual } from "fast-equals";
import { ApplicationSelector } from "../applicationSelector/ApplicationSelector";
import { LevelSelector } from "../levelSelector/LevelSelector";
import { FilterPropType } from "../../propTypes/FilterPropType";

export class FilterModal extends Component {
	constructor(props) {
		super(props);

		this.clear = this.clear.bind(this);

		this.state = {
			filter: props.filter
		};
	}

	componentDidMount() {
		$(`#${this.props.name}`).modal({
			show: false
		});

		$(`#${this.props.name}`).on("hidden.bs.modal", () => {
			this.props.updateFilter({
				...this.props.filter,
				visible: false
			});
		});
	}

	componentWillReceiveProps(nextProps) {
		if (!deepEqual(this.props, nextProps)) {
			if (nextProps.filter.visible) {
				$(`#${this.props.name}`).modal("show");
			}

			this.setState({
				filter: nextProps.filter
			});
		}
	}

	clear() {
		let updatedFilter = {
			...this.props.filter,
			application: "All",
			level: "",
			visible: false
		};

		this.props.updateFilter(updatedFilter);
		this.setState({
			filter: updatedFilter
		});

		$(`#${this.props.name}`).modal("hide");
	}

	render() {
		return (
			<div className="modal fade" id={this.props.name} tabIndex="-1" role="dialog" aria-hidden="true">
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">Filter</h5>
							<button type="button" className="close" data-dismiss="modal" aria-label="close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>

						<div className="modal-body">
							<form>
								<div className="form-group">
									<label htmlFor="application">Application</label>
									<ApplicationSelector filter={this.state.filter} updateFilter={this.props.updateFilter} />
								</div>
								<div className="form-group">
									<label htmlFor="level">Level</label>
									<LevelSelector filter={this.state.filter} updateFilter={this.props.updateFilter} />
								</div>
							</form>
						</div>

						<div className="modal-footer">
							<button type="button" className="btn btn-default" onClick={this.clear}>Clear</button>
							<button type="button" className="btn btn-primary" data-dismiss="modal">Close</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

FilterModal.propTypes = {
	name: PropTypes.string.isRequired,
	filter: FilterPropType,
	updateFilter: PropTypes.func
};