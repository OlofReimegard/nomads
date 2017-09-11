import React from 'react';
import Axios from 'axios';
import {Link} from 'react-router';
import Socket from "../components/socket"

export function Navbar({
    burgerMenu,
    showMenu,
    logOut,
    loadModal,
    url,
    first,
    last,
    userSearch,
    searchResults,
    searchInput

}) {
    return (
        <div className="fp-nav">
            <Link to="/profile"><img className="logo-img" src="/images/packerz-01.png"/></Link>
            <input id="nav-search" onChange={userSearch} value={searchInput}/>
            <div id="nav-burger-icon" onClick={showMenu}></div>
            {burgerMenu && <div id="burger-menu">
                <Link to="/friends">
                    <h3>Friends</h3>
                </Link>
                <Link to="/online">
                    <h3>Online users</h3>
                </Link>
                <Link to="/chat">
                    <h3>Chat</h3>
                </Link>
                <h3 onClick={logOut}>Log out</h3>
            </div>}

            <img onClick={loadModal} id="navpic" src={url} alt={first}/>
        </div>
    )
}


export function UploadModal({url, imgVal, uploadImg, closeWindow}) {
    return (

        <div className="modal">
            <div className="x-button" onClick={closeWindow}>&#10060;</div>
            <img id="modal-profilepic" src={url}/>
            <input type="file" id="file-selector" value={imgVal} onChange={uploadImg}/>
            <label htmlFor="file-selector">
                <h2>Upload file</h2>
            </label>
        </div>
    );
}
export function SearchResults({results,clearSearch}) {
    return (

        <div id="nav-results">{results.map((user) => {
            return <Link onClick={clearSearch} to={"/user/"+user.id}><div className="result-user"><img className="navpic" src={"https://s3.amazonaws.com/olofsbuckett/"+user.url}/><p>{user.first} {user.last}</p></div></Link>})}</div>
    );
}

export class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            uploadVisible: false,
            image: "",
            burgerMenu: false,
            activeRequests: false,
            searchResults: "",
            searchInput:""
        };
        this.uploadImg = this.uploadImg.bind(this);
        this.updateBio = this.updateBio.bind(this);
        this.userSearch = this.userSearch.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
    }

    componentDidMount() {
        Axios.get("/user").then((info) => {

            this.setState({
                first: info.data[0].first,
                last: info.data[0].last,
                id: info.data[0].id,
                imgUrl: "https://s3.amazonaws.com/olofsbuckett/" + info.data[0].url
            })
            if (info.data[0].bio) {
                this.setState({bio: info.data[0].bio, hasBio: true})
            }
        })

    }

    loadModal() {
        this.setState({uploadVisible: true})
    }

    showMenu() {
        if (this.state.burgerMenu) {
            this.setState({burgerMenu: false})
        } else {
            this.setState({burgerMenu: true})
        }

    }

    logOut() {
        Axios.get("/logout");
        window.location.pathname = "/welcome"
    }

    updateBio(newBio) {
        this.setState({bio: newBio})
    }

    closeWindow() {
        this.setState({uploadVisible: false})
    }

    uploadImg(event) {

        this.setState({image: event.target.value});
        var file = event.target.files[0];
        var formData = new FormData();
        formData.append('file', file);
        formData.append('id', this.state.id)

        Axios({url: '/upload', method: 'POST', data: formData, processData: false, contentType: false}).then((response) => {

            this.setState({uploadVisible: false, imgUrl: response.data.url})
        });

    }

    userSearch(event) {


            this.setState({searchInput : event.target.value})
            clearTimeout(this.state.search);
            this.setState({search: setTimeout(() => {
                Axios.post("/user-search",{userSearch:this.state.searchInput}).then((result) => {
                    this.setState({searchResults:result.data})
                })
            },200)});
            if(event.target.value== "") {
                this.clearSearch()
            }

    }

    clearSearch() {
            this.setState({searchInput:"",searchResults:""})
    }

    render(props) {

        const children = React.cloneElement(this.props.children, {
            newBio: this.updateBio,
            imgUrl: this.state.imgUrl,
            first: this.state.first,
            last: this.state.last,
            id: this.state.id,
            bio: this.state.bio,
            hasBio: this.state.hasBio
        })
        return (

            <div>
                <Navbar  searchInput={this.state.searchInput} searchResults={this.state.searchResults} userSearch={e => this.userSearch(e)} activeRequests={this.state.activeRequests} burgerMenu={this.state.burgerMenu} showMenu={e => this.showMenu(e)} logOut={e => this.logOut(e)} loadModal={e => this.loadModal(e)} url={this.state.imgUrl} first={this.state.first} last={this.state.last}/>{this.state.searchResults != "" && <SearchResults results={this.state.searchResults} clearSearch ={e => this.clearSearch(e)}/>} {this.state.uploadVisible && <UploadModal url={this.state.imgUrl} imgVal={this.state.image} uploadImg={e => this.uploadImg(e)} closeWindow={e => this.closeWindow(e)}/>}
                <Socket>
                    {children}
                </Socket>
            </div>

        )
    }
}
