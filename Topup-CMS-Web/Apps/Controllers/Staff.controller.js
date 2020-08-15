const Models = require("../Models/Models");
const mongoose = require("../../common/database")();
const path = require("path");
const formidable = require("formidable");
const mv = require("mv");
const nodemailer = require("nodemailer");
let Create_at = new Date();
global.date =
  Create_at.getFullYear() +
  "-" +
  (Create_at.getMonth() + 1) +
  "-" +
  Create_at.getDate() +
  "/" +
  Create_at.getHours() +
  ":" +
  Create_at.getMinutes() +
  ":" +
  Create_at.getSeconds();
async function Page_Index(req, res) {
  return res.render("StaffPage/index");
}
function Staff_Profile(req, res) {
  return res.render("StaffPage/profile/profile");
}
async function Group_Page(req, res) {
  let student = await Models.RoleModel.findOne({ roleName: "Student" });
  if (req.query.page) {
    var page = parseInt(req.query.page);
  } else {
    var page = 1;
  }

  let rowsPerPage = 5;
  let perRow = page * rowsPerPage - rowsPerPage;
  let ClassAll = await Models.GroupModel.find();
  var totalRow = ClassAll.length;
  var totalPage = Math.ceil(totalRow / rowsPerPage);
  var pagePrev, pageNext;
  if (page - 1 <= 0) {
    pagePrev = 1;
  } else {
    pagePrev = page - 1;
  }
  if (page + 1 >= totalPage) {
    pageNext = totalPage;
  } else {
    pageNext = page + 1;
  }
  let Group = await Models.GroupModel.find()
    .sort({ _id: -1 })
    .skip(perRow)
    .limit(rowsPerPage);
  return res.render("StaffPage/groups/index", {
    data: {
      group: Group,
      totalPage: totalPage,
      pagePrev: pagePrev,
      pageNext: pageNext,
      role: student._id,
    },
  });
}
async function Get_Create_Group(req, res) {
  let role = await Models.RoleModel.findOne({ roleName: "Tutor" });
  let tutor = await Models.UserModel.find({ User_role: role._id });
  return res.render("StaffPage/groups/create", {
    data: { tutor: tutor },
  });
}
async function Post_Create_Group(req, res) {
  let group_id = req.body.group_id;
  let group_name = req.body.group_name;
  let tutor_id = req.body.tutor_id;
  let New_Group = await new Models.GroupModel({
    Group_ID: group_id,
    Group_name: group_name,
    Tutor_id: tutor_id,
    Create_at: date,
    Update_at: "",
  });
  New_Group.save((err) => {
    if (err) {
      let error = "Group ID already exist";
      return res.render("StaffPage/groups/create", { data: { error: error } });
    }
    return res.redirect("/staff/PersonalSupport");
  });
}
async function Get_Update_Group(req, res) {
  let group_id = req.params.group_id;
  let Group = await Models.GroupModel.findById({ _id: group_id });
  let role = await Models.RoleModel.findOne({ roleName: "Tutor" });
  let nowTutor = await Models.UserModel.findOne({ _id: Group.Tutor_id });
  let tutor = await Models.UserModel.find({ User_role: role._id });
  return res.render("StaffPage/groups/edit", {
    data: {
      group: Group,
      tutor: tutor,
      nowTutor: nowTutor.User_full,
    },
  });
}
function Post_Update_Group(req, res) {
  let group_id = req.params.group_id;
  let group_ID = req.body.Group_id;
  let group_name = req.body.Group_name;
  let Tutor_id = req.body.tutor_id;
  Models.GroupModel.findByIdAndUpdate(
    { _id: group_id },
    {
      Update_at: date,
      Group_ID: group_ID,
      Group_name: group_name,
      Tutor_id: Tutor_id,
    }
  ).exec((err) => {
    if (err)
      return res.redirect("/staff/PersonalSupport/UpdateGroup/" + group_id);
    return res.redirect("/staff/PersonalSupport");
  });
}
function Get_Delete_Group(req, res) {
  let group_id = req.params.group_id;
  Models.GroupModel.findOneAndDelete({ _id: group_id }).exec((err) => {
    if (err) throw err;
    return res.redirect("/staff/PersonalSupport");
  });
}
async function Get_Group_Detail(req, res) {
  let group_id = req.params.group_id;
  let Group = await Models.GroupModel.findById({ _id: group_id });
  let tutor = await Models.UserModel.findById({ _id: Group.Tutor_id });
  let tutorName = tutor.User_full;
  let GroupID = Group.Group_ID;
  let GroupName = Group.Group_name;
  let StudentOfGroup = await Models.UserModel.find({ _id: Group.Student_id });
  let Role = await Models.RoleModel.findOne({ roleName: "Student" });
  let role = Role._id;
  return res.render("StaffPage/groups/detail", {
    data: {
      GroupID: GroupID,
      GroupName: GroupName,
      tutor: tutorName,
      StudentOfGroup: StudentOfGroup,
      role: role,
      group_id: group_id,
    },
  });
}
async function Get_List_Student(req, res) {
  //Get list student
  let role = req.params.role_id;
  let group_id = req.params.group_id;
  let ListStudent = await Models.UserModel.find({
    User_role: role,
  });
  return res.render("StaffPage/groups/add-student", {
    data: {
      ListStudent: ListStudent,
      group_id: group_id,
      role: role,
    },
  });
}
function Add_To_ListStudent(req, res) {
  //add student into list student(list student be save in session) before save
  let student_id = req.params.student_id;
  let role = req.params.role_id;
  let group_id = req.params.group_id;
  if (!req.session.ListStudent) {
    req.session.ListStudent = new Array();
    req.session.ListStudent.push(student_id);
    return res.redirect(
      "/staff/PersonalSupport/Group/" + group_id + "/AddStudent/" + role
    );
  }
  req.session.ListStudent.push(student_id);
  return res.redirect(
    "/staff/PersonalSupport/Group/" + group_id + "/AddStudent/" + role
  );
}
function arrayRemove(arr, value) {
  return arr.filter(function (ele) {
    return ele != value;
  });
}
function Delete_StudentInListAdd(req, res) {
  //Delete student in list student add
  let role = req.params.role_id;
  let group_id = req.params.group_id;
  let student_id = req.params.student_id;
  let arr = new Array(req.session.ListStudent);
  let result = arrayRemove(arr[0], student_id);
  req.session.ListStudent = result;
  return res.redirect(
    "/staff/PersonalSupport/Group/" + group_id + "/ListAddStudent/" + role
  );
}
async function Get_Add_Student(req, res) {
  let list_student = req.session.ListStudent;
  let role = req.params.role_id;
  let group_id = req.params.group_id;
  if (list_student === undefined) {
    return res.redirect(
      "/staff/PersonalSupport/Group/" + group_id + "/AddStudent/" + role
    );
  }
  let List = await Models.UserModel.find({ _id: list_student });
  return res.render("StaffPage/groups/list-add-student", {
    data: {
      List: List,
      group_id: group_id,
      role: role,
    },
  });
}
async function Post_Add_Student(req, res) {
  let student_id = req.session.ListStudent;
  let role = req.params.role_id;
  let group_id = req.params.group_id;
  let Class = await Models.GroupModel.findById({ _id: group_id });
  let list = new Array();
  if (Class.Student_id == list) {
    let List_Student = await Models.GroupModel.findByIdAndUpdate(
      { _id: group_id },
      {
        Student_id: student_id,
        Update_at: date,
      }
    );
    return res.redirect("/staff/PersonalSupport/GroupDetail/" + group_id);
  }
  let AddStudent = await Models.GroupModel.findByIdAndUpdate(
    { _id: group_id },
    { $addToSet: { Student_id: student_id }, Update_at: date }
  );
  return res.redirect("/staff/PersonalSupport/GroupDetail/" + group_id);
}
async function Delete_Student_Of_Group(req, res) {
  let student_id = req.params.student_id;
  let group_id = req.params.group_id;
  let Group = await Models.GroupModel.findByIdAndUpdate(
    { _id: group_id },
    { $pull: { Student_id: student_id } }
  );
  return res.redirect("/staff/PersonalSupport/GroupDetail/" + group_id);
}
async function Send_Mail_For_Group(req, res) {
  let group_id = req.params.group_id;
  let Group = await Models.GroupModel.findById({ _id: group_id });
  let Tutor = await Models.UserModel.findOne({ _id: Group.Tutor_id });
  let Student = await Models.UserModel.find({ _id: Group.Student_id });
  let Tutor_mail = Tutor.User_mail;
  return res.render("StaffPage/groups/email", {
    data: { Student: Student, Tutor_mail: Tutor_mail, group_id: group_id },
  });
}
function Post_Send_Mail_For_Group(req, res) {
  let student_email = req.body.student_mail;
  let tutor_mail = req.body.tutor_mail;
  let subject = req.body.subject;
  let content = req.body.content;
  let group_id = req.params.group_id
  if(!student_email)
  {
    student_email = ""
  }
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "hoangpn2201@gmail.com",
      pass: "Hoang123@",
    },
  });
  let mailOptions = {
      from: '"Admin" <hoangpn2201@gmail.com>',
      to: tutor_mail + student_email,
      subject: subject,
      text: content
  }
  transporter.sendMail(mailOptions, (err)=>{
    if(err) throw err
    return res.redirect('/staff/PersonalSupport/GroupDetail/'+group_id)
  })
}
function Index_Account(req, res) {
  Models.RoleModel.find({}).exec((err, Role) => {
    return res.render("StaffPage/account/index", { data: { Role: Role } });
  });
}
async function List_Account(req, res) {
  let role_id = req.params.role_id;
  if (req.query.page) {
    var page = parseInt(req.query.page);
  } else {
    var page = 1;
  }

  let rowsPerPage = 10;
  let perRow = page * rowsPerPage - rowsPerPage;
  let UserAll = await Models.UserModel.find({ User_role: role_id });
  var totalRow = UserAll.length;
  var totalPage = Math.ceil(totalRow / rowsPerPage);
  var pagePrev, pageNext;
  if (page - 1 <= 0) {
    pagePrev = 1;
  } else {
    pagePrev = page - 1;
  }
  if (page + 1 >= totalPage) {
    pageNext = totalPage;
  } else {
    pageNext = page + 1;
  }
  let User = await Models.UserModel.find({ User_role: role_id })
    .sort({ _id: -1 })
    .skip(perRow)
    .limit(rowsPerPage);
  return res.render("StaffPage/account/listAccount", {
    data: {
      account: User,
      totalPage: totalPage,
      pagePrev: pagePrev,
      pageNext: pageNext,
      role: role_id,
    },
  });
}
async function Get_Create_Account(req, res) {
  let role_id = req.params.role_id;
  return res.render("StaffPage/account/create", {
    data: { role_id: role_id},
  });
}
function Post_Create_Account(req, res) {
  let form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    let oldUrl = files.User_avatar.path;
    let newUrl = path.join(
      __dirname,
      "../../Public/images",
      files.User_avatar.name
    );
    mv(oldUrl, newUrl, (err) => {
      if (err) throw err;
      fields.User_avatar = files.User_avatar.name;
      fields.Create_at = date;
      fields.Update_at = "";
      let New_Account = new Models.UserModel(fields, { versionKey: false });
      New_Account.save((err) => {
        if (err) {
          let error = "Email already exist";
          return res.render("StaffPage/account/create", {
            data: { error: error },
          });
        }
        return res.redirect("/staff/Account/" + req.params.role_id);
      });
    });
  });
}
async function Detail_Account(req, res) {
  let user_id = req.params.user_id;
  let role = req.params.role_id;
  let user_role = await Models.RoleModel.findById({ _id: role });
  let User = await Models.UserModel.findById({ _id: user_id });
  return res.render("StaffPage/account/detail", {
    data: { user: User, role: role, userRole: user_role },
  });
}
async function Get_Update_Account(req, res) {
  let user_id = req.params.user_id;
  let role = req.params.role_id;
  Models.UserModel.findById({ _id: user_id }).exec((err, user) => {
    return res.render("StaffPage/account/edit", {
      data: { user: user, role: role},
    });
  });
}
function Post_Update_Account(req, res) {
  let form = new formidable.IncomingForm();
  let user_id = req.params.user_id;
  let role = req.params.role_id;
  form.parse(req, (err, fields, files) => {
    if (files.User_avatar.name) {
      let oldUrl = files.User_avatar.path;
      let newUrl = files.User_avatar.name;
      let NewPath = path.join(__dirname, "../../Public/images", newUrl);
      mv(oldUrl, NewPath, (err) => {
        if (err) throw err;
      });
      fields.User_avatar = files.User_avatar.name;
    }
    fields.Update_at = date;
    Models.UserModel.findByIdAndUpdate({ _id: user_id }, fields).exec((err) => {
      if (err) throw err;
      return res.redirect("/staff/Account/" + role);
    });
  });
}
function Get_Delete_Account(req, res) {
  let user_id = req.params.user_id;
  let role = req.params.role_id;
  Models.UserModel.findByIdAndDelete({ _id: user_id }).exec((err) => {
    if (err) throw err;
    return res.redirect("/staff/Account/" + role);
  });
}
function Get_SendMail_For_Account(req, res)
{
  let role = req.params.role_id
  return res.render('StaffPage/account/email', {data:{role:role}})
}
function Post_SendMail_For_Account(req, res)
{
  let email = req.body.email
  let subject = req.body.subject
  let content = req.body.content
  let role = req.params.role_id
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "hoangpn2201@gmail.com",
      pass: "Hoang123@",
    },
  });
  let mailOptions = {
      from: '"Admin" <hoangpn2201@gmail.com>',
      to: email,
      subject: subject,
      text: content
  }
  transporter.sendMail(mailOptions, (err)=>{
    if(err) throw err
    return res.redirect('/staff/Account/'+role)
  })
}
async function Chart(req, res)
{
  let role = await Models.RoleModel.find({})
  return res.render('StaffPage/report/index', {role:{User_role: role}})
}
async function Chart_Role(req, res)
{
  let role_id = req.params.role_id
  let role = await Models.RoleModel.findById({_id: role_id})
  let Role_Name = role.roleName
  return res.render('StaffPage/report/chart', {Role:{Role_Name: Role_Name, role_id: role_id}})
}
async function Detail_Mess(req, res)
{
  let user_id = req.params.user_id
  let User = await Models.UserModel.findById({_id: user_id})
  return res.render('StaffPage/report/detail', {user_info:{User: User}})
}
async function Student_Support(req, res)
{
  let student = await Models.RoleModel.findOne({roleName: "Student"})
  let Sum_student= await Models.UserModel.find({User_role: student._id})
  return res.render('StaffPage/report/chartStudentSupport', {data:{sum_student: Sum_student.length}})
}
async function Chart_Personal_Tutor(req, res)
{
  let tutor = await Models.RoleModel.findOne({roleName: "Tutor"})
  return res.render('StaffPage/report/chartTutor', {data:{tutor_id: tutor._id}})
}
async function Detail_Personal_Tutor(req, res)
{
  let Tutor = await Models.UserModel.findById({_id: req.params.user_id})
  return res.render('StaffPage/report/detailTutor', {data:{Tutor: Tutor}})
}
module.exports = {
  Page_Index: Page_Index,
  Staff_Profile: Staff_Profile,
  Group_Page: Group_Page,
  Get_Create_Group: Get_Create_Group,
  Post_Create_Group: Post_Create_Group,
  Get_Update_Group: Get_Update_Group,
  Post_Update_Group: Post_Update_Group,
  Get_Delete_Group: Get_Delete_Group,
  Get_Group_Detail: Get_Group_Detail,
  Send_Mail_For_Group: Send_Mail_For_Group,
  Post_Send_Mail_For_Group: Post_Send_Mail_For_Group,
  Index_Account: Index_Account,
  List_Account: List_Account,
  Get_Create_Account: Get_Create_Account,
  Post_Create_Account: Post_Create_Account,
  Detail_Account: Detail_Account,
  Get_Update_Account: Get_Update_Account,
  Post_Update_Account: Post_Update_Account,
  Get_Delete_Account: Get_Delete_Account,
  Get_List_Student: Get_List_Student,
  Add_To_ListStudent: Add_To_ListStudent,
  Get_Add_Student: Get_Add_Student,
  Post_Add_Student: Post_Add_Student,
  Delete_Student_Of_Group: Delete_Student_Of_Group,
  Delete_StudentInListAdd: Delete_StudentInListAdd,
  Get_SendMail_For_Account:Get_SendMail_For_Account,
  Post_SendMail_For_Account: Post_SendMail_For_Account,
  Chart: Chart,
  Chart_Role: Chart_Role,
  Detail_Mess: Detail_Mess,
  Student_Support: Student_Support,
  Chart_Personal_Tutor: Chart_Personal_Tutor,
  Detail_Personal_Tutor: Detail_Personal_Tutor
};
