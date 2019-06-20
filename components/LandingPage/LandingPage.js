import PropTypes from 'prop-types'
import React from 'react';
import './landingPage.scss';

import Navbar from '../Navbar/Navbar.js';
import Userbar from '../Userbar/Userbar.js';
import Loading from "../Loading/Loading";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";

import $ from 'jquery';

/**
 * The LandingPage Component that will contain the sidebars
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 */
class LandingPage extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            loading : false, // if set True, it will render the Loading Component over the website
            confirmationModalComp : (<></>) // the ConfirmationModal Component that will be rendered.
        }
            
    }

    /**
     * Put the website in or out of a loading state
     * @param isLoading {boolean}
     */
    setLoading = (isLoading) => {
        this.setState({loading : isLoading});
    }

    /**
     * Closes the ConfirmationModal Component
     */
    closeConfirmationModal = () => {
        this.setState({
            confirmationModalComp : (<></>)
        });
    }

    /**
     * Prompts a confirmation modal on the screen
     * @param message {String} - Message to be displayed
     * @param acceptAction {Function} - Function to be called when the user "accepts" the message.
     * @param cancelAction {Function} - Function to be called when the user "cancels" the message. It should close the modal!
     * @param customAcceptName {String} - (Optional) Custom Name for the "Accept" button ("Accept" by default)
     * @param customCancelName {String} - (Optional) Custom Name for the "Cancel" button ("Cancel" by default)
     */
    setConfirmationModal = ({message, acceptAction, cancelAction, customAcceptName, customCancelName}) => {
        const {socket, user} = this.props;
        cancelAction = cancelAction || (() => {});
        let confirmationModalComp = (
            <ConfirmationModal
                socket={socket}
                user={user}
                message={message}
                acceptAction={acceptAction}
                cancelAction={cancelAction}
                closeModal={this.closeConfirmationModal}
                customAcceptName={customAcceptName}
                customCancelName={customCancelName}
            />
        );

        this.setState({confirmationModalComp});
    }

    componentDidMount() {
        const {user, socket} = this.props;
        socket.on(`web | refresh user ${user.id}`, user.refreshUser);
    }

    componentWillUnmount() {
        const {user, socket} = this.props;
        socket.off(`web | refresh user ${user.id}`);
    }

    render () {
        const {socket, user, currentPage} = this.props;
        const {loading, confirmationModalComp} = this.state;

        console.log({currentPage});

        let mainPageLoadingClass = ``; // special class to be added to '.main-page' if the site is in a loading state
        let loadingComp = (<></>); // the Loading Component; empty by default

        if (loading) { // checks if the site is in a loading state
            mainPageLoadingClass = ` is-loading`; // sets a special class to '.main-page'
            loadingComp = (
                <Loading overlayColor={true}/>
            ); // adds a Loading Component
        }

        let mainPageExtraCssClasses = ``;

        switch(currentPage) {
            case 'local':
            case 'room':
                mainPageExtraCssClasses += ` expanded`;
                break;
            case 'game':
                mainPageExtraCssClasses += ` full-width`;
                break;
            default :
                mainPageExtraCssClasses = ``;
                break;
        }

        return (
            <>
                {loadingComp}
                {confirmationModalComp}
                <Navbar
                    socket={socket}
                    user={user}
                    setLoading={this.setLoading}
                    setConfirmationModal = {this.setConfirmationModal}
                    currentPage = {currentPage}
                />
                <div
                    className={`main-page${mainPageLoadingClass}${mainPageExtraCssClasses}`}
                >
                    {this.props.children}
                </div>
                <Userbar
                    socket={socket}
                    user={user}
                    currentPage = {currentPage}
                />
            </>
        );
    }

}

export default LandingPage;

LandingPage.propTypes = {
  children: PropTypes.any.isRequired,
  currentPage: PropTypes.any.isRequired,
  socket: PropTypes.any.isRequired,
  user: PropTypes.any.isRequired
}