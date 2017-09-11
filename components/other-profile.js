import React from 'react';
import Axios from 'axios';
import {browserHistory, Push} from 'react-router';

export class OtherProfile extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            image: "",
            hasBio: false,
            requestStatus: 0
        };

        this.sendRequest = this.sendRequest.bind(this);

    }

    componentWillReceiveProps() {

        this.componentDidMount();
    }
    componentDidUpdate() {
        if(!this.state.wallPosts){
            this.componentDidMount();
        }
        this.elem.scrollBottom = this.elem.scrollHeight
    }

    componentDidMount() {


        {
            Axios.post("/get-wall-posts",{
                recId:window.location.pathname.split("/").slice(-1)[0]
            }).then((rows) => {
                this.setState({
                    wallPosts: rows.data.wallPosts
                })
            })
        }

        Axios.post("/friend-requests", {
            recId: window.location.pathname.split("/").slice(-1)[0]
        }).then((response) => {

            if(response.data.recipient != this.props.params.id){

                switch(response.data.response) {
                    case 1:
                        this.setState({requestStatus : "Unfriend"})
                        break;
                    case 2:
                        this.setState({requestStatus : "Accept"})
                        break;
                    default:
                        this.setState({requestStatus : "Request friendship"})
                }
            } else {

                    switch(response.data.response) {
                        case 1:
                            this.setState({requestStatus : "Unfriend"})
                            break;
                        case 2:
                            this.setState({requestStatus : "Cancel"})
                            break;
                        default:
                            this.setState({requestStatus : "Request friendship"})
                    }
                }
            });


        Axios.get("/user-profiles/" + window.location.pathname.split("/").slice(-1)[0]).then((info) => {
            if (info.data.redirect) {
                browserHistory.push('/profile')
            } else {
                this.setState({
                    first: info.data[0].first, last: info.data[0].last, id: info.data[0].id,
                      imgUrl:"https://s3.amazonaws.com/olofsbuckett/"+info.data[0].url
                })
                if (info.data[0].bio) {
                    this.setState({bio: info.data[0].bio, hasBio: true})
                } else {
                    this.setState({bio: "user has no bio", hasBio: true})
                }
            }
        })



    }

    addMessage(message) {
        if(message.keyCode == 13 || message.type == "click"){
            if(this.state.message != ""){
            Axios.post("/add-wall-post", {
                message:this.state.message,recId:this.state.id
            }).then((wallPosts) => {
                Axios.post("/get-wall-posts",{
                    recId:this.state.id
                }).then((rows) => {
                    this.setState({
                        wallPosts: rows.data.wallPosts,
                        message:""
                    })
                })


            });
        }
    } else {
        return
    }

    }

    updateMessage(event) {
        this.setState({
            message:event.target.value
        })
    }

    sendRequest() {
        if(this.state.requestStatus == "Request friendship"){
        Axios.post("/request", {
            recId: window.location.pathname.split("/").slice(-1)[0],
            status: 2
        }).then((response) => {
            this.setState({requestStatus : "Cancel"});
        })
    } else if (this.state.requestStatus == "Cancel") {
        Axios.post("/request", {
            recId: window.location.pathname.split("/").slice(-1)[0],
            status: 4
        }).then((response) => {
            this.setState({requestStatus : "Request friendship"});
        })
    } else if (this.state.requestStatus == "Accept") {
        Axios.post("/request", {
            recId: window.location.pathname.split("/").slice(-1)[0],
            status: 1
        }).then((response) => {
            this.setState({requestStatus : "Unfriend"});
        })
    } else if (this.state.requestStatus == "Unfriend") {
        Axios.post("/request", {
            recId: window.location.pathname.split("/").slice(-1)[0],
            status: 5
        }).then((response) => {
            this.setState({requestStatus : "Request friendship"});
        })
    }
    }

    render(props) {

        return (
            <div className="profile">
                <div id="profile-top">
                    <div className="pic-and-button"><img id="profilepic" src={this.state.imgUrl}/><div id="request-btn" onClick={this.sendRequest}>
                        <h3>{this.state.requestStatus}</h3>
                    </div>

                    </div>
                    <div id="profile-info">
                        <h2>{this.state.first} {this.state.last}</h2>
                        {this.state.hasBio && <p>{this.state.bio}</p>}
                    </div>
                </div>
                <div id="profile-bottom">
                    <div id="wall">
                        <div className="wall-input">
                            <textarea onKeyUp={e => this.addMessage(e)} onChange={e => this.updateMessage(e)} rows="4" cols="50" id="chat-input" placeholder={"Write something to "+this.state.first+".."} value={this.state.message}></textarea>
                            <div onClick={e => this.addMessage(e)}><h3>Post to wall</h3></div>
                        </div>
                        <div className="wall-box">
                            <div className="profile-message-box" ref={elem => this.elem = elem}>
                                {this.state.wallPosts && this.state.wallPosts.map( ( user, index ) => {
                                    return <div className="single-message" key={index}> <img className="msg-img" src={"https://s3.amazonaws.com/olofsbuckett/"+user.url}/> <div className="msg-name"><h3 >{user.first} {user.last}</h3><p>{user.message}</p></div></div>
                                } )}
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        )
    }
}
