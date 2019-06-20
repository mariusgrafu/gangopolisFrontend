import PropTypes from 'prop-types'
import React, {Component} from 'react';

import './hudTeams.scss';
import User from "../../../clientClasses/User";
import PlayerState from "../../../shared/PlayerState";

/**
 * The HudTeams Component
 */
class HudTeams extends Component {

    constructor(props) {
        super(props);

        this.state = {};
    }

    /**
     * Returns the team full name given a teamId (i.e: 'mafia' -> 'The Mobsters')
     * @param teamId {String}
     * @returns {String}
     */
    getTeamName = (teamId) => {
        let teamNames = {
            mafia : `The Mobsters`,
            gang : `The Gangsters`,
            police : `The Police Force`
        };

        return teamNames[teamId];
    }

    /**
     * It returns the active player's current state in a readable format as a react component
     * @param stateId
     * @returns {*}
     */
    getStateComp = (stateId) => {

        let stateName = '';

        switch(stateId) {
            case PlayerState.Enum.Throwing:
                stateName = 'Throwing dice';
                break;
            case PlayerState.Enum.MovementBuildingActions:
                stateName = `Interacting with buildings`;
                break;
            case PlayerState.Enum.Moving:
                stateName = `Moving`;
                break;
            case PlayerState.Enum.LastStep :
                stateName = `Last Step`;
                break;
            case 'rolling':
                stateName = `Rolling Dice`;
                break;
        }

        if(stateName) {
            return (
                <div className={`team-member-state`}>
                    {stateName}
                </div>
            );
        }

        return (<></>);

    }

    /**
     * Returns the owned percentage of a team given as teamId as a React Component
     * @param teamId
     * @returns {*}
     */
    getOwnedPercentageComp = (teamId) => {
        const {ownedBuildingsCount} = this.props;
        if(teamId === 'police') {
            return (<></>);
        }

        let percentage = ownedBuildingsCount[teamId]/ownedBuildingsCount.total;

        return (
            <div
                className={`team-owned-percentage-container`}
                tooltip="Owned Percentage"
            >
                <span>{percentage.toFixed(2).toLocaleString()}</span>
                <span>%</span>
            </div>
        );
    }

    /**
     * Returns the React Component for each team along with information about the current player, their avatars, their names
     *
     * @returns {Array}
     */
    getTeamsComps = () => {
        let {user, getPlayerInfo, teams, activePlayer, ownedBuildingsCount} = this.props;

        let teamsComps = [];

        let teamsOrder = ['police', 'gang', 'mafia'];

        for(let teamId of teamsOrder) {

            let teamOwnedPercentage = this.getOwnedPercentageComp(teamId);

            let teamMembers = teams[teamId].map((playerId) => {
                let player = getPlayerInfo(playerId, 'playerid');
                let clientArrow = (<></>);

                if(player.userid === user.id) {
                    clientArrow = (
                        <i className={`gangicon-player-arrow client-arrow`} />
                    );
                }

                let activePlayerCssClass = ``;

                if(player.playerid === activePlayer) {
                    activePlayerCssClass = ` is-active`;
                }
                return (
                    <div
                        key = {playerId}
                        className={`team-member`}
                    >
                        <i
                            className={`gangicon-${teamId}-cap team-cap`}
                            tooltip={this.getTeamName(teamId)}
                        />
                        <div
                            className={`team-member-avatar-container${activePlayerCssClass}`}
                            tooltip={player.username}
                        >
                            <div
                                className={`team-member-avatar`}
                                style={{backgroundImage : `url(${User.getAvatar(player.avatarId)})`}}
                            />
                            {clientArrow}
                            {this.getStateComp(player.currentState)}
                        </div>
                    </div>
                );
            });

            teamsComps.push(
                <div
                    key = {teamId}
                    className={`hud-team ${teamId}`}>
                    <div className={`team-members`}>
                        {teamOwnedPercentage}
                        {teamMembers}
                    </div>
                </div>
            );
        }

        return teamsComps;
    }

    render() {

        let teamsComps = this.getTeamsComps();

        return (
            <div className={`hud-teams-container no-select`}>
                {teamsComps}
            </div>
        );

    }

}

export default HudTeams;

HudTeams.propTypes = {
  activePlayer: PropTypes.string.isRequired,
  getPlayerInfo: PropTypes.func.isRequired,
  ownedBuildingsCount: PropTypes.any.isRequired,
  teams: PropTypes.any.isRequired,
  user: PropTypes.any.isRequired
}