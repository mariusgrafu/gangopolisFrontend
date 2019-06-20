import React from 'react';

import './playItem.scss';

/**
 * The Play Button from the navbar
 * @prop active {Boolean} - triggers it's active state | False by default
 * @prop name {String} - custom message to be displayed next to the icon on hover | 'Play' by default
 * @prop onClick {Function} - function to be triggered by onClick event
 */
class PlayItem extends React.Component {

    constructor (props) {
        super(props);

        this.state = {}
    }

    render () {
        let active = this.props.active || false;
        let name = this.props.name || 'Play';
        let onClick = this.props.onClick || (() => {});

        active = (active)?(' active'):('');

        return (
            <div className={`navbar-item play-item-container${active}`} onClick = {onClick}>
             <div className="navbar-item-icon">
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 115.9 126.4'>
                    <defs>
                        <linearGradient id='playGradient' x1="100%" y1="100%" x2="0%" y2="0%" >
                            <stop offset='0%' stopColor='#C4EC3B' />
                            <stop offset='100%' stopColor='#47BE2A' />
                        </linearGradient>
                    </defs>
                    <path className='play-outline' d='M24.2,126.4L24.2,126.4C10.9,126.4,0,115.5,0,102.2v-78C0,10.9,10.9,0,24.2,0c4.2,0,8.4,1.1,12.1,3.2l67.5,39 c7.5,4.3,12.1,12.3,12.1,21c0,8.6-4.6,16.6-12.1,21l-67.5,39C32.6,125.3,28.4,126.4,24.2,126.4z M24.2,10C16.4,10,10,16.4,10,24.2 v78c0,7.8,6.4,14.2,14.2,14.2c2.5,0,4.9-0.7,7.1-1.9l67.5-39c4.4-2.5,7.1-7.2,7.1-12.3c0-5.1-2.7-9.8-7.1-12.3l-67.5-39 C29.1,10.7,26.7,10,24.2,10z'
                    />
                    <g className='play-btn'>
                        <path d='M88.2,59.6L29.1,25.5c-2.8-1.6-6.3,0.4-6.3,3.6v68.2c0,3.2,3.5,5.3,6.3,3.6l59.1-34.1 C91,65.2,91,61.2,88.2,59.6z'
                        />
                    </g>
                </svg>
             </div>
             <div className="navbar-item-name">{name}</div>
            </div>
        );
    }

}

export default PlayItem;