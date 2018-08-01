import { SET_LOGS } from "../types/logs";

const initialState = {
	logs: []
};

export default (state = initialState, action) => {
	console.log("In logs reducer, state == ", state, " action == ", action);
	switch (action.type) {
		case SET_LOGS:
			return {
				...state,
				logs: action.payload
			};

		default:
			return state;
	}
};