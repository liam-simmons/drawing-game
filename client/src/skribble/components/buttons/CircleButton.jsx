import React from "react";

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
      <div width={width} height={height} style={{ fontSize: 0 }}>
        <svg
          width={width}
          height={height}
          onClick={this.onClick}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          {hovered && <rect width={width} height={height} fill="#FFFFFF" />}

          {selected ? (
            <circle
              cx={width / 2}
              cy={height / 2}
              r={radius}
              fill={selectColour}
            />
          ) : (
            <circle cx={width / 2} cy={height / 2} r={radius} fill={colour} />
          )}
        </svg>
      </div>
    );
  }
}

export default CircleButton;
