import React, {Component} from 'react';

import './mapPlayers.scss'
import User from "../../../../clientClasses/User";

import $ from 'jquery';

/**
 * The MapPlayers Component
 * @prop user {User} - User Class with data about the client
 * @prop getPlayerInfo {Function(value, key)} - Returns the playerInfo of the player matching gameInfo.playersInfo[key] = value
 * @prop players [] - array of players
 */
class MapPlayers extends Component {

    constructor(props) {
        super(props);

        this.playersContainerDomComp = null; // reference to the players container dom element

        this.state = {
            playersComps : (<></>),
            playersContainerDomComp : null
        };
    }

    /**
     * Returns the position the given player is in based on the tile he is on
     * @param player
     * @returns {{x: number, y: number}|{x: number, y: number, opacity: number}}
     */
    getPlayerTilePosition = (player) => {
        let {mapComp} = this.props;
        let {playersContainerDomComp} = this.state;

        if(!mapComp) {
            console.log('no mapComp');
            return {
                x: 0, y: 0, opacity: 0
            };
        }

        let currentTileId = player.currentTileId;

        if ($(mapComp).find(`.map-tile-road#${currentTileId}`).length === 0) {
            console.log('cannot find map-tile-road');
            return {
                x: 0, y: 0, opacity: 0
            };
        }
        let tile = $(mapComp).find(`.map-tile-road#${currentTileId}`);

        if(!playersContainerDomComp) {
            return {
                x: 0, y: 0, opacity: 0
            };
        }
        let playersContainer = $(playersContainerDomComp);

        if (playersContainer.length === 0) {
            console.log(`cannot find playersContainer`);
            return {
                x: 0, y: 0, opacity: 0
            };
        }

        let y =  tile.offset().top - playersContainer.offset().top;
        let x = tile.offset().left - playersContainer.offset().left;

        x += tile.innerWidth()/2;
        y += tile.innerHeight()/2;

        return {
            x,
            y
        }
    }

    updateDomContainer = (ref) => {
        let {playersContainerDomComp} = this.state;

        if(playersContainerDomComp !== null) return;

        this.setState({playersContainerDomComp : ref});
    }

    /**
     * Returns the components for the players
     * @returns {Array|{x: number, y: number, opacity: number}}
     */
    getPlayersComps = () => {
        const {players, user, activePlayer} = this.props;
        let {mapComp} = this.props;

        if(!mapComp) return {
            x: 0, y: 0, opacity: 0
        };

        let playersComps = [];

        players.map((player) => {
            let playerPos = this.getPlayerTilePosition(player);

            let teamCssClass = ` team-${player.teamType}`;
            let clientArrowComp = (<></>);
            let tooltipName = player.username;
            if(player.userid === user.id) {
                clientArrowComp = (
                    <i className={`gangicon-player-arrow map-player-arrow`} />
                );
                tooltipName = 'You';
            }
            let activePlayerCssClass = '';
            if(player.playerid === activePlayer) {
                activePlayerCssClass = ` is-active`;
            }
            let opacity = (playerPos.opacity === 0)?(0):(1);

            if(!opacity) return;

           playersComps.push(
               <div
                   key={`${player.playerid}-${player.currentTileId}`}
                   id={player.playerid}
                   className={`map-player`}
                   style={{
                       top : playerPos.y + 'px',
                       left : playerPos.x + 'px',
                       opacity
                   }}
                   tooltip = {tooltipName}
               >
                   <div
                       className={`map-player-avatar${teamCssClass}${activePlayerCssClass}`}
                       style={{
                           backgroundImage : `url(${User.getAvatar(player.avatarId)})`
                       }}
                   >
                       {clientArrowComp}
                   </div>
               </div>
           );
        });

        return playersComps;
    }

    componentWillMount() {
        // setTimeout(() => {
        //     this.setState({
        //         playersComps : this.getPlayersComps()
        //     });
        // }, 100);
    }

    render() {
        let playersComps = this.getPlayersComps();

        return (
            <div
                className={`map-players-container`}
                ref = {this.updateDomContainer}
            >
                {playersComps}
            </div>
        );

    }

}

export default MapPlayers;