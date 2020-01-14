/*
 * Copyright (c) 2020. App Nerds LLC. All rights reserved
 */
export const DetailPanelGetters = {
	logEntry: "detailPanel/logEntry",
	right: "detailPanel/right",
	width: "detailPanel/width",
};

export const DetailPanelActions = {
	close: "detailPanel/close",
	open: "detailPanel/open",
	setWidth: "detailPanel/setWidth",
	viewLogEntryDetails: "detailPanel/viewLogEntryDetails",
};

export const DetailPanelState = {
	namespaced: true,

	state() {
		return {
			isOpen: false,
			logEntry: {
				id: "",
				details: {},
			},
			right: 0,
			width: 0,
		};
	},

	mutations: {
		SET_IS_OPEN(state, isOpen) {
			state.isOpen = isOpen;
		},

		SET_LOG_ENTRY(state, logEntry) {
			state.logEntry = logEntry;
		},

		SET_RIGHT(state, right) {
			state.right = right;
		},

		SET_WIDTH(state, width) {
			state.width = width;
		},
	},

	getters: {
		logEntry(state) {
			return state.logEntry;
		},

		right(state) {
			return state.right;
		},

		width(state) {
			return state.width;
		},
	},

	actions: {
		close({ commit, state }) {
			commit("SET_RIGHT", state.width * -1);
			commit("SET_IS_OPEN", false);
		},

		open({ commit }) {
			commit("SET_RIGHT", 0);
			commit("SET_IS_OPEN", true);
		},

		setWidth({ commit }, width) {
			commit("SET_WIDTH", width);
		},

		async viewLogEntryDetails({ commit, state, dispatch }, id) {
			if (id === state.logEntry.id && state.isOpen) {
				dispatch("close");
			} else {
				let logEntry = await Vue.prototype.logEntryService.getLogEntry(id);

				commit("SET_LOG_ENTRY", logEntry);
				dispatch("open");
			}
		},
	},
}
