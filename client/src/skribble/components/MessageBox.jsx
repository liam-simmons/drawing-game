import React from "react";
import { ListGroup } from "react-bootstrap";

class MessageBox extends React.Component {
  render() {
    return (
      <ListGroup variant="flush">
        {this.props.messages.map(message => (
          <ListGroup.Item key={message.id}>
            <strong>{message.username}</strong> {message.message}
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  }
}

export default MessageBox;
