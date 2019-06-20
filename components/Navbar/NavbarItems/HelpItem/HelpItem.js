import React from 'react';

import './helpItem.scss';

/**
 * The Help Button from the navbar
 * @prop active {Boolean} - triggers it's active state | False by default
 */
class HelpItem extends React.Component {

    constructor (props) {
        super(props);

        this.state = {}
    }

    render () {
        let active = this.props.active || false;

        return (
            <div className={`navbar-item help-item-container`}>
             <div className="navbar-item-icon">
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 71.6 113.2'>
                    <defs>
                        <linearGradient id='helpGradient' x1="50%" y1="100%" x2="50%" y2="0%" >
                            <stop offset='0%' stopColor='#FBFBFC' />
                            <stop offset='100%' stopColor='#00FFF6' />
                        </linearGradient>
                    </defs>
                    <polygon className='help-mark' points='52.3,0 19.3,0 0,0 0,19.3 0,31.9 19.3,31.9 19.3,19.3 52.3,19.3 52.3,52.3 26.2,52.3 26.2,58.6 26.2,71.6 26.2,82.2 45.5,82.2 45.5,71.6 52.3,71.6 71.6,71.6 71.6,52.3 71.6,19.3 71.6,0'
                    />
                    <rect className="help-dot" x='26.2' y='93.9' width='19.3' height='19.3' />
                </svg>
             </div>
             <div className="navbar-item-name">Help</div>
            </div>
        );
    }

}

export default HelpItem;