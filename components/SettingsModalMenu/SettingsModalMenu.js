import React from 'react';
import onClickOutside from "react-onclickoutside";

import './settingsModalMenu.scss';

import SettingModalNameChange from './SettingsModalNameChange/SettingsModalNameChange';

/**
 * The Settings Modal Menu
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop closeModal {Function} - Function triggered when clicking outside of the component, meant to close the modal.
 */
class SettingsModalMenu extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            nameChangeActive : false // if True, the component will render the SettingsModalNameChange Component
        }
    }

    /**
     * Closes the modal when the user clicks outside of the component
     * @param evt
     */
    handleClickOutside = (evt) => {
        try{
            const {closeModal} = this.props;
            closeModal();
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Signs the user out by calling the user.logout() method
     */
    signOut = () => {
        const {user} = this.props;

        user.logout();
        location.reload(); // reloads the page which will take the user back to the login page
    }

    /**
     * toggles the nameChangeActive state
     */
    toggleNameChange = () => {
        let {nameChangeActive} = this.state;
        this.setState({nameChangeActive : !nameChangeActive});
    }

    render () {
        const {nameChangeActive} = this.state;
        const {user, socket, closeModal} = this.props;

        let titleComp = (<></>); // the title component, which is different if nameChangeActive is True
        let menuContComp = (<></>); // the component which will be rendered; different if nameChangeActive si True

        if(nameChangeActive) { // checks if nameChangeActive is True
            titleComp = (
                <>
                <i className="gangicon-arrow-left" onClick={this.toggleNameChange}/>
                <span>Name Change</span>
                </>
            );
            menuContComp = (
                <SettingModalNameChange socket={socket} user={user} closeModal={closeModal}/>
            );
        } else {
            titleComp = (
                <span>Menu</span>
            );
            menuContComp = (
                <>
                <div className="smm-btn" onClick={this.toggleNameChange}>
                    <i className="gangicon-edit" />
                    <span>Change Name</span>
                </div>

                <div className="smm-btn red" onClick={this.signOut}>
                    <i className="gangicon-exit" />
                    <span>Sign out</span>
                </div>
                </>
            );
        }

        return (
            <div className="settings-modal-menu-container">
                <div className="smm-top-title">
                    <span className="smmt-title">{titleComp}</span>
                </div>

                {menuContComp}
            </div>
        );
    }

}

export default onClickOutside(SettingsModalMenu);