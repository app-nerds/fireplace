import PropTypes from "prop-types";
import React, { Component } from "react";
import { LogTable } from "../../components/logs/LogTable";
import { DetailsModal } from "../detailsModal/DetailsModal";
import { FilterModal } from "../filterModal/FilterModal";
import { FilterPropType } from "../../propTypes/FilterPropType";
import { PagingPropType } from "../../propTypes/PagingPropType";
import { DetailsPropType } from "../../propTypes/DetailsPropType";

export class Main extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="container-fluid">
				<LogTable
					details={this.props.details}
					filter={this.props.filter}
					paging={this.props.paging}
					updateDetails={this.props.updateDetails}
					updatePaging={this.props.updatePaging} />
				<DetailsModal name="logEntryDetails" details={this.props.details} updateDetails={this.props.updateDetails} />
				<FilterModal name="filterModal" filter={this.props.filter} updateFilter={this.props.updateFilter} />
			</div>
		);
	}
}

Main.propTypes = {
	details: DetailsPropType,
	filter: FilterPropType,
	paging: PagingPropType,
	updateDetails: PropTypes.func,
	updateFilter: PropTypes.func,
	updatePaging: PropTypes.func
}
