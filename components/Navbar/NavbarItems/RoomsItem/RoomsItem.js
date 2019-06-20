import React from 'react';

import './roomsItem.scss';

import Door from '../Door/Door';

/**
 * The Rooms Button from the navbar
 * @prop active {Boolean} - triggers it's active state | False by default
 */
class RoomsItem extends React.Component {

    constructor (props) {
        super(props);

        this.state = {}
    }

    render () {
        let active = this.props.active || false;

        let activeExtraCssClass = ``;

        if(active) activeExtraCssClass = ` active`;

        return (
            <div className={`navbar-item rooms-item-container${activeExtraCssClass}`}>
             <div className="navbar-item-icon">
                <Door />
                <Door />
                <Door />
             </div>
             <div className="navbar-item-name">Roomlist</div>
            </div>
        );
    }

}

export default RoomsItem;