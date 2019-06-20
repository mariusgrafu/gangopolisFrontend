import React from 'react';

import './roomPlayerListItem.scss';
import User from '../../../../clientClasses/User';
import LeaderContextMenu from "./LeaderContextMenu/LeaderContextMenu";

/**
 * The Room Player List Item Component
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop player {Object} - Data about the player to be shown
 * @prop leaderId {String} - Room Leader ID
 * @prop updateUser {Function} - updates the user
 * @prop roomType {String} - the type of the room ('web' or 'local')
 */
class RoomPlayerListItem extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            contextMenuOn : false // whether the contextMenu should render or not
        };
    }

    /**
     * Toggles the context menu
     * @param contextMenuOn {Boolean}
     */
    toggleContextMenu = (contextMenuOn) => {
        this.setState({contextMenuOn});
    }

    updatePlayer = (res) => {
        if(res.success) {
            const {updateUser} = this.props;
            updateUser(res.userInfo);
        }
    }

    refreshUser = () => {
        const {socket, player} = this.props;

        let data = {
            userid : player.userid
        }

        socket.emit(`web | get public user info`, data, this.updatePlayer);
    }

    componentDidMount() {
        const {socket, player} = this.props;

        socket.on(`web | refresh room user ${player.userid}`, this.refreshUser);
    }

    componentWillUnmount() {
        const {socket, player} = this.props;

        socket.off(`web | refresh room user ${player.userid}`);
    }

    render () {
        const {socket, user, leaderId, player, roomType} = this.props;
        const {contextMenuOn} = this.state;

        // if the player is the leader of the room, they will have an icon to show that
        let leaderIconComp = (<></>);

        if(leaderId === player.userid) {
            leaderIconComp = (
                <div
                    className="rpli-avatar-leader"
                    tooltip="Leader"
                >
                    <i className="gangicon-leader" />
                </div>
            );
        }

        let muteIconComp = (<></>);

        if(player.muteStatus) {
            muteIconComp = (
                <div
                    className="rpli-avatar-muteIcon"
                    tooltip="Muted"
                >
                    <i className="gangicon-mute" />
                </div>
            );
        }

        let roomPlayerListItemClass = ``;
        let menuIconClass = ``;

        let contextMenuComp = (<></>);

        if(contextMenuOn && user.id === leaderId) { // if the context menu is visible and the current user is leader, a LeaderContextMenu Component will render
            contextMenuComp = (
                <LeaderContextMenu
                    key={player.userid}
                    socket={socket}
                    user={user}
                    player={player}
                    closeMenu={() => this.toggleContextMenu(false)}
                    roomType = {roomType}
                />
            );

            roomPlayerListItemClass = ` active`;
            menuIconClass = ` active`;
        }

        if(player.userid === user.id) {
            roomPlayerListItemClass += ' is-you';
        }

        let leaderOptionsComp = (<></>);

        if(leaderId === user.id && player.userid !== leaderId) {
            leaderOptionsComp = (
                <div className={"rpli-player-options"}>
                    <i
                        className={`gangicon-ellipsis-v${menuIconClass}`}
                        onClick = {() => this.toggleContextMenu(true)}
                    />
                    {contextMenuComp}
                </div>
            );
        }

        let readyIcon = (<></>);

        if(player.userid !== leaderId) {
            let isReady = ``;
            if(player.readyStatus) {
                isReady = ` ready`;
            }
            readyIcon = (
                <div className={`rpli-player-status${isReady}`}>
                    <i className="gangicon-checkmark" />
                </div>
            );
        }

        return (
            <div className={`room-player-list-item${roomPlayerListItemClass}`}>
                <div className="rpli-player-data">
                    <div className="rpli-avatar no-select" style={{backgroundImage : `url(${User.getAvatar(player.avatarId)})`}}>
                        {leaderIconComp}
                        {muteIconComp}
                    </div>

                    <div className="rpli-name">{player.username}</div>

                    <div className="rpli-id">
                        <i className="gangicon-pound"/> {player.userid}
                    </div>
                </div>

                <div className="rpli-right">
                    {readyIcon}
                    {leaderOptionsComp}
                </div>
            </div>
        );
    }

}

export default RoomPlayerListItem;