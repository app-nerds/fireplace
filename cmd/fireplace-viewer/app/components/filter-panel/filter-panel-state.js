/*
 * Copyright (c) 2020. App Nerds LLC. All rights reserved
 */
export const FilterPanelGetters = {
	application: "filterPanel/application",
	applicationNames: "filterPanel/applicationNames",
	level: "filterPanel/level",
	right: "filterPanel/right",
	searchTerm: "filterPanel/searchTerm",
	width: "filterPanel/width",
};

export const FilterPanelActions = {
	clear: "filterPanel/clear",
	close: "filterPanel/close",
	getApplicationNames: "filterPanel/getApplicationNames",
	setApplication: "filterPanel/setApplication",
	open: "filterPanel/open",
	setLevel: "filterPanel/setLevel",
	setSearchTerm: "filterPanel/setSearchTerm",
	setWidth: "filterPanel/setWidth",
};

export const FilterPanelState = {
	namespaced: true,

	state() {
		return {
			application: "",
			applicationNames: [],
			isOpen: false,
			level: "",
			right: 0,
			searchTerm: "",
			width: 0,
		};
	},

	mutations: {
		SET_APPLICATION(state, application) {
			state.application = application;
		},

		SET_IS_OPEN(state, isOpen) {
			state.isOpen = isOpen;
		},

		SET_LEVEL(state, level) {
			state.level = level;
		},

		SET_RIGHT(state, right) {
			state.right = right;
		},

		SET_SEARCH_TERM(state, searchTerm) {
			state.searchTerm = searchTerm;
		},

		SET_APPLICATION_NAMES(state, applicationNames) {
			state.applicationNames = applicationNames;
		},

		SET_WIDTH(state, width) {
			state.width = width;
		},
	},

	getters: {
		application(state) {
			return state.application;
		},

		applicationNames(state) {
			return state.applicationNames;
		},

		level(state) {
			return state.level;
		},

		right(state) {
			return state.right;
		},

		searchTerm(state) {
			return state.searchTerm;
		},

		width(state) {
			return state.width;
		},
	},

	actions: {
		clear({ commit }) {
			commit("SET_APPLICATION", "");
			commit("SET_LEVEL", "");
			commit("SET_SEARCH_TERM", "");
		},

		close({ commit, state }) {
			commit("SET_RIGHT", state.width * -1);
			commit("SET_IS_OPEN", false);
		},

		open({ commit, dispatch }) {
			dispatch("getApplicationNames");
			commit("SET_RIGHT", 0);
			commit("SET_IS_OPEN", true);
		},

		setApplication({ commit, dispatch }, application) {
			commit("SET_APPLICATION", application);
		},

		setLevel({ commit, dispatch }, level) {
			commit("SET_LEVEL", level);
		},

		setSearchTerm({ commit, dispatch }, searchTerm) {
			commit("SET_SEARCH_TERM", searchTerm);
		},

		setWidth({ commit }, width) {
			commit("SET_WIDTH", width);
		},

		async getApplicationNames({ commit }) {
			let response = await Vue.prototype.applicationNameService.get();
			commit("SET_APPLICATION_NAMES", response);
		},
	},
};
