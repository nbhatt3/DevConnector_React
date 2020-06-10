import { combineReducers } from 'redux';

import alert from './alert';
import auth from './auth';

// All reducers
export default combineReducers({
    alert,
    auth
});