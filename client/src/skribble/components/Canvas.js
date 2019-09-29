import React from "react";
import {
  sendDrawInfo,
  sendFillInfo,
  subscribeToDrawing,
  subscribeToFilling,
  subscribeToTurns,
  subscribeToResetCanvas,
  subscribeToMyId
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
      colour: [0, 0, 0],
      tool: "brush",

      prevCanvasDatas: [],
      canvasDataIndex: 0,

      prevTest: [],
      testI: 0,

      myId: -1
    };

    //this.onKeyDown = this.onKeyDown.bind(this);

    subscribeToMyId(id => {
      this.setState({ myId: id });
    });

    subscribeToDrawing(data => {
      const { x, y, lastX, lastY, colour, radius } = data;
      this.drawCircle2(x, y, lastX, lastY, colour, radius);
    });

    subscribeToFilling(data => {
      const { x, y, colour } = data;
      this.fill(x, y, colour);
    });

    subscribeToResetCanvas(() => {
      this.resetCanvas();
    });

    subscribeToTurns(data => {
      this.setState(prevState => {
        const state = { ...prevState };
        if (data.turn === state.myId) state.turn = true;
        else {
          state.turn = false;
          clearInterval(state.actionLoop);
        }
        return state;
      });
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

    //ctx.clearRect(0, 0, this.state.width, this.state.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, this.state.width, this.state.height);
  };

  undo = () => {
    const ctx = this.refs.canvas.getContext("2d");

    const { prevCanvasDatas, canvasDataIndex } = this.state;
    this.setState(prevState => {
      let state = prevState;
      //save in case of redo if on last secrtion
      if (prevCanvasDatas.length === canvasDataIndex) {
        state = this.addCanvasDataToState(state);
      }
      if (canvasDataIndex > 0) {
        state.canvasDataIndex = canvasDataIndex - 1;
        ctx.putImageData(prevCanvasDatas[canvasDataIndex - 1], 0, 0);
      } /*else {
        ctx.putImageData(prevCanvasDatas[0], 0, 0);
      }*/
      return state;
    });
  };

  redo = () => {
    const ctx = this.refs.canvas.getContext("2d");

    const { prevCanvasDatas, canvasDataIndex } = this.state;
    this.setState(prevState => {
      let state = prevState;

      if (canvasDataIndex + 1 < prevCanvasDatas.length) {
        state.canvasDataIndex = canvasDataIndex + 1;
        ctx.putImageData(prevCanvasDatas[canvasDataIndex + 1], 0, 0);
      }
      /*else {
        ctx.putImageData(prevCanvasDatas[0], 0, 0);
      }*/
      return state;
    });
  };
  onMouseDown = e => {
    e.preventDefault();
    if (this.state.turn && !this.state.actionLoop) {
      if (this.state.tool === "brush") {
        this.setState(prevState => {
          let state = prevState;
          state.actionLoop = setInterval(this.paint, 16);
          state = this.addCanvasDataToState(state);
          state.canvasDataIndex++;
          return state;
        });
      } else if (this.state.tool === "bucket") {
        this.setState(prevState => {
          let state = prevState;
          state = this.addCanvasDataToState(state);
          state.canvasDataIndex++;
          return state;
        });
        this.clientFill();
      }
    }
  };

  addCanvasDataToState = state => {
    //remove everything after the index
    if (state.prevCanvasDatas.length >= state.canvasDataIndex + 1) {
      state.prevCanvasDatas.splice(
        state.canvasDataIndex,
        state.prevCanvasDatas.length - state.canvasDataIndex
      );
      state.prevTest.splice(
        state.canvasDataIndex,
        state.prevTest.length - state.canvasDataIndex
      );
    }

    //add it to state
    const ctx = this.refs.canvas.getContext("2d");
    const canvasData = ctx.getImageData(
      0,
      0,
      this.state.width,
      this.state.height
    );
    state.prevCanvasDatas.push(canvasData);
    state.prevTest.push(state.testI);

    state.testI++;

    return state;
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

    this.drawCircle2(x, y, lastX, lastY, colour, radius);
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

    //line between things
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

  drawCircle2 = (x, y, lastX, lastY, colour, radius) => {
    let circleArray = [];
    circleArray.push(radius);

    for (let i = 1; i < radius; i++) {
      let y = Math.sqrt(radius * radius - i * i);
      circleArray.push(Math.round(y));
    }

    const ctx = this.refs.canvas.getContext("2d");

    let canvasData = ctx.getImageData(
      0,
      0,
      this.state.width,
      this.state.height
    );

    for (let i = 0; i < circleArray.length; i++) {
      for (let j = 0; j < circleArray[i]; j++) {
        this.setPixelColour(canvasData.data, x + i, y + j, [
          colour[0],
          colour[1],
          colour[2],
          255
        ]);
        this.setPixelColour(canvasData.data, x + i, y - j, [
          colour[0],
          colour[1],
          colour[2],
          255
        ]);
        this.setPixelColour(canvasData.data, x - i, y + j, [
          colour[0],
          colour[1],
          colour[2],
          255
        ]);
        this.setPixelColour(canvasData.data, x - i, y - j, [
          colour[0],
          colour[1],
          colour[2],
          255
        ]);
      }
    }

    this.drawLineBetweenPoints(x, y, lastX, lastY, colour, radius, canvasData);

    ctx.putImageData(canvasData, 0, 0);
  };

  drawLineBetweenPoints = (x, y, lastX, lastY, colour, radius, canvasData) => {
    //very poorly implemented but i need to just continue and come back later :/
    if (lastX) {
      const alpha = Math.atan((lastY - y) / (lastX - x));
      const beta = Math.PI / 2 - alpha;
      const cosb = radius * Math.cos(beta);
      const sinb = radius * Math.sin(beta);

      const a1 = [Math.round(x - cosb), Math.round(y + sinb)];
      const a2 = [Math.round(lastX - cosb), Math.round(lastY + sinb)];
      const a3 = [Math.round(lastX + cosb), Math.round(lastY - sinb)];
      const a4 = [Math.round(x + cosb), Math.round(y - sinb)];

      let p1 = [],
        p2 = [],
        p3 = [],
        p4 = [];

      // if (a1[0] <)

      if (a1[0] < a2[0] && a1[0] < a3[0] && a1[0] < a4[0]) {
        p1 = a1;
      } else if (a2[0] < a1[0] && a2[0] < a3[0] && a2[0] < a4[0]) {
        p1 = a2;
      } else if (a3[0] < a1[0] && a3[0] < a2[0] && a3[0] < a4[0]) {
        p1 = a3;
      } else p1 = a4;

      if (a1[1] < a2[1] && a1[1] < a3[1] && a1[1] < a4[1]) {
        p2 = a1;
      } else if (a2[1] < a1[1] && a2[1] < a3[1] && a2[1] < a4[1]) {
        p2 = a2;
      } else if (a3[1] < a1[1] && a3[1] < a2[1] && a3[1] < a4[1]) {
        p2 = a3;
      } else p2 = a4;

      if (a1[0] > a2[0] && a1[0] > a3[0] && a1[0] > a4[0]) {
        p3 = a1;
      } else if (a2[0] > a1[0] && a2[0] > a3[0] && a2[0] > a4[0]) {
        p3 = a2;
      } else if (a3[0] > a1[0] && a3[0] > a2[0] && a3[0] > a4[0]) {
        p3 = a3;
      } else p3 = a4;

      if (a1[1] > a2[1] && a1[1] > a3[1] && a1[1] > a4[1]) {
        p4 = a1;
      } else if (a2[1] > a1[1] && a2[1] > a3[1] && a2[1] > a4[1]) {
        p4 = a2;
      } else if (a3[1] > a1[1] && a3[1] > a2[1] && a3[1] > a4[1]) {
        p4 = a3;
      } else p4 = a4;

      //exception for squares

      if (
        a1[0] === a2[0] ||
        a2[1] === a3[1] ||
        a4[0] === a3[0] ||
        a4[1] === a1[1]
      ) {
        const p1 = [x - radius, Math.min(y, lastY)];
        //const p2 = [x + radius, Math.min(y,lastY)];
        const p3 = [x - radius, Math.max(y, lastY)];
        //const p4 = [x + radius, Math.max(y,lastY)];

        for (let i = 0; i < 2 * radius; i++) {
          for (let j = 0; j < p3[1] - p1[1]; j++) {
            this.setPixelColour(canvasData.data, p1[0] + i, p1[1] + j, [
              colour[0],
              colour[1],
              colour[2],
              255
            ]);
          }
        }
      }
      if (
        a1[1] === a2[1] ||
        a2[0] === a3[0] ||
        a4[1] === a3[1] ||
        a4[0] === a1[0]
      ) {
        const p1 = [Math.min(x, lastX), y - radius];
        //const p2 = [x + radius, Math.min(y,lastY)];
        const p3 = [Math.max(x, lastX), y - radius];
        //const p4 = [x + radius, Math.max(y,lastY)];

        for (let i = 0; i < p3[0] - p1[0]; i++) {
          for (let j = 0; j < 2 * radius; j++) {
            this.setPixelColour(canvasData.data, p1[0] + i, p1[1] + j, [
              colour[0],
              colour[1],
              colour[2],
              255
            ]);
          }
        }
      } else {
        //other:

        const m12 = (p1[1] - p2[1]) / (p1[0] - p2[0]);
        const c12 = p1[1] - m12 * p1[0];
        const m23 = (p2[1] - p3[1]) / (p2[0] - p3[0]);
        const c23 = p2[1] - m23 * p2[0];
        const m34 = (p3[1] - p4[1]) / (p3[0] - p4[0]);
        const c34 = p3[1] - m34 * p3[0];
        const m41 = (p4[1] - p1[1]) / (p4[0] - p1[0]);
        const c41 = p4[1] - m41 * p4[0];

        const left = [];

        for (let i = p2[1]; i < p1[1]; i++) {
          const number = Math.round((i - c12) / m12);
          left.push(number);
        }

        for (let i = p1[1]; i <= p4[1]; i++) {
          const number = Math.round((i - c41) / m41);
          left.push(number);
        }

        const right = [];

        for (let i = p2[1]; i < p3[1]; i++) {
          const number = Math.round((i - c23) / m23);
          right.push(number);
        }
        for (let i = p3[1]; i <= p4[1]; i++) {
          const number = Math.round((i - c34) / m34);
          right.push(number);
        }

        for (let i = 0; i < left.length; i++) {
          for (let j = 0; j < right[i] - left[i] + 1; j++) {
            this.setPixelColour(canvasData.data, left[i] + j, p2[1] + i, [
              colour[0],
              colour[1],
              colour[2],
              255
            ]);
          }
        }
      }

      /*const p1 = [40, 100];
      const p2 = [50, 20];
      const p3 = [250, 240];*/
      //const p4 = [x + cosb, y - sinb];

      //side 1 | left side

      /*const m12 = (p1[1] - p2[1]) / (p1[0] - p2[0]);
      const c12 = p1[1] - m12 * p1[0];


      const side1 = [p1[0]];

      for (let i = p1[1] - 1; i > p2[1]; i--) {
        const number = Math.round((i - c12) / m12);
        side1.push(number);
      }
      side1.push(p2[0]);
      //side 2 | top side
      const m23 = (p2[1] - p3[1]) / (p2[0] - p3[0]);
      const c23 = p2[1] - m23 * p2[0];

      const side2 = [p2[1]];

      for (let i = p2[0] + 1; i < p3[0]; i++) {
        const number = Math.round(m23 * i + c23);
        side2.push(number);
      }
      side2.push(p3[1]);

      /* for (let i = 0; i < side1.length; i++) {
        this.setPixelColour(canvasData.data, side1[i], p1[1] - i, [
          0,
          0,
          0,
          255
        ]);
      }

      for (let i = 0; i < side2.length; i++) {
        this.setPixelColour(canvasData.data, p2[0] + i, side2[i], [
          0,
          0,
          0,
          255
        ]);
      }*/

      /*for (let i = 0; i < side1.length; i++) {
        for (let j = 0; j < side2.length; j++) {
          this.setPixelColour(
            canvasData.data,
            side1,
            ,
            [0, 0, 0, 255]
          )
          /*this.setPixelColour(
            canvasData.data,
            side1[side1.length - i] + j,
            side2[j] + i,
            [0, 0, 0, 255]
          );
        }
      }*/

      //return canvasData;

      //this isn't perfect, maybe i should be test whether i should doi t this way or with x's instead?

      //between p2 and p3
      /*
      const m23 = (p2[1] - p3[1]) / (p2[0] - p3[0]);
      const c23 = p2[1] - m23*p2[0];

      const side2 = [p1[0]]*/

      /*ctx.beginPath();
      ctx.moveTo(x - cosb, y + sinb);
      ctx.lineTo(lastX - cosb, lastY + sinb);
      ctx.lineTo(lastX + cosb, lastY - sinb);
      ctx.lineTo(x + cosb, y - sinb);
      ctx.closePath();
      ctx.fill();*/
    }
  };

  clientFill = () => {
    const { x, y } = this.state;
    //const fillColour = this.state.colour;
    const fillColour = this.state.colour;
    sendFillInfo(x, y, fillColour);
    this.fill(x, y, fillColour);
  };

  fill = (x, y, fillColour) => {
    const ctx = this.refs.canvas.getContext("2d");

    const targetColour = ctx.getImageData(x, y, 1, 1).data;
    //const targetColour = [255, 255, 255, 255];

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
    ctx.putImageData(canvasData, 0, 0);
  };

  setPixelColour(canvasData, x, y, colour) {
    const id = 4 * (x + y * this.state.width);
    //if (id < 0 || id + 2 >= canvasData.length) return false;
    if (x >= 0 && y >= 0 && x < this.state.width && y < this.state.height) {
      canvasData[id] = colour[0];
      canvasData[id + 1] = colour[1];
      canvasData[id + 2] = colour[2];
    }
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
            resetCanvas={this.resetCanvas} //resetCanvas
            undo={this.undo}
            redo={this.redo}
            turn={this.state.turn}
          />
        </div>
      </div>
    );
  }
}

export default Canvas;
