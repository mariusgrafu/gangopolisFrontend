import React from 'react';

import './inviteItem.scss';
import Utils from "../../../../../../clientClasses/Utils";
import {Redirect} from "react-router";

/**
 * The InviteItem Component that will appear on the right
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop closePanel {Function} - Closes the User Panel
 */
class InviteItem extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            redirect : null
        }
    }

    handleDeclineResponse = (res) => {
        // TODO: Handle Errors
        console.log('handleDeclineResponse', res);
    }

    declineInvite = () => {
        const {user, socket, invite} = this.props;

        let data = {
            userCredentials : user.getCredentials(),
            inviteId : invite.id
        };

        socket.emit(`web | decline invite`, data, this.handleDeclineResponse);
    }

    handleAcceptResponse = (res) => {
        console.log('handleAcceptResponse', res);
        if(res.success) {
            const {user, invite, closePanel} = this.props;
            this.setState({redirect : invite.roomid}, () => {
               this.setState({redirect : null});
            });
            user.updateRoomid(res.roomid);
            closePanel();
        } else {
            // TODO: Handle Errors
        }
    }

    acceptInvite = () => {
        const {user, socket, invite} = this.props;

        let data = {
            userCredentials : user.getCredentials(),
            inviteId : invite.id
        };

        socket.emit(`web | accept invite`, data, this.handleAcceptResponse);
    }

    render () {
        const {invite} = this.props;
        const {redirect} = this.state;

        if(redirect !== null) {
            return (
                <Redirect to={`/room/${redirect}`} />
            );
        }

        return (
            <div className="invite-item-container">
                <div className={"invite-details"}>
                    <div className={"invite-title"}>
                        You have been invited in Room <span>#{invite.roomid}</span>
                    </div>
                    <div className={"invite-timestamp"}>
                        {Utils.timeAgo(invite.timestamp)}
                    </div>
                </div>

                <div className={"invite-actions"}>
                    <div
                        className={"invite-action accept"}
                        onClick={this.acceptInvite}
                        tooltip="Accept"
                    >
                        <i className={"gangicon-checkmark"} />
                    </div>
                    <div
                        className={"invite-action decline"}
                        onClick={this.declineInvite}
                        tooltip="Decline"
                    >
                        <i className={"gangicon-close"} />
                    </div>
                </div>

            </div>
        );
    }

}

export default InviteItem;