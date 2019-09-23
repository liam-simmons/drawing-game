import React from "react";
import { subscribeToChat, sendChatMessage } from "./../api";

import MessageBox from "./MessageBox";

class Chatroom extends React.Component {
  constructor(props) {
    super();

    this.state = {
      messages: [],
      chatBox: "",
      scrollDown: true
    };

    subscribeToChat(this.handleReceivedMessage);
  }

  componentWillUpdate() {}

  componentDidUpdate() {
    const test = this.updateScrollDownValue();
    if (test) this.scrollToBottom();
  }

  handleReceivedMessage = data => {
    switch (data.type) {
      case "message": {
        this.setState(prevState => {
          const messages = [
            ...prevState.messages,
            {
              username: data.username + ":",
              message: data.message,
              id: data.id
            }
          ];
          return { ...prevState, messages };
        });
        break;
      }
      case "leaverMessage": {
        this.setState(prevState => {
          const messages = [
            ...prevState.messages,
            { message: `${data.username} has left`, id: data.id }
          ];
          return { ...prevState, messages };
        });
        break;
      }
      case "joinerMessage": {
        this.setState(prevState => {
          const messages = [
            ...prevState.messages,
            { message: `${data.username} has connected  `, id: data.id }
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
      this.setState({ chatBox: "" });
      sendChatMessage(this.state.username, this.state.chatBox);
    }
  };

  onEnterPress = e => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault();
      this.onSubmit();
    }
  };

  scrollToBottom = () => {
    const chatroom = this.refs.chatroom;
    chatroom.scrollTop = chatroom.scrollHeight;
  };

  updateScrollDownValue = () => {
    const chatroom = this.refs.chatroom;
    const chatMessageLength = chatroom.firstChild.lastChild
      ? chatroom.firstChild.lastChild.clientHeight
      : 0;
    const scrolledDown =
      chatroom.scrollTop + chatroom.clientHeight + 1 + chatMessageLength >=
      chatroom.scrollHeight;

    if (scrolledDown != this.state.scrollDown) {
      this.setState({
        scrollDown: scrolledDown
      });
    }
    return scrolledDown;
  };

  render() {
    const { chatBox } = this.state;

    return (
      <div
        style={{
          width: "100%",
          height: "38vw"
        }}
      >
        <div
          style={{
            overflowY: "scroll",
            backgroundColor: "#FFFFFF",
            height: "95%",
            width: "80%"
          }}
          ref="chatroom"
        >
          <MessageBox
            updateScrollDownValue={this.updateScrollDownValue}
            scrollToBottom={this.scrollToBottom}
            scrollDown={this.state.scrollDown}
            messages={this.state.messages}
          />
        </div>
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
