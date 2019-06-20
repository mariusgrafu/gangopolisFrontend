import React from 'react';

import './homeItem.scss';

/**
 * The Home Button from the navbar
 * @prop active {Boolean} - triggers it's active state | False by default
 */
class HomeItem extends React.Component {

    constructor (props) {
        super(props);

        this.state = {}
    }

    render () {
        let active = this.props.active || false;

        active = (active)?(' active'):('');

        return (
            <div className={`navbar-item home-item-container${active}`}>
                <div className="navbar-item-icon">
                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 140.5 125.1'>
                        <path d='M140.5,56.1c-3.3,0-6.2,1.4-8.6,4.1c-1.3,1.4-2.1,2.9-2.5,4.5c-0.4,1.6-0.5,3.7-0.5,6.2v36.1c0,1.5,0,3.1,0,4.6	c0.2,1.4,0.6,2.8,1.5,4.2c0.8,1.5,1.7,2.5,2.7,3.1c1,0.6,2.5,1.2,4.4,1.6v4.6H76.8c-14.6,0-26.2-1.5-34.8-4.4	c-10.8-3.6-19.9-10.2-27.3-19.7C9.9,95,6.3,88.3,3.8,80.9C1.3,73.5,0,65.9,0,58.1C0,49.8,1.5,42,4.6,34.6	c3.1-7.3,7.8-13.7,14.1-19.2c6.1-5.2,13.1-9,21.1-11.3c8-2.4,16.8-3.6,26.3-3.6c5.2,0,10,0.3,14.6,0.8c4.5,0.5,9.7,1.4,15.5,2.6	c3,0.6,5.7,1,8.3,1c2.8,0,5.1-0.5,6.9-1.5c1.4-1.1,2.8-2.3,4.2-3.4l5,41.7l-3,1.6c-1.4-3.9-4.3-8.5-8.9-13.9c-3.5-4.1-7-7-10.4-8.7	c-8.7-4-16.4-6-23.2-6c-10.6,0-19,4.5-25.1,13.6c-5.1,7.5-8.2,17.2-9.3,29.1c-0.1,0.7-0.1,1.4-0.2,2.1c0,0.6-0.1,1.5-0.1,2.4	c0,12.2,3.1,23.3,9.3,33.4c7.3,11.8,16.8,17.7,28.6,17.7c5.3,0,9.1-1.7,11.6-5c2.1-2.8,3.2-6.6,3.2-11.4V67.8c0-2.7-0.2-4.6-0.5-5.7	c-0.4-1-1-2.1-2-3c-1.9-1.8-4-2.7-6.3-2.7c-0.9,0-1.5,0-1.9,0v-4.5h58.1V56.1z'
                        />
                    </svg>
                </div>
                <div className="navbar-item-name">Go Home</div>
            </div>
        );
    }

}

export default HomeItem;