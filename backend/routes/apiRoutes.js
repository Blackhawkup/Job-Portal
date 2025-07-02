const Sequelize = require('sequelize')
const Op = Sequelize.Op
const express = require("express");
const router = express.Router();
const uuid = require('uuid');
const bcrypt = require("bcrypt");
const jwtAuth = require("../lib/jwtAuth");
const addZoomToken = require('../lib/zoomAuth')
const { User, JOB, JobApplicant, Recruiter, Applications, Rating, Meetings } = require('../db/models')
const nodemailer = require('nodemailer')
const zoomMeetingController = require('../lib/zoomMeetingController');
const jwt = require('jsonwebtoken');
const { renderResetPwdHtml } = require("../lib/emailHtmlTemplates")
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your email',
    pass: 'your password'
  }
});



router.post("/jobs", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type != "recruiter") {
    res.status(401).json({
      message: "You don't have permissions to add jobs",
    });
    return;
  }

  const data = req.body;

  const jobData = {
    jid: uuid.v4(),
    title: data.title,
    maxApplicants: data.maxApplicants,
    maxPositions: data.maxPositions,
    deadline: data.deadline,
    skillsets: data.skillsets,
    jobType: data.jobType,
    duration: data.duration,
    salary: parseInt(data.salary),
    rating: data.rating,
    rid: user.uid
  };

  JOB.create(jobData)
    .then(() => {
      res.json({ message: "Job added successfully to the database" });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

// to get all the jobs [pagination] [for recruiter personal and for everyone]
router.get("/jobs", jwtAuth, async (req, res) => {
  let user = req.user;

  let findParams = {};
  let sortParams = [];

  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

  // to list down jobs posted by a particular recruiter
  if (user.type === "recruiter" && req.query.myjobs) {
    findParams = {
      ...findParams,
      rid: user.uid,
    };
  }

  if (req.query.q) {
    findParams = {
      ...findParams,
      title: {
        [Op.substring]: req.query.q
      },
    };
  }

  if (req.query.jobType) {
    let jobTypes = [];
    if (Array.isArray(req.query.jobType)) {
      jobTypes = req.query.jobType;
    } else {
      jobTypes = [req.query.jobType];
    }
    findParams = {
      ...findParams,
      jobType: {
        [Op.in]: jobTypes,
      },
    };
  }

  if (req.query.salaryMin && req.query.salaryMax) {
    findParams = {
      ...findParams,
      salary: {
        [Op.and]: {
          [Op.gte]: parseInt(req.query.salaryMin),
          [Op.lte]: parseInt(req.query.salaryMax)
        }
      }

    };
  } else if (req.query.salaryMin) {
    findParams = {
      ...findParams,
      salary: {
        [Op.gte]: parseInt(req.query.salaryMin)
      },
    };
  } else if (req.query.salaryMax) {
    findParams = {
      ...findParams,
      salary: {
        [Op.lte]: parseInt(req.query.salaryMax),
      },
    };
  }

  if (req.query.duration) {
    findParams = {
      ...findParams,
      duration: {
        [Op.lt]: parseInt(req.query.duration),
      },
    };
  }

  if (req.query.asc) {
    if (Array.isArray(req.query.asc)) {
      req.query.asc.forEach(column => {
        sortParams.push([column, 'ASC'])
      })
    }
    else {
      sortParams.push([req.query.asc, 'ASC'])
    }
  }

  if (req.query.desc) {
    if (Array.isArray(req.query.desc)) {
      req.query.desc.forEach(column => {
        sortParams.push([column, 'DESC'])
      })
    }
    else { sortParams.push([req.query.desc, 'DESC']) }
  }


  let queryParams = {
    where: {
      ...findParams, status: {
        [Op.notIn]: ["Deleted"]
      }
    },
    order: sortParams,
    include: [{ model: Recruiter, attributes: ['name'], required: true }]
  }


  await JOB.findAll(queryParams)
    .then((posts) => {
      if (posts == null) {
        res.status(404).json({
          message: "No job found",
        });
        return;
      }
      res.json(posts);
    })
    .catch((err) => {
      console.log(err)
      res.status(400).json(err);
    });
});


// to get info about a particular job
router.get("/jobs/:id", jwtAuth, (req, res) => {
  JOB.findByPk(req.params.id)
    .then((job) => {
      if (job == null) {
        res.status(400).json({
          message: "Job does not exist",
        });
        return;
      }
      res.json(job);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

// to update info of a particular job
router.put("/jobs/:id", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type != "recruiter") {
    res.status(401).json({
      message: "You don't have permissions to change the job details",
    });
    return;
  }
  console.log(req.params)
  JOB.findOne({
    where: {
      jid: req.params.id,
      rid: user.uid,
    }

  })
    .then((job) => {
      if (job == null) {
        res.status(404).json({
          message: "Job does not exist",
        });
        return;
      }
      const data = req.body;
      if (data.maxApplicants) {
        job.maxApplicants = data.maxApplicants;
      }
      if (data.maxPositions) {
        job.maxPositions = data.maxPositions;
      }
      if (data.deadline) {
        job.deadline = data.deadline;
      }
      job
        .save()
        .then(() => {
          res.json({
            message: "Job details updated successfully",
          });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    })
    .catch((err) => {
      console.log(err)
      res.status(400).json(err);
    });
});

// to delete a job
router.delete("/jobs/:id", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type != "recruiter") {
    res.status(401).json({
      message: "You don't have permissions to delete the job",
    });
    return;
  }
  JOB.update(
    { status: "Deleted" },
    {
      where: {
        jid: req.params.id,
        rid: user.uid,
      }
    })
    .then((job) => {
      if (job === null) {
        res.status(401).json({
          message: "You don't have permissions to delete the job",
        });
        return;
      }
      res.json({
        message: "Job deleted successfully",
      });
    })
    .catch((err) => {
      console.log(err)
      res.status(400).json(err);
    });
});

// get user's personal details
router.get("/user", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type === "recruiter") {
    Recruiter.findByPk(user.uid)
      .then((recruiter) => {
        if (recruiter == null) {
          res.status(404).json({
            message: "User does not exist",
          });
          return;
        }
        res.json(recruiter);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    JobApplicant.findByPk(user.uid)
      .then((jobApplicant) => {
        if (jobApplicant == null) {
          res.status(404).json({
            message: "User does not exist",
          });
          return;
        }
        res.json(jobApplicant);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
});

// get user details from id
router.get("/user/:id", jwtAuth, (req, res) => {
  User.findByPk(req.params.id)
    .then((userData) => {
      if (userData === null) {
        res.status(404).json({
          message: "User does not exist",
        });
        return;
      }

      if (userData.type === "recruiter") {
        Recruiter.findByPk(userData.uid)
          .then((recruiter) => {
            if (recruiter === null) {
              res.status(404).json({
                message: "User does not exist",
              });
              return;
            }
            res.json(recruiter);
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      } else {
        JobApplicant.findByPk(userData.uid)
          .then((jobApplicant) => {
            if (jobApplicant === null) {
              res.status(404).json({
                message: "User does not exist",
              });
              return;
            }
            res.json(jobApplicant);
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

// update user details
router.put("/user", jwtAuth, (req, res) => {
  const user = req.user;
  const data = req.body;
  if (user.type == "recruiter") {
    Recruiter.findByPk(user.uid)
      .then((recruiter) => {
        if (recruiter == null) {
          res.status(404).json({
            message: "User does not exist",
          });
          return;
        }
        const updatingData = { name: data.name, contactNumber: data.contactNumber, bio: data.bio }
        recruiter.update(updatingData).then(() => {
          res.json({
            message: "User information updated successfully",
          });
        })
          .catch((err) => {
            res.status(400).json(err);
          });


      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    JobApplicant.findByPk(user.uid)
      .then((jobApplicant) => {
        if (jobApplicant == null) {
          res.status(404).json({
            message: "User does not exist",
          });
          return;
        }
        data.education.forEach((detail) => {
          detail['startYear'] = parseInt(detail.startYear)
          detail['endYear'] = parseInt(detail.endYear)
        })
        console.log(data.education)

        const updatingData = { name: data.name, education: data.education, skills: data.skills, resume: data.resume, profile: data.profile }
        jobApplicant
          .update(updatingData)
          .then(() => {
            res.json({
              message: "User information updated successfully",
            });
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
});

router.post("/jobs/:id/applications", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to apply for a job",
    });
    return;
  }
  const data = req.body;
  const jobId = req.params.id;

  // check whether applied previously
  // find job
  // check count of active applications < limit
  // check user had < 10 active applications && check if user is not having any accepted jobs (user id)
  // store the data in applications

  Applications.findOne({
    where: {
      aid: user.uid,
      jid: jobId,
      status: {
        [Op.notIn]: ["deleted", "accepted", "cancelled"]
      }
    }
  })
    .then((appliedApplication) => {
      if (appliedApplication !== null) {
        res.status(400).json({
          message: "You have already applied for this job",
        });
        return;
      }

      JOB.findByPk(jobId)
        .then((job) => {
          if (job === null) {
            res.status(404).json({
              message: "Job does not exist",
            });
            return;
          }
          Applications.count({
            where: {
              jid: jobId,
              status: {
                [Op.notIn]: ["rejected", "deleted", "cancelled", "finished"]
              },
            }
          })
            .then((activeApplicationCount) => {
              if (activeApplicationCount < job.maxApplicants) {
                Applications.count({
                  where: {
                    aid: user.uid,
                    status: {
                      [Op.notIn]: ["rejected", "deleted", "cancelled", "finished"]
                    },
                  }
                })
                  .then((myActiveApplicationCount) => {
                    if (myActiveApplicationCount < 10) {
                      Applications.count({
                        where: {
                          aid: user.uid,
                          status: "accepted",
                        }
                      }).then((acceptedJobs) => {
                        if (acceptedJobs === 0) {
                          const applicationData = {
                            aid: user.uid,
                            rid: job.rid,
                            jid: job.jid,
                            status: "applied",
                            sop: data.sop,
                          };
                          Applications.create(applicationData).then(() => {
                            res.json({
                              message: "Job application successful",
                            });
                          })
                            .catch((err) => {
                              res.status(400).json(err);
                            });
                        } else {
                          res.status(400).json({
                            message:
                              "You already have an accepted job. Hence you cannot apply.",
                          });
                        }
                      });
                    } else {
                      res.status(400).json({
                        message:
                          "You have 10 active applications. Hence you cannot apply.",
                      });
                    }
                  })
                  .catch((err) => {
                    res.status(400).json(err);
                  });
              } else {
                res.status(400).json({
                  message: "Application limit reached",
                });
              }
            })
            .catch((err) => {
              res.status(400).json(err);
            });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

// recruiter gets applications for a particular job [pagination] [todo: test: done]
router.get("/jobs/:id/applications", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type != "recruiter") {
    res.status(401).json({
      message: "You don't have permissions to view job applications",
    });
    return;
  }
  const jobId = req.params.id;

  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

  let findParams = {
    jid: jobId,
    rid: user.uid,
  };

  let sortParams = {};

  if (req.query.status) {
    findParams = {
      ...findParams,
      status: req.query.status,
    };
  }

  Applications.findAll({ where: findParams, order: sortParams })
    .then((applications) => {
      res.json(applications);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});


// recruiter/applicant gets all his applications [pagination]
router.get("/applications", jwtAuth, (req, res) => {
  const user = req.user;

  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;
  if (user.type == "recruiter") {
    Applications.findAll({ where: { rid: user.uid }, include: [{ model: JOB, order: ['dateOfPosting', 'ASC'] }, { model: Meetings }, { model: Recruiter }] })
      .then((applications) => {
        res.json(applications);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
  else {
    Applications.findAll({ where: { aid: user.uid }, include: [{ model: JOB, order: ['dateOfPosting', 'ASC'] }, { model: Meetings }, { model: Recruiter }] })
      .then((applications) => {
        res.json(applications);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
});


// update status of application: [Applicant: Can cancel, Recruiter: Can do everything] [todo: test: done]
router.put("/applications/:id", jwtAuth, (req, res) => {
  const user = req.user;
  const applicationId = req.params.id;
  const status = req.body.status;

  // "applied", // when a applicant is applied
  // "shortlisted", // when a applicant is shortlisted
  // "accepted", // when a applicant is accepted
  // "rejected", // when a applicant is rejected
  // "deleted", // when any job is deleted
  // "cancelled", // an application is cancelled by its author or when other application is accepted
  // "finished", // when job is over

  if (user.type === "recruiter") {
    if (status === "accepted") {
      // get job id from application
      // get job info for maxPositions count
      // count applications that are already accepted
      // compare and if condition is satisfied, then save
      Applications.findOne({
        where: {
          applicationId: applicationId,
          rid: user.uid,
        }
      })
        .then((application) => {
          if (application === null) {
            res.status(404).json({
              message: "Application not found",
            });
            return;
          }
          // console.log(application)
          JOB.findOne({
            where: {
              jid: application.jid,
              rid: user.uid,
            }
          }).then((job) => {
            // console.log(job)
            if (job === null) {
              res.status(404).json({
                message: "Job does not exist",
              });
              return;
            }

            Applications.count({
              where: {
                rid: user.uid,
                jid: job.jid,
                status: "accepted",
              }
            }).then((activeApplicationCount) => {
              if (activeApplicationCount < job.maxPositions) {
                // accepted
                // console.log(activeApplicationCount)
                application
                  .update({ status: status, dateOfJoining: req.body.dateOfJoining })
                  .then((result) => {
                    // console.log(result)
                    Applications.update({
                      status: "cancelled",
                    }, {
                      where: {
                        applicationId: {
                          [Op.ne]: application.applicationId,
                        },
                        rid: application.rid,
                        status: {
                          [Op.notIn]: [
                            "rejected",
                            "deleted",
                            "cancelled",
                            "accepted",
                            "finished",
                          ],
                        },
                      }
                    }
                    )
                      .then((result) => {
                        console.log(result)
                        if (status === "accepted") {
                          JOB.update({
                            acceptedCandidates: activeApplicationCount + 1,
                          },
                            {
                              where: {
                                jid: job.jid,
                                rid: user.uid,
                              }
                            },

                          )
                            .then((jobs) => {
                              // console.log("JOB DETAILS:",job)
                              User.findByPk(application.aid).then((result) => {

                                var mailOptions = {
                                  from: 'Job Portal <harshilsharaf@gmail.com>',
                                  to: result.email,
                                  subject: 'Your Job Application Has Been Accepted',
                                  html: `<h1>Congratulations!</h1> <p>You've Been Accepted for the permanent role of ${job.title}</p>`
                                };
                                transporter.sendMail(mailOptions, function (error, info) {
                                  if (error) {
                                    console.log(error)
                                  } else {
                                    console.log('Email sent: ' + info.response);
                                  }
                                });
                              }).catch((err) => { console.log(err) })
                              res.json({
                                message: `Application ${status} successfully`,
                              });
                            })
                            .catch((err) => {
                              res.status(400).json(err);
                            });
                        } else {
                          res.json({
                            message: `Application ${status} successfully`,
                          });
                        }
                      })
                      .catch((err) => {
                        console.log(err)
                        res.status(400).json(err);
                      });
                  })
                  .catch((err) => {
                    console.log(err)
                    res.status(400).json(err);
                  });
              } else {
                res.status(400).json({
                  message: "All positions for this job are already filled",
                });
              }
            });
          });
        })
        .catch((err) => {
          console.log(err)
          res.status(400).json(err);
        });
    } else {
      Applications.update({
        status: status,
      }, {
        where: {
          applicationId: applicationId,
          rid: user.uid,
          status: {
            [Op.notIn]: ["rejected", "deleted", "cancelled"],
          },
        },
      })
        .then((application) => {
          if (application === null) {
            res.status(400).json({
              message: "Application status cannot be updated",
            });
            return;
          }
          if (status === "finished") {
            res.json({
              message: `Job ${status} successfully`,
            });
          } else {
            res.json({
              message: `Application ${status} successfully`,
            });
          }
        })
        .catch((err) => {
          console.log(err)
          res.status(400).json(err);
        });
    }
  } else {
    if (status === "cancelled") {

      Applications.update({
        status: status,
      }, {
        where: {
          applicationId: applicationId,
          aid: user.uid,
        }
      }
      )
        .then((tmp) => {
          res.json({
            message: `Application ${status} successfully`,
          });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    } else {
      res.status(401).json({
        message: "You don't have permissions to update job status",
      });
    }
  }
});


// get a list of final applicants for current job : recruiter
// get a list of final applicants for all his jobs : recuiter
router.get("/applicants", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type === "recruiter") {
    let findParams = {
      rid: user.uid,
    };
    if (req.query.jobId) {
      findParams = {
        ...findParams,
        jid: req.query.jobId,
      };
    }
    if (req.query.status) {
      if (Array.isArray(req.query.status)) {
        findParams = {
          ...findParams,
          status: { [Op.in]: req.query.status },
        };
      } else {
        findParams = {
          ...findParams,
          status: req.query.status,
        };
      }
    }
    let sortParams = [];

    if (!req.query.asc && !req.query.desc) {
      sortParams.push(['aid', 'ASC']);
    }

    if (req.query.asc) {
      if (Array.isArray(req.query.asc)) {
        req.query.asc.forEach((column) => {
          sortParams.push([column, 'ASC'])
        })
      } else {
        sortParams.push([req.query.asc, 'ASC'])
      }
    }

    if (req.query.desc) {
      if (Array.isArray(req.query.desc)) {
        req.query.desc.forEach((column) => {
          sortParams.push([column, 'DESC'])
        })
      } else {
        sortParams.push([req.query.desc, 'DESC'])
      }
    }
    Applications.findAll({ where: findParams, order: sortParams, include: [{ model: JOB }, { model: JobApplicant }] })
      .then((applications) => {
        if (applications.length === 0) {
          res.status(404).json({
            message: "No applicants found",
          });
          return;
        }
        res.json(applications);
      })
      .catch((err) => {
        console.log(err)
        res.status(400).json(err);
      });
  } else {
    res.status(400).json({
      message: "You are not allowed to access applicants list",
    });
  }
});

// to add or update a rating [todo: test]
router.put("/rating", jwtAuth, (req, res) => {
  const user = req.user;
  const data = req.body;
  if (user.type === "recruiter") {
    // can rate applicant
    Rating.findOne({
      where: {
        senderId: user.uid,
        receiverId: data.applicantId,
        category: "applicant",
      }
    })
      .then((rating) => {
        if (rating === null) {
          Applications.count({
            where: {
              aid: data.applicantId,
              rid: user.uid,
              status: {
                [Op.in]: ["accepted", "finished"],
              },
            }
          })
            .then((acceptedApplicant) => {
              if (acceptedApplicant > 0) {
                // add a new rating
                ratingData = {
                  category: "applicant",
                  receiverId: data.applicantId,
                  senderId: user.uid,
                  rating: data.rating,
                }

                Rating
                  .create(ratingData)
                  .then(() => {
                    // get the average of ratings
                    Rating.findAll({
                      where: {
                        receiverId: data.applicantId,
                        category: "applicant",
                      },
                      attributes: [[Sequelize.fn('avg', Sequelize.col('rating')), 'average']]
                    }

                    )
                      .then((result) => {
                        // update the user's rating
                        if (result === null) {
                          res.status(400).json({
                            message: "Error while calculating rating",
                          });
                          return;
                        }
                        const avg = Math.round(result[0].dataValues.average);

                        JobApplicant.update(
                          {
                            rating: avg,
                          },
                          {
                            where: {
                              aid: data.applicantId,
                            }
                          },
                        )
                          .then((applicant) => {
                            if (applicant === null) {
                              res.status(400).json({
                                message:
                                  "Error while updating applicant's average rating",
                              });
                              return;
                            }
                            res.json({
                              message: "Rating added successfully",
                            });
                          })
                          .catch((err) => {
                            res.status(400).json(err);
                          });
                      })
                      .catch((err) => {
                        res.status(400).json(err);
                      });
                  })
                  .catch((err) => {
                    res.status(400).json(err);
                  });
              } else {
                // you cannot rate
                res.status(400).json({
                  message:
                    "Applicant didn't worked under you. Hence you cannot give a rating.",
                });
              }
            })
            .catch((err) => {
              res.status(400).json(err);
            });
        } else {
          // rating.dataValues.rating = data.rating;
          Rating
            .update({ rating: data.rating }, {
              where: {
                receiverId: data.applicantId,
                category: "applicant"
              }
            })
            .then(() => {
              // get the average of ratings
              Rating.findAll({
                where: {
                  receiverId: data.applicantId,
                  category: "applicant"
                },
                attributes: [[Sequelize.fn('avg', Sequelize.col('rating')), 'average']]
              }).then((result) => {
                // update the user's rating
                if (result === null) {
                  res.status(400).json({
                    message: "Error while calculating rating",
                  });
                  return;
                }
                const avg = Math.round(result[0].dataValues.average);
                JobApplicant.update({
                  rating: avg,
                },
                  {
                    where: {
                      aid: data.applicantId,
                    }
                  }
                )
                  .then((applicant) => {
                    if (applicant === null) {
                      res.status(400).json({
                        message:
                          "Error while updating applicant's average rating",
                      });
                      return;
                    }
                    res.json({
                      message: "Rating updated successfully",
                    });
                  })
                  .catch((err) => {
                    res.status(400).json(err);
                  });
              })
                .catch((err) => {

                  res.status(400).json(err);
                });
            })
            .catch((err) => {
              res.status(400).json(err);
            });
        }
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    // applicant can rate job
    Rating.findOne({
      where: {
        senderId: user.uid,
        receiverId: data.jobId,
        category: "job",
      }
    })
      .then((rating) => {

        if (rating === null) {
          Applications.count({
            where: {
              aid: user.uid,
              jid: data.jobId,
              status: {
                [Op.in]: ["accepted", "finished"],
              },
            }
          })
            .then((acceptedApplicant) => {
              if (acceptedApplicant > 0) {
                // add a new rating
                ratingData = {
                  category: "job",
                  receiverId: data.jobId,
                  senderId: user.uid,
                  rating: data.rating,
                }
                Rating
                  .create(ratingData)
                  .then(() => {
                    // get the average of ratings
                    Rating.findAll({
                      where:
                        { receiverId: data.jobId, category: "job" },
                      attributes: [[Sequelize.fn('avg', Sequelize.col('rating')), 'rating']]

                    })
                      .then((result) => {
                        if (result === null) {
                          res.status(400).json({
                            message: "Error while calculating rating",
                          });
                          return;
                        }
                        const avg = result[0].dataValues.average;
                        JOB.update({
                          rating: avg,
                        }, { where: { jid: data.jobId } }
                        ).then((foundJob) => {
                          if (foundJob === null) {
                            res.status(400).json({
                              message:
                                "Error while updating job's average rating",
                            });
                            return;
                          }
                          res.json({
                            message: "Rating added successfully",
                          });
                        })
                          .catch((err) => {
                            res.status(400).json(err);
                          });
                      })
                      .catch((err) => {
                        res.status(400).json(err);
                      });
                  })
                  .catch((err) => {
                    res.status(400).json(err);
                  });
              } else {
                // you cannot rate
                res.status(400).json({
                  message:
                    "You haven't worked for this job. Hence you cannot give a rating.",
                });
              }
            })
            .catch((err) => {
              res.status(400).json(err);
            });
        } else {
          // update the rating
          // rating.rating = data.rating;
          Rating
            .update({
              rating: data.rating
            }, {
              where: { receiverId: data.jobId, category: "job" }
            }
            )
            .then(() => {
              // get the average of ratings
              Rating.findAll({
                where: { receiverId: data.jobId, category: "job" },
                attributes: [[Sequelize.fn('avg', Sequelize.col('rating')), 'average']]

              }).then((result) => {
                if (result === null) {
                  res.status(400).json({
                    message: "Error while calculating rating",
                  });
                  return;
                }
                const avg = result[0].dataValues.average;

                JOB.update({
                  rating: avg,
                },
                  {
                    where: { jid: data.jobId, }

                  }
                )
                  .then((foundJob) => {
                    if (foundJob === null) {
                      res.status(400).json({
                        message: "Error while updating job's average rating",
                      });
                      return;
                    }
                    res.json({
                      message: "Rating added successfully",
                    });
                  })
                  .catch((err) => {
                    res.status(400).json(err);
                  });
              })
                .catch((err) => {
                  res.status(400).json(err);
                });
            })
            .catch((err) => {
              res.status(400).json(err);
            });
        }
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
});

// get personal rating
router.get("/rating", jwtAuth, (req, res) => {
  const user = req.user;
  Rating.findOne({
    where: {
      senderId: user.uid,
      receiverId: req.query.id,
      category: user.type === "recruiter" ? "applicant" : "job",
    }
  }).then((rating) => {
    if (rating === null) {
      res.json({
        rating: -1,
      });
      return;
    }
    res.json({
      rating: rating.rating,
    });
  });
});


//forgot password route

router.post("/forgotPassword", (req, res) => {
  const emailId = req.body.email

  // mg.messages().send(data, function (error, body) {
  // 	console.log(body);
  // });
  User.findOne({
    where: {
      email: emailId
    },
    attributes: ['uid', 'password']
  },
  ).then((user) => {
    if (user != null) {
      const secret = "some Super secret..." + user.password
      const payload = {
        email: emailId,
        id: user.uid
      }

      const token = jwt.sign(payload, secret, { expiresIn: "15m" })
      const link = `http://localhost:3000/reset-password/${user.uid}/${token}`
      var mailOptions = {
        from: 'Job Portal <harshilsharaf@gmail.com>',
        to: "gebehir156@wowcg.com",
        subject: 'Reset Your Password',
        html: renderResetPwdHtml(link)
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error)
          res.status(400).json({ message: "Some Error Occured" });
        } else {
          res.status(200).json({ status: 200, message: "Password Reset Link Has Been successfully sent to your email." })
          console.log('Email sent: ' + info.response);
        }
      });

    }
    else {
      res.status(200).json({ status: 400, message: "User does not exist.Please verify your Email." })
    }
  }).catch((error) => {
    res.status(400).json(error)
    console.log(error)
  })

})

router.post('/reset-password', (req, res, next) => {
  const { id, token } = req.body;
  User.findByPk(id).then((user) => {
    if (user === null) {
      res.send(400).json({ message: "User Invalid." })
    }
    else {
      const secret = "some Super secret..." + user.password
      try {
        // console.log("Password:",req.body.password)
        const payload = jwt.verify(token, secret)
        const salt = bcrypt.genSaltSync(10, "a");
        req.body.password = bcrypt.hashSync(req.body.password, salt);
        User.update({
          password: req.body.password
        }, {
          where: { uid: id }
        }).then((result) => {
          if (result !== null) {
            res.status(200).json({ message: "Your Password has been reset." })
          }
          else {
            res.status(400).json({ message: "Invalid User." })
          }
        }).catch((err) => { res.status(400).json({ message: "Failed to Reset Password." }) })
      }
      catch (err) {
        console.log(err)
        if (err.name = "TokenExpiredError") { res.status(400).json({ message: "Link Has Been Expired.Please Try Again." }) }
        else {
          res.status(400).json({ message: "Some Error Occured." })
        }
      }
    }
  })
});
//check for meeting
router.post("/checkMeetings", jwtAuth, addZoomToken, (req, res) => {
  const user = req.user
  if (user.type === 'recruiter') {

    Meetings.findOne({
      where: {
        rid: user.uid,
        aid: req.body.aid,
        applicationId: req.body.applicationId,
        jid: req.body.jid
      }
    }).then((result) => {
      if (result !== null) {
        req.body = { ...req.body, result }
        req.body.meetingId = result.zoomMeetingId
        zoomMeetingController.getMeeting(req, res)
      }
      else {
        res.status(200).json({ message: "Meeting Not Found" })
      }
    }).catch(err => { console.log(err) })
  }
})


//creating a zoom meeting

router.post('/createZoomMeeting', addZoomToken, zoomMeetingController.createZoomMeeting);

// update zoom meeting

router.post('/updateMeeting', jwtAuth, addZoomToken, (req, res) => {
  const user = req.user
  if (user.type === 'recruiter') {
    Meetings.findOne({
      where: {
        rid: user.uid,
        aid: req.body.aid,
        applicationId: req.body.applicationId,
        jid: req.body.jid
      }
    }).then((result) => {
      if (result !== null) {
        req.body = { ...req.body, result }
        req.body.meetingId = result.zoomMeetingId
        zoomMeetingController.updateMeeting(req, res).then((result) => {
          res.status(200).json({ message: "Meeting Details Updated Successfully" })
        }).catch((err) => {
          console.log(err)
          res.status(400).json({ message: "Failed to Update Meeting Details" })
        })
      }
      else {
        res.status(200).json({ message: "Meeting Not Found" })
      }
    }).catch(err => { console.log(err) })
  }

})

//delete zoom meeting
router.post('/deleteMeeting',jwtAuth,addZoomToken,zoomMeetingController.deleteMeeting)

module.exports = router;