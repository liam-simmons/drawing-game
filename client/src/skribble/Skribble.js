import React from "react";
import { Row, Col } from "react-bootstrap";
import Chatroom from "./components/Chatroom";
import Canvas from "./components/Canvas";
import PlayerList from "./components/PlayerList";
import Word from "./components/Word";
import Join from "./components/Join";
import { sendName } from "./api";

document.body.style = "background: #152234;";

class Skribble extends React.Component {
  constructor() {
    super();

    this.state = {
      name: ""
    };
  }

  setName = nom => {
    this.setState({ name: nom });
    sendName(nom);
  };

  render() {
    return (
      <div className="App">
        {this.state.name ? (
          <div>
            <Word />
            <Row>
              <Col xs={2}>
                <PlayerList />
              </Col>
              <Col xs={7}>
                <Canvas width={this.props.width} height={this.props.height} />
              </Col>
              <Col xs={3}>
                <Chatroom />
              </Col>
            </Row>
          </div>
        ) : (
          <Join setName={this.setName} />
        )}
      </div>
    );
  }
}

export default Skribble;
