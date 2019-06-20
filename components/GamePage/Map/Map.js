import PropTypes from 'prop-types'
import React from 'react';

import './map.scss';
import Building from "./Building/Building";
import LandingLogo from "../../Logo/LandingLogo";

import $ from 'jquery';
import 'jquery-ui-bundle';
import MapPlayers from "./MapPlayers/MapPlayers";
import Loading from "../../Loading/Loading";
import GameState from "../../../shared/GameState";

/**
 * The Map Component
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop mapInfo {} - Info about the building appearing on the map
 * @prop buildingOrder [] - The order in which the buildings must appear
 * @prop getPlayerInfo {Function(value, key)} - Returns the playerInfo of the player matching gameInfo.playersInfo[key] = value
 * @prop players [] - array of players
 * @prop accessibleBuildings [] - array of accessible buildings for the active player starting with their current tile
 */
class Map extends React.Component {

    constructor (props) {
        super(props);

        this.mapDomElement = null; // reference to the DOM Element representing the map

        // How many buildings are found on each side
        this.topRowCount = 13;
        this.bottomRowCount = 12;
        this.rightColumnCount = 7;
        this.leftColumnCount = 8;

        this.state = {
            loading : true // if true, a Loading Component will cover the screen
        };
    }

    /**
     * When the component mounts it will make the map dom element draggable
     * JqueryUI is used for this
     * It also moves the map in it's starting position
     */
    componentDidMount() {
        $(this.mapDomElement).draggable({
            scroll: false,
            stop : function () {
                let top = $(this).position().top;
                let left = $(this).position().left;
                let height = $(this).outerHeight();
                let width = $(this).outerWidth();

                let screenHeight = $(window).outerHeight();
                let screenWidth = $(window).outerWidth();

                top = Math.max(top, -(height - height/3));
                top = Math.min(top, screenHeight - height/3);

                left = Math.max(left, -(width - width/3));
                left = Math.min(left, screenWidth - width/3);

                $(this).css({
                    top : `${top}px`,
                    left : `${left}px`
                });
            }
        });

        $(this.mapDomElement).css({
            top : `${($(window).outerHeight() - 2200 )}px`
        });

        setTimeout(() => {
            this.setState({loading: false});
        }, 500);
    }

    /**
     * Checks if the buildingId Building is accessible (i.e is in the accessibleBuildings array)
     * Future checks on the matter should be made here
     * @param buildingId
     * @returns {boolean}
     */
    isBuildingAccessible = (buildingId) => {
        let {accessibleBuildings, activePlayer, getPlayerInfo, user} = this.props;
        let clientInfo = getPlayerInfo(user.id, 'userid');
        return (clientInfo.playerid === activePlayer && accessibleBuildings.indexOf(buildingId) !== -1);
    }

    /**
     * Returns the Building Components that should appear on the top row
     * @see Building
     * @returns {Array}
     */
    getTopTilesComps = () => {
        const {mapInfo, buildingOrder, user, socket, getPlayerInfo} = this.props;

        let tilesComps = [];

        let start = this.leftColumnCount + 1;
        let end = this.leftColumnCount + this.topRowCount + 1;

        for(let i = start; i < end; ++i) {
            let placement = 'top';
            if(i === start) placement = 'top left-corner';
            if(i === end - 1) placement = `top right-corner`;
            tilesComps.push(
                <Building
                    user = {user}
                    socket = {socket}
                    getPlayerInfo = {getPlayerInfo}
                    key={i}
                    building={mapInfo[buildingOrder[i]]}
                    buildingKey={buildingOrder[i]}
                    placement={placement}
                    accessibleBuilding = {this.isBuildingAccessible(buildingOrder[i])}
                    getBuildingFromTile = {this.props.getBuildingFromTile}
                />
            );
        }

        return tilesComps;
    }

    /**
     * Returns the Building Components that should appear on the right column
     * @see Building
     * @returns {Array}
     */
    getRightTilesComps = () => {
        const {mapInfo, buildingOrder, user, socket, getPlayerInfo} = this.props;

        let tilesComps = [];

        let start = this.leftColumnCount + this.topRowCount + 1;
        let end = start + this.rightColumnCount;

        for(let i = start; i < end; ++i) {
            let placement = 'right';
            tilesComps.push(
                <Building
                    user = {user}
                    socket = {socket}
                    getPlayerInfo = {getPlayerInfo}
                    key={i}
                    building={mapInfo[buildingOrder[i]]}
                    buildingKey={buildingOrder[i]}
                    placement={placement}
                    getBuildingFromTile = {this.props.getBuildingFromTile}
                    accessibleBuilding = {this.isBuildingAccessible(buildingOrder[i])}
                />
            );
        }

        return tilesComps;
    }

    /**
     * Returns the Building Components that should appear on the bottom row
     * @see Building
     * @returns {Array}
     */
    getBottomTilesComps = () => {
        const {mapInfo, buildingOrder, user, socket, getPlayerInfo} = this.props;

        let tilesComps = [];

        let start = this.leftColumnCount + this.topRowCount + this.rightColumnCount + this.bottomRowCount;
        let end = start - this.bottomRowCount;

        tilesComps.push(
            <Building
                user = {user}
                socket = {socket}
                getPlayerInfo = {getPlayerInfo}
                key={0}
                building={mapInfo[buildingOrder[0]]}
                buildingKey={buildingOrder[0]}
                placement={`bottom left-corner`}
                getBuildingFromTile = {this.props.getBuildingFromTile}
                accessibleBuilding = {this.isBuildingAccessible(buildingOrder[0])}
            />
        );

        for(let i = start - 1; i >= end + 1; --i) {
            let placement = 'bottom';
            if(i === end + 1) placement = `bottom right-corner`;
            tilesComps.push(
                <Building
                    user = {user}
                    socket = {socket}
                    getPlayerInfo = {getPlayerInfo}
                    key={i}
                    building={mapInfo[buildingOrder[i]]}
                    buildingKey={buildingOrder[i]}
                    placement={placement}
                    getBuildingFromTile = {this.props.getBuildingFromTile}
                    accessibleBuilding = {this.isBuildingAccessible(buildingOrder[i])}
                />
            );
        }

        return tilesComps;
    }

    /**
     * Returns the Building Components that should appear on the left column
     * @see Building
     * @returns {Array}
     */
    getLeftTilesComps = () => {
        const {mapInfo, buildingOrder, user, socket, getPlayerInfo} = this.props;

        let tilesComps = [];

        let start = this.leftColumnCount;
        let end = 0;

        for(let i = start; i > end; --i) {
            let placement = 'left';
            tilesComps.push(
                <Building
                    user = {user}
                    socket = {socket}
                    getPlayerInfo = {getPlayerInfo}
                    key={i}
                    building={mapInfo[buildingOrder[i]]}
                    buildingKey={buildingOrder[i]}
                    placement={placement}
                    getBuildingFromTile = {this.props.getBuildingFromTile}
                    accessibleBuilding = {this.isBuildingAccessible(buildingOrder[i])}
                />
            );
        }

        return tilesComps;
    }

    /**
     * Returns the component which renders the Player on the map
     * @see MapPlayers
     * @returns {*}
     */
    getMapPlayersComp = () => {
        const {players, getPlayerInfo, user, tilesComps, activePlayer, gameState} = this.props;
        const {loading} = this.state;
        if(loading || gameState === GameState.Enum.WaitingForPlayers) return (<></>);

        let mapPlayersComp = (
            <MapPlayers
                key = {`${tilesComps.updateCount}`}
                user = {user}
                players = {players}
                getPlayerInfo = {getPlayerInfo}
                tilesComps = {tilesComps}
                activePlayer = {activePlayer}
                mapComp = {this.mapDomElement}
            />
        );

        return mapPlayersComp;
    }

    /**
     * Returns the Loading Component
     * It also checks if the loading component should appear. If not it will simply return a React Fragment
     * @returns {*}
     */
    getLoadingComp = () => {
        const {loading} = this.state;
        if(!loading) return (<></>);
        return (
            <Loading />
        );
    }

    render () {

        let topTilesComps = this.getTopTilesComps();

        let bottomTilesComps = this.getBottomTilesComps();

        let leftTilesComps = this.getLeftTilesComps();

        let rightTilesComps = this.getRightTilesComps();

        let mapPlayersComp = this.getMapPlayersComp();

        let loadingComp = this.getLoadingComp();

        return (
            <div
                className="map-container no-select"
                ref={c => this.mapDomElement = c}
            >
                {loadingComp}
                {mapPlayersComp}
                <div className={`map-row top`}>
                    {topTilesComps}
                </div>
                <div className={`map-middle`}>
                    <div className={`map-row left`}>
                        {leftTilesComps}
                    </div>
                    <div className={`map-logo`}>
                        <LandingLogo ignoreLink={true} />
                    </div>
                    <div className={`map-row right`}>
                        {rightTilesComps}
                    </div>
                </div>
                <div className={`map-row bottom`}>
                    {bottomTilesComps}
                </div>
            </div>
        );
    }

}

export default Map;

Map.propTypes = {
  accessibleBuildings: PropTypes.any.isRequired,
  activePlayer: PropTypes.any.isRequired,
  buildingOrder: PropTypes.any.isRequired,
  gameState: PropTypes.any.isRequired,
  getBuildingFromTile: PropTypes.any.isRequired,
  getPlayerInfo: PropTypes.any.isRequired,
  mapInfo: PropTypes.any.isRequired,
  players: PropTypes.any.isRequired,
  socket: PropTypes.any.isRequired,
  tilesComps: PropTypes.any.isRequired,
  user: PropTypes.any.isRequired
}