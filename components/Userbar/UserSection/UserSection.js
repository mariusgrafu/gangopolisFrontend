import React from 'react';

import './userSection.scss';
import User from "../../../clientClasses/User";
import UserPanel from "./UserPanel/UserPanel";

/**
 * The UserSection Component that will appear on the right
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 */
class UserSection extends React.Component {

    constructor (props) {
        super(props);

        this.maxRoomUsers = 5;

        this.state = {
            panelOpen : false,
            room : null,
            invites : []
        }
    }

    togglePanel = (panelOpen) => {
        this.setState({panelOpen});
    }

    /**
     * Updates the invites with information from the server
     * @param res
     */
    updateInvites = (res) => {
        console.log("Update Invites", res);
        if(res.success) {
            this.setState({invites : res.invites});
        } else {
            //TODO: Handle Errors

        }

    }

    /**
     * Asks the server for information about invites
     * The Server responds through the callback
     */
    refreshInvites = () => {
        const {user, socket} = this.props;

        let data = {
            userCredentials : user.getCredentials()
        }

        socket.emit(`web | get user invites`, data, this.updateInvites);
    }

    updateRoom = (res) => {
        if(res.success) {
            this.setState({room : res.roomInfo});
        }
    }

    /**
     * Asks the server for information about the room
     * The server responds through the callback
     */
    refreshRoom = () => {
        const {user, socket} = this.props;

        let data = {
            userCredentials : user.getCredentials(), // sends credentials (userid, userhash) to be verified on the server
            roomid : user.roomid
        };

        // asks the server for information
        socket.emit(`web | get room info`, data, this.updateRoom);
    }

    /**
     * When the component mounts it listens for different event regarding it
     */
    componentDidMount() {
        const {user, socket} = this.props;

        this.refreshInvites();

        socket.on(`web | refresh invites user ${user.id}`, this.refreshInvites);
        if(user.roomid) {
            this.refreshRoom();
            socket.on(`web | refresh userSection room ${user.roomid}`, this.refreshRoom);
        }
    }

    componentWillUnmount() {
        const {user, socket} = this.props;

        socket.off(`web | refresh invites user ${user.id}`);
        socket.off(`web | refresh userSection room ${user.roomid}`);
    }

    render () {
        const {user, socket} = this.props;
        const {panelOpen, invites, room} = this.state;

        let panelComp = (<></>);

        if(panelOpen) {
            panelComp = (
                <UserPanel
                    socket={socket}
                    user={user}
                    closePanel={() => this.togglePanel(false)}
                    invites = {invites}
                    room = {room}
                />
            );
        }

        let tooltipObj = {};

        let invitesCountComp = (<></>);

        if(invites.length && !panelOpen) {
            invitesCountComp = (
                <div className={"user-invites-counter"}>
                    {invites.length}
                </div>
            );

            tooltipObj = {
                tooltip : `${invites.length} invite${ (invites.length !== 1)?'s':'' }`
            }
        }

        let userInRoomExtraClass = '';

        if(user.roomid) {
            userInRoomExtraClass = ` in-room`;
        }

        let roomUsersComp = (<></>);
        if(room && !panelOpen) {

            roomUsersComp = (
                <div
                    className={"user-avatar-roomUsers"}
                >
                    <i className={`gangicon-users`} />
                    <span>{room.usersInfo.length}/{this.maxRoomUsers}</span>
                </div>
            );
        }

        return (
            <div
                className={`user-avatar${userInRoomExtraClass}`}
                style={{backgroundImage : `url(${User.getAvatar(user.avatar)})`}}
                onClick = {() => {
                    if(!panelOpen)
                        this.togglePanel(true)
                }}
                {...tooltipObj}
            >
                {roomUsersComp}
                {invitesCountComp}
                {panelComp}
            </div>
        );
    }

}

export default UserSection;