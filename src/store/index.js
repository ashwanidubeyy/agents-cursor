import { combineReducers, createStore, applyMiddleware } from 'redux';
import commonReducer from './Common/reducers';
import ticketsReducer from './Tickets/reducers';

const thunkMiddleware = (store) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState);
  }
  return next(action);
};

const rootReducer = combineReducers({
  common: commonReducer,
  tickets: ticketsReducer,
});

export const createAppStore = () => createStore(rootReducer, applyMiddleware(thunkMiddleware));
