import React from "react";
import CircleButton from "./buttons/CircleButton";
import ResetButton from "./buttons/ResetButton";
import { sendResetCanvas } from "../api";
import { truncate } from "fs";

class Toolbar extends React.Component {
  constructor() {
    super();

    this.state = {
      size: 0,
      colour: 0,
      tool: 0
    };
  }
  setSelectedSize(num) {
    this.setState({ size: num });
  }

  setSelectedColour(num) {
    this.setState({ colour: num });
  }

  setSelectedTool(num) {
    this.setState({ tool: num });
  }

  render() {
    const styles = {
      height: "100px",
      backgroundColor: "#DDDDDD",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    };

    return (
      <div style={styles}>
        {this.props.turn ? (
          <div>
            <CircleButton
              width={50}
              height={50}
              radius={2}
              colour="#095068"
              selected={this.state.size === 0}
              setActive={() => {
                this.setSelectedSize(0);
                this.props.setSize(2);
              }}
            />
            <CircleButton
              width={50}
              height={50}
              radius={5}
              colour="#095068"
              selected={this.state.size === 1}
              setActive={() => {
                this.setSelectedSize(1);
                this.props.setSize(5);
              }}
            />
            <CircleButton
              width={50}
              height={50}
              radius={10}
              colour="#095068"
              selected={this.state.size === 2}
              setActive={() => {
                this.setSelectedSize(2);
                this.props.setSize(10);
              }}
            />
            <CircleButton
              width={50}
              height={50}
              radius={20}
              colour="#095068"
              selected={this.state.size === 3}
              setActive={() => {
                this.setSelectedSize(3);
                this.props.setSize(20);
              }}
            />

            <CircleButton
              width={50}
              height={50}
              radius={10}
              colour="#FF0000"
              selected={this.state.colour === 0}
              setActive={() => {
                this.setSelectedColour(0);
                this.props.setColour("#FF0000");
              }}
            />

            <CircleButton
              width={50}
              height={50}
              radius={10}
              colour="#00FF00"
              selected={this.state.colour === 1}
              setActive={() => {
                this.setSelectedColour(1);
                this.props.setColour("#00FF00");
              }}
            />

            <CircleButton
              width={50}
              height={50}
              radius={10}
              colour="#0000FF"
              selected={this.state.colour === 2}
              setActive={() => {
                this.setSelectedColour(2);
                this.props.setColour("#0000FF");
              }}
            />
            <CircleButton
              width={50}
              height={50}
              radius={10}
              colour="#FFFF00"
              selected={this.state.colour === 3}
              setActive={() => {
                this.setSelectedColour(3);
                this.props.setColour("#FFFF00");
              }}
            />
            <CircleButton
              width={50}
              height={50}
              radius={10}
              colour="#FF00FF"
              selected={this.state.colour === 4}
              setActive={() => {
                this.setSelectedColour(4);
                this.props.setColour("#FF00FF");
              }}
            />
            <CircleButton
              width={50}
              height={50}
              radius={10}
              colour="#00FFFF"
              selected={this.state.colour === 5}
              setActive={() => {
                this.setSelectedColour(5);
                this.props.setColour("#00FFFF");
              }}
            />
            <CircleButton
              width={50}
              height={50}
              radius={10}
              colour="#111111"
              selected={this.state.colour === 6}
              setActive={() => {
                this.setSelectedColour(6);
                this.props.setColour("#000000");
              }}
            />
            <CircleButton
              width={50}
              height={50}
              radius={10}
              colour="#EEEEEE"
              selected={this.state.colour === 2}
              setActive={() => {
                this.setSelectedColour(2);
                this.props.setColour("#FFFFFF");
              }}
            />

            <ResetButton
              width={50}
              height={50}
              radius={10}
              colour="#0000FF"
              setActive={() => {
                if (this.props.turn) {
                  sendResetCanvas();
                  this.props.resetCanvas();
                }
              }}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

export default Toolbar;
