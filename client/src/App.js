import React, { Fragment, useEffect } from 'react';
import './App.css';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Navbar from '../src/components/layout/Navbar';
import Landing from '../src/components/layout/Landing';
import Register from '../src/components/auth/Register';
import Login from '../src/components/auth/Login';
import Alert from '../src/components/layout/Alert'

import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken';

// Redux
import { Provider } from 'react-redux';
import store from './store';

// call token check each time using useEffect
if (localStorage.token) {
    setAuthToken(localStorage.token);
}

const App = () => {

    useEffect(() => {
        store.dispatch(loadUser());
    }, []);

    return ( <
        Provider store = { store } >
        <
        Router > <
        Fragment >
        <
        Navbar / >
        <
        Route exact path = '/'
        component = { Landing }
        /> 

        <
        section className = "container" >
        <
        Alert / >
        <
        Switch >
        <
        Route exact path = "/register"
        component = { Register }
        /> <
        Route exact path = "/login"
        component = { Login }
        /> < /
        Switch > <
        /section> < /
        Fragment > <
        /Router> < /
        Provider >

    )
};
export default App;