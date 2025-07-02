import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  makeStyles,
} from "@material-ui/core";
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Container from 'react-bootstrap/Container'
import * as colors from "@material-ui/core/colors";
import { useHistory } from "react-router-dom";
import logo from '../logo.jpg'
import isAuth, { userType } from "../lib/isAuth";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    fontWeight: "bold",
    fontSize: 24,
  },
  Toolbar: {
    boxShadow: "0px 0px",
    backgroundColor: "white",
    color: colors.blueGrey[700],
  },
  button: {
    fontFamily: "Montserrat",
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
  },
  noBox: {
    boxShadow: "0px 0px",
    backgroundColor: "#fff",
  },
}));

const NavBar = (props) => {
  const classes = useStyles();
  let history = useHistory();

  const handleClick = (location) => {
    console.log(location);
    history.push(location);
  };

  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
  <Container>
  <Navbar.Brand href="/">
    <img src={logo}
    width="50" height="30" style={{marginRight:"8px"}}></img>
    Job Portal</Navbar.Brand>
  <Navbar.Toggle aria-controls="responsive-navbar-nav" />
  <Navbar.Collapse id="responsive-navbar-nav">
    <Nav className="ms-auto ">
      {isAuth() ? ( userType() === "recruiter" ?
      (<>
        <Nav.Link href="/addjob">Add Jobs</Nav.Link>
      <Nav.Link href="/myjobs">My Jobs</Nav.Link>
      <Nav.Link href="/employees">Employees</Nav.Link>
      <Nav.Link href="/profile">Profile</Nav.Link>
      <Nav.Link href="/logout">Logout</Nav.Link>
      </>) : 
      (
        <>
          <Nav.Link href="/home">Home</Nav.Link>
      <Nav.Link href="/applications">Applications</Nav.Link>
      <Nav.Link href="/profile">Profile</Nav.Link>
      <Nav.Link href="/logout">Logout</Nav.Link>
        </>
      ) ) : (
        <>
      <Nav.Link href="/login">Login</Nav.Link>
      <Nav.Link href="/signup">SignUp</Nav.Link>
        </>
      ) }

    </Nav>
  </Navbar.Collapse>
  </Container>
</Navbar>
 );
};

export default NavBar;
