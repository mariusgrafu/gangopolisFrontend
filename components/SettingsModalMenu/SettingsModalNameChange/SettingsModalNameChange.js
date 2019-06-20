import React from 'react';

import './settingsModalNameChange.scss';

/**
 * The Name Change Component found in the Settings Modal Menu
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 */
class SettingsModalNameChange extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            newName : this.props.user.username, // the new name. it starts as the current username
            rules : {}, // the username rules
            errors : []
        }
    }

    /**
     * Updates the rules state
     * @param rules
     */
    updateRules = (rules) => {
        this.setState({rules});
    }

    /**
     * Updates the username state
     * @param e {Event} - triggered by the input
     */
    updateName = (e) => {
        this.setState({newName : e.target.value});
    }

    /**
     * Handles the response from the server upon requesting a name change
     * @param res
     */
    submitResponse = (res) => {
        if(res.success) {
            const {user, closeModal} = this.props;
            user.refreshUser();
            closeModal();
        } else {
            this.setState({errors : res.errors});
            // TODO: Handle Errors
        }
    }

    /**
     * Request a name change from the server
     */
    submit = () => {
        let {newName} = this.state;
        let {user, socket} = this.props;

        let data = {
            newName,
            userCredentials : user.getCredentials()
        };

        this.setState({errors : []});
        socket.emit(`web | change username`, data, this.submitResponse);
    }

    handleKeydown = (e) => {
        if(e.keyCode === 13) {
            this.submit();
        }
    }

    componentDidMount() {
        let {socket} = this.props;

        // asks the server for the username rules
        socket.emit(`web | get username rules`, this.updateRules);
    }

    getErrorsComps = () => {
        const {errors} = this.state;
        let errorsComps = {};

        if(errors.length) {
            errors.map( (err, i) => {
                errorsComps[err.type] = (
                    <div key={i} className="error-box">
                        {err.message}
                    </div>
                );
            });
        }

        return errorsComps;
    }

    render () {
        const {rules, newName} = this.state;

        let errorsComps = this.getErrorsComps();

        return (
            <div className="settings-modal-name-change-container">
                <div className="name-change-description">
                    <b>Pick a new username!</b>
                    <span>{rules.textRule}</span>
                </div>

                <input
                    maxLength={rules.maxLength}
                    type="text"
                    placeholder="MyNewUsername"
                    value={newName}
                    onChange={this.updateName}
                    onKeyDown={this.handleKeydown}
                />
                {errorsComps.username}

                <div className="smm-btn" onClick={this.submit}>
                    <i className="gangicon-edit" />
                    <span>Change Name!</span>
                </div>
            </div>
        );
    }

}

export default SettingsModalNameChange;