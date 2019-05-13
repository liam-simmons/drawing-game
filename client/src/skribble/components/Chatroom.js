import React from "react";
import { ListGroup, Form } from "react-bootstrap";
import { subscribeToChat, sendChatMessage } from "./../api";

class Chatroom extends React.Component {
  constructor(props) {
    super();

    this.state = {
      messages: [],
      chatBox: ""
    };

    subscribeToChat(this.handleReceivedMessage);
  }

  handleReceivedMessage = data => {
    switch (data.type) {
      case "message": {
        this.setState(prevState => {
          const messages = [
            ...prevState.messages,
            { username: data.username, message: data.message }
          ];
          return { ...prevState, messages };
        });
        break;
      }
      case "leaverMessage": {
        this.setState(prevState => {
          const messages = [
            ...prevState.messages,
            { message: `${data.username} has left` }
          ];
          return { ...prevState, messages };
        });
        break;
      }
      case "joinerMessage": {
        this.setState(prevState => {
          const messages = [
            ...prevState.messages,
            { message: `${data.username} has connected  ` }
          ];
          return { ...prevState, messages };
        });
        break;
      }
      default:
        break;
    }
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSubmit = () => {
    if (this.state.chatBox) {
      console.log("sending " + this.state.chatBox);
      this.setState({ chatBox: "" });
      sendChatMessage(this.state.username, this.state.chatBox);
    }
  };

  onEnterPress = e => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault();
      console.log("hello");
      this.onSubmit();
    }
  };

  render() {
    const { chatBox } = this.state;

    return (
      <div style={{ width: "100%", height: "100%" }}>
        <ListGroup
          variant="flush"
          style={{
            backgroundColor: "#FFFFFF",
            height: "95%",
            width: "80%",
            overflow: "auto",
            overflowY: "scroll"
          }}
        >
          {this.state.messages.map(message => (
            <ListGroup.Item>
              <strong>{message.username}:</strong> {message.message}
            </ListGroup.Item>
          ))}
        </ListGroup>
        <input
          type="text"
          id="chatBox"
          name="chatBox"
          placeholder="Type a message here"
          onChange={this.handleChange}
          value={chatBox}
          style={{ width: "80%", height: "5%" }}
          onKeyDown={this.onEnterPress}
          autocomplete="off"
        />
      </div>
    );
  }
}

export default Chatroom;
