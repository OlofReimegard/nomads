import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {showOnlineUsers, removeOnlineUser, addOnlineUser, newMsg} from '../src/actions';

import * as io from 'socket.io-client';
import Axios from "axios";

class Socket extends React.Component {
    componentDidMount() {

        if (!this.socket) {
            this.socket = io.connect();

            this.socket.on("leavingUser", (data) => {
                this.props.dispatch(removeOnlineUser(data.userId));
            });

            this.socket.on("newUser", (data) => {

                this.props.dispatch(addOnlineUser(data.userId, data.onlineMessages));
            });

            this.socket.on("msg", (data) => {

                this.props.dispatch(newMsg(data.onlineMessages));
            });

            this.socket.on("sendId", (data) => {

                const uniqueUsers = [];
                data.onlineUsers.map((obj) => {
                    return obj.id;
                }).forEach((id) => {
                    if (uniqueUsers.indexOf(id) > 0) {
                        uniqueUsers.push(data.onlineUsers[uniqueUsers.indexOf(id)]);
                    }
                });

                this.props.dispatch(showOnlineUsers(uniqueUsers, data.onlineMessages));

                Axios.post("/add-user", {socketId: this.socket.id}).then(({data}) => {

                    this.socket.emit('addUser', {id: data.yourId});
                });

            });

            this.socket.on("welcome", (data) => {

                this.socket.emit('thanks', {message: 'Thank you. It is great to be here.'});
            });

        }
    }

    render() {

        const children = React.cloneElement(this.props.children, {socket: this.socket});
        return <div>
            {children}
        </div>;
    }
}

export default connect()(Socket);
