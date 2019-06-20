import React from 'react';

import './userPanel.scss';
import User from "../../../../clientClasses/User";
import InvitesPanel from "./InvitesPanel/InvitesPanel";
import onClickOutside from "react-onclickoutside";
import RoomPanel from "./RoomPanel/RoomPanel";

/**
 * The UserPanel Component that will appear on the right
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop invites {Array} - Array of invites
 * @prop room {Object|null} - Object of the room (if exists)
 */
class UserPanel extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            activeTab : (props.room !== null)?'room':'invites'
        }
    }

    handleClickOutside = (evt) => {
        try {
            const {closePanel} = this.props;
            closePanel();
        } catch (e) {
            console.log(e);
        }
    }

    setActiveTab = (activeTab) => {
        this.setState({activeTab});
    }

    render () {
        let {activeTab} = this.state;
        const {user, socket, invites, closePanel, room} = this.props;

        if(!room) activeTab = 'invites';

        let roomTab = (<></>);

        if(room) {
            let isSelectedClass = ``;
            if(activeTab === 'room') isSelectedClass = ' selected';
            roomTab = (
                <div
                    className={`userpanel-tab${isSelectedClass}`}
                    onClick = {() => this.setActiveTab('room')}
                >
                    room
                </div>
            );
        }

        let isSelectedClass = ``;
        if(activeTab === 'invites') isSelectedClass = ` selected`;
        let hasInvitesDot = (<></>);
        if(invites.length) {
            hasInvitesDot = (
                <span className={"has-invites-dot"} />
            );
        }
        let invitesTab = (
            <div
                className={`userpanel-tab${isSelectedClass}`}
                onClick = {() => this.setActiveTab('invites')}
            >
                invites {hasInvitesDot}
            </div>
        );

        let activePanel = (<></>);

        switch (activeTab) {
            case 'room':
                activePanel = (
                    <RoomPanel
                        user = {user}
                        socket = {socket}
                        room = {room}
                        closePanel={closePanel}
                    />
                );
                break;
            case 'invites':
                activePanel = (
                    <InvitesPanel
                        user={user}
                        socket={socket}
                        invites={invites}
                        closePanel={closePanel}
                    />
                );
                break;
        }


        return (
            <div className={"userpanel-container"}>
                <div className={"upper-section"}>
                    <div className={"username"}>
                        {user.username}
                    </div>
                    <div className={`userpanel-tabs`}>
                        {roomTab}
                        {invitesTab}
                    </div>
                </div>
                {activePanel}
            </div>
        );
    }

}

export default onClickOutside(UserPanel);