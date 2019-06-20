import React from 'react';
import PropTypes from 'prop-types';

import './otherPlayer.scss';
import User from "../../../../clientClasses/User";
import UserCard from "../../UserCard/UserCard";

/**
 * Other Player Component used in Userbar to show a player in the sidebar
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop player {Object} - The Player to be shown
 * @prop updatePlayer {Function} - Updates the player in the parent array
 */
class OtherPlayer extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            showUserCard : false, // if True, a UserCard Component will be rendered
            userCardTimeout : null // the timeout for the usercard to disappear
        }
    }

    static propTypes = {
        socket : PropTypes.object.isRequired,
        user : PropTypes.object.isRequired,
        player : PropTypes.object.isRequired,
        updatePlayer : PropTypes.func.isRequired
    }

    /**
     * Clears the timeout when the mouse moves over this component
     */
    handleMouseOver = () => {
        let {userCardTimeout} = this.state;
        clearTimeout(userCardTimeout);
        this.setState({showUserCard : true, userCardTimeout});
    }

    /**
     * Sets the timeout to make the usercard disappear after 120ms
     */
    handleMouseOut = () => {
        let {userCardTimeout} = this.state;
        clearTimeout(userCardTimeout);
        userCardTimeout = setTimeout(() => {
            this.setState({showUserCard : false});
        }, 120);
        this.setState({userCardTimeout});
    }

    closeCard = () => {
        let {userCardTimeout} = this.state;
        clearTimeout(userCardTimeout);
        this.setState({userCardTimeout, showUserCard : false});
    }

    refreshResponse = (res) => {
        if(res.success) {
            const {updatePlayer} = this.props;
            updatePlayer(res.userInfo);
        }
    }

    refreshPlayer = () => {
        const {socket, player} = this.props;

        let data = {
            userid : player.userid
        }

        socket.emit(`web | get public user info`, data, this.refreshResponse);
    }

    componentDidMount() {
        const {socket, player} = this.props;

        socket.on(`web | refresh user ${player.userid}`, this.refreshPlayer);
    }

    componentWillUnmount() {
        const {socket, player} = this.props;

        socket.off(`web | refresh user ${player.userid}`);
    }

    render () {
        const {user, socket, player} = this.props;
        const {showUserCard} = this.state;

        // the UserCard Component will be rendered here
        let userCardComp = (<></>);

        if(showUserCard) {
            userCardComp = (
                <UserCard
                    socket={socket}
                    user={user}
                    player={player}
                    close={this.closeCard}
                />
            );
        }

        return (
            <div
                className="otherplayer-avatar"
                style={{backgroundImage : `url(${User.getAvatar(player.avatarId)})`}}
                onMouseOver={this.handleMouseOver}
                onMouseOut={this.handleMouseOut}
            >
                {userCardComp}
            </div>
        );
    }

}

export default OtherPlayer;