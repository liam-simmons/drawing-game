import React from "react";
import {
  sendDrawInfo,
  subscribeToDrawing,
  subscribeToTurns,
  subscribeToResetCanvas
} from "./../api";
import Toolbar from "./Toolbar";
class Canvas extends React.Component {
  constructor(props) {
    super();

    this.state = {
      width: props.width,
      height: props.height,
      turn: false,
      ratio: 1,

      radius: 10,
      colour: "#FF0000"
    };

    //this.onKeyDown = this.onKeyDown.bind(this);

    subscribeToDrawing(data => {
      const { x, y, lastX, lastY, colour, radius } = data;
      this.drawCircle(x, y, lastX, lastY, colour, radius);
    });

    subscribeToResetCanvas(() => {
      this.resetCanvas();
    });

    subscribeToTurns(data => {
      this.setState({ turn: data.turn });
    });
  }

  componentDidMount() {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");
    canvas.addEventListener("mousedown", this.onMouseDown, false);
    window.addEventListener("mouseup", this.onMouseUp, false);
    //canvas.addEventListener("keydown", this.onKeyDown, false);

    this.setState({ ctx });
    this.resetCanvas();

    const ratio = canvas.clientWidth / canvas.width;

    this.setState({ ratio });
  }

  //change this to from the state?
  resetCanvas = () => {
    const canvas = this.refs.canvas;
    canvas.style.height = "auto";
    canvas.style.width = "100%";

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, this.state.width, this.state.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, this.state.width, this.state.height);
  };

  onMouseDown = e => {
    e.preventDefault();
    if (this.state.turn && !this.state.actionLoop) {
      this.setState({
        actionLoop: setInterval(this.paint, 16)
      });
    }
  };

  onMouseUp = e => {
    clearInterval(this.state.actionLoop);
    this.setState({ actionLoop: null, lastX: null, lastY: null });
  };

  onMouseMove = e => {
    this.setState({
      x: e.nativeEvent.offsetX / this.state.ratio,
      y: e.nativeEvent.offsetY / this.state.ratio
    });
  };

  paint = () => {
    const { x, y, lastX, lastY, colour, radius } = this.state;

    this.drawCircle(x, y, lastX, lastY, colour, radius);
    sendDrawInfo(x, y, lastX, lastY, colour, radius);

    this.setState({ lastX: x, lastY: y });
  };

  drawCircle = (x, y, lastX, lastY, colour, radius) => {
    const { ctx } = this.state;

    //drawing the circle
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

    //line between shit
    if (lastX) {
      const alpha = Math.atan((lastY - y) / (lastX - x));
      const beta = Math.PI / 2 - alpha;
      const cosb = radius * Math.cos(beta);
      const sinb = radius * Math.sin(beta);

      ctx.beginPath();
      ctx.moveTo(x - cosb, y + sinb);
      ctx.lineTo(lastX - cosb, lastY + sinb);
      ctx.lineTo(lastX + cosb, lastY - sinb);
      ctx.lineTo(x + cosb, y - sinb);
      ctx.closePath();
      ctx.fill();
    }
  };

  setColour = colour => {
    this.setState({ colour });
  };

  setSize = radius => {
    this.setState({ radius });
  };

  onClick = e => {}; //idk why its needed?

  handleBarChange = e => {
    //seems quite messy to me :/
    let hex = parseInt(e.target.value).toString(16);
    if (hex.length === 1) hex = "0" + hex;

    if (e.target.name === "red") {
      let newColour = `#${hex + this.state.colour.slice(3, 7)}`;
      this.setState({ colour: newColour });
    } else if (e.target.name === "green") {
      let newColour = `#${this.state.colour.slice(1, 3) +
        hex +
        this.state.colour.slice(5, 7)}`;
      this.setState({ colour: newColour });
    } else if (e.target.name === "blue") {
      let newColour = `#${this.state.colour.slice(1, 5) + hex}`;
      this.setState({ colour: newColour });
    }
  }; //should make a separate hex converter?

  render() {
    const { width, height } = this.state;

    return (
      <div>
        <div className="float-none">
          <canvas
            ref="canvas"
            onClick={e => this.onClick(e)}
            onMouseMove={this.onMouseMove}
            width={width}
            height={height}
            clientWidth={100}
          />
        </div>

        <div className="float-none">
          <Toolbar
            setSize={this.setSize}
            setColour={this.setColour}
            resetCanvas={this.resetCanvas}
            turn={this.state.turn}
          />
        </div>
      </div>
    );
  }
}

export default Canvas;
