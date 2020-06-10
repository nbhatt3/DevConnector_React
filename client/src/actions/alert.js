import { SET_ALERT, REMOVE_ALERT } from './types';
import { v4 as uuidv4 } from 'uuid';

// file created in order to dispatch the alerts with type,payload, id 
// dispatch more than one actionType using dispatch using double => because of thunk middleware

// Action is setAlert which is going to dispatch an alert to reducer alert (created in reducer folder)
export const setAlert = (msg, alertType, timeout = 5000) => dispatch => {
    const id = uuidv4(); // to get random string for id
    dispatch({
        type: SET_ALERT,
        payload: { msg, alertType, id }
    });

    // remove alert after 5 seconds
    setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
}