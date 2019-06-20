import React from 'react';
import {Redirect} from "react-router-dom";

import './roomPageFooter.scss';

/**
 * The Room Page Footer Component
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop players {Array} - Array with the players in the room
 * @prop leaderId {String} - Room Leader ID
 * @prop roomid {String} - Room ID (temporary)
 * @prop roomType {String} - the type of the room ('web' or 'local')
 */
class RoomPageFooter extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            redirect : false, // if true, the component will redirect to '/' (home)
            maxReadyPlayers : (props.roomType === 'web')? 4 : 5 // how many players have to be ready for the game to be "Playable"
        };
    }

    /**
     * Counts how many players are ready and returns that number
     * @returns {number|*}
     */
    getReadyPlayersCount = () => {
        const {players, leaderId} = this.props;
        if(!players || !players.length) return 0;
        return players.reduce((acc, player) => {
            if(player.userid === leaderId) return acc + 0;
            if(player.readyStatus) return acc + 1;
            return acc + 0;
        }, 0);
    }

    /**
     * Looks through the players array and checks if the user(client) is ready
     * @returns {boolean}
     */
    isPlayerReady = () => {
        const {user, players, roomType} = this.props;
        if(!players || !players.length || (roomType === 'web' && players.length === 1)) return false;

        let isReady = false;
        players.map((player) => {
            if(player.userid === user.id) {
                isReady = player.readyStatus;
            }
        });

        return isReady;
    }

    /**
     * Response from the server after updating the ready state
     * @param res
     */
    readyServerResponse = (res) => {
        //TODO: Handle Errors
        console.log(res);
    }

    /**
     * Sets the current user's ready status
     * @param newStatus {Boolean}
     */
    setReadyStatus = (newStatus) => {
        const {socket, user} = this.props;

        let data = {
            userCredentials : user.getCredentials(),
            readyStatus : newStatus
        };

        socket.emit(`web | set user ready status`, data, this.readyServerResponse);
    }

    /**
     * Handles the response from the server upon requesting leaving the room
     * @param res
     */
    handleLeaveRoomResponse = (res) => {
        //TODO: Handle Errors
        console.log(res);
        const {user} = this.props;
        if(res.success) { // if the request was successful it will set the user's roomid to null and redirect them
            this.setState({redirect : true}, () => {
                user.updateRoomid(null);
            });
        }
    }

    /**
     * Sends request to the server to leave the room
     */
    leaveRoom = () => {
        const {socket, user} = this.props;

        let data = {
            userCredentials: user.getCredentials()
        };

        socket.emit(`web | leave room`, data, this.handleLeaveRoomResponse);
    }

    startGameResponse = (res) => {
        //TODO: Handle Errors
        console.log('start game response', res);
    }

    startGame = () => {
        const {socket, user} = this.props;

        let data = {
            userCredentials : user.getCredentials()
        }

        socket.emit(`web | start game`, data, this.startGameResponse);
    }

    render () {
        const {leaderId, user, roomType} = this.props;
        let {maxReadyPlayers, redirect} = this.state;

        if(redirect) { // renders Redirect Component if needed
            return (
                <Redirect to={'/'}/>
            );
        }

        const readyPlayersCount = this.getReadyPlayersCount(); // gets count of how many players are ready

        let mainBtnComp = (<></>); // main button component

        if(user.id === leaderId) { // checks if the current is user is the leader of the room
            // the Play button will be '.disabled' if there are players who are not ready
            let btnClass = ` disabled`;
            let onClickFunction = () => {};
            if(readyPlayersCount === maxReadyPlayers) {
                btnClass = ` green`;
                onClickFunction = this.startGame;
            }
            mainBtnComp = (
                <div
                    className={`footer-btn${btnClass}`}
                    onClick = {onClickFunction}
                >Play!</div>
            );
        } else {
            // if the current user is not the leader, the Play button becomes the Ready button
            let btnClass = ` green`;
            let btnMsg = `Ready`;
            let isReady = this.isPlayerReady(); // checks if the user is ready

            if(isReady) { // if the user is ready, the button will make them unready
                btnClass = ``;
                btnMsg = `Unready`;
            }
            mainBtnComp = (
                <div
                    className={`footer-btn${btnClass}`}
                    onClick={() => this.setReadyStatus(!isReady)}
                >{btnMsg}</div>
            );
        }

        let leaveString = `Leave`;

        if(roomType === 'local') {
            leaveString = `Disband`;
        }

        return (
            <div className="room-page-footer-container no-select">
                <div className="room-page-ready-counter">
                    {readyPlayersCount}/{maxReadyPlayers} players ready
                </div>
                <div className="room-page-footer-btns">
                    {mainBtnComp}
                    <div
                        className="footer-btn red"
                        onClick={this.leaveRoom}
                    >{leaveString}</div>
                </div>
            </div>
        );
    }

}

export default RoomPageFooter;