import React, { Component } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Route } from "react-router-dom";
import Skribble from "./skribble/Skribble";
import HomePage from "./pages/HomePage";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Navbar bg="dark" expand="lg">
          <Navbar.Brand href="#home">Skribble Clone</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="/">Home</Nav.Link>
              <Nav.Link href="/skribble">Skribble</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Route path="/" exact component={HomePage} />
        <Route
          path="/skribble"
          exact
          render={routeProps => (
            <Skribble {...routeProps} width={1280} height={720} />
          )}
        />
      </div>
    );
  }
}

export default App;
