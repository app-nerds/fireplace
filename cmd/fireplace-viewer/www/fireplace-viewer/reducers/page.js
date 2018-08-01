import { SET_PAGE } from "../types/page";

const initialState = {
	page: 1
};

export default (state = initialState, action) => {
	switch (action.type) {
		case SET_PAGE:
			return {
				...state,
				page: action.payload.page
			};

		default:
			return state;
	}
};