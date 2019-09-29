import React from "react";
import { ListGroup } from "react-bootstrap";
import { subscribeToPlayerList, subscribeToTurns } from "./../api";

class PlayerList extends React.Component {
  constructor() {
    super();

    this.state = {
      playerList: [],
      turnId: -1
    };

    subscribeToPlayerList(data => {
      this.handleData(data);
    });

    subscribeToTurns(data => {
      this.setState({ turnId: data.turn });
    }); //do i need this??? can't i just add this to the player list functions
  }

  handleData = data => {
    switch (data.type) {
      case "newTurn":
        console.log("RESETTING");
        this.setState(prevState => {
          const state = { ...prevState };
          for (let i = 0; i < state.playerList.length; i++)
            state.playerList[i].hasGuessed = false;
          return state;
        });
        break;
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
      case "playerGuessed":
        this.setState(prevState => {
          const state = { ...prevState };
          state.playerList[data.playerId].hasGuessed = true;
          return state;
        });
        break;
      default:
        break;
    }
  };

  render() {
    return (
      <ListGroup variant="flush" style={{ float: "right", width: "80%" }}>
        {this.state.playerList.map((player, i) => (
          <ListGroup.Item
            style={
              this.state.playerList[i].hasGuessed
                ? { backgroundColor: "#00FF00" }
                : { backgroundColor: "#FFFFFF" }
            }
          >
            <strong>{player.username}</strong> (ID: {player.id}){" - "}
            <strong>
              {this.state.playerList[i].id === this.state.turnId &&
                "Currently drawing"}
            </strong>
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  }
}

export default PlayerList;
