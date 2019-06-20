import PropTypes from 'prop-types'
import React from 'react';
import './login.scss';

import LandingLogo from '../Logo/LandingLogo.js';
import User from "../../clientClasses/User";

import Chance from 'chance';

import $ from 'jquery';

/**
 * The Login Component
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 */
class Login extends React.Component {

    // array of adjectives to be used in generating a random username
    static shortAdjectives =
        ["Small", "Big", "Ugly", "Funny", "Cute",
        "Gay", "Queer", "Noisy", "Stubborn", "Weird",
        "Fast", "Slow", "Old", "Young", "Shady", "Busy",
        "Lazy", "Sleepy", "Brave", "Scared", "Lucky", "Bold"];

    constructor (props) {
        super(props);

        this.loginContainer = null;

        this.state = {
            username : '', // value entered by the user in the username input field
            pickedAvatar : "",
            avatars : [], // array of avatar names
            minimumChars : 3, // minimum number of characters the username must have
            maximumChars : 12, // maximum number of characters the username must have
            usernameRule : ``, // text rule explaining username conditions
            errors : [], // array of errors
            placeholder: ""
        }
            
    }

    generateUsernameSuggestion = () => {
        let chance = new Chance();
        let {minimumChars, maximumChars} = this.state;

        let username = "";

        while(username.length < minimumChars || username.length > maximumChars){
            username = chance.pickone(Login.shortAdjectives) + chance.animal().replace(/\s+/g, '');
        }

        this.setState({
            placeholder: username
        });
    }

    /**
     * Updates the username state with a value received from the input
     * @param e {Event} - event triggered by the input
     */
    updateUsername = (e) => {
        this.setState({
            username : e.target.value
        });
    }

    /**
     * Updates the pickedAvatar state with a new avatar index
     * @param idx {Integer} - index of the new avatar
     */
    pickAvatar = (idx) => {
        let {pickedAvatar} = this.state;
        if(pickedAvatar === idx) pickedAvatar = -1; // if the avatar is already picked, it will deselect
        else pickedAvatar = idx;
        this.setState({pickedAvatar});
    }

    /**
     * Handles the response received from the server upon submitting a login request
     * @param res {Object} - the response received from the server
     */
    serverResponse = (res) => {
        if (res.success) { // if the action was a success, it will set the userId and userHash from localStorage to the ones received from the server
            localStorage.userId = res.userCredentials.id;
            localStorage.userHash = res.userCredentials.hash;
            location.reload(); // reloads the page, which will redirect the user home

        } else {
            this.setState({errors : res.errors}); // in case of failure, update the errors array
        }
    }

    /**
     * Submits a login request to the server with the current username and avatar
     */
    submit = () => {
        let {username, pickedAvatar, avatars, placeholder} = this.state;
        let {socket} = this.props;

        this.setState({errors : []}); // resets the errors array

        if(!username.length) {
            username = placeholder;
        }

        if(pickedAvatar === -1) // if there is no avatar picked, a random one from the avatars array will be picked
            pickedAvatar = Math.floor(Math.random() * avatars.length);

        let data = {
            username,
            pickedAvatar
        };

        // sends a login request to the server
        socket.emit(`web | create user > sv`, data, this.serverResponse);
    }

    /**
     * Updates the avatars array
     * @param avatars {Array} - the new avatars array
     */
    updateAvatars = (avatars) => {
        if(avatars) this.setState({avatars});
    }

    /**
     * Updates the username rules (minimumChars, maximumChars, usernameRule)
     * @param rules {Object} - {minLength, maxLength, textRule}
     */
    updateUsernameRules = (rules) => {
        if(!rules) return;
        this.setState({
            minimumChars : rules.minLength,
            maximmumChars : rules.maxLength,
            usernameRule : rules.textRule
        });
    }

    componentDidMount () {
        const {socket} = this.props;

        socket.emit(`web | get avatar list > sv`, this.updateAvatars); // asks the server for the avatar list
        socket.emit(`web | get username rules`, this.updateUsernameRules); // asks the server for the username rules

        $(this.loginContainer).on('keyup', e => {
           if(e.keyCode === 13) {
               this.submit();
           }
        });

        this.generateUsernameSuggestion();

    }

    render () {
        const {username, avatars, pickedAvatar, minimumChars, maximumChars, errors, usernameRule, placeholder} = this.state;

        let picturesComps = []; // array of picture components where the avatar array will be displayed

        if (avatars.length) { // checks the avatar array has elements
            avatars.map((avt, i) => {
                let selected = '';
                if(i === pickedAvatar) selected = ' selected'; // adds a special css class if the avatar is picked
                picturesComps.push(
                    <div key={i} 
                    onClick = {() => this.pickAvatar(i)}
                    className={`login-group-picture${selected}`} 
                    style={{backgroundImage: `url(${User.getAvatar(avt)})`}} />
                );
            });
        }

        // the submit button component. '.disabled' if the username doesn't match the rules
        let btn = (<div className={`btn disabled`}>Submit</div>);

        if(username.length === 0 || username.length >= minimumChars && username.length <= maximumChars){
            btn = (
                <div className={`btn primary`}
                onClick = {this.submit}
                >Submit</div>
            );
        }

        // map of error components created from the errors array -> { 'errorType' : ErrorComponent }
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
        
        return (
            <div className="login-container" ref={c => this.loginContainer = c}>
                <LandingLogo ignoreLink={true} />
                <div className="login-wrapper">

                    <div className="login-group">
                        <div className="login-group-description">
                            <b>pick a name!</b>
                            <span>
                            {usernameRule}
                            </span>
                        </div>
                        <input type="text" maxLength={maximumChars} placeholder={placeholder} name="username" value={username} onChange={this.updateUsername} />
                        {errorsComps['username']}
                    </div>

                    <div className="login-group">
                        <div className="login-group-description">
                            <b>pick a picture!</b>
                            <span>
                            choose an image to go with the name. or don't, and  you'll get a random one from the exact same pack!
                            </span>
                        </div>
                        <div className="login-group-pictures">
                            {picturesComps}
                        </div>
                    </div>

                    <div className="login-btn">
                        {btn}
                    </div>
                </div>
            </div>
        );
    }

}

export default Login;

Login.propTypes = {
  socket: PropTypes.any.isRequired
}