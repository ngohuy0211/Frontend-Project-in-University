const Models = require('../Models/Models')
const mongoose = require("../../common/database")();
const nodemailer = require('nodemailer')
async function Index_Page(req, res)
{
    let staff = await Models.RoleModel.findOne({roleName: "Staff"})
    return res.render('TutorAndStudent/index', {data:{staff_id: staff._id}})
}
function Profile_Page(req, res)
{
    res.render('TutorAndStudent/profile/detail')
}
async function Chat(req, res)
{
    return res.render('TuTorAndStudent/chatbox/index')
}
async function Dashboard(req, res)
{
    let user = await Models.UserModel.findById({_id:req.params.user_id})
    let Role = await Models.RoleModel.findById({_id: user.User_role})
    return  res.render('TutorAndStudent/dashboard/index', {data:{user_id: req.params.user_id, Role: Role.roleName}})
}
async function Get_Contact(req, res)
{
    let role = await Models.RoleModel.findOne({roleName: "Staff"})
    global.List_staff = await Models.UserModel.find({User_role: role._id})
    return res.render('TutorAndStudent/contact/index', {data:{Staff: List_staff}})
}
async function Post_Contact(req, res)
{
    let arr = new Array()
    for(var i=0; i<= List_staff.length-1; i++)
    {
        arr.push(List_staff[i].User_mail)
    }
    let staff_mail = req.body.staff_mail
    let mail = req.body.mail
    let student_name = req.body.name
    let student_id = req.body.id
    let content = req.body.content
    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "hoangpn2201@gmail.com",
          pass: "Hoang123@",
        },
      });
      let mailOptions = {
          from: '"Admin" <hoangpn2201@gmail.com>',
          to: staff_mail,
          subject: "From "+ student_name +", email: "+ mail+" Student ID: "+student_id,
          text: content
      }
    if(arr.includes(staff_mail) == true)
    {
          transporter.sendMail(mailOptions, (err, info)=>{
            if(err) throw err
            console.log(info)
            return res.redirect('/user')
          })
    }
    else{
        let err  = "Please enter email of staff"
        return res.render('TutorAndStudent/contact/index', {data:{err: err, Staff: List_staff}})
    }
}
module.exports = {
    Index_Page: Index_Page,
    Profile_Page: Profile_Page,
    Chat: Chat,
    Dashboard: Dashboard,
    Get_Contact: Get_Contact,
    Post_Contact: Post_Contact
}