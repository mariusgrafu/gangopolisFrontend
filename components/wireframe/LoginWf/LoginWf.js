import React from "react"
import "./LoginWf.scss"

class LoginWf extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            usernameInput: "",
        };
    }

    usernameInputChange = (event) => {
        this.setState({usernameInput: event.target.value})
    };

    emit = (string, obj) => {
        let {socket} = this.props;
        socket.emit(string, obj);
    };

    render() {

        const {usernameInput, roomnameInput} = this.state;
        let {renameUser} = this.props;

        return (
            <div className="wf-login">
                {/* <i className="coupicon-power"/> */}
                <div className="wf-login-pair">
                    <input onChange={(e)=>{this.usernameInputChange(e)}} name="username"/>
                    <div className="wf-button" onClick={()=>{this.emit("debug | create user > sv", {username: usernameInput})}}>Create New User</div>
                </div>

                <div className="wf-login-pair">
                    <div className="wf-login-buttons">
                        <div className="wf-button" onClick={()=>{this.emit("debug | create room > sv", {roomname: roomnameInput})}}>Create Room</div>
                    </div>
                </div>

                <div className="wf-login-pair">
                    <div className="wf-button" onClick={()=>{renameUser(usernameInput)}}>Rename User</div>
                </div>
            </div>
        );
    }

}

export default LoginWf;