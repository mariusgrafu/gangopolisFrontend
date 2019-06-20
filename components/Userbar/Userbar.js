import React from 'react';
import {Link} from "react-router-dom";

import './userbar.scss';

import OtherPlayers from './OtherPlayers/OtherPlayers';
import SettingsModalMenu from '../SettingsModalMenu/SettingsModalMenu';
import User from "../../clientClasses/User";
import UserPanel from "./UserSection/UserPanel/UserPanel";
import InvitesPanel from "./UserSection/UserPanel/InvitesPanel/InvitesPanel";
import UserSection from "./UserSection/UserSection";

/**
 * The Userbar Component that will appear on the right
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop currentPage {String|null} - The Current Page the Client is on
 */
class Userbar extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            showSettingsModalMenu : false // if True, it will render the SettingsModalMenu Component
        }
    }

    /**
     * Toggles the showSettingsModalMenu state
     */
    toggleSettingsModalMenu = () => {
        let {showSettingsModalMenu} = this.state;
        this.setState({showSettingsModalMenu : !showSettingsModalMenu});
    }

    render () {
        const {socket, user, currentPage} = this.props;
        const {showSettingsModalMenu} = this.state;
        
        if(!user.isLogged() || !currentPage || currentPage === 'game'){ // if the user is not logged, it will render an empty fragment
            return (<></>);
        }

        let userSettingsCls = ``;

        // if showSettingsModalMenu is True, the SettingsModalMenu Component will render here
        let settingsModalMenuComp = (<></>);

        if(showSettingsModalMenu) {
            settingsModalMenuComp = (
                <SettingsModalMenu socket={socket} user={user} closeModal={this.toggleSettingsModalMenu} />
            );
            userSettingsCls = ` active`;
        }

        return (
            <div className="userbar-container no-select">

                <UserSection key={`${user.id}-${user.roomid}`} socket={socket} user={user} />

                <OtherPlayers socket={socket} user={user} />

                <div
                    className={`user-settings${userSettingsCls}`}
                    onClick={this.toggleSettingsModalMenu}
                    tooltip="Settings"
                >

                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 174 183.2'>
                        <path className='gear-inside' d='M168.5,62.3c-3.5-9.9-8.8-18.9-15.4-26.7h-33.8L102.4,6.4C97.4,5.5,92.3,5,87,5c-5.3,0-10.4,0.5-15.4,1.4 L54.7,35.6H20.9C14.3,43.5,9,52.5,5.5,62.3l16.9,29.3L5.5,120.9c3.5,9.9,8.8,18.9,15.5,26.7h33.8l16.9,29.3 c5,0.9,10.2,1.4,15.4,1.4c5.3,0,10.4-0.5,15.4-1.4l16.9-29.3h33.8c6.6-7.8,11.9-16.9,15.5-26.7l-16.9-29.3L168.5,62.3z M87,128.6 c-20.4,0-37-16.6-37-37s16.6-37,37-37s37,16.6,37,37S107.5,128.6,87,128.6z'
                        />
                        <path className='gear-outline' d='M87,183.2c-5.5,0-11-0.5-16.3-1.4l-2.3-0.4l-16.6-28.8H18.6l-1.5-1.8c-7.1-8.4-12.7-17.9-16.4-28.3L0,120.4 l16.6-28.8L0,62.8l0.8-2.2C4.5,50.3,10,40.8,17.1,32.4l1.5-1.8h33.2L68.4,1.8l2.3-0.4c10.7-1.9,21.9-1.9,32.6,0l2.3,0.4l16.6,28.8 h33.2l1.5,1.8c7.1,8.4,12.6,17.9,16.3,28.3l0.8,2.2l-16.6,28.8l16.6,28.8l-0.8,2.2c-3.7,10.3-9.2,19.9-16.3,28.3l-1.5,1.8h-33.2 l-16.6,28.8l-2.3,0.4C98,182.7,92.5,183.2,87,183.2z M74.7,172.3c8.1,1.2,16.5,1.2,24.5,0l17.2-29.7h34.3 c5.2-6.5,9.3-13.6,12.3-21.3l-17.2-29.7L163,61.9c-3-7.7-7.1-14.8-12.3-21.2h-34.3L99.3,10.9c-8.1-1.2-16.5-1.2-24.5,0L57.6,40.6 H23.3C18.1,47.1,14,54.2,11,61.9l17.2,29.7L11,121.3c3,7.7,7.1,14.8,12.3,21.3h34.3L74.7,172.3z M87,133.6c-23.2,0-42-18.8-42-42 s18.8-42,42-42s42,18.8,42,42S110.2,133.6,87,133.6z M87,59.6c-17.6,0-32,14.4-32,32s14.4,32,32,32s32-14.4,32-32 S104.7,59.6,87,59.6z'
                        />
                    </svg>

                </div>

                {settingsModalMenuComp}

            </div>
        );
    }

}

export default Userbar;