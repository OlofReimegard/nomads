import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {getOnlineUsers} from '../src/actions';

class Online extends React.Component {



    render() {

        const online = this.props.onlineUsers && this.props.onlineUsers.filter((user) => {
            return user.id != this.props.yourId
        });


        return (
            <div id="requests">
                <h1>ONLINE</h1>
                <div className="friend-box">
                    {online && online.map((user, index) => {
                        return <div className="friends-user-container" key={index}>
                            <Link to={"/user/" + user.id}>
                                <img src={"https://s3.amazonaws.com/olofsbuckett/" + user.url}/>
                                <h2>{user.first} {user.last}</h2>
                            </Link>
                        </div>
                    })}
                </div>
            </div>
        );
    }
}

const mapStateToProps = function(state) {
    return {onlineUsers: state.online,
            yourId: state.yourId}
}

export default connect(mapStateToProps)(Online);
