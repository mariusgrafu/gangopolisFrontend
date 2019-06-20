import PropTypes from 'prop-types'
import React from 'react';

import './building.scss';
import RoadTile from "./RoadTile/RoadTile";
import PlayerState from "../../../../shared/PlayerState";

/**
 * The Building Component
 * @prop socket {WebSocket} - the socket belonging to the user
 * @prop user {User} - User Class with data about the client
 * @prop getPlayerInfo {Function(value, key)} - Returns the playerInfo of the player matching gameInfo.playersInfo[key] = value
 */
class Building extends React.Component {

    constructor (props) {
        super(props);

        this.showCardTimeout = null; // the showcard timeout will be saved here so it can be cleared later

        this.state = {
            showBuildingCard : false // whether the building card should show or not
        };
    }

    /**
     * Returns the image requested from the 'img' url
     * If the path should change, this should change as well
     * @param img
     * @returns {string}
     */
    requestMapImage = (img) => {
        if(!img) return '';
        return require(`../../../../imgs/map/assets/${img}`);
    }

    /**
     * Closes the Building Card
     */
    closeCard = () => {
        clearTimeout(this.showCardTimeout);
        this.setState({showBuildingCard : false});
    }

    /**
     * Makes the Building Card appear
     * @param e
     */
    showCard = (e) => {
        clearTimeout(this.showCardTimeout);
        this.showCardTimeout = setTimeout(() => {
            this.setState({
                showBuildingCard : true
            });
        }, 250);
    }

    /**
     * Checks if the player given as playerInfo is on this Building (on the map)
     * @param playerInfo
     * @returns {boolean}
     */
    isPlayerOnBuidling = (playerInfo) => {
        const {buildingKey, getBuildingFromTile} = this.props;

        return getBuildingFromTile(playerInfo.currentTileId) === buildingKey;
    }

    /**
     * Checks if the player is allowed to upgrade this building
     * @returns {boolean}
     */
    canUpgradeBuilding = () => {
        const {accessibleBuilding, building, getPlayerInfo, user} = this.props;
        let clientInfo = getPlayerInfo(user.id, 'userid');

        return (
                (accessibleBuilding || (this.isPlayerOnBuidling(clientInfo) && clientInfo.currentState === PlayerState.Enum.LastStep)) &&
                building.owner === clientInfo.teamType &&
                building.upgradeLevel < 3
        );
    }

    /**
     * Checks if the player is allowed to switch this building's legal activity status
     * @returns {boolean}
     */
    canSwitchBuildingIllegalStatus = () => {
        const {accessibleBuilding, building, getPlayerInfo, user} = this.props;
        let clientInfo = getPlayerInfo(user.id, 'userid');

        return (
            (accessibleBuilding || (this.isPlayerOnBuidling(clientInfo) && clientInfo.currentState === PlayerState.Enum.LastStep)) &&
            building.owner === clientInfo.teamType
        );
    }

    /**
     * Checks if the player is allowed to raid this building
     * @returns {boolean}
     */
    canRaidBuilding = () => {
        const {buildingKey, building, getPlayerInfo, user, getBuildingFromTile} = this.props;
        let clientInfo = getPlayerInfo(user.id, 'userid');

        return (building.owner &&
                clientInfo.teamType === 'police' &&
                clientInfo.currentState === PlayerState.Enum.LastStep &&
                getBuildingFromTile(clientInfo.currentTileId) === buildingKey
        );
    }

    /**
     * Checks if the player is allowed to buy this building
     * @returns {boolean}
     */
    canBuyBuilding = () => {
        const {buildingKey, building, getPlayerInfo, user, getBuildingFromTile} = this.props;
        let clientInfo = getPlayerInfo(user.id, 'userid');

        return (!building.owner &&
                clientInfo.teamType !== 'police' &&
                clientInfo.currentState === PlayerState.Enum.LastStep &&
                getBuildingFromTile(clientInfo.currentTileId) === buildingKey
        );
    }

    /**
     * Logs the response from the server when an upgrade is made (debug)
     * @param res
     */
    handleUpgradeResponse = (res) => {
        console.log(`building upgrade response`, res);
    }

    /**
     * Emits to the server that the player wants to upgrade the building
     * The Server will respond with an emit
     */
    upgradeBuilding = () => {
        const {user, socket, buildingKey} = this.props;

        let data = {
            userCredentials : user.getCredentials(),
            buildingId : buildingKey
        }

        socket.emit(`web | game | upgrade building`, data, this.handleUpgradeResponse);

    }

    /**
     * Logs the response from the server after a buy call
     * @param res
     */
    handleBuyResponse = (res) => {
        console.log(`building buy response`, res);
    }

    /**
     * Emits to the server that the player wants to buy the building
     * The Server will respond with an emit
     */
    buyBuilding = () => {
        const {user, socket, buildingKey} = this.props;

        let data = {
            userCredentials : user.getCredentials(),
            buildingId : buildingKey
        }

        socket.emit(`web | game | buy building`, data, this.handleBuyResponse);

    }

    /**
     * Logs the response from the server after switch status is called
     * @param res
     */
    handleSwitchStatusResponse = (res) => {
        console.log(`building legal status change response`, res);
    }

    /**
     * Emits to the server that the player wants to switch the building illegal activity status
     * The Server will respond with an emit
     */
    switchBuildingStatus = () => {
        const {user, socket, buildingKey, building} = this.props;

        let data = {
            userCredentials : user.getCredentials(),
            buildingId : buildingKey,
            status : !building.illegalActivityStatus
        }

        socket.emit(`web | game | set building illegal activity status`, data, this.handleSwitchStatusResponse);

    }

    /**
     * Return a React Component with stars based on the upgrade level of the building
     * @returns {*}
     */
    handleRaidResponse = (res) => {
        console.log('raid response', res);
    }

    raidBuilding = () => {
        const {user, socket, buildingKey} = this.props;

        let data = {
            userCredentials : user.getCredentials(),
            buildingId : buildingKey
        }

        socket.emit(`web | game | start raid`, data, this.handleRaidResponse);

    }

    getUpgradeStarsComp = () => {
        const {building} = this.props;

        if(!building.owner) {
            return (<></>);
        }

        let stars = [];

        for(let i = 0; i < building.upgradeLevel; ++i) {
            stars.push(
                <i key={`star-${i}`} className={`gangicon-star`}/>
            );
        }

        for(let i = 0; i < 3 - building.upgradeLevel; ++i) {
            stars.push(
                <i key={`empty-star-${i}`} className={`gangicon-star-outline`}/>
            );
        }

        return (
            <div
                className={`building-card-upgrade-level`}
                tooltip="Upgrade Level"
            >
                {stars}
            </div>
        );
    }

    /**
     * Returns a React Component displaying the Illegal Status to the players in the team which owns the building
     * @returns {*}
     */
    getIllegalActivityTextComp = () => {
        const {building, user, getPlayerInfo} = this.props;

        let clientInfo = getPlayerInfo(user.id, 'userid');

        if(clientInfo.teamType !== building.owner) {
            return (<></>);
        }

        let statusText = `Legal Business`;
        let cssExtraClass = ``;
        if(building.illegalActivityStatus) {
            cssExtraClass = ` illegal`;
            statusText = `Illegal Business`;
        }

        return (
            <div className={`business-status${cssExtraClass}`}>
                {statusText}
            </div>
        );
    }

    /**
     * Return the Building Card
     * It displays details about the building
     * It also has buttons for Buying, Upgrading, Switching Status, Raiding the building
     * @returns {*}
     */
    getBuildingCard = () => {
        const {building} = this.props;
        const {showBuildingCard, cardPosition} = this.state;

        if(building.type === `start` || !showBuildingCard) return (<></>);

        let bottomPart = (<></>);
        switch(building.type) {
            case 'residence':
            case 'business':
                let upgradeBtn = (<></>);
                let buyBtn = (<></>);
                let illegalActivityBtn = (<></>);
                let raidBuildingBtn = (<></>);
                let buildingPriceComp = (<></>);
                if(this.canBuyBuilding()) {
                    buyBtn = (
                        <div className={`building-option-btn-container`}>
                            <div
                                className="building-buy-btn"
                                onClick={this.buyBuilding}
                            >
                                Buy Property
                            </div>
                        </div>
                    );
                }
                if(this.canUpgradeBuilding()) {
                    upgradeBtn = (
                        <div className={`building-option-btn-container`}>
                            <div
                                className="building-upgrade-btn"
                                onClick = {this.upgradeBuilding}
                            >
                                Upgrade Property
                            </div>
                        </div>
                    );
                }
                if(this.canSwitchBuildingIllegalStatus()) {
                    let activityString = `Start doing Illegal Business`;
                    let extraCssClass = ` illegal`;
                    if(building.illegalActivityStatus) {
                        activityString = `Start doing Legal Business`;
                        extraCssClass = ``;
                    }
                    illegalActivityBtn = (
                        <div className={`building-option-btn-container`}>
                            <div
                                className={`building-illegal-btn${extraCssClass}`}
                                onClick = {this.switchBuildingStatus}
                            >
                                {activityString}
                            </div>
                        </div>
                    );
                }
                if(this.canRaidBuilding()) {
                    raidBuildingBtn = (
                        <div className={`building-option-btn-container`}>
                            <div
                                className="building-raid-btn"
                                onClick={this.raidBuilding}
                            >
                                Raid this building
                            </div>
                        </div>
                    );
                }

                if(!building.owner) {
                    buildingPriceComp = (
                        <div className={`building-price-wrap`}>
                            <div className={`building-price-type`}>
                                Buy Price
                            </div>
                            <div className={`building-price`}>
                                <i className={`gangicon-money`} />
                                <span>{building.buyPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    );
                } else if(this.canUpgradeBuilding()){
                    buildingPriceComp = (
                        <div className={`building-price-wrap`}>
                            <div className={`building-price-type`}>
                                Upgrade Price
                            </div>
                            <div className={`building-price`}>
                                <i className={`gangicon-money`} />
                                <span>{building.upgradePrice.toLocaleString()}</span>
                            </div>
                        </div>
                    );
                }
                bottomPart = (
                    <>
                        {buildingPriceComp}
                        {raidBuildingBtn}
                        {buyBtn}
                        {upgradeBtn}
                        {illegalActivityBtn}
                    </>
                );
                break;
        }

        let typeTooltips = {
            residence : `Residence`,
            business : `Business`,
            decorative : `Decoration`,
            special : `Special`
        }

        let upgradeStarsComp = this.getUpgradeStarsComp();

        let illegalActivityTextComp = this.getIllegalActivityTextComp();

        // let top = cardPosition.y;
        // let left = cardPosition.x;

        let buildingCardComp = (
            <div
                className={`building-card-wrap`}
            >
                <div className={`building-card-container`}>
                    <div className={`card-img-preview-container`}>
                        {illegalActivityTextComp}
                        {upgradeStarsComp}
                        <div className={`card-img-preview`}
                             style={{backgroundImage : `url(${this.requestMapImage(building.img)})`}}
                        />
                    </div>
                    <div className={`card-top`}>
                        <div className={`building-name`}>
                            {building.name}
                        </div>
                        <i
                            className={`gangicon-building-${building.type}`}
                            tooltip={typeTooltips[building.type]}
                        />
                    </div>
                    <div className={`building-description`}>
                        {building.description}
                    </div>
                    {bottomPart}
                </div>
            </div>
        );

        return buildingCardComp;
    }

    /**
     * Returns a bar which will be colored based on the team who owns the building
     * @returns {*}
     */
    getTeamColorBar = () => {
        const {building} = this.props;

        if(!building.owner) {
            return (<></>);
        }

        return (
            <div className={`owner-color-bar ${building.owner}`} />
        );
    }

    render () {
        let {building, placement, updateTileComp} = this.props;
        const {showBuildingCard} = this.state;


        building = building || {};
        let size = building.tileOrder.length;

        let sizeClass = '';

        if(size > 1) sizeClass = ` size-${size}`;

        let roadTiles = building.tileOrder.map((tileId) => {
            return (
                <RoadTile
                    key = {tileId}
                    tileId = {tileId}
                    playersOnTile = {building.tiles[tileId].players}
                />
            );
        });

        let buildingCardComp = this.getBuildingCard();

        let mapRoadTilesExtraCssClass = ``;
        if(showBuildingCard) {
            mapRoadTilesExtraCssClass = ` active`;
        }

        let ownerColorBar = this.getTeamColorBar();

        return (
            <div className={`map-tile-container ${placement}${sizeClass}`}>
                <img
                    src={this.requestMapImage(building.img)}
                />
                <div
                    className={`map-road-tiles-container`}
                    onMouseEnter={(e) => this.showCard(e)}
                    onMouseLeave={this.closeCard}
                >
                    <div
                        className={`map-road-tiles${mapRoadTilesExtraCssClass}`}
                    >
                        {roadTiles}
                    </div>

                    {ownerColorBar}

                    {buildingCardComp}
                </div>
            </div>
        );
    }

}

export default Building;

Building.propTypes = {
  accessibleBuilding: PropTypes.any.isRequired,
  building: PropTypes.any.isRequired,
  buildingKey: PropTypes.any.isRequired,
  getBuildingFromTile: PropTypes.any.isRequired,
  getPlayerInfo: PropTypes.any.isRequired,
  placement: PropTypes.any.isRequired,
  socket: PropTypes.any.isRequired,
  updateTileComp: PropTypes.any.isRequired,
  user: PropTypes.any.isRequired
}