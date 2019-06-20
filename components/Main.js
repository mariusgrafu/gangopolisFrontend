import React from "react";
import {BrowserRouter as Router, Route, Switch, Link, Redirect} from "react-router-dom";
import Roomlist from './Roomlist/Roomlist';
import MainWf from "./wireframe/MainWf/MainWf"
import UserList from './UserList/UserList';
import LandingPage from './LandingPage/LandingPage';
import DefaultLandingPage from './LandingPage/DefaultLandingPage';
import $ from 'jquery';

import RoomPage from './RoomPage/RoomPage';

import Login from './Login/Login';

import User from '../clientClasses/User';

// css style
import "./main.scss"

//TODO: detect browser and load only relevant font type
import '../assets/iconfont/gangicon.scss'
import '../assets/iconfont/gangicon.ttf'
import '../assets/iconfont/gangicon.eot'
import '../assets/iconfont/gangicon.woff'
import RoomPlayerList from "./RoomPage/RoomPlayerList/RoomPlayerList";
import InvitePage from "./InvitePage/InvitePage";
import Favicon from "react-favicon";
import GamePage from "./GamePage/GamePage";

class Main extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            currentPage : null, // key of the current page the client is on
            user : new User()
        }
    }

    emit = (string) => {
        let {socket} = this.props;
        socket.emit("test", string);
    };

    updateUser = () => {
        const {user} = this.state;
        this.setState({user});
    }

    pingServer = () => {
        console.log(`ping the server`);
        const {socket} = this.props;
        const {user} = this.state;

        let data = {
            userCredentials : user.getCredentials()
        }

        socket.emit(`web | update socket`, data);
    }

    componentDidMount () {
        let {socket} = this.props;
        let {user} = this.state;
        user.update = this.updateUser;
        user.socket = socket;

        user.initData();
        this.setState({user});

        let tooltipTimeout = null;

        $(document).on('mouseover', '[tooltip]', function () {

            $(".tooltip-helper").remove();

            clearTimeout(tooltipTimeout);

            let tooltipContent = $(this).attr('tooltip');
            if(!$.trim(tooltipContent).length) return;
            let top = $(this).offset().top;
            let left = $(this).offset().left + $(this).outerWidth()/2;

            $("#root").prepend(`
                <div class="tooltip-helper" style="top: ${top}px; left: ${left}px">
                    ${tooltipContent}
                </div>
            `);

            tooltipTimeout = setTimeout(() => {
                $(".tooltip-helper").remove();
            }, 1000);
        });

        $(document).on('mouseout', '[tooltip]', () => {
            clearTimeout(tooltipTimeout);
            $(".tooltip-helper").remove();
        });

        socket.on(`web | ping user ${user.id}`, this.pingServer);
    }

    componentWillUnmount() {
        $(document).off('mouseover', '[tooltip]');
        $(document).off('mouseleave', '[tooltip]');

        const {socket} = this.props;
        const {user} = this.state;

        socket.off(`web | ping user ${user.id}`);
    }

    /**
     * Sets the currentPage state
     * @param currentPage {String|null}
     */
    setCurrentPage = (currentPage = null) => {
        this.setState({currentPage});
    }

    render(){
        let {socket} = this.props;
        const {user, currentPage} = this.state;

        if(!user._ready) return (<></>);

        let SwitchComp = (<></>);

        if (user.isLogged()) {
            SwitchComp = (
                <Switch>

                    <Route exact path={"/"}>
                        <DefaultLandingPage
                            pageKey={'home'}
                            setCurrentPage = {this.setCurrentPage}
                        />
                    </Route>

                    <Route path={"/room/:roomid"} render={
                        (props) => <RoomPage
                            key={`${props.match.params.roomid}-${user.roomid}`}
                            socket={socket}
                            user={user}
                            roomid={props.match.params.roomid}
                            pageKey={'room'}
                            setCurrentPage = {this.setCurrentPage}
                        />
                    } />

                    <Route path={"/invite/:roomid/:accesCode"} render={
                        (props) => <InvitePage
                            key={`${props.match.params.roomid}-${props.match.params.accesCode}`}
                            socket={socket}
                            user={user}
                            roomid={props.match.params.roomid}
                            accessCode={props.match.params.accesCode}
                            pageKey={'invite'}
                            setCurrentPage = {this.setCurrentPage}
                        />
                    } />

                    <Route path={"/users"}>
                        <UserList
                            pageKey={'users'}
                            socket={socket}
                            setCurrentPage = {this.setCurrentPage}
                        />
                    </Route>

                    <Route path={"/rooms"}>
                        <Roomlist
                            pageKey={'rooms'}
                            socket = {socket}
                            setCurrentPage = {this.setCurrentPage}
                        />
                    </Route>

                    <Route path={"/game"}>
                        <GamePage
                            pageKey={'game'}
                            setCurrentPage = {this.setCurrentPage}
                            socket={socket}
                            user={user}
                        />
                    </Route>

                    <Route>
                        <Redirect to="/" />
                    </Route>

                </Switch>
            );
        } else {
            SwitchComp = (
                <Switch>
                <Route>
                    <Login socket={socket} user={user} />
                </Route>
                {/*<Route>*/}
                {/*    <Redirect to="/login" />*/}
                {/*</Route>*/}
                </Switch>
            );
        }

        return(
            <>
                <Favicon url={require(`../imgs/misc/favicon.png`)} />
                <Router>
                        <Switch>
                            <Route path={"/dev"}>
                                <MainWf socket={socket}/>
                            </Route>
                            <LandingPage
                                key={`${user.id}`}
                                socket={socket}
                                user={user}
                                currentPage={currentPage}
                            >
                            {SwitchComp}
                            </LandingPage>
                        </Switch>
                </Router>
            </>
        )
    }
}

export default Main;