import React from 'react';
import './landingPage.scss';

import LandingLogo from '../Logo/LandingLogo.js';
import PageAbstract from "../PageAbstract/PageAbstract";

/**
 * The Default Landing Page Component containing the Landing Page Logo
 */
class DefaultLandingPage extends PageAbstract {

    constructor (props) {
        super(props);

        this.state = {
        }
            
    }

    render () {
        
        return (
            <div className="default-landing-page-container">
                <LandingLogo ignoreLink={true} />
            </div>
        );
    }

}

export default DefaultLandingPage;