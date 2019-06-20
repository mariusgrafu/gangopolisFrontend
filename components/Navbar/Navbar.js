import PropTypes from 'prop-types'
import React from 'react';
import {Link, Redirect} from "react-router-dom";

import './navbar.scss';

import PlayItem from './NavbarItems/PlayItem/PlayItem';
import RoomItem from './NavbarItems/RoomItem/RoomItem';
import RoomsItem from './NavbarItems/RoomsItem/RoomsItem';
import PhoneItem from './NavbarItems/PhoneItem/PhoneItem';
import HelpItem from './NavbarItems/HelpItem/HelpItem';
import HomeItem from "./NavbarItems/HomeItem/HomeItem";

/**
 * The Navbar Component that will appear on the left
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop setLoading {function} - Places the website in or out of a loading state
 * @prop setConfirmationModal {function} - Prompts a confirmation modal on the screen
 * @prop currentPage {String|null} - The Current Page the Client is on
 */
class Navbar extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            redirect : `` // link to where the user should be redirected
        }
    }

    /**
     * If the request was successful the player will be redirected to the newly found room
     * @param res
     */
    handlePlayResponse = (res) => {
        console.log('handlePlay res', res);
        if(res.success) {
            const {user} = this.props;
            this.setState({redirect : `/room/${res.roomid}`}, () => {
                this.setState({redirect : ``}, () => {
                    user.updateRoomid(res.roomid);
                })
            })
        } else {
            //TODO: Handle errors
        }
    }

    /**
     * Emits to the server that the player should be inserted into a random room
     * The server responds through callback
    */
    handlePlay = () => {
        const {user, socket} = this.props;

        let data = {
            userCredentials : user.getCredentials()
        }

        socket.emit(`web | insert in random room`, data, this.handlePlayResponse);
    }

    render () {
        const {user, socket, setLoading, setConfirmationModal, currentPage} = this.props;
        const {redirect} = this.state;

        if(redirect) {
            return (
                <Redirect to={redirect} />
            );
        }

        if(!user.isLogged() || !currentPage || currentPage === 'game'){ // if the user is not logged, it will only render an empty fragment
            return (<></>);
        }

        let playItemComp = (<></>);

        if(user.roomid) { // checks if the user is in a room
            let playUrl = `/room/${user.roomid}`; // now it will link to the room the user is known to be in
            let playActive = true; // triggers the active state of the PlayItem Component
            let playName = 'Return to the Room'; // text to let the user know that the path is changed

            playItemComp = (
                <Link to={playUrl}><PlayItem
                    active={playActive}
                    name={playName}
                /></Link>
            );
        } else {
            playItemComp = (
                <PlayItem
                    active = {false}
                    name = {`Play Now`}
                    onClick = {this.handlePlay}
                />
            );
        }

        let navbarItemExtraCssClass = ``;

        if(['room', 'rooms', 'help', 'local'].indexOf(currentPage) !== -1) {
            navbarItemExtraCssClass = ` faded`;
        }

        return (
            <div className="navbar-container no-select">

                <div className={`navbar-items${navbarItemExtraCssClass}`}>
                    <Link to={'/'}>
                        <HomeItem active={(currentPage === 'home')} />
                    </Link>
                    {playItemComp}
                    <RoomItem
                        socket={socket}
                        user={user}
                        setLoading={setLoading}
                        setConfirmationModal={setConfirmationModal}
                        active={(currentPage === 'room')}
                    />
                    <Link to={'/rooms'}>
                        <RoomsItem
                            active={(currentPage === 'rooms')}
                        />
                    </Link>
                    <PhoneItem
                        socket={socket}
                        user={user}
                        setLoading={setLoading}
                        setConfirmationModal={setConfirmationModal}
                        active={(currentPage === 'local')}
                    />
                    {/*<HelpItem*/}
                    {/*    active={(currentPage === 'help')}*/}
                    {/*/>*/}
                </div>

            </div>
        );
    }

}

export default Navbar;

Navbar.propTypes = {
  currentPage: PropTypes.any.isRequired,
  setConfirmationModal: PropTypes.any.isRequired,
  setLoading: PropTypes.any.isRequired,
  socket: PropTypes.any.isRequired,
  user: PropTypes.any.isRequired
}