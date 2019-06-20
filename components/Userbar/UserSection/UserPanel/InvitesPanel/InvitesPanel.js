import React from 'react';

import './invitesPanel.scss';
import InviteItem from "./InviteItem/InviteItem";

/**
 * The InvitesPanel Component that will appear on the right
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop invites {Array} - Array of invites
 * @prop closePanel {Function} - Closes the User Panel
 */
class InvitesPanel extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
        }
    }

    render () {
        const {user, socket, invites, closePanel} = this.props;

        let invitesComp = [];

        if(invites.length) {
            invitesComp = invites.map((invite) => {
                return (
                    <InviteItem
                        key={invite.id}
                        user = {user}
                        socket = {socket}
                        invite = {invite}
                        closePanel = {closePanel}
                    />
                );
            });
        } else {
            invitesComp.push(
                <div key={"noInvites"} className={"no-invites"}>
                    You have no invites! 🙁
                </div>
            );
        }

        return (
            <div className="invites-panel-container no-select">

                {invitesComp}

            </div>
        );
    }

}

export default InvitesPanel;