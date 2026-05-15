import React, { Component } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Routes, Route, Link } from "react-router-dom";
import DrawingGame from "./skribble/DrawingGame";
import HomePage from "./pages/HomePage";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Navbar expand="lg" style={{ backgroundColor: "#264fa3" }}>
          <Navbar.Brand
            as={Link}
            to="/"
            style={{ color: "#eeeeee", paddingLeft: "0.75rem" }}
          >
            Drawing Game!
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/" style={{ color: "#cccccc" }}>
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/play" style={{ color: "#cccccc" }}>
                Play
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/play"
            element={<DrawingGame width={640} height={360} />}
          />
        </Routes>
      </div>
    );
  }
}

export default App;
