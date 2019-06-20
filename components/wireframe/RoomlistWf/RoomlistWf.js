import React from "react"
import "./RoomlistWf.scss"
import shortid from 'shortid'

class RoomlistWf extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            roomlist: {},
            selectedRoom: ""
        }
    }

    refreshRoomlist = (roomlist) => {
        let {socket} = this.props;
        if(roomlist === undefined) {
            socket.emit("debug | get roomlist > sv", this.updateRoomlist);
        } else {
            this.updateRoomlist(roomlist);
        }

    };

    deleteRoom = (roomid) => {
        let {socket} = this.props;
        socket.emit("debug | delete room > sv", {roomid});
    };

    updateRoomlist = (roomlist) => {
        //validation
        this.setState({roomlist});
    };

    componentDidMount() {
        this.refreshRoomlist();
        let {socket} = this.props;
        socket.on("debug | refresh roomlist > cl", this.refreshRoomlist);
    }

    render(){

        let roomHTML = [];

        let {roomlist} = this.state;
        let {selectRoom, selectedRoom, deselectRoom} = this.props;

        let i = 1;
        for(let roomid in roomlist){

            let roomUserlistHTML = [];

            roomlist[roomid].userlist.map((el) => {
                roomUserlistHTML.push(
                    <div key={`div-${shortid.generate()}`} className="wf-room-item-user-item">
                        {el}
                    </div>
                )
            });

            let classname = "wf-room-item";
            if(roomid === selectedRoom) classname += " selected";

            roomHTML.push(
                <div key={`div-${shortid.generate()}`} className={classname}>
                    <div className="wf-room-item-id-users"  onClick={() => {selectRoom(roomid)}}>
                        {i++}. {roomlist[roomid].roomname} {`(${roomlist[roomid].userlist.length}/5)`}
                        <div className="wf-room-item-users">
                            {roomUserlistHTML}
                        </div>
                    </div>
                    <div className="wf-room-item-controls">
                        <div
                            className="wf-button"
                            onClick={() => {
                                this.deleteRoom(roomid);
                                deselectRoom();
                                }
                            }
                        >
                            Delete
                        </div>
                    </div>
                </div>
            );

        }

        return (
            <div className="wf-roomlist">
                <div className="wf-roomlist-title">
                    <span>Rooms</span>
                </div>
                <div className="wf-roomlist-items">
                    {roomHTML}
                </div>
            </div>
        );
    }

}

export default RoomlistWf;