import React from 'react';
import Axios from 'axios';
import {Link} from 'react-router';

export class Profile extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            image: "",
            bioInput: false,
            hasBio: false
        };
        this.insertBio = this.insertBio.bind(this);
        this.bioInput = this.bioInput.bind(this);
    }
    componentDidUpdate() {
        if(!this.state.wallPosts){
            this.componentDidMount();
        }
        this.elem.scrollBottom = this.elem.scrollHeight
    }

    componentDidMount() {


            Axios.get("/get-user-wall-posts").then((rows) => {

                this.setState({
                    wallPosts: rows.data.wallPosts
                })
            })


    }

    updateBio(event) {

        this.setState({bio: event.target.value})
    }

    insertBio() {

        Axios.post("/insert-bio", {bio: this.state.bio}).then((response) => {
            this.setState({hasBio: true, bioInput: false})

        }).catch(function(error) {});
    }
    bioInput() {
        this.setState({bioInput: true})
    }

    render() {

        return (
            <div className="profile">
                <div id="profile-flex">
                    <img id="profilepic" src={this.props.imgUrl}/>
                    <div id="profile-info">

                        <h2>{this.props.first} {this.props.last}</h2>
                        {!this.state.bioInput && this.props.bio || !this.state.bioInput && <p>User has no bio</p>}
                        {!this.props.bio && <p className="profile-link" onClick={(e) => this.bioInput(e)}>Insert bio</p>}
                        {this.state.bioInput && <textarea onChange={e => this.updateBio(e)} rows="4" cols="50" placeholder="insertBio"></textarea>}
                        {this.state.bioInput && <div onClick={e => {
                            this.insertBio(e);
                            this.props.newBio(this.state.bio)
                        }} className="bio-button">
                            <p className="profile-link">Submit</p>
                        </div>}
                        {this.props.bio && !this.state.bioInput && <div onClick={(e) => this.bioInput(e)} className="bio-button">
                            <p className="profile-link">update bio</p>
                        </div>}
                    </div>
                </div>
                <div id="profile-bottom">
                    <div id="wall">
                        <div className="wall-box">
                            <div className="profile-message-box" ref={elem => this.elem = elem}>
                                {this.state.wallPosts && this.state.wallPosts.map( ( user, index ) => {
                                    return <div className="single-message" key={index}> <Link to={user.req_id}><img className="msg-img" src={"https://s3.amazonaws.com/olofsbuckett/"+user.url}/> <div className="msg-name"><h3 >{user.first} {user.last}</h3><p>{user.message}</p></div></Link></div>
                                } )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
