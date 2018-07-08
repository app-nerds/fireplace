import Box from "grommet/components/Box";
import Button from "grommet/components/Button";
import Header from "grommet/components/Header";
import ActionsIcon from "grommet/components/icons/base/Actions";
import FilterIcon from "grommet/components/icons/base/Filter";
import RefreshIcon from "grommet/components/icons/base/Refresh";
import Menu from "grommet/components/Menu";
import Search from "grommet/components/Search";
import Title from "grommet/components/Title";
import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Filter from "./Filter";
import Paging from "./Paging";

export default class AppHeader extends Component {
	constructor(props) {
		super(props);

		this.filterVisible = false;

		this.onApplicationSelect = this.onApplicationSelect.bind(this);
		this.onLevelSelect = this.onLevelSelect.bind(this);
		this.toggleFilter = this.toggleFilter.bind(this);
		this.onFilterClose = this.onFilterClose.bind(this);
		this.onRefresh = this.onRefresh.bind(this);

		this.state = {
			page: props.page,
			filterVisible: false,
			application: this.props.application,
			level: this.props.level
		};
	}

	onApplicationSelect(appliation) {
		this.props.onApplicationSelect(appliation);
	}

	onLevelSelect(level) {
		this.props.onLevelSelect(level);
	}

	toggleFilter() {
		this.filterVisible = !this.filterVisible;

		this.setState({
			filterVisible: this.filterVisible
		});
	}

	onFilterClose() {
		this.filterVisible = false;

		this.setState({
			filterVisible: this.filterVisible
		});
	}

	onRefresh(e) {
		e.preventDefault();
		this.props.onRefresh();
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			page: nextProps.page,
			application: nextProps.application,
			level: nextProps.level
		});
	}

	render() {
		return (
			<div>
				<Header size="small" fixed={true}>
					<Title><NavLink to="/">Fireplace Viewer</NavLink></Title>
					<Box flex={true} justify="end" direction="row" responsive={true}>
						{this.props.showEntryManagement &&
							<div>
								<Search inline={true} fill={true} size="medium" placeHolder="Search" dropAlign={{ "right": "right" }} onDOMChange={this.props.onSearch} />
								<Button icon={<RefreshIcon onClick={this.onRefresh} />} />
								<Paging
									page={this.state.page}
									onNextPage={this.props.onNextPage}
									onPreviousPage={this.props.onPreviousPage} />
								<Button icon={<FilterIcon />} onClick={this.toggleFilter} />
							</div>
						}
						<Menu icon={<ActionsIcon />} dropAlign={{ "right": "right", "top": "bottom" }}>
							<NavLink to="/deleteoldentries">Delete Old Entries</NavLink>
							{/* <Anchor href="/deleteoldentries" label="Delete Old Entries" /> */}
						</Menu>
					</Box>
				</Header>

				<div>
					<Filter
						visible={this.state.filterVisible}
						onApplicationSelect={this.onApplicationSelect}
						onLevelSelect={this.onLevelSelect}
						onClose={this.onFilterClose}
						application={this.state.application}
						level={this.state.level} />
				</div>
			</div>
		);
	}
}
