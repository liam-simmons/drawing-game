import React from "react";
import { ListGroup } from "react-bootstrap";
import { subscribeToPlayerList } from "./../api";

class PlayerList extends React.Component {
  constructor() {
    super();

    this.state = {
      playerList: []
    };

    subscribeToPlayerList(data => {
      this.handleData(data);
    });
  }

  handleData = data => {
    switch (data.type) {
      case "playerJoin":
        this.setState(prevState => ({
          ...prevState,
          playerList: [
            ...prevState.playerList,
            { username: data.username, id: data.id }
          ]
        }));
        break;
      case "playerLeave":
        this.setState(prevState => {
          const playerList = prevState.playerList.filter(i => i.id !== data.id);
          return { ...prevState, playerList };
        });
        break;
      case "playerList":
        this.setState({ playerList: data.list });
        break;
      default:
        break;
    }
  };

  render() {
    console.log(this.state.playerList);
    return (
      <ListGroup variant="flush" style={{ float: "right", width: "80%" }}>
        {this.state.playerList.map(player => (
          <ListGroup.Item>
            <strong>{player.username}</strong> - {player.id}
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  }
}

export default PlayerList;
