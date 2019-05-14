import React from "react";
import CircleButton from "./buttons/CircleButton";
import ResetButton from "./buttons/ResetButton";
import { sendResetCanvas } from "../api";
import { Row } from "react-bootstrap";

class Toolbar extends React.Component {
  constructor() {
    super();

    this.state = {
      size: 0,
      colour: 0,
      tool: 0,

      buttons: {
        sizes: [
          {
            id: 0,
            radius: 2,
            colour: "#F00",
            selected: false,
            size: 50,
            clientSize: 50,
            clientRadius: 2
          },
          {
            id: 1,
            radius: 5,
            colour: "#F00",
            selected: true,
            size: 50,
            clientSize: 50,
            clientRadius: 5
          },
          {
            id: 2,
            radius: 10,
            colour: "#F00",
            selected: false,
            size: 50,
            clientSize: 50,
            clientRadius: 10
          },
          {
            id: 3,
            radius: 20,
            colour: "#F00",
            selected: false,
            size: 50,
            clientSize: 50,
            clientRadius: 20
          }
        ],
        colours: [
          {
            id: 0,
            radius: 10,
            colour: "#000",
            selected: true,
            size: 50,
            clientSize: 50,
            clientRadius: 10
          },
          {
            id: 1,
            radius: 10,
            colour: "#FF0000",
            selected: false,
            size: 50,
            clientSize: 50,
            clientRadius: 10
          },
          {
            id: 2,
            radius: 10,
            colour: "#00FF00",
            selected: false,
            size: 50,
            clientSize: 50,
            clientRadius: 10
          },
          {
            id: 3,
            radius: 10,
            colour: "#0000FF",
            selected: false,
            size: 50,
            clientSize: 50,
            clientRadius: 10
          },
          {
            id: 4,
            radius: 10,
            colour: "#FFFF00",
            selected: false,
            size: 50,
            clientSize: 50,
            clientRadius: 10
          },
          {
            id: 5,
            radius: 10,
            colour: "#FF00FF",
            selected: false,
            size: 50,
            clientSize: 50,
            clientRadius: 10
          },
          {
            id: 6,
            radius: 10,
            colour: "#00FFFF",
            selected: false,
            size: 50,
            clientSize: 50,
            clientRadius: 10
          }
        ],
        tools: [{}]
      }
    };
  }

  componentDidMount = function() {
    this.setClientSizes();
    window.addEventListener("resize", this.setClientSizes);
  };
  componentWillUnmount = function() {
    window.removeEventListener("resize", this.setClientSizes);
  };

  setClientSizes = () => {
    const ratio = window.innerWidth / 1920;
    this.setState(prevState => {
      const state = { ...prevState };
      for (let i = 0; i < state.buttons.sizes.length; i++) {
        state.buttons.sizes[i].clientSize = state.buttons.sizes[i].size * ratio;
        state.buttons.sizes[i].clientRadius =
          state.buttons.sizes[i].radius * ratio;
      }
      for (let i = 0; i < state.buttons.colours.length; i++) {
        state.buttons.colours[i].clientSize =
          state.buttons.colours[i].size * ratio;
        state.buttons.colours[i].clientRadius =
          state.buttons.colours[i].radius * ratio;
      }

      return state;
    });
  };

  setSelectedSize(num) {
    this.setState(prevState => {
      const state = { ...prevState };
      for (let i = 0; i < state.buttons.sizes.length; i++)
        state.buttons.sizes[i].selected = false;
      state.buttons.sizes[num].selected = true;
      return state;
    });
    //send it up the chain to go to canvas
    this.props.setSize(this.state.buttons.sizes[num].radius);
  }

  setSelectedColour(num) {
    this.setState({ colour: num });
    this.setState(prevState => {
      const state = { ...prevState };
      for (let i = 0; i < state.buttons.colours.length; i++)
        state.buttons.colours[i].selected = false;
      state.buttons.colours[num].selected = true;
      return state;
    });
    this.props.setColour(this.state.buttons.colours[num].colour);
  }

  setSelectedTool(num) {
    this.setState({ tool: num });
  }

  render() {
    const styles = {
      height: "5.20833333333vw",
      backgroundColor: "#DDDDDD"
    };

    const { buttons } = this.state;

    return (
      <div style={styles}>
        {this.props.turn ? (
          <div>
            <Row>
              <div
                style={{
                  width: "12vw",
                  height: "4vw",
                  marginLeft: "4vw",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}
              >
                <div style={{ display: "flex" }}>
                  {buttons.sizes.map(button => (
                    <CircleButton
                      key={button.id}
                      width={button.clientSize}
                      height={button.clientSize}
                      radius={button.clientRadius}
                      colour={button.colour}
                      selected={button.selected}
                      setActive={() => {
                        this.setSelectedSize(button.id);
                      }}
                    />
                  ))}
                </div>
              </div>
              <div
                style={{
                  width: "12vw",
                  display: "flex",
                  flexWrap: "wrap"
                }}
              >
                {buttons.colours.map(button => (
                  <CircleButton
                    key={button.id}
                    width={button.clientSize}
                    height={button.clientSize}
                    radius={button.clientRadius}
                    colour={button.colour}
                    selected={button.selected}
                    setActive={() => {
                      this.setSelectedColour(button.id);
                    }}
                  />
                ))}
              </div>

              {/*<ResetButton
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
              />*/}
            </Row>
          </div>
        ) : null}
      </div>
    );
  }
}

export default Toolbar;
