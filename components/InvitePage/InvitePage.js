import PropTypes from 'prop-types'
import React from 'react';

import './invitePage.scss';
import Loading from "../Loading/Loading";
import RoomError from "../RoomPage/RoomError/RoomError";
import {Redirect} from "react-router";
import PageAbstract from "../PageAbstract/PageAbstract";

/**
 * The Invite Page Component
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop roomid {String} - The Room id
 * @prop accessCode {String} - The Access Code of the Invite
 */
class InvitePage extends PageAbstract {

    constructor (props) {
        super(props);

        this.state = {
            redirect : ``, // the link it should redirect to
            errors : [] // array of errors
        };
    }

    /**
     * Handles the server response and redirect to the room if successful
     * @param res
     */
    handleServerResponse = (res) => {
        const {user, roomid} = this.props;
        if(res.success) {
            user.updateRoomid(roomid);
            this.setState({redirect : `/room/${roomid}`}, () => {
               this.setState({redirect : ''});
            });
        } else {
            this.setState({errors : res.errors});
        }
    }

    /**
     * When the component mounts it processes the invite link
     * The server will respond through a callback
     */
    componentDidMount() {
        const {socket, user, roomid, accessCode} = this.props;

        let data = {
            userCredentials : user.getCredentials(),
            roomid,
            accessCode
        };

        socket.emit(`web | process invite link`, data, this.handleServerResponse);
    }

    render () {
        const {errors, redirect} = this.state;

        if(redirect !== '') {
            return (
                <Redirect to={redirect} />
            );
        }

        if(errors.length) {
            return (
                <div className={`room-page-container centered`}>
                    <RoomError errors={errors} />
                </div>
            );
        }

        return (
            <div className="room-page-container">
                <Loading />
            </div>
        );
    }

}

export default InvitePage;

InvitePage.propTypes = {
  accessCode: PropTypes.string.isRequired,
  roomid: PropTypes.string.isRequired,
  socket: PropTypes.any.isRequired,
  user: PropTypes.any.isRequired
}