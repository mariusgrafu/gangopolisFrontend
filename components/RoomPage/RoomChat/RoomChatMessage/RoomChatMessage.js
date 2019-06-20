import React from 'react';
import {Link} from "react-router-dom";

import './roomChatMessage.scss';
import User from "../../../../clientClasses/User";


/**
 * The Room Chat Message Component
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop message {Object} - Message Object with data about the author and the message
 * @prop getTeamByUserid {Function} - Gets the Team a player is in by userid
 * @prop isUserInRoom {Function} - Checks if a user is in the room
 */
class RoomChatMessage extends React.Component {

    constructor (props) {
        super(props);

        this.state = {};
    }

    render () {
        const {user, message, getTeamByUserid, isUserInRoom} = this.props;

        let messageClass = ``;

        if(message.author.userid === user.id) {
            messageClass += ` my-message`;
        }


        let teamUserIsIn = getTeamByUserid(message.author.userid);

        let teamMemberTitle = '';

        switch(teamUserIsIn) {
            case 'police':
                messageClass += ` police-message`;
                teamMemberTitle = 'Officer';
                break;
            case 'mafia1':
            case 'mafia2':
                messageClass += ` mob-message`;
                teamMemberTitle = 'Mobster';
                break;
            case 'gang1':
            case 'gang2':
                messageClass += ` gang-message`;
                teamMemberTitle = 'Gangster';
                break;
        }

        let hasLeft = !(isUserInRoom(message.author.userid));

        let hasLeftClass = '';

        if(hasLeft) {
            hasLeftClass = ' user-left';
        }

        let messagesComps = [];

        message.content.map((msg, i) => {
           messagesComps.push(
               <div key={i} className={'rcm-content-message'}>
                   {msg}
               </div>
           );
        });

        return (
            <div className={`room-chat-message${messageClass}${hasLeftClass}`}>
                <div className="rcm-author-avatar"
                     tooltip={teamMemberTitle}
                style={{backgroundImage : `url(${User.getAvatar(message.author.avatarId)})`}}
                />

                <div className="rcm-message-content">
                    <div className={"rcm-author-info"}>
                        <div className="rcm-author-name">{message.author.username}</div>
                        <div className="rcm-author-id">
                            <i className={"gangicon-pound"} />
                            {message.author.userid}
                        </div>
                    </div>
                    <div className="rcm-content">
                        {messagesComps}
                    </div>
                </div>
            </div>
        );
    }

}

export default RoomChatMessage;