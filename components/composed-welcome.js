import React from 'react';
import {Router, Route, Link, IndexRoute, hashHistory} from 'react-router';
import Axios from 'axios';

export function Welcome(props) {
    return (
        <div className="fp-container">
            <div className="fp-image-box">
                <img className="fp-logo" src="/images/packerz-01.png"/>
                <h3>A network for earth wanderers</h3>
                {props.children}
            </div>
        </div>
    );
}

export class Form extends React.Component {

    constructor(props) {

        super(props);
        this.state = {};
        this.handleChange = this.handleChange.bind(this);
        this.handlePost = this.handlePost.bind(this);
    }

    handleChange(event) {
        const name = event.target.name;
        const value = event.target.value;
        this.setState({[name]: value});

    }

    handlePost(event) {
        Axios.post("/" + event.target.name, {
            first: this.state.first,
            last: this.state.last,
            email: this.state.email,
            password: this.state.password
        }).then(function(response) {
            window.location.replace("/");
        }).catch(function(error) {});

    }

    render(props) {

        const Component = this.props.component;
        return <Component handleChange={e => this.handleChange(e)} handlePost={e => this.handlePost(e)}/>
    }
}

export function Login({handleChange, handlePost}) {
    return (
        <div className="fp-form">
            <input placeholder="Email" type="text" name="email" onChange={handleChange}/>
            <input placeholder="Password" type="password" name="password" onChange={handleChange}/>
            <input onClick={handlePost} type="submit" name="login-user"/>
            <Link to="register">Register</Link>

        </div>
    );
}

export function Registration({handleChange, handlePost}) {
    return (
        <div className="fp-form">
            <input placeholder="First name" type="text" name="first" onChange={handleChange}/>
            <input placeholder="Last name" type="text" name="last" onChange={handleChange}/>
            <input placeholder="Email" type="text" name="email" onChange={handleChange}/>
            <input placeholder="Password" type="password" name="password" onChange={handleChange}/>
            <input onClick={handlePost} type="submit" name="register-user"/>
            <Link Classname="fp-link" to="login">Login</Link>

        </div>
    );
}
