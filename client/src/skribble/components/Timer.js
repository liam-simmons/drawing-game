import React from "react";

import { subscribeToTimer, subscribeToTurns } from "./../api";

class Timer extends React.Component {
  state = {
    time: 0,
    on: false
  };

  constructor() {
    super();

    subscribeToTimer(data => {
      this.setState({ time: data.time });
    });

    subscribeToTurns(data => {
      if (data.turn >= 0) this.setState({ on: true });
      else this.setState({ on: false });
    });
  }

  componentDidMount() {
    this.interval = setInterval(
      () =>
        this.setState(prevState => {
          const state = { ...prevState };
          if (state.time > 0 && state.on) state.time--;
          return state;
        }),
      1000
    );
  }
  componentWillUnmount() {
    clearInterval(this.interval);
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
