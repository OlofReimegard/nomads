import React from 'react';
import ReactDOM from 'react-dom';
import * as io from 'socket.io-client';
import Axios from "axios";
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxPromise from 'redux-promise';
import reducer from './reducers';
import { composeWithDevTools } from 'redux-devtools-extension';
const store = createStore(reducer, composeWithDevTools(applyMiddleware(reduxPromise)));

import { Router, Route, Link, IndexRoute, hashHistory, browserHistory,IndexRedirect } from 'react-router';
import {Form,Login as LoginComp,Registration as RegistrationComp,Welcome} from "../components/composed-welcome"
import {App,Navbar} from "../components/home"
import {Profile} from "../components/logged-in-profile"
import {OtherProfile} from "../components/other-profile"
import Friends from "../components/friends"
import Online from "../components/online"
import Chat from "../components/chat"


function Login() {
    return <Form component={LoginComp} />;
}

function Registration() {
    return <Form component={RegistrationComp} />;
}

const welcomeRouter = (
    <Router history={hashHistory}>
        <Route path="/" component={Welcome}>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Registration} />
            <IndexRoute component={Registration} />
  	    </Route>
    </Router>
);

const appRouter = (
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={App}>
                <Route path="/user/:id" component={OtherProfile} />
                <Route path="/profile" component={Profile} />
                <Route path="/friends" component={Friends} />
                <Route path="/online" component={Online} />
                <Route path="/chat" component={Chat} />
                <IndexRoute component={Profile} />
      	    </Route>
            <Route path="*">
                <IndexRedirect to='/' />
            </Route>
        </Router>
    </Provider>
);

let toRender = welcomeRouter;
if(window.location.pathname != "/welcome"){
        toRender = appRouter
    }

ReactDOM.render(
   toRender,
   document.querySelector('main')

);
