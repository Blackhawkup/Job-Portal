const axios = require('axios');
const { Applications, Meetings, User } = require('../db/models')
const { renderMeetingDetailsHtml } = require("../lib/emailHtmlTemplates")
const nodemailer = require('nodemailer')
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your email',
        pass: 'your password'
    }
});
async function zoomUserInfo(req, res, next) {
    const zoomToken = req.body.zoomToken;
    const email = 'abc@gmail.com'; //host email id
    axios.get("https://api.zoom.us/v2/users/" + email, {
        headers: {
            'Authorization': 'Bearer ' + zoomToken,
            'User-Agent': 'Zoom-api-Jwt-Request',
            'content-type': 'application/json'
        }
    }).then((result) => {
        res.status(200).send(result.data)
    })
        .catch((err) => {
            console.log(err)
            res.status(400).json({ message: "Failed To fetch userInfo" })


        })
}

async function createZoomMeeting(req, res, next) {
    const zoomToken = req.body.zoomToken;
    const email = 'harshilsharaf@gmail.com'; //host email id;
    const date = req.body.startDate.concat("T", req.body.startTime, ":00")
    axios.post("https://api.zoom.us/v2/users/" + email + "/meetings", {
        "topic": req.body.topic,
        "type": 2,
        "start_time": date,
        "duration": req.body.duration,
        "timezone": "Asia/Calcutta",
        // "password": "",
        "agenda": req.body.agenda,
        "settings": {
            "host_video": true,
            "participant_video": true,
            "cn_meeting": false,
            "in_meeting": true,
            "join_before_host": false,
            "mute_upon_entry": false,
            "watermark": false,
            "use_pmi": false,
            "approval_type": 2,
            "audio": "both",
            "auto_recording": "local",
            "enforce_login": false,
            "registrants_email_notification": false,
            "waiting_room": true,
            "allow_multiple_devices": true
        }
    }, {
        headers: {
            'Authorization': 'Bearer ' + zoomToken,
            'User-Agent': 'Zoom-api-Jwt-Request',
            'content-type': 'application/json'
        }
    }).then((result) => {
        console.log(result.data)
        const meetingDetails = {
            zoomMeetingId: result.data.id,
            meetingURL: result.data.join_url,
            rid: req.body.rid,
            aid: req.body.aid,
            applicationId: req.body.applicationId,
            jid: req.body.jid
        }
        Meetings.create(meetingDetails).then((meeting) => {
            Applications.update({
                mid: meeting.dataValues.mid
            },
                { where: { applicationId: meeting.dataValues.applicationId } }
            ).then((resultApplications) => { })
                .catch((err) => { console.log(err) })

            User.findByPk(req.body.aid)
                .then((user) => {
                    const start_date = new Date(result.data.start_time).toLocaleDateString()
                    const start_time = new Date(result.data.start_time).toLocaleTimeString()

                    var mailOptions = {
                        from: 'Job Portal <harshilsharaf@gmail.com>',
                        to: user.email,
                        subject: 'Your Interview Has been Scheduled!',
                        html: renderMeetingDetailsHtml(result.data.join_url,start_time,start_date)
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error)
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                })
                .catch((err) => {
                    console.log(err)
                })

            console.log("Meeeting Added Successfully!")
            res.status(200).send(result.data)

        }).catch(err => console.log(err))

    }).catch((error) => {
        console.log(error)
        res.status(400).json({ message: "Failed To create Meeting" })
    })
    // console.log(date)
}

async function updateMeeting(req, res, next) {
    const zoomToken = req.body.zoomToken;
    const meetingId = req.body.id;
    const startTime = req.body.start_time.split("Z")
    return axios.patch("https://api.zoom.us/v2/meetings/" + meetingId, {
        "topic": req.body.topic,
        "type": 2,
        "start_time": startTime[0],
        "duration": req.body.duration,
        "timezone": "India",
        "agenda": req.body.agenda,
        "settings": {
            "host_video": true,
            "participant_video": true,
            "cn_meeting": false,
            "in_meeting": true,
            "join_before_host": false,
            "mute_upon_entry": false,
            "watermark": false,
            "use_pmi": false,
            "approval_type": 2,
            "audio": "both",
            "auto_recording": "local",
            "enforce_login": false,
            "registrants_email_notification": false,
            "waiting_room": true,
            "allow_multiple_devices": true
        }
    }, {
        headers: {
            'Authorization': 'Bearer ' + zoomToken,
            'User-Agent': 'Zoom-api-Jwt-Request',
            'content-type': 'application/json'
        }
    })

}
async function deleteMeeting(req, res, next) {
    const zoomToken = req.body.zoomToken;
    const meetingId = req.body.id;
    axios.delete("https://api.zoom.us/v2/meetings/" + meetingId, {
        headers: {
            'Authorization': 'Bearer ' + zoomToken,
            'User-Agent': 'Zoom-api-Jwt-Request',
            'content-type': 'application/json'
        }
    }).then((result) => {
        Applications.update({ mid: null }, {
            where: {
                applicationId: req.body.applicationId,
            }
        }).then(() => {
            Meetings.destroy({
                where: {
                    zoomMeetingId: meetingId
                }
            }).then(() => { })
                .catch(err => { console.log(err) })
        }).catch((err) => { console.log(err) })
        if(result.status === 204)
            {res.status(200).json({status:200,message:"Meeting Deleted Successfully"}) }
        else {
            res.status(400).json({status:result.status,message:"Some Error Occured."})
        }
    }).catch((error) => {
        console.log(error)
        res.status(400).send({ message: "Failed To delete Meeting" })
    })
}

async function getMeeting(req, res, next) {

    const zoomToken = req.body.zoomToken;
    const meetingId = req.body.meetingId;
    axios.get("https://api.zoom.us/v2/meetings/" + meetingId, {
        headers: {
            'Authorization': 'Bearer ' + zoomToken,
            'User-Agent': 'Zoom-api-Jwt-Request',
            'content-type': 'application/json'
        }
    }).then((result) => {
        Object.keys(result).forEach((key) => {
            if (key !== "data") delete result[key]
        })
        const finalResult = { ...result.data, rid: req.body.rid, aid: req.body.aid, jid: req.body.jid, applicationId: req.body.applicationId }
        // res.status(200).send(result.data)
        console.log(result.data)
        res.status(200).json({ data: finalResult })

    }).catch((error) => {
        console.log(error)
        res.status(400).send({ message: "Failed To get Meeting" })
    })

}
module.exports = { zoomUserInfo, createZoomMeeting, updateMeeting, deleteMeeting, getMeeting }