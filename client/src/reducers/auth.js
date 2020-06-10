import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    AUTH_ERROR,
    USER_LOADED,
    LOGIN_FAIL,
    LOGIN_SUCCESS,
    LOGOUT
} from '../actions/types';

// store token in localStorage, set initial State
const initalState = {
    token: localStorage.getItem('Item'),
    isAuthenticated: null,
    loading: true, // default true, make sure loading is done, response is received
    user: null
}

//register function for action
export default function(state = initalState, action) {
    const { type, payload } = action; // receive action and destructure it
    switch (type) {
        case USER_LOADED:
            return {
                ...state,
                isAuthenticated: true,
                user: payload
            }
            // Note: Login and Register Success are going to do same thing - token mgmt
        case REGISTER_SUCCESS:
        case LOGIN_SUCCESS:
            localStorage.setItem('token', payload.token); // set token
            return {
                ...state,
                ...payload,
                isAuthenticated: true,
                loading: false // set loading to false, received response
            }
        case REGISTER_FAIL:
        case LOGIN_FAIL:
        case AUTH_ERROR:
        case LOGOUT:
            localStorage.removeItem('token');
            return {
                ...state,
                token: null, // set token to null
                isAuthenticated: false,
                loading: false // set loading to false, received response
            }
        default:
            return state;

    }

}