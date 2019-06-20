import React from 'react';

import './door.scss';

/**
 * Door prop used in RoomItem and RoomsItem
 */
class Door extends React.Component {

    constructor (props) {
        super(props);

        this.state = {}
    }

    // renders a door component made out of divs and css classes
    render () {

        return (
            <div className={`door`}>
                <div className="door-top-panels">
                    <div className="door-panel" />
                    <div className="door-panel" />
                </div>
                <div className="door-knob" />
                <div className="door-bottom-panel">
                    <div className="door-panel" />
                </div>
            </div>
        );
    }

}

export default Door;