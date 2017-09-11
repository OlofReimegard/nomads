
import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { recieveFriendRequests, acceptFriendRequest, endFriendship } from '../src/actions';

class Friends extends React.Component {
    componentDidMount() {
            this.props.dispatch(recieveFriendRequests());
    }

    acceptFriendRequest(event) {

        this.props.dispatch(acceptFriendRequest(event.target.id));
    }

    endFriendship(event) {
        this.props.dispatch(endFriendship(event.target.id));
    }

    render() {

        return (
            <div id="requests">
                <h1>FRIENDS</h1>
                <div className="friend-box">
                    {this.props.friends && this.props.friends.map( ( user, index ) => {
                        return <div className="friends-user-container"key={index}>
                                    <Link to={"/user/"+user.id}>
                                        <img src={"https://s3.amazonaws.com/olofsbuckett/"+user.url}  />
                                        <h2>{user.first} {user.last}</h2>
                                    </Link>
                                    <div id={user.id} className="action-button"  onClick={(e) => this.endFriendship(e)}>End friendship</div>
                                </div>
                    } )}
                </div>
                <h1>FRIEND REQUESTS</h1>
                <div className="friend-box">
                    {this.props.requests && this.props.requests.map( ( user, index ) => {
                        return <div className="friends-user-container"key={index}><Link to={"/user/"+user.id}><img src={"https://s3.amazonaws.com/olofsbuckett/"+user.url}/><h2 >{user.first} {user.last}</h2></Link><div id={user.id} className="action-button" onClick={(e) => this.acceptFriendRequest(e)}>Accept friendship</div></div>
                    } )}
                </div>




            </div>
        );
    }
}

const mapStateToProps = function(state) {
    return {
        friends: state.friends,
        requests: state.requests
    }
}

export default connect(mapStateToProps)(Friends);
