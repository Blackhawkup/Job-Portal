const jwt = require("jsonwebtoken");


const payload = {
    iss: "RWHFUfFaTty35yMAr7GaVQ",
    exp: ((new Date()).getTime() + 500000)
};
const token = jwt.sign(payload, "OSPscH5VmKbGRqceJ3kHggcl1e7rAhwfVSRo");


const addZoomToken = (req, res, next) => {
    req.body["zoomToken"] = token;
    next();
    (req, res, next)
}

module.exports =  addZoomToken 