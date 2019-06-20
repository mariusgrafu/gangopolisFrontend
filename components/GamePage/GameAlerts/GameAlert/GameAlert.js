import PropTypes from 'prop-types'
import React, {Component} from 'react';

import './gameAlert.scss';

/**
 * The GameAlert Component
 * It displays the alert received with the 'alert' prop
 * @prop alert {String} - the alert to be shown
 * @prop closeAlert {Function} - function to close the alert
 */
class GameAlert extends Component {

    constructor(props) {
        super(props);

        this.timeout = 5000; // time in ms after this alert will self close

        this.state = {};
    }

    /**
     * When the component mounts it starts a timeout that will close this component
     */
    componentDidMount() {
        const {closeAlert} = this.props;

        setTimeout(() => {
           closeAlert();
        }, this.timeout);
    }

    render() {
        const {alert, closeAlert} = this.props;

        return (
            <div className={`game-alert`}>
                <i
                    className={`gangicon-close game-alert-close`}
                    onClick = {closeAlert}
                />

                <span>
                    {alert}
                </span>
                
            </div>
        );

    }

}

export default GameAlert;

GameAlert.propTypes = {
  alert: PropTypes.string.isRequired,
  closeAlert: PropTypes.func.isRequired
}