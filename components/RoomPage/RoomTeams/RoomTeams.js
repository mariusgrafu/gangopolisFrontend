import React from 'react';
import {Link} from "react-router-dom";

import './roomTeams.scss';
import User from "../../../clientClasses/User";


/**
 * The Room Teams Component
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop teams {Object} - Object representing the teams and their members
 * @prop users {Array} - Array with the users in the room
 * @prop roomType {String} - the type of the room ('web' or 'local')
 */
class RoomTeams extends React.Component {

    constructor (props) {
        super(props);

        this.state = {};
    }

    /**
     * Handles response from the server upon requesting to either join or leave a team
     * @param res
     */
    handleServerResponse = (res) => {
        //TODO: Handle Errors
        console.log(res);
    }

    /**
     * Sends a request to the server to join a team
     * @param team {String} - name of the team (police, mafia1, mafia2, gang1, gang2)
     */
    joinTeam = (team) => {
        const {socket, user, roomType} = this.props;

        if(roomType !== 'web') {
            return;
        }

        let data = {
            userCredentials : user.getCredentials(),
            team
        };

        socket.emit(`web | join team`, data, this.handleServerResponse);
    }


    /**
     * Sends a request to the server to leave a team
     * @param team {String} - name of the team (police, mafia1, mafia2, gang1, gang2)
     */
    leaveTeam = (team) => {
        const {socket, user, roomType} = this.props;

        if(roomType !== 'web') {
            return;
        }

        let data = {
            userCredentials : user.getCredentials(),
            team
        };

        socket.emit(`web | leave team`, data, this.handleServerResponse);
    }

    /**
     * Gets information about a user from the users array
     * @param userid {String}
     * @returns {null|Object}
     */
    getUserInfo = (userid) => {
        const {users} = this.props;

        for(let user of users) {
            if(user.userid === userid) return user;
        }

        return null;
    }

    /**
     * Generates the teams components
     * @returns {{mafia1: *, police: *, gang2: *, gang1: *, mafia2: *}}
     */
    getTeamsComps = () => {
        const {user, teams, roomType} = this.props;

        let teamsComps = {
            police : (<></>),
            mafia1 : (<></>),
            mafia2 : (<></>),
            gang1 : (<></>),
            gang2 : (<></>)
        };

        // map with the full names of the teams
        let teamNames = {
            police : 'Police Force',
            mafia1 : 'Mobsters',
            mafia2 : 'Mobsters',
            gang1 : 'Gangsters',
            gang2 : 'Gangsters'
        }

        for(let teamName of ['police', 'mafia1', 'mafia2', 'gang1', 'gang2']) {
            if (!teams[teamName]) { // if the team has no member
                let joinMessageComp = (<></>);

                if(roomType === 'web') {
                    joinMessageComp = (
                        <div className={"room-team-prompt"}>
                            Join the {teamNames[teamName]}!
                        </div>
                    );
                } else {
                    joinMessageComp = (
                        <div className={"room-team-prompt"}>
                            The {teamNames[teamName]}
                        </div>
                    );
                }

                teamsComps[teamName] = (
                    <div
                        className="room-team"
                        onClick={() => this.joinTeam(teamName)}
                    >
                        {joinMessageComp}
                    </div>
                );
            } else {
                let promptComp = (<></>);
                let onClickAction = () => {}; // on click action, default is an empty function

                let userInfo = this.getUserInfo(teams[teamName]); // get userinfo about the member

                let roomTeamInfo = (<></>);

                if(userInfo !== null) {
                    // the information shown is slightly different if the member is the current user
                    roomTeamInfo = (
                        <div className={"room-team-info"}>
                            <div className={"room-team-username"}>
                                {userInfo.username}
                            </div>
                            <div className={"room-team-userid"}>
                                #{userInfo.userid}
                            </div>
                        </div>
                    );
                }

                if(teams[teamName] === user.id && roomType === 'web') {
                    promptComp = (
                        <div className={"room-team-prompt"}>
                            Leave the {teamNames[teamName]}!
                        </div>
                        );
                    onClickAction = () => this.leaveTeam(teamName);
                    roomTeamInfo = (
                        <div className={"room-team-info"}>
                            <div className={"room-team-username"}>
                                You
                            </div>
                        </div>
                    );
                }

                let userComp = (
                    <div className={"room-team-member"}>
                    <div
                        className={"room-team-avatar"}
                        style={{backgroundImage : `url(${User.getAvatar(userInfo.avatarId)})`}}
                    />
                        {roomTeamInfo}
                    </div>
                );

                teamsComps[teamName] = (
                    <div
                        className="room-team"
                        onClick={onClickAction}
                    >
                        {userComp}
                        {promptComp}
                    </div>
                );
            }
        }

        return teamsComps;
    }

    render () {
        let teamsComps = this.getTeamsComps(); // get the teams components

        return (
            <div className="room-page-column">
                <div className="rpc-header">
                    <div className="rpc-title">Teams</div>
                    <div className="rpc-description">
                        Pick a team or let the game decide one for you
                    </div>
                </div>

                <div className="room-teams-container no-select">
                    <div className="room-teams-row police">
                        {teamsComps.police}
                    </div>

                    <div className="room-teams-row mob">
                        {teamsComps.mafia1}
                        {teamsComps.mafia2}
                    </div>

                    <div className="room-teams-row gang">

                        {teamsComps.gang1}
                        {teamsComps.gang2}
                    </div>
                </div>
            </div>
        );
    }

}

export default RoomTeams;