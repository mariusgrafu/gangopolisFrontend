import PropTypes from 'prop-types'
import React, {Component} from 'react';

import Chance from 'chance';

import './dicePanel.scss';
import $ from "jquery";
import PlayerState from "../../../shared/PlayerState";

/**
 * The DicePanel Component
 * From here the player will be able to roll dice, move to destination and end their turn
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop getPlayerInfo {Function(value, key)} - Returns the playerInfo of the player matching gameInfo.playersInfo[key] = value
 * @prop gameId {String} - the id of the parent Game
 */
class DicePanel extends Component {

    constructor(props) {
        super(props);

        this.rollInterval = {
            isOn : false, // whether the interval is on or not
            interval : null // the interval will be stored here
        }

        this.state = {
            maxDiceValue : 6, // the maximum value a die can roll
            leftDieValues : [ // an array of values the left die has; it should also have an unique key
                {
                    val : 0,
                    key : -1
                }
            ],
            rightDieValues : [ // an array of values the right die has; it should also have an unique key
                {
                    val : 0,
                    key : -1
                }
            ],
            leftDie : 0, // the value the left die has
            rightDie : 0, // the value the right die has
            isRolling : false // whether the dice are rolling or not (settings this true will trigger the rolling state)
        };
    }

    /**
     * extracts the die value from a given valuesArr
     * @param valuesArr {Array} - an array of dice values, like the ones from this.state
     * @returns {Array} - Array of react components
     */
    getDieValuesProps = (valuesArr) => {
        let dieValuesProps = [];
        if(!valuesArr.length) return dieValuesProps;

        valuesArr.map( (value, i) => {
           dieValuesProps.push(
               <div
                   key={value.key}
                   className={`die-value`}
               >{value.val}</div>
           );
        });

        return dieValuesProps;
    }

    /**
     * Adds a new die value to the array of the given side (left or right)
     * The die array holds up to 3 values in the array
     * If the added value is last, the other values will be removed!
     * @param side {String}
     * @param value {Object}
     * @param isLast {Boolean}
     */
    pushDieValue = (side, value, isLast = false) => {
        let dieValues = [];
        if(side === 'left') {
            dieValues = this.state.leftDieValues;
        } else {
            dieValues = this.state.rightDieValues;
        }

        if(!isLast) {
            dieValues = [value, ...dieValues];

            if(dieValues.length > 3) {
                dieValues.splice(3);
            }
        } else {
            dieValues = [value];
        }

        if(side === 'left') {
            this.setState({leftDieValues : dieValues});
        } else {
            this.setState({rightDieValues : dieValues});
        }
    }

    /**
     * Logs the response from the server after the dice roll call
     * @param res
     */
    handleRollDiceServerResponse = (res) => {
        console.log(`handleRollDiceServerResponse`, res);
        //TODO: Handle Errors
    }

    /**
     * Calls the server for a dice roll
     * The server will respond through an emit
     */
    rollDice = () => {
        const {user, socket} = this.props;
        const {isRolling} = this.state;

        if(isRolling) return; // checks if the game is already in a rolling state

        let data = {
            userCredentials : user.getCredentials()
        };

        socket.emit(`web | game | get next dice throw`, data, this.handleRollDiceServerResponse);
    }

    /**
     * As the component mounts it listens for dice rolls and visibility change
     */
    componentDidMount() {
        const {user, gameId, socket} = this.props;

        socket.on(`web | game | get roll dice pairs`, this.animateDice);

        $(document).on("visibilitychange", this.handleVisibilityChange);
    }

    /**
     * When browser visibility changes to hidden, it will skip any on-going animations and call the functions
     * that should be called when the animation is over
     */
    handleVisibilityChange = () => {
        const {socket, user} = this.props;

        if(document.visibilityState === 'hidden') {
            if(this.rollInterval.isOn) {
                clearInterval(this.rollInterval.interval);
                this.rollInterval.isOn = false;


                const {leftDie, rightDie} = this.state;

                let leftDieValues = [
                    {
                        val : leftDie,
                        key : -1
                    }
                ];
                let rightDieValues = [
                    {
                        val : rightDie,
                        key : -1
                    }
                ];

                this.setState({leftDieValues, rightDieValues, isRolling : false});

                socket.emit(`web | game | dice roll done`, {
                    userCredentials: user.getCredentials()
                }, () => {});

            }
        }
    }

    /**
     * Animates the dice to be rolling
     * It receives from the server an array of values so it will sync with other players
     * It will append different values until the end is reached
     * The last values will be added multiple times to avoid a "visual jump"
     * @param res
     */
    animateDice = (res) => {
        console.log(`received dice pairs`, res);
        const {user, socket, updatePlayerState, activePlayer} = this.props;
        let dicePairs = res.pairs;

        this.setState({
            leftDie : dicePairs[dicePairs.length - 1].left,
            rightDie : dicePairs[dicePairs.length - 1].right
        });

        let pairsCount = dicePairs.length;

        this.setState({isRolling : true});

        updatePlayerState(activePlayer, 'rolling');

        clearInterval(this.rollInterval.interval);
        this.rollInterval.isOn = true;

        if(document.visibilityState === 'hidden') {
            this.handleVisibilityChange();
            return;
        }

        this.rollInterval.interval  = setInterval( () => {
            let pairIndex = dicePairs.length - Math.max(1, pairsCount);
            let otherLeftValue = dicePairs[pairIndex].left;
            let otherRightValue = dicePairs[pairIndex].right;
            pairsCount--;
            if(pairsCount === 1) {
                this.pushDieValue('left', {val : otherLeftValue, key : pairsCount});
                this.pushDieValue(`right`, {val : otherRightValue, key : pairsCount});
            } else if (pairsCount === 0 || pairsCount === -1) {
                this.pushDieValue('left', {val: otherLeftValue, key : pairsCount});
                this.pushDieValue(`right`, {val: otherRightValue, key : pairsCount});
            } else if (pairsCount === -2) {
                this.pushDieValue('left', {val: otherLeftValue, key : pairsCount}, true);
                this.pushDieValue(`right`, {val: otherRightValue, key : pairsCount}, true);

                this.setState({isRolling : false});

                socket.emit(`web | game | dice roll done`, {
                    userCredentials: user.getCredentials()
                }, () => {});

                this.rollInterval.isOn = false;
                clearInterval(this.rollInterval.interval);
            } else {
                this.pushDieValue('left', {val: otherLeftValue, key : pairsCount});
                this.pushDieValue(`right`, {val: otherRightValue, key : pairsCount});
            }
        }, 200);
    }

    /**
     * Checks if the client is allowed to roll the dice
     * Future checks on the matter should be made here
     * @returns {boolean}
     */
    canRoll = () => {
        const {user, getPlayerInfo, activePlayer} = this.props;
        const {isRolling} = this.state;

        if(isRolling) return false;

        let clientInfo = getPlayerInfo(user.id, 'userid');

        return (clientInfo.currentState === 'throwing' && clientInfo.playerid === activePlayer);
    }

    /**
     * It builds the React Component (a button) to be shown when the player is able to move to destination
     * It also checks if the button should render. If not, it will simply return a React Fragment
     * @returns {*}
     */
    getMoveToPositionBtn = () => {
        const {accessibleTiles, activePlayer, getPlayerInfo, user, moveToPosition} = this.props;

        let clientInfo = getPlayerInfo(user.id, 'userid');

        if(!accessibleTiles || !accessibleTiles.length || activePlayer !== clientInfo.playerid) {
            return (<></>);
        }

        return (
            <div
                className={`move-to-destination-btn`}
                onClick={moveToPosition}
            >
                Move to Destination
            </div>
        );
    }

    /**
     * Emits to the server that the player ended their turn
     * The server will respond with an emit
     */
    endTurn = () => {
        const {user, socket} = this.props;

        let data = {
            userCredentials : user.getCredentials()
        }

        socket.emit(`web | game | end turn`, data);
    }

    /**
     * It builds the End Turn Button Component
     * It also checks if the button should render. If not, it will simply return a React Fragment
     * @returns {*}
     */
    getEndTurnBtn = () => {
        const {getPlayerInfo, user} = this.props;

        let clientInfo = getPlayerInfo(user.id, 'userid');

        if(clientInfo.currentState !== PlayerState.Enum.LastStep) {
            return (<></>);
        }

        return (
            <div
                className={`end-turn-btn`}
                onClick={this.endTurn}
            >
                End Turn
            </div>
        );
    }

    render() {
        let {rightDieValues, leftDieValues} = this.state;

        let leftDieValuesProps = this.getDieValuesProps(leftDieValues);
        let rightDieValuesProps = this.getDieValuesProps(rightDieValues);

        let rollingCssClass = ``;

        if(!this.canRoll()) rollingCssClass = ' disabled';

        let moveToPositionBtn = this.getMoveToPositionBtn();
        let endTurnBtn = this.getEndTurnBtn();

        return (
            <div className={`dice-panel-container no-select${rollingCssClass}`}>
                {endTurnBtn}
                {moveToPositionBtn}

                <div className={`dice-wrap`}>
                    <div className={`die-container`}>
                        {leftDieValuesProps}
                    </div>
                    <div className={`die-container`}>
                        {rightDieValuesProps}
                    </div>
                </div>

                <div
                    className={`dice-btn`}
                    onClick = {this.rollDice}
                />
            </div>
        );

    }

}

export default DicePanel;

DicePanel.propTypes = {
  accessibleTiles: PropTypes.any.isRequired,
  activePlayer: PropTypes.any.isRequired,
  gameId: PropTypes.any.isRequired,
  getPlayerInfo: PropTypes.any.isRequired,
  moveToPosition: PropTypes.any.isRequired,
  socket: PropTypes.any.isRequired,
  updatePlayerState: PropTypes.any.isRequired,
  user: PropTypes.any.isRequired
}