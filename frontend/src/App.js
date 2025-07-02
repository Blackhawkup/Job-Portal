import { createContext, useState } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import MessagePopup from "./lib/MessagePopup";
import NavBar from "./component/Navbar";
import Login from "./component/Login";
import Logout from "./component/Logout";
import Signup from "./component/Signup";
import Profile from "./component/Profile";
import Applications from "./component/Applications";
import RecruiterProfile from "./component/recruiter/Profile";
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { userType } from "./lib/isAuth";
import CreateJobs from "../src/component/recruiter/CreateJobs";
import MyJobs from "./component/recruiter/MyJobs";
import Home from "./component/Home";
import JobApplications from "./component/recruiter/JobApplications";
import AcceptedApplicants from "./component/recruiter/AcceptedApplicants";
import Welcome, { ErrorPage } from "./component/Welcome";
import ForgotPasswordForm from './component/ForgotPassword'
import ResetPasswordForm from "./component/ResetPassword";
const useStyles = makeStyles((theme) => ({
  body: {
    marginTop: "2px",
    marginLeft: "0px",
    marginRight: "0px",
    width: "100%",
    background: "linear-gradient(to right, #00d2ff, #3a7bd5)"
  }
}));

export const SetPopupContext = createContext();

function App() {
  const classes = useStyles();
  const [popup, setPopup] = useState({
    open: false,
    severity: "",
    message: "",
  });
  return (
    <BrowserRouter>
      <SetPopupContext.Provider value={setPopup}>
        <Container fluid>
          <Row>
            <NavBar id="navbar" />
          </Row>
          <Row className={classes.body}>
            <Col className="p-0">
              <Switch>
                <Route exact path="/">
                  <Welcome id="welcome" />
                </Route>
                <Route exact path="/login">
                  <Login />
                </Route>
                <Route exact path="/signup">
                  <Signup />
                </Route>
                <Route exact path="/logout">
                  <Logout />
                </Route>
                <Route exact path="/home">
                  <Home />
                </Route>
                <Route exact path="/profile">
                  {userType() === "recruiter" ? (
                    <RecruiterProfile />
                  ) : (
                    <Profile />
                  )}
                </Route>
                <Route exact path="/addjob">
                  <CreateJobs />
                </Route>
                <Route exact path="/myjobs">
                  <MyJobs />
                </Route>
                <Route exact path="/job/applications/:jobId">
                  <JobApplications />
                </Route>
                <Route exact path="/applications">
                  <Applications />
                </Route>
                <Route exact path="/employees">
                  <AcceptedApplicants />
                </Route>
                <Route exact path="/forgotPassword">
                  <ForgotPasswordForm />
                </Route>
                <Route exact path="/reset-password/:id/:token">
                  <ResetPasswordForm />
                </Route>
                <ErrorPage />
              </Switch>
            </Col>

          </Row>
        </Container>
        <MessagePopup
          open={popup.open}
          setOpen={(status) =>
            setPopup({
              ...popup,
              open: status,
            })
          }
          severity={popup.severity}
          message={popup.message}
        />
      </SetPopupContext.Provider>
    </BrowserRouter>
  );
}

export default App;
