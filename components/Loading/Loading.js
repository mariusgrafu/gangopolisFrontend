import PropTypes from 'prop-types'
import React from 'react';
import './loading.scss';

/**
 * The Loading Component
 * @prop overlayColor {Boolean} - darkens the background (default is False)
 */
class Loading extends React.Component {

    constructor (props) {
        super(props);

    }

    render () {
        let {overlayColor} = this.props;

        let overlayColorClass = ``; // special class to be added to '.loading-overlay'
        if(overlayColor === true) overlayColorClass = ' with-color'; // checks if the component should darken it's background

        return (
            <div className={`loading-overlay${overlayColorClass}`}>
                <div className={"loading-icon"} />
            </div>
        );
    }

}

export default Loading;

Loading.propTypes = {
  overlayColor: PropTypes.any.isRequired
}