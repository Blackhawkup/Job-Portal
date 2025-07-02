import { useContext, useState } from "react";
import {
  Grid,
  TextField,
  Button,
  Typography,
  makeStyles,
  Paper,
  Link
} from "@material-ui/core";
import axios from "axios";
import { Redirect } from "react-router-dom";

import PasswordInput from "../lib/PasswordInput";
import EmailInput from "../lib/EmailInput";
import { SetPopupContext } from "../App";

import apiList from "../lib/apiList";
import isAuth from "../lib/isAuth";

const useStyles = makeStyles((theme) => ({
  body: {
    // height:"100%",
    padding: "60px 60px",
    margin: "10px 0px",
    fontFamily: "Roboto",
  },
  inputBox: {
    width: "300px",
    [theme.breakpoints.only('xs')]:{
      width:"100%"
    }
  },
  submitButton: {
    width: "300px",
    [theme.breakpoints.only('xs')]:{
      width:"100%"
    }
  },
  ScreenSize: {
    flexDirection: 'column',
    [theme.breakpoints.only('xs')]: {
      flexDirection: 'row'
    },
    [theme.breakpoints.only('sm')]: {
      flexDirection: 'column'
    },
    [theme.breakpoints.only('md')]: {
      flexDirection: 'column'
    }
  },
}));

const Login = (props) => {
  const classes = useStyles();
  const setPopup = useContext(SetPopupContext);

  const [loggedin, setLoggedin] = useState(isAuth());

  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });

  const [inputErrorHandler, setInputErrorHandler] = useState({
    email: {
      error: false,
      message: "",
    },
    password: {
      error: false,
      message: "",
    },
  });

  const handleInput = (key, value) => {
    setLoginDetails({
      ...loginDetails,
      [key]: value,
    });
  };

  const handleInputError = (key, status, message) => {
    setInputErrorHandler({
      ...inputErrorHandler,
      [key]: {
        error: status,
        message: message,
      },
    });
  };

  const handleLogin = () => {
    const verified = !Object.keys(inputErrorHandler).some((obj) => {
      return inputErrorHandler[obj].error;
    });
    if (verified) {
      axios
        .post(apiList.login, loginDetails)
        .then((response) => {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("type", response.data.type);
          setLoggedin(isAuth());
          setPopup({
            open: true,
            severity: "success",
            message: "Logged in successfully",
          });
          console.log(response);
        })
        .catch((err) => {
          setPopup({
            open: true,
            severity: "error",
            message: err.response.data.message,
          });
          console.log(err.response);
        });
    } else {
      setPopup({
        open: true,
        severity: "error",
        message: "Incorrect Input",
      });
    }
  };

  return loggedin ? (
    <Redirect to="/home" />
  ) : (
    <Paper elevation={3} className={classes.body} style={
      {
        display:"inline-block",      position: 'absolute', 
    left: '50%', 
    top: '50%',
    transform: 'translate(-50%, -50%)'
  }
  }
    >
      <Grid container className={classes.ScreenSize} spacing={4} alignItems="center">
        <Grid item xs={12}>
          <Typography variant="h3" component="h2">
            Login
          </Typography>
        </Grid>
        <Grid item xs={12} >
          <EmailInput
            label="Email"
            value={loginDetails.email}
            onChange={(event) => handleInput("email", event.target.value)}
            inputErrorHandler={inputErrorHandler}
            handleInputError={handleInputError}
            className={classes.inputBox}
            // style={{width:"100%"}}
          />
        </Grid>
        <Grid item xs={12}>
          <PasswordInput
            label="Password"
            value={loginDetails.password}
            onChange={(event) => handleInput("password", event.target.value)}
            className={classes.inputBox}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleLogin()}
            className={classes.submitButton}
          >
            Login
          </Button>
        </Grid>
        <Link href="/forgotPassword">Forgot Password?</Link>

      </Grid>
    </Paper>
  );
};

export default Login;
