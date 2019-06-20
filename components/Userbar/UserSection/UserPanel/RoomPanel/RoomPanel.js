import React from 'react';

import './roomPanel.scss';
import User from "../../../../../clientClasses/User";
import {Link} from "react-router-dom";

/**
 * The RoomPanel Component that will appear on the right.
 * It shows information about the room the client is in.
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop room {Object} - The Object of the Room
 * @prop closePanel {Function} - Closes the User Panel
 */
class RoomPanel extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
        }
    }

    render () {
        const {room, closePanel} = this.props;

        let usersComps = [];

        room.usersInfo.map( (userInfo) => {
            let iconComp = (<></>);

            if(userInfo.userid === room.leaderId) {
                iconComp = (
                    <i className={`gangicon-leader leader`} />
                );
            } else {
                let readyClass = ` unready`;
                if(userInfo.readyStatus) readyClass = ` ready`;
                iconComp = (
                    <i className={`gangicon-checkmark${readyClass}`} />
                );
            }

            usersComps.push(
                <div
                    key={userInfo.userid}
                    className={`room-panel-user`}
                    style={{backgroundImage: `url(${User.getAvatar(userInfo.avatarId)})`}}
                    tooltip={userInfo.username}
                >
                    {iconComp}
                </div>

            );
        });

        for(let i = 0; i < 5 - room.usersInfo.length; ++i) {
            usersComps.push(
                <div
                    key = {i}
                    className={`room-panel-user no-user`}
                />
            );
        }

        return (
            <div className="room-panel-container no-select">
                <div className={`room-id-wrap`}>
                    <div className={`room-id-title`}>
                        room id
                    </div>
                    <div className={`room-id`}>
                        #{room.roomid}
                    </div>
                </div>
                <div className={`room-panel-users`}>
                    {usersComps}
                </div>
                <Link
                    to={`/room/${room.roomid}`}
                    className={`btn`}
                    onClick = {() => {closePanel()}}
                >
                    Go to Room
                </Link>
            </div>
        );
    }

}

export default RoomPanel;