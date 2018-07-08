import Button from "grommet/components/Button";
import Footer from "grommet/components/Footer";
import Form from "grommet/components/Form";
import FormFields from "grommet/components/FormFields";
import Header from "grommet/components/Header";
import Heading from "grommet/components/Heading";
import Layer from "grommet/components/Layer";
import React, { Component } from "react";
import ApplicationSelector from "./ApplicationSelector";
import LevelSelector from "./LevelSelector";

export default class Filter extends Component {
	constructor(props) {
		super(props);

		this.onApplicationSelect = this.onApplicationSelect.bind(this);
		this.onLevelSelect = this.onLevelSelect.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onClear = this.onClear.bind(this);

		this.state = {
			visible: false,
			application: props.application,
			level: props.level
		};
	}

	onApplicationSelect(application) {
		this.props.onApplicationSelect(application);
	}

	onLevelSelect(level) {
		this.props.onLevelSelect(level);
	}

	onClose() {
		this.props.onClose();
	}

	onClear() {
		this.setState({
			application: "All",
			level: ""
		});

		this.props.onApplicationSelect("All");
		this.props.onLevelSelect("");
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			visible: nextProps.visible,
			application: nextProps.application,
			level: nextProps.level
		});
	}

	render() {
		return (
			<div>
				{this.state.visible && (
					<Layer closer={true} align="right" overlayClose={true} onClose={this.onClose}>
						<Form pad="small">
							<Header>
								<Heading>Filter</Heading>
							</Header>

							<FormFields>
								<ApplicationSelector onSelect={this.onApplicationSelect} value={this.state.application} />
								<LevelSelector onSelect={this.onLevelSelect} value={this.state.level} />
							</FormFields>

							<Footer pad={{ "vertical": "medium" }}>
								<Button label="Close" type="button" primary={true} onClick={this.onClose} />
								<Button label="Clear" type="button" onClick={this.onClear} />
							</Footer>
						</Form>
					</Layer>
				)}
			</div>
		);
	}
}

//window.Filter = Filter;