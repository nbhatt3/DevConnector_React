import { combineReducers } from 'redux';

import alert from './alert';
import auth from './auth';
import profile from './profile';

// All reducers
export default combineReducers({
    alert,
    auth,
    profile
});