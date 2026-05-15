import React from "react";

import { subscribeToTimer } from "./../api";

class Timer extends React.Component {
  state = {
    time: 0
  };

  constructor() {
    super();

    subscribeToTimer(data => {
      this.setState({ time: data.time });
    });
  }

  render() {
    return (
      <div
        style={{
          backgroundColor: "#eeeeee",
          float: "right",
          width: "80%",
          marginTop: "2vh"
        }}
      >
        Time left: {this.state.time}
      </div>
    );
  }
}

export default Timer;
