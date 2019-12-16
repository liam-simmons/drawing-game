import React, { Component } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Route, Link } from "react-router-dom";
import DrawingGame from "./skribble/DrawingGame";
import HomePage from "./pages/HomePage";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Navbar expand="lg" style={{ backgroundColor: "#264fa3" }}>
          <Link to="/">
            <Navbar.Brand style={{ color: "#eeeeee" }}>
              Drawing Game!
            </Navbar.Brand>
          </Link>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Link to="/">
                <Nav.Link
                  style={{
                    color: "#cccccc"
                  }}
                >
                  Home
                </Nav.Link>
              </Link>
              <Link to="/play">
                <Nav.Link style={{ color: "#cccccc" }}>Play</Nav.Link>
              </Link>
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
