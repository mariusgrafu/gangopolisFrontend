import PropTypes from 'prop-types'
import React, {Component} from 'react';

import './gameAlerts.scss';
import GameAlert from "./GameAlert/GameAlert";

/**
 * The GameAlerts Component
 * @prop socket {WebSocket} - the socket belonging to the user
 */
class GameAlerts extends Component {

    constructor(props) {
        super(props);

        this.alertsContainer = null;

        this.state = {
            gameAlerts : [] // array of strings
        };
    }

    /**
     * Adds a new game alert to the gameAlerts array
     * @param newGameAlert {String}
     */
    addNewGameAlert = (newGameAlert) => {
        let {gameAlerts} = this.state;
        gameAlerts.push(newGameAlert);

        this.setState({gameAlerts}, () => {
            this.alertsContainer.scrollTop =  this.alertsContainer.scrollHeight;
        });
    }

    /**
     * Removes the alert from gameAlertIndex from the game alerts array
     * @param gameAlertIndex {Integer}
     */
    removeGameAlert = (gameAlertIndex) => {
        let {gameAlerts} = this.state;

        if (gameAlertIndex < 0 || gameAlertIndex >= gameAlerts.length) return;

        gameAlerts.splice(gameAlertIndex, 1);

        this.setState({gameAlerts});
    }

    /**
     * Empties the gameAlerts array
     */
    removeAllGameAlerts = () => {
        let {gameAlerts} = this.state;

        gameAlerts.length = 0;

        this.setState({gameAlerts});
    }

    /**
     * When the component mounts it will listen for new alert for the current game
     */
    componentDidMount() {
        const {socket} = this.props;

        // listens for new alerts
        socket.on(`web | game | new game alert`, this.addNewGameAlert);
    }

    /**
     * When it will unmount it will stop listening
     */
    componentWillUnmount() {
        const {socket} = this.props;
        socket.off(`web | game | new game alert`);
    }

    /**
     * Generates an array of GameAlert Components from the gameAlerts array of the state
     * @see GameAlert
     * @returns {*}
     */
    getGameAlertsComps = () => {
        const {gameAlerts} = this.state;

        return gameAlerts.map((gameAlert, i) => {
            return (
                <GameAlert
                    key = {`${i}-${Date.now()}`}
                    alert = {gameAlert}
                    closeAlert = {() => this.removeGameAlert(i)}
                />
            );
        });
    }

    render() {
        const {gameAlerts} = this.state;

        // if there are no alerts, the component will not render
        if(!gameAlerts.length) {
            return (<></>);
        }

        let gameAlertsComps = this.getGameAlertsComps();

        return (
            <div className={`game-alerts-container no-select`}>

                <div className={`game-alerts-top`}>
                    <i className={`gangicon-alerts game-alerts-icon`} />
                    <div
                        className={`game-alerts-clear`}
                        onClick = {this.removeAllGameAlerts}
                    >
                        Clear All
                    </div>
                </div>

                <div className={`game-alerts`} ref = {c =>  this.alertsContainer = c}>
                    {gameAlertsComps}
                </div>
                
            </div>
        );

    }

}

export default GameAlerts;

GameAlerts.propTypes = {
  socket: PropTypes.any.isRequired
}