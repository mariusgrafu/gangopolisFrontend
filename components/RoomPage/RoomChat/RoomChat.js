import React from 'react';
import $ from 'jquery';
import './roomChat.scss';

import RoomChatMessage from './RoomChatMessage/RoomChatMessage';

/**
 * The Room Chat Component
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop roomid {String} - Room ID
 * @prop leaderId {String} - Room Leader ID
 * @prop getTeamByUserid {Function} - Gets the Team a player is in by userid
 * @prop isUserInRoom {Function} - Checks if a user is in the room
 * @prop muteStatus {Boolean} - If the user can or not write in the chat
 */
class RoomChat extends React.Component {

    constructor (props) {
        super(props);

        this.messagesContainer = null;

        this.state = {
            messages : [], // array of messages
            newMessage : `` // the content of the new message to be sent
        };
    }

    /**
     * Updates the newMessage state
     * @param e {Event} - triggered by the input
     */
    updateMessage = (e) => {
        this.setState({newMessage : e.target.value});
    }

    /**
     * Handles the response from the server after sending a new message
     * @param res {Object} - response from the server
     */
    handleMessageResponse = (res) => {
        //TODO: Handle Errors
        console.log("send message response", res);
        if(res.success) { // if it was successful the input will be emptied
            this.setState({newMessage : ``});
        }
    }

    /**
     * Sends the newMessage to the server if it is not empty
     */
    sendNewMessage = () => {
        const {user, socket} = this.props;
        const {newMessage} = this.state;
        if($.trim(newMessage) === '') return; // checks that the message is not empty

        let data = {
            userCredentials : user.getCredentials(),
            newMessage
        };

        socket.emit(`web | send chat message`, data, this.handleMessageResponse);
    }

    /**
     * Triggers sendNewMessage() when the user presses enter
     * @param e {Event} - triggered by the input
     */
    handleSendOnEnter = (e) => {
        if(e.key.toLowerCase() === 'enter')
            this.sendNewMessage();
    }

    /**
     * Add a new message to the messages array
     * @param newMessage {Object} - new message received from the server
     */
    addNewMessage = (newMessage) => {
        console.log('new message', newMessage);
        let {messages} = this.state;
        messages.push(newMessage);
        this.setState({messages}, () => {
            if(this.messagesContainer !== null)
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight; // keeps the messages container scrolled to the bottom
        });
    }

    componentDidMount() {
        const {socket, roomid} = this.props;

        // listens for new messages from the server
        socket.on(`web | new chat message ${roomid}`, this.addNewMessage);
    }

    getMessagesComps = () => {
        const {socket, user, leaderId, getTeamByUserid, isUserInRoom} = this.props;
        const {messages} = this.state;
        if(!messages.length) return [];

        let messagesComps = [];

        let compactMessages = [];
        let newMessage = $.extend(true,{}, messages[0]);
        compactMessages.push(newMessage);
        compactMessages[0].content = [messages[0].content];

        for(let i = 1; i < messages.length; ++i) {
            let lastMessage = compactMessages[compactMessages.length - 1];
            if(messages[i].author.userid === lastMessage.author.userid) {
                lastMessage.content.push(messages[i].content);
            } else {
                let newMessage = $.extend(true,{}, messages[i]);
                compactMessages.push(newMessage);
                compactMessages[compactMessages.length - 1].content = [messages[i].content];
            }
        }

        compactMessages.map((message, i) => {
            messagesComps.push(
                <RoomChatMessage
                    key={`${i}${message.author.userid}`}
                    socket={socket}
                    user={user}
                    message={message}
                    leaderId={leaderId}
                    getTeamByUserid={getTeamByUserid}
                    isUserInRoom={isUserInRoom}
                />
            );
        });

        return messagesComps;
    }

    render () {
        const {socket, user, leaderId, roomid, getTeamByUserid, muteStatus} = this.props;
        const {newMessage, messages} = this.state;

        let messagesComps = []; // array of message components
        let noMessagesComp = (<></>); // component to be shown if there are no messages

        if(messages.length) { // checks if there are any messages
            messagesComps = this.getMessagesComps();
        } else { // if there are no messages, this component will be shown instead
            noMessagesComp = (
                <div className={"room-chat-no-messages"}>
                    Welcome to Room #{roomid}!
                </div>
            );
        }

        // the send icon will look different if there is no new message to be sent
        let sendIconClass = ``;
        if($.trim(newMessage) === '') {
            sendIconClass = ` disabled`;
        }

        let sendMessagePlaceholderText = `leave a message`;
        let sendMessageInputExtraClass = ``;

        if(muteStatus) {
            sendMessagePlaceholderText = `You have been muted`;
            sendMessageInputExtraClass = ` is-muted`;
        }

        return (
            <div className="room-page-column no-expand">
                <div className="rpc-header">
                    <div className="rpc-title">Chat</div>
                    <div className="rpc-description">
                        Fraternize with the enemy before the match
                    </div>
                </div>

                <div className="room-chat-container">
                    <div className="room-chat-messages" ref={c => (this.messagesContainer = c)}>
                        {noMessagesComp}
                        {messagesComps}
                    </div>

                    <div className={`room-chat-input${sendMessageInputExtraClass}`}>
                        <input
                            type="text"
                            placeholder={sendMessagePlaceholderText}
                            value={newMessage}
                            onChange={this.updateMessage}
                            onKeyPress={this.handleSendOnEnter}
                        />
                        <i
                            className={`gangicon-plane-send${sendIconClass}`}
                            onClick={this.sendNewMessage}
                        />
                    </div>
                </div>
            </div>
        );
    }

}

export default RoomChat;