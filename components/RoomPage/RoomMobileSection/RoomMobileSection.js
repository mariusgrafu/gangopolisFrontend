import React, {Component} from 'react';

import './roomMobileSection.scss';

/**
 * The RoomMobileSection Component
 * @prop code {String} - the code mobile users should enter
 */
class RoomMobileSection extends Component {

    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        const {code} = this.props;

        return (
            <div className="room-page-column">
                <div className="rpc-header">
                    <div className="rpc-title">Join the room</div>
                    <div className="rpc-description">
                        Connect to the room through our mobile app
                    </div>
                </div>

                <div className="mobile-section-container no-select">
                    <div className={`mobile-section-connect-wrap`}>
                        <div className={`msc-desc`}>
                            Enter this code in the mobile app
                        </div>
                        <div className={`msc-code`}>
                            {code}
                        </div>
                    </div>

                    <div className={`mobile-section-app`}>
                        <div className={`msa-desc`}>
                            Don't have our app?
                        </div>
                        <img src={require(`../../../imgs/googlePlay/en_badge_web_generic.png`)} />
                        <div className={`msa-legal-attribution`}>
                            Google Play and the Google Play logo are trademarks of Google LLC.
                        </div>
                    </div>
                </div>
            </div>
        );

    }

}

export default RoomMobileSection;