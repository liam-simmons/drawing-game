import React from "react";
import { subscribeToWords } from "./../api";

class Word extends React.Component {
  constructor(props) {
    super();

    this.state = {
      word: "Waiting for players..."
    };

    subscribeToWords(data => {
      this.setState({ word: data });
    });
  }

  render() {
    const styles = {
      textAlign: "center",
      color: "#FFFFFF",
      letterSpacing: "5px"
    };
    return (
      <div style={styles}>
        <h1>{this.state.word}</h1>
      </div>
    );
  }
}

export default Word;
