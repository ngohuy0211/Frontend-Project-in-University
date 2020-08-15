const Models = require("../Models/Models");
const mongoose = require("../../common/database")();
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer')
const server = require('../../app')

function Home_Page(req, res) {
  res.render("HomePage/index");
}
function GetLogin(req, res, next) {
  res.render("HomePage/login", { data: {} });
}
async function PostLogin(req, res) {
  let email = req.body.email;
  let password = req.body.password;
  Models.UserModel.findOne({ User_mail: email }).exec((err, docs) => {
    if (docs === null) {
      let error = "Wrong Email or Password";
      res.render("HomePage/login", { data: { error: error } });
      return;
    }
    if (docs.User_pass !== password) {
      let error = "Wrong Email or Password";
      res.render("HomePage/login", { data: { error: error } });
      return;
    } else {
      const user = {
        user_id: docs._id,
        user_mail: docs.User_mail,
        user_role: docs.User_role
      };
      let token = jwt.sign({ user: user }, "Team2DevelopmentCms", {
        algorithm: "HS256",
        expiresIn: "3h"
      });
      res.cookie("user", token, { maxAge: 10800000, signed: true });
       //set domain and httpOnly to cookie only send to a domain and https
      Models.RoleModel.findById({ _id: docs.User_role }).exec((err, role) => {
        if (role.roleName === "Staff") {
          return res.redirect("/staff");
        }
        if (role.roleName === "Student") {

          return res.redirect("/user");
        }
        if (role.roleName === "Tutor") {
          return res.redirect("/user");
        }
      });
    }
  });
}
function LogOut(req, res) {
  res.clearCookie("user");
  return res.redirect("/login");
}
function Get_Forgot_Password(req, res)
{
  return res.render('HomePage/Forgotpass', {data:{}})
}
function Post_Forgot_Password(req, res)
{
  let mail = req.body.email
  Models.UserModel.findOne({User_mail:mail}).exec((err, user)=>{
    if(err) {
      let error = "Email does not exist"
      return res.render('HomePage/Forgotpass', {data:{error:error}})
    }
    else{
      let transporter = nodemailer.createTransport({
        service: "Gmail",
  auth: {
    user: 'hoangpn2201@gmail.com',
    pass: 'Hoang123@'
  }
    })
    let mailOptions = {
        from: '"Admin" <hoangpn2201@gmail.com>',
        to: user.User_mail,
        subject: "Your password of University",
        text: ("Your Password of email : " + user.User_mail + " is : " + user.User_pass),
    }
    transporter.sendMail(mailOptions, (err, info)=>{
        if(err) return console.log(err)
        console.log('Message sent: ' + info)
        return res.redirect('/login')
    })
    }
  })
}
function sendMail(req, res)
{
  res.render('StaffPage/class/email')
}
module.exports = {
  Home_Page: Home_Page,
  GetLogin: GetLogin,
  PostLogin: PostLogin,
  LogOut: LogOut,
  Get_Forgot_Password: Get_Forgot_Password,
  Post_Forgot_Password: Post_Forgot_Password,
  sendMail: sendMail
};
