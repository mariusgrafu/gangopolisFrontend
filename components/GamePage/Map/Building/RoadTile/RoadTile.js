import React, {Component} from 'react';

import $ from 'jquery';

/**
 * The RoadTile Component
 * Prints the "squares" from around the map
 */
class RoadTile extends Component {

    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        const {tileId} = this.props;

        return (
            <div
                key={tileId}
                className={"map-tile-road"}
                id={tileId}
            >
            </div>
        );

    }

}

export default RoadTile;