import React, { Fragment, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';

// Connect to Redux and import the action
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { login } from '../../actions/auth';

// Note: the props.login is destructured and written as {login} in simplified notation
const Login = ({ login, isAuthenticated }) => {

    // set initial state
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const { email, password } = formData;
    const onChange = e => setFormData({...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        // console.log(formData);
        login(email, password);
    };

    // Redirect of dashboard of logged in 
    if (isAuthenticated) {
        return <Redirect to = "/dashboard" / >
    }
    return ( <
        Fragment >
        <
        h1 className = "large text-primary" > Sign In < /h1> <
        p className = "lead" > < i className = "fas fa-user" > < /i> Sign Into Your Account</p >
        <
        form className = "form"
        onSubmit = { e => onSubmit(e) } >
        <
        div className = "form-group" >
        <
        input type = "email"
        placeholder = "Email Address"
        name = "email"
        required value = { email }
        onChange = { e => onChange(e) }
        /> <
        small className = "form-text" >
        This site uses Gravatar so
        if you want a profile image, use a Gravatar email < /small > < /
        div > <
        div className = "form-group" >
        <
        input type = "password"
        placeholder = "Password"
        name = "password"
        minLength = "6"
        required value = { password }
        onChange = { e => onChange(e) }
        /> < /
        div >
        <
        input type = "submit"
        className = "btn btn-primary"
        value = "Login" / >
        <
        /form> <
        p className = "my-1" >
        Don 't have an account ? < Link to = "/register" > Sign Up < /Link> < /
        p > <
        /Fragment>
    )
};

Login.propTypes = {
    login: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool
}

/* bring isAuthenticated from auth state as prop */
const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
})


export default connect(
    mapStateToProps, { login }
)(Login)