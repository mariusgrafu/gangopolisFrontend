import React from "react"
import "./UserlistWf.scss"
import shortid from 'shortid'

class UserlistWf extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            userlist: {},
            selectedUser: ""
        }

    }

    refreshUserlist = (userlist) => {
        let {socket} = this.props;
        if(userlist === undefined) {
            socket.emit("debug | get userlist > sv", this.updateUserlist);
        } else {
            this.updateUserlist(userlist);
        }

    };

    updateUserlist = (userlist) => {
        //validation
        this.setState({userlist});
    };

    componentDidMount() {
        this.refreshUserlist();
        let {socket} = this.props;
        socket.on("debug | refresh userlist > cl", this.refreshUserlist);
    }

    render() {

        let userHTML = [];

        let {userlist} = this.state;
        let {selectUser, selectedUser} = this.props;

        let i = 1;
        for(let userid in userlist){

            let classname = "wf-user-item";
            if(userid === selectedUser) classname += " selected";

            userHTML.push(
                <div key={`div-${shortid.generate()}`} className={classname} onClick={() => {selectUser(userid);}}>
                    {i++}. {userlist[userid].username} ({userlist[userid].userid})
                </div>
            );

        }

        return (
            <div className="wf-userlist">
                <div className="wf-userlist-title">
                    <span>Users</span>
                </div>
                <div className="wf-userlist-items">
                    {userHTML}
                </div>
            </div>
        );
    }

}

export default UserlistWf;