import React from "react";
import CircleButton from "./buttons/CircleButton";
import IconButton from "./buttons/IconButton";
import { sendResetCanvas, sendUndo, sendRedo } from "../api";
import { Row } from "react-bootstrap";

import ResetImage from "../images/trash-solid.svg";
import BucketImage from "../images/fill-drip-solid.svg";
import BrushImage from "../images/paint-brush-solid.svg";
import UndoImage from "../images/undo-solid.svg";
import RedoImage from "../images/redo-solid.svg";

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
            colourRGB: [0, 0, 0],
            selected: true,
            size: 50,
            clientSize: 50,
            clientRadius: 10
          },
          {
            id: 1,
            radius: 10,
            colour: "#FF0000",
            colourRGB: [255, 0, 0],
            selected: false,
            size: 50,
            clientSize: 50,
            clientRadius: 10
          },
          {
            id: 2,
            radius: 10,
            colour: "#00FF00",
            colourRGB: [0, 255, 0],
            selected: false,
            size: 50,
            clientSize: 50,
            clientRadius: 10
          },
          {
            id: 3,
            radius: 10,
            colour: "#0000FF",
            colourRGB: [0, 0, 255],
            selected: false,
            size: 50,
            clientSize: 50,
            clientRadius: 10
          },
          {
            id: 4,
            radius: 10,
            colour: "#FFFF00",
            colourRGB: [255, 255, 0],
            selected: false,
            size: 50,
            clientSize: 50,
            clientRadius: 10
          },
          {
            id: 5,
            radius: 10,
            colour: "#FF00FF",
            colourRGB: [255, 0, 255],
            selected: false,
            size: 50,
            clientSize: 50,
            clientRadius: 10
          },
          {
            id: 6,
            radius: 10,
            colour: "#00FFFF",
            colourRGB: [0, 255, 255],
            selected: false,
            size: 50,
            clientSize: 50,
            clientRadius: 10
          },
          {
            id: 7,
            radius: 10,
            colour: "#FFFFFF",
            colourRGB: [255, 255, 255],
            toolbarColour: "#EEEEEE",
            selected: false,
            size: 50,
            clientSize: 50,
            clientRadius: 10
          }
        ],
        tools: [
          {
            id: 0,
            selected: true,
            size: 50,
            image: BrushImage,
            imageSize: 20,
            clientSize: 50,
            clientImageSize: 20,
            name: "brush"
          },
          {
            id: 1,
            selected: false,
            size: 50,
            image: BucketImage,
            imageSize: 20,
            clientSize: 50,
            clientImageSize: 20,
            name: "bucket"
          }
        ],
        specials: [
          {
            id: 0,
            size: 50,
            imageSize: 20,
            clientSize: 50,
            clientImageSize: 20,
            image: ResetImage,
            function: () => {
              if (this.props.turn) {
                sendResetCanvas();
                this.props.resetCanvas();
              }
            }
          },
          {
            id: 1,
            size: 50,
            imageSize: 20,
            clientSize: 50,
            clientImageSize: 20,
            image: UndoImage,
            function: () => {
              if (this.props.turn) {
                sendUndo();
                this.props.undo();
              }
            }
          },
          {
            id: 2,
            size: 50,
            imageSize: 20,
            clientSize: 50,
            clientImageSize: 20,
            image: RedoImage,
            function: () => {
              if (this.props.turn) {
                sendRedo();
                this.props.redo();
              }
            }
          }
        ]
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

      for (let i = 0; i < state.buttons.tools.length; i++) {
        state.buttons.tools[i].clientSize = state.buttons.tools[i].size * ratio;
        state.buttons.tools[i].clientImageSize =
          state.buttons.tools[i].imageSize * ratio;
      }

      for (let i = 0; i < state.buttons.specials.length; i++) {
        state.buttons.specials[i].clientSize =
          state.buttons.specials[i].size * ratio;
        state.buttons.specials[i].clientImageSize =
          state.buttons.specials[i].imageSize * ratio;
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
    this.props.setColour(this.state.buttons.colours[num].colourRGB);
  }

  setSelectedTool(num) {
    console.log("setting");
    this.setState({ tool: num });
    this.setState(prevState => {
      const state = { ...prevState };
      for (let i = 0; i < state.buttons.tools.length; i++)
        state.buttons.tools[i].selected = false;
      state.buttons.tools[num].selected = true;
      return state;
    });
    this.props.setTool(this.state.buttons.tools[num].name);
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
                    colour={button.toolbarColour || button.colour}
                    selected={button.selected}
                    setActive={() => {
                      this.setSelectedColour(button.id);
                    }}
                  />
                ))}
              </div>

              <div
                style={{
                  width: "6vw",
                  display: "flex",
                  flexWrap: "wrap"
                }}
              >
                {buttons.tools.map(button => (
                  <IconButton
                    key={button.id}
                    width={button.clientSize}
                    height={button.clientSize}
                    image={button.image}
                    imageSize={button.clientImageSize}
                    selected={button.selected}
                    setActive={() => {
                      this.setSelectedTool(button.id);
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  width: "8vw",
                  display: "flex",
                  flexWrap: "wrap"
                }}
              >
                {buttons.specials.map(button => (
                  <IconButton
                    key={button.id}
                    width={button.clientSize}
                    height={button.clientSize}
                    image={button.image}
                    imageSize={button.clientImageSize}
                    setActive={() => {
                      button.function();
                    }}
                  />
                ))}
              </div>
            </Row>
          </div>
        ) : null}
      </div>
    );
  }
}

export default Toolbar;
