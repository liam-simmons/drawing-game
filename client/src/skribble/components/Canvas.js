import React from "react";
import {
  sendDrawInfo,
  sendFillInfo,
  subscribeToDrawing,
  subscribeToFilling,
  subscribeToTurns,
  subscribeToResetCanvas
} from "./../api";
import Toolbar from "./Toolbar";
import { timingSafeEqual } from "crypto";
class Canvas extends React.Component {
  constructor(props) {
    super();

    this.state = {
      width: props.width,
      height: props.height,
      turn: false,
      ratio: 1,

      radius: 10,
      colour: "#FF0000",
      tool: "brush"
    };

    //this.onKeyDown = this.onKeyDown.bind(this);

    subscribeToDrawing(data => {
      const { x, y, lastX, lastY, colour, radius } = data;
      this.drawCircle(x, y, lastX, lastY, colour, radius);
    });

    subscribeToFilling(data => {
      const { x, y, colour } = data;
      this.fill(x, y, colour);
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
      if (this.state.tool === "brush") {
        this.setState({
          actionLoop: setInterval(this.paint, 16)
        });
      } else if (this.state.tool === "bucket") {
        this.clientFill();
      }
    }
  };

  onMouseUp = e => {
    clearInterval(this.state.actionLoop);
    this.setState({ actionLoop: null, lastX: null, lastY: null });
  };

  onMouseMove = e => {
    this.setState({
      //round rather than floor maybe?
      x: Math.floor(e.nativeEvent.offsetX / this.state.ratio),
      y: Math.floor(e.nativeEvent.offsetY / this.state.ratio)
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

  clientFill = () => {
    const { x, y } = this.state;
    //const fillColour = this.state.colour;
    const fillColour = [0, 0, 0, 255];
    sendFillInfo(x, y, fillColour);
    this.fill(x, y, fillColour);
  };

  fill = (x, y, fillColour) => {
    const ctx = this.refs.canvas.getContext("2d");

    //const targetColour = ctx.getImageData(x, y, 1, 1).data;
    const targetColour = [255, 255, 255, 255];

    let canvasData = ctx.getImageData(
      0,
      0,
      this.state.width,
      this.state.height
    );
    const pixelsToCheck = [{ x, y }];
    const pixelsChecked = [];
    pixelsChecked[x + this.state.width * y] = true;

    //let temp = 0;
    while (pixelsToCheck.length > 0) {
      //temp++;
      const dogman = pixelsToCheck.length;
      for (let i = 0; i < dogman; i++) {
        //console.log("pixelsToCheck", [...pixelsToCheck]);

        if (
          this.checkPixelColour(
            targetColour,
            pixelsToCheck[0].x,
            pixelsToCheck[0].y,
            canvasData.data
          )
        ) {
          this.setPixelColour(
            canvasData.data,
            pixelsToCheck[0].x,
            pixelsToCheck[0].y,
            fillColour
          );
          this.addSurroundingPixels(pixelsToCheck, pixelsChecked);
        }
        pixelsToCheck.splice(0, 1);
      }

      //if (temp > 1000) break;
    }
    console.log("canvasData", canvasData);
    ctx.putImageData(canvasData, 0, 0);
  };

  setPixelColour(canvasData, x, y, colour) {
    const id = 4 * (x + y * this.state.width);
    //if (id < 0 || id + 2 >= canvasData.length) return false;
    canvasData[id] = colour[0];
    canvasData[id + 1] = colour[1];
    canvasData[id + 2] = colour[2];
  }

  checkPixelColour = (targetColour, x, y, canvasData) => {
    //returns true if colours are the same
    const id = 4 * (x + y * this.state.width);
    //if (id < 0 || id + 2 >= canvasData.length) return false;
    return (
      canvasData[id] === targetColour[0] &&
      canvasData[id + 1] === targetColour[1] &&
      canvasData[id + 2] === targetColour[2]
    );
  };

  addSurroundingPixels = (pixelsToCheck, pixelsChecked) => {
    const x = pixelsToCheck[0].x,
      y = pixelsToCheck[0].y;

    if (!pixelsChecked[x + 1 + y * this.state.width] && x < this.state.width) {
      pixelsToCheck.push({
        x: x + 1,
        y: y
      });
      pixelsChecked[x + 1 + y * this.state.width] = true;
    }
    if (
      !pixelsChecked[x + (y + 1) * this.state.width] &&
      y < this.state.height
    ) {
      pixelsToCheck.push({
        x: x,
        y: y + 1
      });
      pixelsChecked[x + (y + 1) * this.state.width] = true;
    }
    if (!pixelsChecked[x - 1 + y * this.state.width] && x !== 0) {
      pixelsToCheck.push({
        x: x - 1,
        y: y
      });
      pixelsChecked[x - 1 + y * this.state.width] = true;
    }
    if (!pixelsChecked[x + (y - 1) * this.state.width] && y !== 0) {
      pixelsToCheck.push({
        x: x,
        y: y - 1
      });
      pixelsChecked[x + (y - 1) * this.state.width] = true;
    }
    //return canvasData;
  };

  setColour = colour => {
    this.setState({ colour });
  };

  setSize = radius => {
    this.setState({ radius });
  };

  setTool = tool => {
    this.setState({ tool });
  };

  //onClick = e => {}; //idk why its needed?

  //i dont know what this is for:
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
            //onClick={e => this.onClick(e)}
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
            setTool={this.setTool}
            resetCanvas={this.resetCanvas}
            turn={this.state.turn}
          />
        </div>
      </div>
    );
  }
}

export default Canvas;
