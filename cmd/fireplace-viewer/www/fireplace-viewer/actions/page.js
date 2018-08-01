import { SET_PAGE } from "../types/page";

export const setPage = (page) => {
	return dispatch => {
		dispatch({
			type: SET_PAGE,
			payload: page
		});
	}
};