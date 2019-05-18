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
    const { width, height, image, selected, imageSize } = this.props;
    const { hovered } = this.state;

    return (
      <div width={width} height={height}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          onClick={this.onClick}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          {hovered && <rect width={width} height={height} fill="#FFFFFF" />}

          <image
            x={(width - imageSize) / 2}
            y={(height - imageSize) / 2}
            width={imageSize}
            height={imageSize}
            href={image}
          />
        </svg>
      </div>
    );
  }
}

export default CircleButton;
