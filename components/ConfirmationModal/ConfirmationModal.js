import PropTypes from 'prop-types'
import React from 'react';
import {Link} from "react-router-dom";

import './confirmationModal.scss';

import $ from 'jquery';

/**
 * Confirmation Modal - Displays a message and offers to options : Accept and Cancel
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop message {String} - Message to be displayed
 * @prop acceptAction {Function} - Function to be called when the user "accepts" the message
 * @prop cancelAction {Function} - Function to be called when the user "cancels" the message
 * @prop closeModal {Function} - Function to close the modal!
 * @prop customAcceptName {String} - (Optional) Custom Name for the "Accept" button ("Accept" by default)
 * @prop customCancelName {String} - (Optional) Custom Name for the "Cancel" button ("Cancel" by default)
 */
class ConfirmationModal extends React.Component {

    constructor (props) {
        super(props);

        this.state = {}
    }

    /**
     * Calls the acceptAction function received as prop, and then closeModal()
     */
    handleAccept = () => {
        const {acceptAction, closeModal} = this.props;
        acceptAction();
        closeModal();
    }

    /**
     * Calls the cancelAction function received as prop, and then closeModal()
     */
    handleCancel = () => {
        const {cancelAction, closeModal} = this.props;
        cancelAction();
        closeModal();
    }

    componentDidMount() {

        $(document).on('keyup', e => {
            if(e.keyCode === 27) {
                this.handleCancel();
            } else if (e.keyCode === 13) {
                this.handleAccept();
            }
        })
    }

    componentWillUnmount() {
        $(document).off('keyup');
    }

    render () {
        const {message} = this.props; // the message that the user will either accept or cancel.

        let customAcceptName = this.props.customAcceptName || "Accept"; // name of the accept button. "Accept" by default.
        let customCancelName = this.props.customCancelName || "Cancel"; // name of the cancel button. "Cancel" by default.

        return (
            <div className="confirmation-modal-overlay">
                <div className={"confirmation-modal-container"}>
                    <div className={"confirmation-modal-message"}>
                        {message}
                    </div>
                    <div className={"confirmation-modal-btns"}>
                        <div
                            className={"btn primary"}
                            onClick={this.handleAccept}
                        >{customAcceptName}</div>
                        <div
                            className={"btn"}
                            onClick={this.handleCancel}
                        >{customCancelName}</div>
                    </div>
                </div>
            </div>
        );
    }

}

export default ConfirmationModal;

ConfirmationModal.propTypes = {
  acceptAction: PropTypes.func.isRequired,
  cancelAction: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  customAcceptName: PropTypes.string,
  customCancelName: PropTypes.string,
  message: PropTypes.string.isRequired
}