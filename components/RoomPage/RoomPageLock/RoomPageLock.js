import React from 'react';

import './roomPageLock.scss';

/**
 * The Room Page Lock Component
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop leaderId {String} - Room Leader ID
 * @prop privateStatus {Boolean} - Room Privacy Status (True = Room is Private)
 * @prop roomid {String} - Room ID
 * @prop password {String} - Room Password (if missing it will be ``)
 */
class RoomPageLock extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            password : props.password || ``, // new room password
            oldPassword : props.password || ``, // backup of the password
            passwordType : `text` // type of the password ('text' will make it readable, 'password' will represent it as dots)
        };
    }

    /**
     * Response from the server upon requesting a room privacy status change
     * @param res
     */
    privateStatusResponse = (res) => {
        console.log('private status response', res);
        // TODO: Handle Errors
        if(res.success) { // if successful, the new settings will be applied
            let password = res.password || ``;
            let oldPassword = res.password || ``;
            this.setState({password, oldPassword});
        }
    }

    /**
     * Sets the room privacy status
     */
    setPrivateStatus = () => {
        const {socket, user, leaderId, roomid} = this.props;
        let {privateStatus} = this.props;

        if(user.id !== leaderId) return; // if the current user is not the leader the function has no effect

        privateStatus = !privateStatus; // if the room is private, it will become public, and vice-versa

        let data = {
            userCredentials : user.getCredentials(),
            roomid,
            privateStatus
        };

        // requests the status change from the server
        socket.emit(`web | set room private status`, data, this.privateStatusResponse);
    }

    /**
     * Updates the password state
     * @param e {Event} - triggerd by the input
     */
    updatePassword = (e) => {
        this.setState({password : e.target.value});
    }

    /**
     * Toggles the Password Type, making it readable or not
     */
    togglePasswordType = () => {
        let {passwordType} = this.state;
        if(passwordType === 'password') passwordType = 'text';
        else passwordType = 'password';

        this.setState({passwordType});
    }

    /**
     * Handles Response from the server upon requesting the password to be updated
     * @param res
     */
    submitResponse = (res) => {
        console.log('password update submit response', res);
        this.setState({ // updates the passwords from the component
           password : res.password || ``,
           oldPassword : res.password || ``
        });
    }

    /**
     * Submits a password change
     */
    submitPassword = () => {
        const {user, socket, roomid} = this.props;
        let {password} = this.state;

        let data = {
            userCredentials: user.getCredentials(),
            roomid,
            password
        };

        socket.emit(`web | set room password`, data, this.submitResponse);
    }

    /**
     * Reverts 'password' back to 'oldPassword'
     */
    revertPassword = () => {
        let {oldPassword} = this.state;
        this.setState({password : oldPassword});
    }

    render () {
        const {oldPassword, password, passwordType} = this.state;
        const {leaderId, user, privateStatus} = this.props;

        let contentComp = (<></>);

        if(privateStatus) { // checks if the room is private

            // the 'eye icon' aspect should fit with the password type
            let eyeClass = ``;
            if(passwordType === 'text') {
                eyeClass = ` active`;
            }

            let passwordInputComp = (<></>);
            if(leaderId === user.id && 0) { // if the current user is the leader, they will be able to see and update the password
                let reloadDisabledClass = ``;
                let updateBtnDisabledClass = ``;
                if(oldPassword === password) {
                    reloadDisabledClass = ` disabled`;
                    updateBtnDisabledClass = ` disabled`;
                }
                if(password === ``) {
                    updateBtnDisabledClass = ` disabled`;
                }
                passwordInputComp = (
                    <div className="rpl-password-wrap">
                        <div className="rpl-password-label">password</div>
                        <div className="rpl-pass-input">
                            <input type={passwordType} value={password} onChange={this.updatePassword} placeholder="your totally secret yet unencrypted password" />
                            <i className={"gangicon-eye" + eyeClass}
                               onClick = {this.togglePasswordType}
                            />
                        </div>
                        <i className={`rpl-reload-password gangicon-reload${reloadDisabledClass}`}
                           onClick = {this.revertPassword}
                        />
                        <div className={`btn${updateBtnDisabledClass}`} onClick={this.submitPassword}>update</div>
                    </div>
                );
            }
            contentComp = (
                <>
                <div className="rpl-lock-wrap no-select locked" onClick={this.setPrivateStatus}>
                    <span className="rpl-lock-type">Private Room</span>
                    <i className="gangicon-locked" />
                </div>
                    {passwordInputComp}
                </>
            );

        } else {
            contentComp = (
                <div className="rpl-lock-wrap no-select" onClick={this.setPrivateStatus}>
                    <span className="rpl-lock-type">Public Room</span>
                    <i className="gangicon-unlocked" />
                </div>
            );
        }

        return (
            <div className="room-page-lock-container">

                {contentComp}

            </div>
        );
    }

}

export default RoomPageLock;