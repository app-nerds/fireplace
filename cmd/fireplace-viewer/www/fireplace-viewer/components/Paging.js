import Button from "grommet/components/Button";
import CaretNextIcon from "grommet/components/icons/base/CaretNext";
import CaretPreviousIcon from "grommet/components/icons/base/CaretPrevious";
import Label from "grommet/components/Label";
import React, { Component } from "react";

export default class Paging extends Component {
	constructor(props) {
		super(props);

		this.onPreviousPage = this.onPreviousPage.bind(this);
		this.onNextPage = this.onNextPage.bind(this);

		this.state = {
			page: props.page
		};
	}

	onPreviousPage(e) {
		e.preventDefault();
		this.props.onPreviousPage();
	}

	onNextPage(e) {
		e.preventDefault();
		this.props.onNextPage();
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			page: nextProps.page
		});
	}

	render() {
		return (
			<span>
				<Button icon={<CaretPreviousIcon onClick={this.onPreviousPage} />} />
				<Label>{this.state.page}</Label>
				<Button icon={<CaretNextIcon onClick={this.onNextPage} />} />
			</span>
		);
	}
}

//window.Paging = Paging;