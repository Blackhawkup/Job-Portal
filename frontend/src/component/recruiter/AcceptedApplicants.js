import { useState, useEffect, useContext } from "react";
import {
  Button,
  Chip,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Typography,
  Modal,
  Checkbox,
  Avatar,
  Link,
} from "@material-ui/core";
import Form from 'react-bootstrap/Form'
import Rating from "@material-ui/lab/Rating";
import axios from "axios";
import FilterListIcon from "@material-ui/icons/FilterList";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import LinkIcon from '@material-ui/icons/Link';
import Dialog from '@material-ui/core/Dialog';
import DeleteIcon from '@material-ui/icons/Delete';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { SetPopupContext } from "../../App";
import parse from 'html-react-parser';

import apiList, { server } from "../../lib/apiList";
import { user } from "pg/lib/defaults";
const Swal = require('sweetalert2')
const moment = require("moment")
const useStyles = makeStyles((theme) => ({
  body: {
    height: "inherit",
  },
  statusBlock: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textTransform: "uppercase",
  },
  jobTileOuter: {
    padding: "30px",
    margin: "20px 0",
    boxSizing: "border-box",
    width: "100%",
  },
  popupDialog: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: theme.spacing(15),
    height: theme.spacing(15),
  },
  ScreenSize: {
    flexDirection: 'row',
    [theme.breakpoints.only('xs')]: {
      flexDirection: 'column'
    },
    [theme.breakpoints.only('sm')]: {
      flexDirection: 'row'
    },
    [theme.breakpoints.only('md')]: {
      flexDirection: 'row'
    }
  }
}));

const FilterPopup = (props) => {
  const classes = useStyles();
  const { open, handleClose, searchOptions, setSearchOptions, getData } = props;
  return (
    <Modal open={open} onClose={handleClose} className={classes.popupDialog}>
      <Paper
        style={{
          padding: "50px",
          outline: "none",
          minWidth: "50%",
        }}
      >
        <Grid container direction="column" alignItems="center" spacing={3}>
          {/* <Grid container item alignItems="center">
            <Grid item xs={3}>
              Application Status
            </Grid>
            <Grid
              container
              item
              xs={9}
              justify="space-around"
              // alignItems="center"
            >
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="rejected"
                      checked={searchOptions.status.rejected}
                      onChange={(event) => {
                        setSearchOptions({
                          ...searchOptions,
                          status: {
                            ...searchOptions.status,
                            [event.target.name]: event.target.checked,
                          },
                        });
                      }}
                    />
                  }
                  label="Rejected"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="applied"
                      checked={searchOptions.status.applied}
                      onChange={(event) => {
                        setSearchOptions({
                          ...searchOptions,
                          status: {
                            ...searchOptions.status,
                            [event.target.name]: event.target.checked,
                          },
                        });
                      }}
                    />
                  }
                  label="Applied"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="shortlisted"
                      checked={searchOptions.status.shortlisted}
                      onChange={(event) => {
                        setSearchOptions({
                          ...searchOptions,
                          status: {
                            ...searchOptions.status,
                            [event.target.name]: event.target.checked,
                          },
                        });
                      }}
                    />
                  }
                  label="Shortlisted"
                />
              </Grid>
            </Grid>
          </Grid> */}
          <Grid container item alignItems="center">
            <Grid item xs={3}>
              Sort
            </Grid>
            <Grid item container direction="row" xs={9}>
              <Grid
                item
                container
                xs={6}
                justify="space-around"
                alignItems="center"
                style={{ border: "1px solid #D1D1D1", borderRadius: "5px" }}
              >
                <Grid item>
                  <Checkbox
                    name="name"
                    checked={searchOptions.sort["Jobapplicant.name"].status}
                    onChange={(event) =>
                      setSearchOptions({
                        ...searchOptions,
                        sort: {
                          ...searchOptions.sort,
                          "Jobapplicant.name": {
                            ...searchOptions.sort["Jobapplicant.name"],
                            status: event.target.checked,
                          },
                        },
                      })
                    }
                    id="name"
                  />
                </Grid>
                <Grid item>
                  <label for="name">
                    <Typography>Name</Typography>
                  </label>
                </Grid>
                <Grid item>
                  <IconButton
                    disabled={!searchOptions.sort["Jobapplicant.name"].status}
                    onClick={() => {
                      setSearchOptions({
                        ...searchOptions,
                        sort: {
                          ...searchOptions.sort,
                          "Jobapplicant.name": {
                            ...searchOptions.sort["Jobapplicant.name"],
                            desc: !searchOptions.sort["Jobapplicant.name"].desc,
                          },
                        },
                      });
                    }}
                  >
                    {searchOptions.sort["Jobapplicant.name"].desc ? (
                      <ArrowDownwardIcon />
                    ) : (
                      <ArrowUpwardIcon />
                    )}
                  </IconButton>
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={6}
                justify="space-around"
                alignItems="center"
                style={{ border: "1px solid #D1D1D1", borderRadius: "5px" }}
              >
                <Grid item>
                  <Checkbox
                    name="jobTitle"
                    checked={searchOptions.sort["job.title"].status}
                    onChange={(event) =>
                      setSearchOptions({
                        ...searchOptions,
                        sort: {
                          ...searchOptions.sort,
                          "job.title": {
                            ...searchOptions.sort["job.title"],
                            status: event.target.checked,
                          },
                        },
                      })
                    }
                    id="jobTitle"
                  />
                </Grid>
                <Grid item>
                  <label for="jobTitle">
                    <Typography>Job Title</Typography>
                  </label>
                </Grid>
                <Grid item>
                  <IconButton
                    disabled={!searchOptions.sort["job.title"].status}
                    onClick={() => {
                      setSearchOptions({
                        ...searchOptions,
                        sort: {
                          ...searchOptions.sort,
                          "job.title": {
                            ...searchOptions.sort["job.title"],
                            desc: !searchOptions.sort["job.title"].desc,
                          },
                        },
                      });
                    }}
                  >
                    {searchOptions.sort["job.title"].desc ? (
                      <ArrowDownwardIcon />
                    ) : (
                      <ArrowUpwardIcon />
                    )}
                  </IconButton>
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={6}
                justify="space-around"
                alignItems="center"
                style={{ border: "1px solid #D1D1D1", borderRadius: "5px" }}
              >
                <Grid item>
                  <Checkbox
                    name="dateOfJoining"
                    checked={searchOptions.sort.dateOfJoining.status}
                    onChange={(event) =>
                      setSearchOptions({
                        ...searchOptions,
                        sort: {
                          ...searchOptions.sort,
                          dateOfJoining: {
                            ...searchOptions.sort.dateOfJoining,
                            status: event.target.checked,
                          },
                        },
                      })
                    }
                    id="dateOfJoining"
                  />
                </Grid>
                <Grid item>
                  <label for="dateOfJoining">
                    <Typography>Date of Joining</Typography>
                  </label>
                </Grid>
                <Grid item>
                  <IconButton
                    disabled={!searchOptions.sort.dateOfJoining.status}
                    onClick={() => {
                      setSearchOptions({
                        ...searchOptions,
                        sort: {
                          ...searchOptions.sort,
                          dateOfJoining: {
                            ...searchOptions.sort.dateOfJoining,
                            desc: !searchOptions.sort.dateOfJoining.desc,
                          },
                        },
                      });
                    }}
                  >
                    {searchOptions.sort.dateOfJoining.desc ? (
                      <ArrowDownwardIcon />
                    ) : (
                      <ArrowUpwardIcon />
                    )}
                  </IconButton>
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={6}
                justify="space-around"
                alignItems="center"
                style={{ border: "1px solid #D1D1D1", borderRadius: "5px" }}
              >
                <Grid item>
                  <Checkbox
                    name="rating"
                    checked={searchOptions.sort["Jobapplicant.rating"].status}
                    onChange={(event) =>
                      setSearchOptions({
                        ...searchOptions,
                        sort: {
                          ...searchOptions.sort,
                          "Jobapplicant.rating": {
                            ...searchOptions.sort[["Jobapplicant.rating"]],
                            status: event.target.checked,
                          },
                        },
                      })
                    }
                    id="rating"
                  />
                </Grid>
                <Grid item>
                  <label for="rating">
                    <Typography>Rating</Typography>
                  </label>
                </Grid>
                <Grid item>
                  <IconButton
                    disabled={!searchOptions.sort["Jobapplicant.rating"].status}
                    onClick={() => {
                      setSearchOptions({
                        ...searchOptions,
                        sort: {
                          ...searchOptions.sort,
                          "Jobapplicant.rating": {
                            ...searchOptions.sort["Jobapplicant.rating"],
                            desc: !searchOptions.sort["Jobapplicant.rating"]
                              .desc,
                          },
                        },
                      });
                    }}
                  >
                    {searchOptions.sort["Jobapplicant.rating"].desc ? (
                      <ArrowDownwardIcon />
                    ) : (
                      <ArrowUpwardIcon />
                    )}
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid item>
            <Button
              variant="contained"
              color="primary"
              style={{ padding: "10px 50px" }}
              onClick={() => getData()}
            >
              Apply
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Modal>
  );
};

const ApplicationTile = (props) => {
  const classes = useStyles();
  const { application, getData } = props;
  const setPopup = useContext(SetPopupContext);
  const [open, setOpen] = useState(false);
  // const largeScreen = useMediaQuery(theme => theme.breakpoints.up('md'));
  // const mobile = useMediaQuery((theme) => theme.breakpoints.only('mobile'), {noSsr: true});


  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleOpenCreateMeetingModal = () => { setShowCreateModal(true) }
  const handleCloseCreateMeetingModal = () => {
    setCreateMeetingMessage("")
    setShowCreateModal(false)
    checkForMeetings()
  }
  const handleOpenUpdateMeetingModal = () => { setShowUpdateModal(true) }
  const handleCloseUpdateMeetingModal = () => {
    setUpdateMeetingMessage('')
    setShowUpdateModal(false)
    checkForMeetings()
  }

  const [openEndJob, setOpenEndJob] = useState(false);
  const [rating, setRating] = useState(application.Jobapplicant.rating);
  const [createMeetingMessage, setCreateMeetingMessage] = useState('')
  const [updateMeetingMessage, setUpdateMeetingMessage] = useState('')

  const [isMeetingCreated, setIsMeetingCreated] = useState(false)
  const [meetingData, setMeetingData] = useState({

  })
  const [dateAndTimeArray, setDateAndTimeArray] = useState({ start_date: '', start_time: '' })

  const [topic, setTopic] = useState('')
  const [agenda, setAgenda] = useState('')
  const [duration, setDuration] = useState(0)
  const [startDate, setStartDate] = useState(new Date())
  const [startTime, setStartTime] = useState(new Date().toLocaleTimeString())

  const appliedOn = new Date(application.dateOfApplication);

  const changeRating = () => {
    axios
      .put(
        apiList.rating,
        { rating: rating, applicantId: application.Jobapplicant.aid },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        setPopup({
          open: true,
          severity: "success",
          message: "Rating updated successfully",
        });
        // fetchRating();
        getData();
        setOpen(false);
      })
      .catch((err) => {
        // console.log(err.response);
        console.log(err);
        setPopup({
          open: true,
          severity: "error",
          message: err.response.data.message,
        });
        // fetchRating();
        getData();
        setOpen(false);
      });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseEndJob = () => {
    setOpenEndJob(false);
  };

  const colorSet = {
    applied: "#3454D1",
    shortlisted: "#DC851F",
    accepted: "#09BC8A",
    rejected: "#D1345B",
    deleted: "#B49A67",
    cancelled: "#FF8484",
    finished: "#4EA5D9",
  };

  const getResume = () => {
    if (
      application.Jobapplicant.resume &&
      application.Jobapplicant.resume !== ""
    ) {
      const address = `${server}${application.Jobapplicant.resume}`;
      axios(address, {
        method: "GET",
        responseType: "blob",
      })
        .then((response) => {
          const file = new Blob([response.data], { type: "application/pdf" });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL);
        })
        .catch((error) => {
          console.log(error);
          setPopup({
            open: true,
            severity: "error",
            message: "Error",
          });
        });
    } else {
      setPopup({
        open: true,
        severity: "error",
        message: "No resume found",
      });
    }
  };

  const updateStatus = (status) => {
    const address = `${apiList.applications}/${application.applicationId}`;
    const statusData = {
      status: status,
      dateOfJoining: new Date().toISOString(),
    };
    axios
      .put(address, statusData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setPopup({
          open: true,
          severity: "success",
          message: response.data.message,
        });
        handleCloseEndJob();
        getData();
      })
      .catch((err) => {
        setPopup({
          open: true,
          severity: "error",
          message: err.response.data.message,
        });
        console.log(err.response);
        handleCloseEndJob();
      });
  };
  const handleCreateMeeting = () => {

    const meetingDetails = {
      topic,
      agenda,
      duration,
      startDate,
      startTime,
      rid: application.rid,
      aid: application.Jobapplicant.aid,
      jid: application.job.jid,
      applicationId: application.applicationId
    }
    console.log(meetingDetails)

    let address = apiList.createZoomMeeting
    axios.post(address, meetingDetails).then((result) => {
      console.log(result)
      if (result !== null) {
        setCreateMeetingMessage(`<span style="color:green">Meeting Added Successfully</span>`)
        checkForMeetings()
      }
    }).catch(error => {

      setCreateMeetingMessage(`<span style="color:red">Some Error Occured</span>`)

      console.log(error)

    }


    )
  }

  const checkForMeetings = () => {
    const meetingDetails = {
      rid: application.rid,
      aid: application.Jobapplicant.aid,
      jid: application.job.jid,
      applicationId: application.applicationId
    }
    axios.post(apiList.checkMeetings, meetingDetails, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    }).then((result) => {
      if (result.data !== null && result.data.message !== "Meeting Not Found") {
        const dateTime = result.data.data.start_time.split("T")
        const timeArray = new Date(result.data.data.start_time).toTimeString().split("GMT+0530")
        let time = timeArray[0].replace(/ /g, "")
        console.log(result.data.data.start_time)
        setDateAndTimeArray({ start_date: dateTime[0], start_time: time })
        setMeetingData(result.data.data)
        console.log("Meeting data:", meetingData)
        setTopic(meetingData.topic)
        setAgenda(meetingData.agenda)
        setDuration(meetingData.duration)
        setStartDate(dateAndTimeArray.start_date)
        setStartTime(dateAndTimeArray.start_time)
        setIsMeetingCreated(true)
      }
      else {
        setMeetingData({})
        setIsMeetingCreated(false)
      }
    }).catch((err) => {
      console.log(err)
    })
  }

  const showCreateMeetingModal = () => {
    return (
      <>
        <Dialog open={showCreateModal} onClose={handleCloseCreateMeetingModal} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Add Interview Details</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Arrange An Interview with the Candidate
            </DialogContentText>
            <Form method="POST" id="createMeetingForm" onSubmit={(e) => { e.preventDefault(); }}>
              <Form.Group className="mb-3" controlId="Topic">
                <Form.Label>Topic Of Meeting</Form.Label>
                <Form.Control type="text" placeholder="Enter topic" onInput={e => setTopic(e.target.value)} />

              </Form.Group>

              <Form.Group className="mb-3" controlId="Agenda">
                <Form.Label>Agenda of Meeting</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Enter Agenda" onInput={e => setAgenda(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="timings">
                <Form.Label>Enter Duration of Meeting</Form.Label>
                <Form.Control type="number" onInput={e => setDuration(e.target.value)} />

                <Form.Label>Enter Date Of Meeting</Form.Label>
                <Form.Control type="date" onInput={e => setStartDate(e.target.value)} />
                <Form.Label>Enter Starting Time  Of Meeting</Form.Label>
                <Form.Control type="time" onInput={e => setStartTime(e.target.value)} />

              </Form.Group>
              <div className='mt-2' >{parse(createMeetingMessage)}</div>
            </Form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateMeetingModal} color="primary">
              Cancel
            </Button>
            <Button onClick={handleCreateMeeting} color="primary" type="submit" form="createMeetingForm">
              Schedule
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )

  }


  const handleUpdateMeeting = () => {
    meetingData['start_time'] = dateAndTimeArray.start_date.concat("T", dateAndTimeArray.start_time, "Z")
    console.log("UPDATE MEETING DETAILS:", meetingData)
    axios.post(apiList.updateMeeting, meetingData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    }).then((result) => {
      console.log("Response:", result)
      setUpdateMeetingMessage(`<span style="color:green">${result.data.message}</span>`)
    }).catch(err => {
      console.log(err)
      setUpdateMeetingMessage(`<span style="color:red">Failed to Update Meeting Details</span>`)
    })
  }
  const showUpdateMeetingModal = () => {
    return (
      <>
        <Dialog open={showUpdateModal} onClose={handleCloseUpdateMeetingModal} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Update Interview Details</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Arrange An Interview with the Candidate
            </DialogContentText>
            <Form method="POST" id="updateMeetingForm" onSubmit={(e) => { e.preventDefault(); }}>
              <Form.Group className="mb-3" controlId="Topic">
                <Form.Label>Topic Of Meeting</Form.Label>
                <Form.Control type="text" placeholder="Enter topic" value={meetingData ? meetingData.topic : ''} onInput={e => setMeetingData({ ...meetingData, topic: e.target.value })} />

              </Form.Group>

              <Form.Group className="mb-3" controlId="Agenda">
                <Form.Label>Agenda of Meeting</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Enter Agenda" value={meetingData ? meetingData.agenda : ''} onInput={e => setMeetingData({ ...meetingData, agenda: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="timings">
                <Form.Label>Enter Duration of Meeting</Form.Label>
                <Form.Control type="number" value={meetingData ? meetingData.duration : ''} onInput={e => setMeetingData({ ...meetingData, duration: e.target.value })} />

                <Form.Label>Enter Date Of Meeting</Form.Label>
                <Form.Control type="date" value={dateAndTimeArray.start_date} onInput={e => setDateAndTimeArray({ ...dateAndTimeArray, start_date: e.target.value })} />
                <Form.Label>Enter Starting Time  Of Meeting</Form.Label>
                <Form.Control type="time" step={2} value={dateAndTimeArray.start_time} onInput={e => setDateAndTimeArray({ ...dateAndTimeArray, start_time: e.target.value })} />

              </Form.Group>
              <div className='mt-2' >{parse(updateMeetingMessage)}</div>
            </Form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUpdateMeetingModal} color="primary">
              Cancel
            </Button>
            <Button onClick={handleUpdateMeeting} color="primary" type="submit" form="updateMeetingForm">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )

  }


  useEffect(() => {
    checkForMeetings();
  }, []);

  const deleteMeeting= () =>{
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Cancel Interview!'
    }).then((result) => {

      if (result.isConfirmed) {
        console.log(meetingData)
        axios.post(apiList.deleteMeeting,meetingData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        })
        .then((result)=>{console.log(result)
          if(result.data.status === 200){
            Swal.fire(
              'Cancelled!',
              'Your Meeting has been cancelled.',
              'success'
            ).then(()=>{
              setCreateMeetingMessage("")
              setIsMeetingCreated(false)
            })
          }
        })
        .catch((err) =>{console.log(err)})

      }
    })
  } 

  return (
    <Paper className={classes.jobTileOuter} elevation={3}>
      <Grid container className={classes.ScreenSize}>
        <Grid
          item
          xs={12}
          sm={4}
          md={2}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Avatar
            src={`${server}${application.Jobapplicant.profile}`}
            className={classes.avatar}
          />
        </Grid>
        <Grid container item xs={7} sm={5} md={7} spacing={1} direction="column" style={{ maxWidth: "100%" }}>
          <Grid item>
            <Typography variant="h5">
              {application.Jobapplicant.name}
            </Typography>
          </Grid>
          <Grid item>
            <Rating
              value={
                application.Jobapplicant.rating !== -1
                  ? application.Jobapplicant.rating
                  : null
              }
              readOnly
            />
          </Grid>
          <Grid item><b>Job Title:</b> {application.job.title}</Grid>
          <Grid item><b>Role:</b> {application.job.jobType}</Grid>
          <Grid item><b>Applied On:</b> {appliedOn.toLocaleDateString()}</Grid>
          <Grid item>
            <b>SOP:</b> {application.sop !== "" ? application.sop : "Not Submitted"}
          </Grid>
          <Grid item>
            {application.Jobapplicant.skills.map((skill) => (
              <Chip label={skill} style={{ marginRight: "2px" }} />
            ))}
          </Grid>
          <Grid item alignItems="center"
            justifyContent="center">
            {isMeetingCreated ?
              (<>
              <Button variant="contained" style={{marginTop:"4px",marginRight:"4px",background:"#ffbd03",}} 
              onClick={handleOpenUpdateMeetingModal}><EditIcon />Update Interview</Button>
                <Button variant="contained" style={{marginTop:"4px" ,marginRight:"4px"  ,background:"red",color:"white"}}
              onClick ={deleteMeeting}  ><DeleteIcon/>Cancel Interview</Button>
              </>)
              : <Button variant="contained" style={{ background:"#ffbd03",marginBottom:"10px"}} onClick={handleOpenCreateMeetingModal}>
                <AddIcon />Schedule an Interview</Button>}
            {showCreateMeetingModal()}
            {showUpdateMeetingModal()}

          </Grid>
          {isMeetingCreated ?
            (<Grid item style={{ marginBottom: '20px' }}> <b>Meeting Link:</b> <Link href={meetingData.start_url}> <LinkIcon /> </Link></Grid>) : null}
        </Grid>
        <Grid item container direction="column" xs={12} sm={12} md={3}>
          <Grid item >
            <Button
              variant="contained"
              className={classes.statusBlock}
              color="primary"
              onClick={() => getResume()}
            >
              Download Resume
            </Button>
          </Grid>
          <Grid item container xs>
            {/* {buttonSet[application.status]} */}
            <Button
              variant="contained"
              color="primary"
              className={classes.statusBlock}
              style={{
                background: "#09BC8A",
              }}
              onClick={() => {
                setOpenEndJob(true);
              }}
            >
              End Job
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              className={classes.statusBlock}
              onClick={() => {
                setOpen(true);
              }}
            >
              Rate Applicant
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Modal open={open} onClose={handleClose} className={classes.popupDialog}>
        <Paper
          style={{
            padding: "20px",
            outline: "none",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: "30%",
            alignItems: "center",
          }}
        >
          <Rating
            name="simple-controlled"
            style={{ marginBottom: "30px" }}
            value={rating === -1 ? null : rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
          />
          <Button
            variant="contained"
            color="primary"
            style={{ padding: "10px 50px" }}
            onClick={() => changeRating()}
          >
            Submit
          </Button>
        </Paper>
      </Modal>
      <Modal
        open={openEndJob}
        onClose={handleCloseEndJob}
        className={classes.popupDialog}
      >
        <Paper
          style={{
            padding: "20px",
            outline: "none",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: "30%",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" style={{ marginBottom: "10px" }}>
            Are you sure?
          </Typography>
          <Grid container justify="center" spacing={5}>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                style={{ padding: "10px 50px" }}
                onClick={() => {
                  updateStatus("finished");
                }}
              >
                Yes
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                style={{ padding: "10px 50px" }}
                onClick={() => handleCloseEndJob()}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Modal>
    </Paper>
  );
};

const AcceptedApplicants = (props) => {
  const setPopup = useContext(SetPopupContext);

  const [applications, setApplications] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchOptions, setSearchOptions] = useState({
    sort: {
      "Jobapplicant.name": {
        status: false,
        desc: false,
      },
      "job.title": {
        status: false,
        desc: false,
      },
      dateOfJoining: {
        status: true,
        desc: true,
      },
      "Jobapplicant.rating": {
        status: false,
        desc: false,
      },
    },
  });

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    let searchParams = [];
    searchParams = [...searchParams, `status=accepted`];

    let asc = [],
      desc = [];

    Object.keys(searchOptions.sort).forEach((obj) => {
      const item = searchOptions.sort[obj];
      if (item.status) {
        if (item.desc) {
          desc = [...desc, `desc=${obj}`];
        } else {
          asc = [...asc, `asc=${obj}`];
        }
      }
    });

    searchParams = [...searchParams, ...asc, ...desc];
    const queryString = searchParams.join("&");
    let address = `${apiList.applicants}`;
    if (queryString !== "") {
      address = `${address}?${queryString}`;
    }


    axios
      .get(address, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        setApplications(response.data);
      })
      .catch((err) => {
        console.log(err);
        setApplications([]);
        setPopup({
          open: true,
          severity: "error",
          message: err.response.data.message,
        });
      });
  };

  return (
    <>
      <Grid
        container
        item
        direction="column"
        alignItems="center"
        style={{ padding: "30px", minHeight: "93vh" }}
      >
        <Grid item>
          <Typography variant="h3">Employees</Typography>
        </Grid>
        <Grid item>
          <IconButton onClick={() => setFilterOpen(true)}>
            <FilterListIcon />
          </IconButton>
        </Grid>
        <Grid
          container
          item
          xs
          direction="column"
          style={{ width: "100%" }}
          alignItems="stretch"
          justify="center"
        >
          {applications.length > 0 ? (
            applications.map((obj) => (
              <Grid item>
                <ApplicationTile application={obj} getData={getData} />
              </Grid>
            ))
          ) : (
            <Typography variant="h5" style={{ textAlign: "center" }}>
              No Applications Found
            </Typography>
          )}
        </Grid>
      </Grid>
      <FilterPopup
        open={filterOpen}
        searchOptions={searchOptions}
        setSearchOptions={setSearchOptions}
        handleClose={() => setFilterOpen(false)}
        getData={() => {
          getData();
          setFilterOpen(false);
        }}
      />
    </>
  );
};

export default AcceptedApplicants;
