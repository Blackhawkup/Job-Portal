export const server = "http://localhost:5000";

const apiList = {
  login: `${server}/auth/login`,
  signup: `${server}/auth/signup`,
  uploadResume: `${server}/upload/resume`,
  uploadProfileImage: `${server}/upload/profile`,
  jobs: `${server}/api/jobs`,
  applications: `${server}/api/applications`,
  rating: `${server}/api/rating`,
  user: `${server}/api/user`,
  applicants: `${server}/api/applicants`,
  forgotPassword: `${server}/api/forgotPassword`,
  resetPassword: `${server}/api/reset-password`,
  createZoomMeeting: `${server}/api/createZoomMeeting`,
  checkMeetings: `${server}/api/checkMeetings`,
  updateMeeting: `${server}/api/updateMeeting`,
  deleteMeeting: `${server}/api/deleteMeeting`
};

export default apiList;
