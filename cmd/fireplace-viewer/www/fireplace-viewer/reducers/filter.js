import { SET_FILTER } from "../types/filter";

const initialState = {
	filter: {
		application: "All",
		level: "",
		searchTerm: ""
	}
};

export default (state = initialState, action) => {
	console.log("In filter reducer, state == ", state, " action == ", action);

	switch (action.type) {
		case SET_FILTER:
			return {
				...state,
				application: action.payload.application,
				level: action.payload.level,
				searchTerm: action.payload.searchTerm
			};

		default:
			return state;
	}
};