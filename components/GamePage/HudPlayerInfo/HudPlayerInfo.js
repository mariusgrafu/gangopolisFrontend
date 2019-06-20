import PropTypes from 'prop-types'
import React, {Component} from 'react';

import './hudPlayerInfo.scss';
import User from "../../../clientClasses/User";

/**
 * The HudPlayerInfo Component
 * It displays the client's username, avatar and in-game money
 * @prop user {User} - an User Object with client info
 * @prop getPlayerInfo {Function} - Function retrieving Player Info
 */
class HudPlayerInfo extends Component {

    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        const {user, getPlayerInfo} = this.props;

        const clientInfo = getPlayerInfo(user.id, 'userid');

        return (
            <div className={`hud-player-info-container no-select`}>
                <div className={`hud-player-info`}>
                    <div className={`hud-player-stats`}>
                        <div className={`player-username`}>
                            {clientInfo.username}
                        </div>
                        <div className={`player-money`}>
                            <i className={`gangicon-money`} />
                            <span>{clientInfo.money.toLocaleString()}</span>
                        </div>
                    </div>
                    <div
                        className={`hud-player-avatar`}
                        style={{backgroundImage : `url(${User.getAvatar(clientInfo.avatarId)})`}}
                    />
                </div>
            </div>
        );

    }

}

export default HudPlayerInfo;

HudPlayerInfo.propTypes = {
  getPlayerInfo: PropTypes.func.isRequired,
  user: PropTypes.any.isRequired
}