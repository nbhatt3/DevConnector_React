import React, { Fragment, useEffect } from 'react';
import './App.css';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Navbar from '../src/components/layout/Navbar';
import Landing from '../src/components/layout/Landing';
import Register from '../src/components/auth/Register';
import Login from '../src/components/auth/Login';
import Alert from '../src/components/layout/Alert'

import Dashboard from './components/dashboard/Dashboard'

// Use private route for Dashboard
import PrivateRoute from './components/routing/PrivateRoute'

import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken';

// Redux
import { Provider } from 'react-redux';
import store from './store';

// Profile pages
import CreateProfile from '../src/components/profile-forms/CreateProfile'
import EditProfile from '../src/components/profile-forms/EditProfile'

import AddExperience from '../src/components/profile-forms/AddExperience';
import AddEducation from '../src/components/profile-forms/AddEducation';

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
        />  <
        PrivateRoute exact path = "/dashboard"
        component = { Dashboard }
        />  <
        PrivateRoute exact path = "/create-profile"
        component = { CreateProfile }
        /> <
        PrivateRoute exact path = "/edit-profile"
        component = { EditProfile }
        /> <
        PrivateRoute exact path = "/add-experience"
        component = { AddExperience }
        /> <
        PrivateRoute exact path = "/add-education"
        component = { AddEducation }
        />  <
        /Switch > < /
        section > < /
        Fragment > <
        /Router> < /
        Provider >

    )
};
export default App;