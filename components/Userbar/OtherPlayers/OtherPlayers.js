import React from 'react';
import PropTypes from 'prop-types';
import {Link} from "react-router-dom";

import './otherPlayers.scss';
import OtherPlayer from "./OtherPlayer/OtherPlayer";
import UserCard from "../UserCard/UserCard";

/**
 * Other Players Component used in Userbar to show other players from the server
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 */
class OtherPlayers extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            players : [] // array with players
        }
    }

    static propTypes = {
        socket : PropTypes.object.isRequired,
        user : PropTypes.object.isRequired
    }

    /**
     * Updates the players array with information from the server
     * @param res {Object} - response from the server
     */
    updatePlayers = (res) => {
        console.log('x random', res);
        if(res.success) {
            this.setState({players : res.users});
        } else { // if the request failed, the players array will be an empty array
            this.setState({players : []});
        }
    }

    /**
     * Generates an array of components for the missing players, in case the players array has less than 5 players
     * @returns {Array}
     */
    getMissingPlayers = () => {
        const {players} = this.state;

        let missingPlayersComps = [];

        let missingPlayersCount = 5 - players.length; // check how many components need rendering

        for(let i = 0; i < missingPlayersCount; ++i) {
            missingPlayersComps.push(
                <div
                key={`missingPlayer${i}`}
                className="otherplayer-avatar missing-player"
                />
            );
        }

        return missingPlayersComps;
    }

    /**
     * Update the player matching the userid from the players array
     * @param userid
     * @param player
     */
    updatePlayer = (userid, player) => {
        let {players} = this.state;

        for(let i = 0; i < players.length; ++i) {
            if(players[i].userid === userid) {
                players[i] = player;
                break;
            }
        }

        this.setState({players});
    }

    componentDidMount () {
        const {socket, user} = this.props;

        let data = {
            count : 5,
            userid : user.id
        };

        // asks the server for data.count random users, except the current user (userid)
        socket.emit(`web | get x random users`, data, this.updatePlayers);
    }

    componentWillUnmount() {
        const {socket} = this.props;
        socket.off(`web | get x random users`);
    }

    render () {
        const {players} = this.state;
        const {socket, user} = this.props;

        let playersComps = []; // array of player components

        if(players.length) {
            players.map( (player) => {
                playersComps.push(
                    <OtherPlayer
                        key={`${player.userid}-${player.roomid}`}
                        user={user}
                        socket={socket}
                        player={player}
                        updatePlayer = {(newPlayer) => this.updatePlayer(player.userid, newPlayer)}
                    />
                );
            });
        }

        let missingPlayersComps = this.getMissingPlayers(); // get the missing players components (if there are already 5 players, this will be an empty array)

        return (
            <div className="otherplayers-container">

               {playersComps}
               {missingPlayersComps}

               <Link to="/users" className="otherplayers-more"
                     tooltip = {'All Players'}>
                <i className="gangicon-ellipsis-h"></i>
               </Link>

            </div>
        );
    }

}

export default OtherPlayers;