import React from "react";
import _ from "lodash";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Profile from "./components/Profile";
import LoginForm from "./components/LoginForm";
import Public from "./components/Public";
import { fireAuth } from "./fireApi";
import withAuthProtection from "./withAuthProtection";
import API from "../src/utils/API";
import SignUpForm from "./components/SignUpForm";
import Button from "react-bootstrap/Button";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";

const Wrapper = props => (
  <div style={{ maxWidth: "100%", padding: 16, margin: "auto" }} {...props} />
);

const ProtectedProfile = withAuthProtection("/login")(Profile);

class App extends React.Component {
  constructor() {
    super();
    console.log("user", fireAuth.currentUser);
    this.state = {
      me: fireAuth.currentUser,
      activeUser: {}
    };
  }

  isSomeoneSignedIn = () => {
    if (this.state.activeUser) {
      return (
        <ProtectedProfile
          {...this.state.props}
          me={this.state.me}
          displayName={this.state.email}
          id={this.state.id}
          activeUser={this.state.activeUser}
        />
      );
    } else {
      return <ProtectedProfile />;
    }
  };

  componentDidMount() {
    fireAuth.onAuthStateChanged(me => {
      console.log(me.email);
      API.saveUser({ email: me.email, fBaseId: me.uid }).catch(err =>
        console.log(err)
      );

      API.getUser(me.uid).then(d => {
        this.setState({ activeUser: d });
      });
      this.setState({ me });
    });
  }

  handleSignIn = history => (email, password) => {
    return fireAuth.signInWithEmailAndPassword(email, password).then(() => {
      return history.push("/profile");
    });
  };
  handleSignUp = history => (email, password) => {
    fireAuth
      .createUserWithEmailAndPassword(email, password)
      .catch(function(error) {
        // Handle Errors here.
        // var errorCode = error.code;
        // var errorMessage = error.message;
        // ...
      });
    return history.push("/profile");
  };

  onLogOut() {
    window.location = "/";
  }

  render() {
    const { me } = this.state;
    const email = _.get(me, "email");
    const id = _.get(me, "uid");
    const activeUser = this.state.activeUser;
    return (
      <BrowserRouter>
        <Navbar expand="lg" style={{ backgroundColor: "#cd9093" }}>
          <Navbar.Brand
            style={{ fontFamily: "Bradley Hand, cursive", fontSize: "30pt" }}
            href="/"
          >
            Pantry
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link>
                <Link
                  to="/"
                  style={{
                    fontFamily: "Bradley Hand, cursive",
                    fontSize: "18pt",
                    textDecorationColor: "#bc7",
                    color: "black"
                  }}
                >
                  Home
                </Link>
              </Nav.Link>
              <Nav.Link>
                <Link
                  to="/login"
                  style={{
                    fontFamily: "Bradley Hand, cursive",
                    fontSize: "18pt",
                    textDecorationColor: "#bc7",
                    color: "black"
                  }}
                >
                  Login
                </Link>
              </Nav.Link>
              <Nav.Link>
                {" "}
                <Link
                  to="/profile"
                  style={{
                    fontFamily: "Bradley Hand, cursive",
                    fontSize: "18pt",
                    textDecorationColor: "#bc7",
                    color: "black"
                  }}
                >
                  Profile
                </Link>
              </Nav.Link>
            </Nav>
            <Button
              variant={"contained"}
              onClick={() => {
                fireAuth.signOut();
                this.onLogOut();
              }}
              style={{
                marginLeft: "45%",
                fontFamily: "Bradley Hand, cursive",
                fontSize: "18pt",
                textDecorationColor: "#bc7",
                color: "black"
              }}
            >
              Logout
            </Button>
          </Navbar.Collapse>
        </Navbar>

        <Switch>
          <Route
            path="/"
            exact
            render={() => (
              <Wrapper>
                {/* <Link to="/login" style={{ marginRight: 16 }}>
                  Login
                </Link>
                <Link to="/profile">Profile</Link> */}
                <Home />
              </Wrapper>
            )}
          />
          <Route
            path="/login"
            exact
            render={({ history }) => (
              <Wrapper>
                {/* <Link to="/">Home</Link>
                <Link to="/profile">Profile</Link> */}
                <LoginForm onSubmit={this.handleSignIn(history)} />

                <ButtonToolbar style={{
                    marginLeft: "18%",
                    marginLeft: "43%",
                    fontfamily: "Bradley Hand, cursive"
                  }}>
                  {["Sign Up"].map(placement => (
                    <OverlayTrigger
                      trigger="click"
                      key={placement}
                      placement={placement}
                      overlay={
                        <Popover
                          style={{ color: "black", backgroundColor: "#bc7" }}
                          id={`popover-positioned-${placement}`}
                        >
                          <Popover.Title
                            style={{ fontfamily: "Bradley Hand, cursive" }}
                            as="h3"
                          >{`${placement}`}</Popover.Title>
                          <Popover.Content
                            style={{ fontfamily: "Bradley Hand, cursive" }}
                          >
                            <SignUpForm
                              onSubmit={this.handleSignUp(history)}
                              style={{ fontfamily: "Bradley Hand, cursive" }}
                            />
                          </Popover.Content>
                        </Popover>
                      }
                    >
                      <Button
                        style={{
                          backgroundColor: "#cd9093",
                          fontfamily: "Bradley Hand, cursive",
                          marginLeft: "7%"
                        }}
                        variant="primary"
                      >
                        {placement}
                      </Button>
                    </OverlayTrigger>
                  ))}
                </ButtonToolbar>
              </Wrapper>
            )}
          />
          <Route
            path="/profile"
            exact
            render={props => (
              <Wrapper>
                {/* <Link to="/">Home</Link> */}
                {/* {this.isSomeoneSignedIn()} */}
                <ProtectedProfile
                  {...props}
                  me={me}
                  displayName={email}
                  id={id}
                  activeUser={activeUser}
                />
              </Wrapper>
            )}
          />
          <Route
            path="/public"
            exact
            render={() => (
              <Wrapper>
                {/* <Link to="/">Home</Link> */}
                <Public />
              </Wrapper>
            )}
          />
        </Switch>
      </BrowserRouter>
    );
  }
}
export default App;
