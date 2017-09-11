
import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Axios from 'axios';

class Chat extends React.Component {

    constructor(props) {
      super(props);

      this.state = {
          message: "",
      };

    }

    addMessage(message) {
        if(message.keyCode == 13 || message.type == "click"){
            if(this.state.message != ""){
            Axios.post("/add-message", {
                message:this.state.message,name:this.props.first+ " " + this.props.last,
                imgUrl: this.props.imgUrl
            }).then((returnstuff) => {
                this.props.socket.emit('msg', {
                    message: 'message inserted'
                });

            });
            this.setState({
                message:""
            })
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


    componentDidUpdate() {
        this.elem.scrollTop = this.elem.scrollHeight
    }

    render() {

        return (
                <div className="chat-box">
                    <div className="message-box" ref={elem => this.elem = elem}>
                        {this.props.chatMessages && this.props.chatMessages.map( ( user, index ) => {
                            return <div className="single-message" key={index}> <img className="msg-img" src={user.imgUrl}/> <div className="msg-name"><h3 >{user.name}</h3><p>{user.message}</p></div></div>
                        } )}
                    </div>
                    <div className="input-box">
                        <textarea onKeyUp={e => this.addMessage(e)} onChange={e => this.updateMessage(e)} rows="4" cols="50" id="chat-input" placeholder="Type message here.." value={this.state.message}></textarea>
                        <div onClick={e => this.addMessage(e)}><h3>SUBMIT</h3></div>
                    </div>
                </div>

        );
    }
}

const mapStateToProps = function(state) {

    return {
        chatMessages: state.chatMessages
    }
}

export default connect(mapStateToProps)(Chat);
