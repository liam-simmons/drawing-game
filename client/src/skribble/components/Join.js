import React from "react";
import { Form, Button } from "react-bootstrap";

class Join extends React.Component {
  constructor() {
    super();

    this.state = {
      name: ""
    };
  }

  onChange = e => {
    this.setState({ name: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();
    this.props.setName(this.state.name);
  };

  render() {
    return (
      <Form
        onSubmit={this.onSubmit}
        style={{ textAlign: "center", marginTop: "10%" }}
      >
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Pick a name!"
          value={this.state.name}
          onChange={this.onChange}
        />
        <button type="submit">Join</button>
      </Form>
    );
  }
}

export default Join;
