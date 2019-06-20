import React from 'react';
import onClickOutside from "react-onclickoutside";

import './leaderContextMenu.scss';

/**
 * Leader Context Menu with options regarding the players from the room
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop closeMenu {Function} - Function triggered when clicking outside of the component, meant to close the menu.
 * @prop player {Object} - The Player who will be affected
 * @prop roomType {String} - the type of the room ('web' or 'local')
 */
class LeaderContextMenu extends React.Component {

    constructor (props) {
        super(props);

    }

    /**
     * Closes the menu when the user clicked outside of this component
     * @param evt
     */
    handleClickOutside = (evt) => {
        try{
            const {closeMenu} = this.props;
            closeMenu();
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Handles response from the server upon requesting one of the options
     * @param res
     */
    handleServerResponse = (res) => {
        console.log(`context menu response: `, res);
        const {closeMenu} = this.props;
        closeMenu();
    }

    /**
     * Toggled the mute status of the player
     */
    toggleMuteStatus = () => {
        const {socket, user, player, roomType} = this.props;

        if(roomType !== 'web') return;

        let data = {
            userCredentials : user.getCredentials(),
            playerId : player.userid,
            muteStatus : !player.muteStatus
        };

        socket.emit(`web | set user mute status`, data, this.handleServerResponse);
    }

    /**
     * Designates the player as the new leader of the room
     */
    makeLeader = () => {
        const {socket, user, player, roomType} = this.props;

        if(roomType !== 'web') return;

        let data = {
            userCredentials : user.getCredentials(),
            playerId : player.userid
        };

        socket.emit(`web | make room leader`, data, this.handleServerResponse);
    }

    /**
     * Kicks the player from the room
     */
    kickPlayer = () => {
        const {socket, user, player} = this.props;

        let data = {
            userCredentials : user.getCredentials(),
            playerId : player.userid
        };

        socket.emit(`web | kick user`, data, this.handleServerResponse);
    }

    render () {
        const {player, roomType} = this.props;

        // the available options
        let options = [];

        if(roomType === 'web') {
            options.push(
                {
                    name : `make leader`,
                    action : this.makeLeader
                }
            );
            options.push(
                {
                    name : (player.muteStatus)?`unmute player`:`mute player`,
                    action : this.toggleMuteStatus
                }
            );
        }

        options.push(
            {
                name : `kick player`,
                action : this.kickPlayer
            }
        );

        let optionsComps = []; // array of options components

        options.map( (option, i) => {
            optionsComps.push( // creates a new option component for each component
                <div
                    key={i}
                    className={"leader-context-menu-item"}
                    onClick={option.action}
                >
                    {option.name}
                </div>
            );
        });

        return (
            <div className="leader-context-menu-container no-select">
                {optionsComps}
            </div>
        );
    }

}

export default onClickOutside(LeaderContextMenu);