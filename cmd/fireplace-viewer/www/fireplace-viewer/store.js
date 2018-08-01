import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";

import filterReducer from "./reducers/filter";
import logsReducer from "./reducers/logs";
import pageReducer from "./reducers/page";

const reducer = combineReducers({
	filterReducer,
	logsReducer,
	pageReducer
});

const store = createStore(
	reducer,
	applyMiddleware(thunk)
);

export default store;