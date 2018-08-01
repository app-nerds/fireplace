import { SET_LOGS } from "../types/logs";

export const setLogs = (logs) => {
	return dispatch => {
		dispatch({
			type: SET_LOGS,
			payload: logs
		});
	};
};