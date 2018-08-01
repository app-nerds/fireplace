import { SET_FILTER } from "../types/filter";

export const setFilter = (filter) => {
	return dispatch => {
		dispatch({
			type: SET_FILTER,
			payload: {
				application: filter.application,
				level: filter.level,
				searchTerm: filter.searchTerm
			}
		});
	}
};