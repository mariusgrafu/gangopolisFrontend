import React from "react"
import "./MainWf.scss"

import LoginWf from "../LoginWf/LoginWf"
import RoomlistWf from "../RoomlistWf/RoomlistWf"
import UserlistWf from "../UserlistWf/UserlistWf"

class MainWf extends React.Component {

    constructor(props){
        super(props);

        this.socket = this.props.socket;

        this.state = {
            selectedUser: "",
            selectedRoom: "",
            selectedUserTimeout: "",
            selectedRoomTimeout: ""
        }
    }

    selectRoom = (selectedRoom) => {
        this.setState({selectedRoom}, this.moveUserToRoom);

        let {selectedRoomTimeout} = this.state;
        clearTimeout(selectedRoomTimeout);

        selectedRoomTimeout = setTimeout(() => {
            this.deselectRoom();
        }, 2000);

        this.setState({selectedRoomTimeout});
    };

    selectUser = (selectedUser) => {
        this.setState({selectedUser}, this.moveUserToRoom);

        let {selectedUserTimeout} = this.state;
        clearTimeout(selectedUserTimeout);

        selectedUserTimeout = setTimeout(() => {
            selectedUser = "";
            this.setState({selectedUser});
        }, 2000);

        this.setState({selectedUserTimeout});
    };

    moveUserToRoom = () => {
        let {selectedRoom, selectedUser} = this.state;
        if(selectedRoom !== "" && selectedUser !== "") {
            this.socket.emit("debug | move user to room > sv", {selectedRoom, selectedUser});
            this.setState({
                selectedUser: "",
                selectedRoom: ""
            })
        }
    };

    renameUser = (usernameInput) => {
        let {selectedUser} = this.state;
        if (selectedUser !== "" && usernameInput !== "") {
            this.socket.emit("debug | rename user > sv", {selectedUser, usernameInput})
        }
    };

    deselectRoom = () => {
        let selectedRoom = "";
        this.setState({selectedRoom});
    };

    render(){

        let {socket} = this.props;
        let {selectedUser, selectedRoom} = this.state;

        return(
            <div className="wf-main">

                <div className="wf-control">
                    <LoginWf socket={socket} renameUser={this.renameUser}/>
                </div>

                <div className="wf-display">
                    <div className="wf-rooms-users">
                        <RoomlistWf
                            socket={socket}
                            selectRoom={this.selectRoom}
                            selectedRoom={selectedRoom}
                            deselectRoom={this.deselectRoom}
                        />
                        <UserlistWf socket={socket} selectUser={this.selectUser} selectedUser={selectedUser}/>
                    </div>
                </div>

            </div>
        )
    }
}

export default MainWf;