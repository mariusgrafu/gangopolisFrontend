import React from 'react';
import {Link} from "react-router-dom";

import './roomError.scss';

/**
 * The Room Error Component - displays room errors when no room is found
 * @prop errors {Array} - the array of errors
 */
class RoomError extends React.Component {

    constructor (props) {
        super(props);
    }

    render () {
        const {errors} = this.props;

        let errorComps = []; // array of error components
        if(errors.length) { // checks if any errors where received
            errors.map((err, i) => { // pushes new components in the errorsComps array
               errorComps.push(
                   <div className={`error-box`}
                        key={i}
                   >
                       {err.message}
                   </div>
               );
            });
        }

        return (
            <div className="room-error-container">
                <div className={"room-error-image"} />
                <div className={"room-error-title"}>
                    Looks like you've hit a wall 🙁
                </div>
                <div className={"room-error-errors"}>
                    {errorComps}
                </div>
                <div className={"room-error-btn"}>
                    <Link to={"/"} className={"btn primary"}>
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

}

export default RoomError;