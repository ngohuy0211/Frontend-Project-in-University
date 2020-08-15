const Models = require("../Models/Models");
const mongoose = require("../../common/database")();
const jwt = require("jsonwebtoken");
async function checkAth(req, res, next) {
  let token = req.signedCookies.user;
  if (!token) {
    return res.redirect("/login");
  }
  let userId = jwt.verify(token, "Team2DevelopmentCms", (err, decode) => {
    if (err) return res.status(400).send("Error");
    global.user_ifo = decode.user;
    Models.UserModel.find({ _id: decode.user.user_id }).exec((err, docs) => {
      if (docs == null) {
        return res.redirect("/login");
      }
      res.locals.user = docs;
      global.User_id = docs._id
      return next();
    });
  });
}
function CheckStaff(req, res, next) {
  Models.RoleModel.findById({ _id: user_ifo.user_role }).exec((err, role) => {
    if (role.roleName === "Staff") {
      return next();
    }
    return res.redirect("/login");
  });
}
function CheckTutorAndStudent(req, res, next) {
  Models.RoleModel.findById({ _id: user_ifo.user_role }).exec((err, role) => {
    if (role.roleName === "Tutor") {
      res.locals.role = role.roleName;
      return next();
    }
    if(role.roleName === "Student")
    {
      res.locals.role = role.roleName;
      return next();
    }
     return res.redirect("/login");
  });
}
module.exports = {
  reqAuth: checkAth,
  CheckStaff: CheckStaff,
  CheckTutorAndStudent: CheckTutorAndStudent
};
