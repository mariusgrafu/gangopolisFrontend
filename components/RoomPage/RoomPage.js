import PropTypes from 'prop-types'
import React from 'react';

import './roomPage.scss';

import RoomPageLock from './RoomPageLock/RoomPageLock';
import RoomPageFooter from './RoomPageFooter/RoomPageFooter';
import RoomChat from './RoomChat/RoomChat';

import RoomPlayerList from './RoomPlayerList/RoomPlayerList';
import RoomTeams from './RoomTeams/RoomTeams';
import Loading from "../Loading/Loading";
import RoomError from "./RoomError/RoomError";
import PageAbstract from "../PageAbstract/PageAbstract";
import RoomMobileSection from "./RoomMobileSection/RoomMobileSection";
import {Redirect} from "react-router";

/**
 * The Room Page Component
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop roomid {String} - The Room id
 */
class RoomPage extends PageAbstract {

    constructor (props) {
        super(props);

        this.inviteLinkInput = null;
        this.inviteLinkExtraClassTimeout = null;

        this.state = {
            inviteLinkExtraClass : '',
            redirect : ``, // link to where it should redirect
            room : null, // information about the room. null until information is received from the server
            loading : true, // a Loading Component will be rendered until the server responds
            errors : [] // array of errors
        };
    }

    /**
     * Updates the room with information from the server
     * @param res
     */
    updateRoom = (res) => {
        console.log('update room', res); // logging for debugging purposes
        if(res.success) { // checks if the request was a success and updates the room and takes it out of a loading state
            this.setState({room : res.roomInfo, loading : false});
            if(res.roomInfo.type === 'local') {
                const {setCurrentPage} = this.props;

                try{
                    setCurrentPage('local');
                } catch(e) {
                    console.log(e);
                }
            }
        } else { // if the request wasn't successful it will stop the loading state and update the errors array with the ones received from the server
            this.setState({
                errors : res.errors || [],
                loading : false
            });
        }
    }

    /**
     * Updates the room privacy status
     * @param res {Object} - response from the server
     */
    updateRoomStatus = (res) => {
        if(res.success) {
            let {room} = this.state;
            room.privateStatus = res.privateStatus;
            this.setState({room});
        }
    }

    /**
     * Asks the server for the room privacy status
     */
    refreshRoomStatus = () => {
        const {user, roomid, socket} = this.props;

        let data = {
            userCredentials: user.getCredentials(),
            roomid
        };

        socket.emit(`web | get room private status`, data, this.updateRoomStatus);
    }

    /**
     * Updates the user with userid given
     * @param userid
     * @param user
     */
    updateUser = (userid, user) => {
        let {room} = this.state;

        for(let i = 0; i < room.usersInfo.length; ++i) {
            if(room.usersInfo[i].userid === userid) {
                room.usersInfo[i] = user;
                break;
            }
        }

        this.setState({room});
    }

    /**
     * Asks the server for information about the room
     */
    refreshRoom = () => {
        const {user, socket, roomid} = this.props;

        let data = {
            userCredentials : user.getCredentials(), // sends credentials (userid, userhash) to be verified on the server
            roomid
        };

        // asks the server for information
        socket.emit(`web | get room info`, data, this.updateRoom);
    }

    redirectToGame = () => {
        this.setState({redirect : '/game'});
    }

    componentDidMount() {
        const {socket, roomid} = this.props;

        // calls the refreshRoom function which will ask the server for room information
        this.refreshRoom();

        // listens for changes made to the room
        socket.on(`web | refresh room status ${roomid}`, this.refreshRoomStatus);
        socket.on(`web | refresh room ${roomid}`, this.refreshRoom);

        socket.on(`web | start game in room ${roomid}`, this.redirectToGame);
    }

    componentWillUnmount() {
        const {socket, roomid} = this.props;

        // removes socket listeners when the component will be unmounted
        socket.off(`web | refresh room status ${roomid}`);
        socket.off(`web | refresh room ${roomid}`);
        socket.off(`web | start game in room ${roomid}`);
    }

    getInviteLink = () => {
        let {inviteLinkExtraClass} = this.state;
        if(inviteLinkExtraClass !== '') return;

        clearTimeout(this.inviteLinkExtraClassTimeout);

        this.inviteLinkInput.select();

        document.execCommand("copy");

        this.setState({inviteLinkExtraClass : ' copied'}, () => {
            this.inviteLinkExtraClassTimeout = setTimeout( () => {
               this.setState({inviteLinkExtraClass : ''});
            }, 500);
        });
    }

    /**
     * Given an userid it returns the team the user is in, or null
     * @param userid
     * @returns {null|String}
     */
    getTeamByUserid = (userid) => {
        const {room} = this.state;
        if(!room) return null;

        const {teams} = room;

        for(let team in teams) {
            if(teams[team] == userid) return team;
        }

        return null;
    }

    /**
     * Returns info about the user
     * @param userid
     * @returns {null||*}
     */
    getUserInfoByUserid = (userid) => {
        const {room} = this.state;
        if(!room) return null;

        const {usersInfo} = room;

        if(!usersInfo.length) return null;

        for(let i = 0; i < usersInfo.length; ++i) {
            if(usersInfo[i].userid === userid) return usersInfo[i];
        }

        return null;
    }

    /**
     * Checks if a user is in this room
     * @param userid
     * @returns {boolean}
     */
    isUserInRoom = (userid) => {
        return (this.getUserInfoByUserid(userid) !== null);
    }

    getInviteComp = () => {
        const {room, inviteLinkExtraClass} = this.state;

        if(room.type === 'local') return (<></>);

        let inviteLink = `http://${window.location.hostname}:${window.location.port}/invite/${room.roomid}/${room.accessCode}`;

        let inviteComp = (
            <div
                className="room-page-invite-link-container"
                onClick={this.getInviteLink}
            >
                <input
                    className={"invite-link-input"}
                    type={"text"}
                    value={inviteLink}
                    readOnly={true}
                    ref={c => (this.inviteLinkInput = c)}
                />
                <div className={`invite-link-btn no-select${inviteLinkExtraClass}`}>
                    <div className={"invite-link-group"}>
                        <span className="invite-link-title">Get Invite Link</span>
                        <i className="gangicon-letter" />
                    </div>
                    <div className={"invite-link-group"}>
                        <span className="invite-link-title">Copied to Clipboard</span>
                        <i className="gangicon-checkmark" />
                    </div>
                </div>
            </div>
        );

        return inviteComp;
    }

    getRoomPrivacyComp = () => {
        const {socket, user} = this.props;
        const {room} = this.state;

        if(room.type === 'local') {
            return (<></>);
        }

        let roomPrivacyComp = (
            <RoomPageLock
                socket={socket}
                user={user}
                leaderId={room.leaderId}
                privateStatus={room.privateStatus}
                roomid={room.roomid}
                password={room.password}
            />
        );

        return roomPrivacyComp;
    }

    getRoomChatComp = () => {
        const {user, socket} = this.props;
        const {room} = this.state;

        if(room.type === 'local') {
            return (<></>);
        }

        let muteStatus = true;
        let clientInfo = this.getUserInfoByUserid(user.id);
        if(clientInfo) {
            muteStatus = clientInfo.muteStatus;
        }

        let roomChatComp = (
            <RoomChat
                user={user}
                muteStatus={muteStatus}
                socket={socket}
                roomid={room.roomid}
                leaderId={room.leaderId}
                getTeamByUserid={this.getTeamByUserid}
                isUserInRoom={this.isUserInRoom}
            />
        );

        return roomChatComp;
    }

    getMobileSectionComp = () => {
        const {room} = this.state;

        if(room.type !== 'local') return (<></>);

        let mobileSectionComp = (
            <RoomMobileSection
                code = {room.roomid}
            />
        );

        return mobileSectionComp;
    }

    getPageDetailsComp = () => {
        const {room} = this.state;
        let pageDetailsComp;
        if(room.type === `local`) {
            pageDetailsComp = (
                <div className="room-page-details">
                    <div className={`rpd-title`}>
                        Play with Friends
                    </div>
                </div>
            );
        } else {
            pageDetailsComp = (
                <div className="room-page-details">
                    <span className="rpd-welcome">Welcome to Room</span>
                    <div className="rpd-room-id">
                        <i className="gangicon-pound" />
                        <span>{room.roomid}</span>
                    </div>
                </div>
            );
        }


        return pageDetailsComp;
    }

    render () {
        const {socket, user} = this.props;
        const {room, loading, errors, redirect} = this.state;

        if(redirect) {
            return (
                <Redirect to={redirect} />
            );
        }

        if(loading) // renders a Loading Component
            return (
                <div className="room-page-container">
                    <Loading />
                </div>
            );

        if(errors.length) { // renders the RoomError Component if there are any errors
            return (
              <div className={`room-page-container centered`}>
                  <RoomError errors={errors} />
              </div>
            );
        }

        console.log('room', room); // logs the room details for debugging purposes

        let inviteComp = this.getInviteComp();
        let roomPrivacyComp = this.getRoomPrivacyComp();

        let roomChatComp = this.getRoomChatComp();

        let mobileSectionComp = this.getMobileSectionComp();

        let pageDetailsComp = this.getPageDetailsComp();

        return (
            <div className="room-page-container">

                <div className="room-page-header">
                    {pageDetailsComp}

                    {inviteComp}

                    {roomPrivacyComp}
                </div>

                <div className="room-page-main-container">
                    {mobileSectionComp}

                    <RoomPlayerList
                        user={user}
                        socket={socket}
                        players={room.usersInfo}
                        leaderId={room.leaderId}
                        updateUser = {this.updateUser}
                        roomType={room.type}
                    />

                    <RoomTeams
                        user={user}
                        socket={socket}
                        teams={room.teams}
                        users={room.usersInfo}
                        roomType={room.type}
                    />

                    {roomChatComp}
                </div>

                <RoomPageFooter
                    socket={socket}
                    user={user}
                    players={room.usersInfo}
                    leaderId={room.leaderId}
                    roomid = {room.roomid}
                    roomType={room.type}
                />

            </div>
        );
    }

}

export default RoomPage;

RoomPage.propTypes = {
  roomid: PropTypes.any.isRequired,
  setCurrentPage: PropTypes.any.isRequired,
  socket: PropTypes.any.isRequired,
  user: PropTypes.any.isRequired
}