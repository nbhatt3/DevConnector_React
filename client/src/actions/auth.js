import axios from 'axios';

import { setAlert } from './alert';
import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    USER_LOADED,
    AUTH_ERROR,
    LOGIN_FAIL,
    LOGIN_SUCCESS,
    LOGOUT
} from './types';

import setAuthToken from '../utils/setAuthToken';

//Load User
export const loadUser = () => async dispatch => {

    // check token present or not, use a utility file 
    if (localStorage.token) {
        setAuthToken(localStorage.token);
    }

    try {
        const res = await axios.get('/api/auth');

        dispatch({
            type: USER_LOADED,
            payload: res.data
        });

    } catch (err) {
        dispatch({
            type: AUTH_ERROR
        });

    }

}

// Action : Register a user- send post request to /api/users/
export const register = ({ name, email, password }) => async dispatch => {

    const config = {
        headers: { 'Content-Type': 'application/json' }
    }

    const body = JSON.stringify({ name, email, password });
    try {
        const res = await axios.post('/api/users', body, config);

        // on success of register - dispatch an action, send token in payload
        dispatch({
            type: REGISTER_SUCCESS,
            payload: res.data
        });
        dispatch(loadUser());
    } catch (err) {
        // on failure of register request, array of errors is received
        // show alert for each error using setAlert action

        const errors = err.response.data.errors;
        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
        }
        dispatch({
            type: REGISTER_FAIL
        })
    }
}

// Action : LOGIN a user- send post request to /api/auth/
export const login = (email, password) => async dispatch => {

    const config = {
        headers: { 'Content-Type': 'application/json' }
    }

    const body = JSON.stringify({ email, password });
    try {
        const res = await axios.post('/api/auth', body, config);

        // on success of Login - dispatch an action, send token in payload
        dispatch({
            type: LOGIN_SUCCESS,
            payload: res.data
        });

        dispatch(loadUser());

    } catch (err) {
        // on failure of Login request, array of errors is received
        // show alert for each error using setAlert action

        const errors = err.response.data.errors;
        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
        }
        dispatch({
            type: LOGIN_FAIL
        })
    }
};

// Logout and clear profile
export const logout = () => dispatch => {
    dispatch({ type: LOGOUT });
};