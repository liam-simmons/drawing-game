import React, { Component } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Route } from "react-router-dom";
import DrawingGame from "./skribble/DrawingGame";
import HomePage from "./pages/HomePage";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Navbar expand="lg" style={{ backgroundColor: "#264fa3" }}>
          <Navbar.Brand href="/" style={{ color: "#eeeeee" }}>
            Drawing Game!
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="/" style={{ color: "#cccccc" }}>
                Home
              </Nav.Link>
              <Nav.Link href="/play" style={{ color: "#cccccc" }}>
                Play
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Route path="/" exact component={HomePage} />
        <Route
          path="/play"
          exact
          render={routeProps => (
            <DrawingGame {...routeProps} width={640} height={360} />
          )}
        />
      </div>
    );
  }
}

export default App;
