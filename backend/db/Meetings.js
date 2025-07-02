const Sequelize = require("sequelize");
const { DataTypes } = require("sequelize");
const sequelize = require("./Connection");

const Meetings = sequelize.define(
    "Meetings",
    {
        mid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        applicationId:{
            type:Sequelize.UUID,
            allowNull:false
        }
        ,
        meetingURL: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        zoomMeetingId: {
            type: Sequelize.BIGINT,
            allowNull: false
        }

    })

module.exports = Meetings