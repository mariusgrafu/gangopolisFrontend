import React from 'react';
import {Link} from "react-router-dom";

import './userCard.scss';
import User from "../../../clientClasses/User";

/**
 * UserCard Component with Invite Button
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop player {Object} - The Player to be shown
 * @prop close {Function} - Closes the card
 */
class UserCard extends React.Component {

    constructor (props) {
        super(props);
    }

    /**
     * Handles the response from the server upon requesting an user invite
     * @param res
     */
    handleServerResponse = (res) => {
        //TODO: Handle Errors
        console.log(`invite player response`, res);
    }

    /**
     * Requests the server to invite a player
     */
    invitePlayer = () => {
        const {user, socket, player, close} = this.props;

        if(!user.roomid) return; // if the user is not in a room, the method has no effect

        let data = {
            userCredentials : user.getCredentials(),
            playerId : player.userid
        };

        socket.emit(`web | invite user`, data, this.handleServerResponse);
        close();
    }

    render () {
        const {player, user} = this.props;

        // the invite button component; it's empty if the user is not in a room
        let inviteBtnComp = (<></>);

        if(user.roomid && player.roomid !== user.roomid) {
            inviteBtnComp = (
                <div
                    className={"invite-btn"}
                    onClick = {this.invitePlayer}
                >
                    Invite!
                </div>
            );
        }

        return (
            <div className={`usercard-container`}>
                <div
                    className={'usercard-avatar'}
                    style={{backgroundImage : `url(${User.getAvatar(player.avatarId)})`}}
                />
                <div className={'usercard-info'}>
                    <div className={'usercard-name'}>
                        {player.username}
                    </div>
                    <div className={'usercard-id'}>
                        <i className={"gangicon-pound"} />
                        {player.userid}
                    </div>
                </div>
                {inviteBtnComp}
            </div>
        );
    }

}

export default UserCard;