import React from 'react';

import './roomPlayerList.scss';

import './RoomPlayerListItem/RoomPlayerListItem';
import RoomPlayerListItem from './RoomPlayerListItem/RoomPlayerListItem';

/**
 * The Room Player List Component
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop players {[Object]} - Array with information about the players in the room
 * @prop leaderId {String} - Leader ID
 * @prop updateUser {Function} - updates an user based on userid
 * @prop roomType {String} - the type of the room ('web' or 'local')
 */
class RoomPlayerList extends React.Component {

    constructor (props) {
        super(props);

        this.state = {};
    }

    getPlayersComps = () => {
        let {socket, user, leaderId, players, updateUser, roomType} = this.props;
        let playersComps = [];
        if (!players.length) return (
            <div className={`room-player-list-no-players`}>
                There's no one in this room.. maybe make some friends? 😒
            </div>
        );

        let leader = null, currentUser = null, otherPlayers = [];
        players.map((player) => {
            if(player.userid === leaderId) {
                leader = player;
            } else if (player.userid === user.id) {
                currentUser = player;
            } else {
                otherPlayers.push(player);
            }
        });

        if(leader !== null) {
            playersComps.push(
                <RoomPlayerListItem
                    key={leader.userid}
                    socket={socket}
                    user={user}
                    player={leader}
                    leaderId={leaderId}
                    updateUser = {(newUser) => updateUser(leader.userid, newUser)}
                    roomType = {roomType}
                />
            );
        }

        if(currentUser !== null) {
            playersComps.push(
                <RoomPlayerListItem
                    key={currentUser.userid}
                    socket={socket}
                    user={user}
                    player={currentUser}
                    leaderId={leaderId}
                    updateUser = {(newUser) => updateUser(currentUser.userid, newUser)}
                    roomType = {roomType}
                />
            );
        }

        if(otherPlayers.length) {
            otherPlayers.map((otherPlayer) => {
                playersComps.push(
                    <RoomPlayerListItem
                        key={otherPlayer.userid}
                        socket={socket}
                        user={user}
                        player={otherPlayer}
                        leaderId={leaderId}
                        updateUser = {(newUser) => updateUser(otherPlayer.userid, newUser)}
                        roomType = {roomType}
                    />
                );
            });
        }

        return playersComps;
    }

    render () {
        const {socket, user, players, leaderId} = this.props;

        if(!players) return (<></>);

        let playersComps = this.getPlayersComps();

        return (
            <div className="room-page-column">
                <div className="rpc-header">
                    <div className="rpc-title">Players</div>
                    <div className="rpc-description">
                        See who else is in the room
                    </div>
                </div>

                <div className="room-player-list">
                    {playersComps}
                </div>
            </div>
        );
    }

}

export default RoomPlayerList;