import React from 'react';

import './roomItem.scss';

import Door from '../Door/Door';
import {Redirect} from "react-router";

/**
 * The Room Button from the navbar
 * @prop active {Boolean} - triggers it's active state | False by default
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop setLoading {function} - Places the website in or out of a loading state
 * @prop setConfirmationModal {function} - Prompts a confirmation modal on the screen
 */
class RoomItem extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            redirect : null // path to where the component should redirect. null if it should not redirect.
        }
    }

    /**
     * Handles the response from the server upon requesting a room to be created
     * @param res
     */
    createRoomResponse = (res) => {
        const {setLoading, user} = this.props;
        if(res.success) { // if it was successful it will update the user's roomid and redirect them to that room
            user.updateRoomid(res.roomid);
            this.setState(
                {redirect : `/room/${res.roomid}`},
                () => this.setState({redirect : null}) // it's important the redirect to be changed back to null immediately otherwise it will redirect too many times
            );
        } else {
            //TODO: show the errors on screen
            console.log(res.errors);
        }
        setLoading(false); // stops the loading state of the website
    }

    /**
     * Tells the server to create a room
     */
    createRoom = () => {
        const {socket, user, setLoading} = this.props;

        setLoading(true); // it will put the website in a loading state, while the room is created

        // tells the server to create a room
        socket.emit(`web | create room`, {userCredentials : user.getCredentials(), type : 'web'}, this.createRoomResponse);
    }

    /**
     * Checks if the user is already in a room and prompts a ConfirmationModal if true; otherwise it will call the createRoom() function directly
     */
    attemptToCreateRoom = () => {
        const {user, setConfirmationModal} = this.props;

        if(user.roomid) { // if the user is already in a room, it will prompt a ConfirmationModal to inform the user that they would leave the current room
            setConfirmationModal(
                {
                    message : `You are already in a room! Creating a new room will take you out of your current room! Are you sure you want to proceed?`,
                    acceptAction : this.createRoom
                }
            );
            return;
        }

        // if the user isn't in a room, it will simply call createRoom()
        this.createRoom();
    }

    render () {
        let active = this.props.active || false;
        const {redirect} = this.state;

        if(redirect !== null) { // if there is a redirect path, it will redirect there with the Redirect Component
            return (<Redirect to={redirect} />);
        }

        let activeCssClass = '';

        if(active) activeCssClass = ` active`;

        return (
            <>
            <div
                className={`navbar-item room-item-container${activeCssClass}`}
                onClick={this.attemptToCreateRoom}
            >
                 <div className="navbar-item-icon">
                    <Door />
                 </div>
                 <div className="navbar-item-name">Create a Room</div>
            </div>
            </>
        );
    }

}

export default RoomItem;