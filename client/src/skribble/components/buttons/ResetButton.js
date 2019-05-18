import React from "react";

//super temperary

class CircleButton extends React.Component {
  constructor(props) {
    super();

    this.state = {
      hovered: false
    };
  }

  onClick = e => {
    e.preventDefault();
    this.props.setActive();
    this.setState({ selected: true });
  };

  onMouseEnter = () => {
    this.setState({ hovered: true });
  };

  onMouseLeave = () => {
    this.setState({ hovered: false });
  };

  render() {
    const {
      width,
      height,
      colour,
      radius,
      selectColour,
      selected
    } = this.props;
    const { hovered } = this.state;

    return (
      <svg
        width={width}
        height={height}
        onClick={this.onClick}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        {hovered && <rect width={width} height={height} fill="#FFFFFF" />}

        <rect
          x={width / 2 - radius}
          y={height / 2 - radius}
          width={radius * 2}
          height={radius * 2}
          fill="#a980fc"
        />
      </svg>
    );
  }
}

export default CircleButton;
