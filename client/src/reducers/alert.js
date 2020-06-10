import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

const initialState = [];

export default function(state = initialState, action) {

    const { type, payload } = action;
    switch (type) {
        case SET_ALERT:
            return [...state, payload]; // append to current state - new alert
        case REMOVE_ALERT:
            return state.filter(alert => alert.id !== payload); // remove the alert
        default:
            return state;
    }


}