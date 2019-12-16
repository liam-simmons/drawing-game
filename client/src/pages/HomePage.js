import React from "react";
import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div>
      <Container
        style={{
          backgroundColor: "#eee",
          marginTop: "20px",
          borderRadius: "3px",
          textAlign: "center",
          padding: "30px"
        }}
      >
        <h2 style={{ color: "#222", fontSize: "96px" }}>Drawing Game!</h2>
        <p style={{ color: "#333", fontSize: "36px" }}>
          Invite your friends and guess some drawings!
        </p>
        <Link to="/play">
          <Button
            style={{
              width: "250px",
              height: "80px",
              fontSize: "30px",
              fontWeight: "bold"
            }}
          >
            Play now!
          </Button>
        </Link>
      </Container>
    </div>
  );
};

export default HomePage;
