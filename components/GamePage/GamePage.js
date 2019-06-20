import PropTypes from 'prop-types'
import React from 'react';

import './gamePage.scss';
import PageAbstract from "../PageAbstract/PageAbstract";
import Map from "./Map/Map";
import DicePanel from "./DicePanel/DicePanel";
import Loading from "../Loading/Loading";
import {Redirect} from "react-router";

import $ from 'jquery';
import GameState from "../../shared/GameState";
import PlayerState from "../../shared/PlayerState";
import HudTeams from "./HudTeams/HudTeams";
import GameAlerts from "./GameAlerts/GameAlerts";
import Building from "./Map/Building/Building";
import HudPlayerInfo from "./HudPlayerInfo/HudPlayerInfo";

/**
 * The Game Page Component
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 */
class GamePage extends PageAbstract {

    constructor (props) {
        super(props);

        this.tilesComps = {updateCount : 0}; // keeps track of the tiles that loaded

        // keeps track of the movement animation interval
        this.movementAnimationInterval = {
            interval : null,  // the interval
            isOn : false // if the interval is active
        };

        this.state = {
            gameInfo : null, // gameInfo from the server
            loading : true, // whether the page is still loading or not
            redirect : '', // where to redirect to
            accessibleBuildings : [], // array of accessible buildings
            accessibleTiles : [] // array of accessible tiles
        };
    }

    /**
     * Sets the accessibleTiles array based on the accessibleTiles from the server
     * @param accessibleTiles
     */
    setAccessibleTilesToBuildings = (accessibleTiles) => {
        let accessibleBuildings = [];
        let {gameInfo} = this.state;

        accessibleTiles.map((accessibleTile) => {
            let building = gameInfo.tileToBuilding[accessibleTile];
            if(accessibleBuildings.indexOf(building) === -1) {
                accessibleBuildings.push(building);
            }
        });

        this.setState({accessibleBuildings});
    }

    /**
     * Given a tileId, it returns the buildingId this tile belongs to
     * @param tileId
     */
    getBuildingFromTile = (tileId) => {
        let {gameInfo} = this.state;

        return gameInfo.tileToBuilding[tileId];
    }

    /**
     * Centers the "camera" to the player position
     * @param playerid
     */
    centerCameraToPlayer = (playerid) => {

        let playerComp = $(`#${playerid}`);

        let playersContainer = $(`.map-players-container`);

        let playerRelativePosition = {
            top : playerComp.offset().top - playersContainer.offset().top,
            left : playerComp.offset().left - playersContainer.offset().left
        }

        let screenHeight = $(window).outerHeight();
        let screenWidth = $(window).outerWidth();

        let centerTop = screenHeight/2;
        let centerLeft = screenWidth/2;

        $(`.map-container`).animate({
            top: (centerTop - playerRelativePosition.top) + 'px',
            left: (centerLeft - playerRelativePosition.left) + 'px'
        }, 150);


    }

    /**
     * Moves the player to the position of a given tileId
     * If the "camera" should follow the player, 'moveCamera' should be true
     * @param playerid
     * @param tileid
     * @param moveCamera
     */
    movePlayerToTilePosition = (playerid, tileid, moveCamera = true) => {

        let tile = $(`.map-tile-road#${tileid}`);
        let playersContainer = $(`.map-players-container`);

        let y =  tile.offset().top - playersContainer.offset().top;
        let x = tile.offset().left - playersContainer.offset().left;

        x += tile.innerWidth()/2;
        y += tile.innerHeight()/2;

        let playerComp = $(`#${playerid}`);

        playerComp.css({
            left : x + 'px',
            top : y + 'px'
        });

        if(moveCamera) {
            this.centerCameraToPlayer(playerid);
        }
    }

    /**
     * Animates the activePlayer through the accessibleTiles by moving them from tile to tile
     * When the player lands on the last tile, it will emit to the server that the movement is done
     * @param activePlayer
     * @param accessibleTiles
     */
    animateToDestination = (activePlayer, accessibleTiles) => {
        const {user, socket} = this.props;
        let playerId = activePlayer.playerid;
        let tileIndex = 0;
        clearInterval(this.movementAnimationInterval.interval);

        this.movementAnimationInterval.isOn = true;
        this.movementAnimationInterval.interval = setInterval(() => {
            this.movePlayerToTilePosition(playerId, accessibleTiles[tileIndex]);
            tileIndex++;
            if(tileIndex === accessibleTiles.length) {

                $(`.map-waypoint`).remove();

                socket.emit(`web | game | movement done`, {
                    userCredentials : user.getCredentials()
                }, () => {});

                this.setState({
                    accessibleTiles : [],
                    accessibleBuildings : []
                });

                this.movementAnimationInterval.isOn = false;
                clearInterval(this.movementAnimationInterval.interval);
            }
        }, 500);
    }

    /**
     * Handles browser visibility change. If it is hidden, then it will skip the movement animation and call the
     * functions that would normally get called at the end of the animation
     */
    handleVisibilityChange = () => {
        const {socket, user} = this.props;
        const {gameInfo} = this.state;

        if(document.visibilityState === 'hidden') {
            if(this.movementAnimationInterval.isOn) {
                clearInterval(this.movementAnimationInterval.interval);
                this.movementAnimationInterval.isOn = false;
                $(`.map-waypoint`).remove();
                this.centerCameraToPlayer(gameInfo.activePlayer);

                socket.emit(`web | game | movement done`, {
                    userCredentials : user.getCredentials()
                });

                this.setState({
                    accessibleTiles : [],
                    accessibleBuildings : []
                });

            }
        }
    }

    /**
     * Sets a way-point to the destination (through the accessible tiles)
     * This shows the player the tiles they will go through, so they will know what building they can interact with
     * @param activePlayer
     * @param accessibleTiles
     */
    setWaypoint = (activePlayer, accessibleTiles) => {
        let activePlayerCurrentTile = activePlayer.currentTileId;

        $(`.map-tile-road#${activePlayerCurrentTile}`).append(`
                <div class="map-waypoint start"></div>
                `);

        accessibleTiles.map((accesibleTile, i) => {
            let extraCssClass = ``;
            if(i === accessibleTiles.length - 1){
                extraCssClass = ` end`;
            }
            $(`.map-tile-road#${accesibleTile}`).append(`
                <div class="map-waypoint${extraCssClass}"></div>
                `);
        });
    }

    /**
     * Starts the player movement
     */
    startMoving = () => {
        const {accessibleTiles} = this.state;

        this.handleMovement(accessibleTiles);
        this.setState({accessibleTiles : []});
    }

    /**
     * Handles the movement. It will start the moving animation or skip it if the browser is not on this page
     * @param accessibleTiles
     */
    handleMovement = (accessibleTiles) => {
        const {gameInfo} = this.state;
        let activePlayer = this.getPlayerInfo(gameInfo.activePlayer, 'playerid');
        this.updateGameState(GameState.Enum.WaitingForMovementEnd);
        this.updatePlayerState(gameInfo.activePlayer, PlayerState.Enum.Moving);
        // this.setWaypoint(activePlayer, accessibleTiles);

        this.movementAnimationInterval.isOn = true;

        if(document.visibilityState === 'hidden') {
            this.handleVisibilityChange();
            return;
        }

        this.animateToDestination(activePlayer, accessibleTiles);
    }

    /**
     * Handles accessible tiles from the server
     * It sets the way-point, updates the needed states and player-states
     * @param res
     */
    handleAccessibleTiles = (res) => {
        console.log('handle accessible tiles', res);
        const {gameInfo} = this.state;
        if(res.success) {
            let activePlayer = this.getPlayerInfo(gameInfo.activePlayer, 'playerid');
            this.setWaypoint(activePlayer, res.accessibleTiles);
            this.setAccessibleTilesToBuildings(res.accessibleTiles);
            this.updateGameState(GameState.Enum.WaitingForBuildingActions);
            this.updatePlayerState(gameInfo.activePlayer, PlayerState.Enum.MovementBuildingActions);
            this.setState({accessibleTiles : res.accessibleTiles});
        } else {
            //TODO: Handle Errors
        }
    }

    /**
     * Updates the game state from gameInfo
     * @param newGameState
     */
    updateGameState = (newGameState) => {
        let {gameInfo} = this.state;
        gameInfo.gameState = newGameState;

        this.setState({gameInfo});
    }

    /**
     * Updates the player-state from the playerInfo field from gameInfo
     * @param playerid
     * @param newState
     */
    updatePlayerState = (playerid, newState) => {
        let {gameInfo} = this.state;

        for(let i = 0; i < gameInfo.playersInfo.length; ++i) {
            if(gameInfo.playersInfo[i].playerid === playerid) {
                gameInfo.playersInfo[i].currentState = newState;
            }
        }

        this.setState({gameInfo});
    }

    /**
     * Updates gameInfo with information from the server
     * @param res
     */
    updateGameInfo = (res) => {
        console.log(`update game info`, res);
        if(res.success) {

            res.gameInfo.playersInfo = this.mergePlayersInfo(res.gameInfo.playersInfo);
            this.setState({
                gameInfo : res.gameInfo,
                loading : false

            });
        } else {
            this.setState({
                redirect : '/'
            })
        }
    }

    /**
     * Merges player info. The player info comes as {userInfo, playerInfo}. This method squishes the two into one with no loss
     * @param playersInfo
     * @returns {Array}
     */
    mergePlayersInfo = (playersInfo) => {
        let _playersInfo = []
        playersInfo.map((playerInfo) => {
            _playersInfo.push($.extend(false, playerInfo.userInfo, playerInfo.playerInfo));
        });
        return _playersInfo;
    }

    /**
     * Asks the server for gameInfo (thus, refreshes it)
     */
    refreshGameInfo = () => {
        const {user, socket} = this.props;

        let data = {
            userCredentials : user.getCredentials()
        }

        socket.emit(`web | game | get game info`, data, this.updateGameInfo);
    }

    /**
     * Initializes the game with information from the server
     * @param res
     */
    handleInitResponse = (res) => {
        console.log('handle init response', res);
        if(res.success) {
            res.gameInfo.playersInfo = this.mergePlayersInfo(res.gameInfo.playersInfo);
            this.setState({
                gameInfo : res.gameInfo
            });
        } else {
            this.setState({
                redirect : '/'
            })
        }
    }

    /**
     * Asks the server for info about the game to initialize gameInfo
     */
    initGame = () => {
        const {user, socket} = this.props;

        let data = {
            userCredentials: user.getCredentials()
        };

        socket.emit(`web | game | init game`, data, this.handleInitResponse);
    }

    componentDidMount() {
        // init gameInfo
        this.initGame();

        const {socket} = this.props;
        // listens for player movement
        socket.on(`web | game | send movement`, this.handleMovement);
        // listens for accessible tiles
        socket.on(`web | game | send accessible tiles`, this.handleAccessibleTiles);
        // listens for changes in game info
        socket.on(`web | game | refresh game info`, this.refreshGameInfo);

        socket.on(`web | game | start moving`, this.startMoving);

        // listens for visibility changes in browser tab
        $(document).on("visibilitychange", this.handleVisibilityChange);
    }

    /**
     * Stops listening to avoid memory leaks
     */
    componentWillUnmount() {
        const {socket} = this.props;
        socket.off(`web | game | send movement`);
        socket.off(`web | game | refresh game info`);

        $(document).off("visibilitychange");

    }

    /**
     * Returns the playerInfo of the player matching gameInfo.playersInfo[key] = value
     * @param value
     * @param key
     * @returns {null|*}
     */
    getPlayerInfo = (value, key = "userid") => {
        const {gameInfo} = this.state;

        for(let i = 0; i < gameInfo.playersInfo.length; ++i) {
            if(gameInfo.playersInfo[i][key] === value) {
                return gameInfo.playersInfo[i];
            }
        }

        return null;
    }

    /**
     * Emits to the server that the player will move to destination
     * The server will respond with an emit
     */
    moveToPosition = () => {
        const {user, socket} = this.props;
        const {gameInfo} = this.state;

        let clientInfo = this.getPlayerInfo(user.id, 'userid');

        if(gameInfo.activePlayer !== clientInfo.playerid) return;

        let data = {
            userCredentials : user.getCredentials()
        };

        socket.emit(`web | game | move to destination`, data, gameInfo.gameId);
    }

    render () {
        const {user, socket} = this.props;
        const {gameInfo, loading, redirect, accessibleBuildings} = this.state;

        console.log({gameInfo});

        if(redirect) {
            return (
                <Redirect to={redirect} />
            );
        }

        if(loading) {
            return (
              <Loading />
            );
        }

        return (
            <div
                key = {
                    `${gameInfo.gameId}`
                }
                className="game-page-container"
            >

                <Map
                    user = {user}
                    socket = {socket}
                    buildingOrder={gameInfo.buildingOrder}
                    mapInfo = {gameInfo.mapInfo}
                    gameState = {gameInfo.gameState}
                    getPlayerInfo = {this.getPlayerInfo}
                    activePlayer = {gameInfo.activePlayer}
                    players = {gameInfo.playersInfo}
                    updateTileComp = {this.updateTileComp}
                    tilesComps = {this.tilesComps}
                    accessibleBuildings = {accessibleBuildings}
                    getBuildingFromTile = {this.getBuildingFromTile}
                />

                <div className={`game-hud-overlay-container`}>
                    <div className={`hud-top-level`}>
                        <GameAlerts
                            socket = {socket}
                        />
                    </div>

                    <div className={`hud-bottom-level`}>

                        <HudTeams
                            user = {user}
                            players = {gameInfo.playersInfo}
                            getPlayerInfo = {this.getPlayerInfo}
                            activePlayer = {gameInfo.activePlayer}
                            ownedBuildingsCount = {gameInfo.ownedBuildingsCount}
                            teams = {gameInfo.playersByTeams}
                        />

                        <DicePanel
                            user = {user}
                            socket = {socket}
                            getPlayerInfo = {this.getPlayerInfo}
                            gameId = {gameInfo.gameId}
                            activePlayer={gameInfo.activePlayer}
                            movePlayerXTiles = {this.movePlayerXTiles}
                            updateGameState = {this.updateGameState}
                            updatePlayerState = {this.updatePlayerState}
                            accessibleTiles = {this.state.accessibleTiles}
                            moveToPosition = {this.moveToPosition}
                        />

                        <HudPlayerInfo
                            user = {user}
                            players = {gameInfo.playersInfo}
                            getPlayerInfo = {this.getPlayerInfo}
                        />

                    </div>

                </div>

            </div>
        );
    }

}

export default GamePage;

GamePage.propTypes = {
  socket: PropTypes.any.isRequired,
  user: PropTypes.any.isRequired
}