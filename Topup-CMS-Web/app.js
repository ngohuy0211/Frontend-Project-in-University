const express = require("express");
const app = express();
const session = require("express-session");
require("express-group-routes");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const router = express.Router();
const ejsLint = require("ejs-lint");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");
const Body_parser = require("body-parser");
const expressValidator = require("express-validator");
const home = require("./Router/Home.router");
const staff = require("./Router/Staff.router");
const auth = require("./Apps/midderware/au.midderware");
const Student = require("./Router/Student.router");
const Models = require("./Apps/Models/Models");
require("./Apps/kernal")(app, express, Body_parser, session);
app.use(cookieParser("123@123@!T"));
app.use("/", home);
app.use("/staff", auth.reqAuth, auth.CheckStaff, staff);
app.use("/user", auth.reqAuth, auth.CheckTutorAndStudent, Student);

io.on("connection", (socket) => {
  socket.on("user_info", async (data) => {
    socket.name = data.user_full;
    socket.user_room = data.user_id;
    socket.user = data.user_id;
    socket.join(socket.user_room);
    if (data.user_role === "Student") {
      let group = await Models.GroupModel.findOne({ Student_id: data.user_id });
      let tutor = await Models.UserModel.findById({ _id: group.Tutor_id });
      let tutor_id = group.Tutor_id;
      let tutor_full = tutor.User_full;
      let tutor_avatar = tutor.User_avatar;
      socket.emit("chat_tutor", {
        tutor_id,
        tutor_full,
        tutor_avatar,
      });
    }
    if (data.user_role === "Tutor") {
      let group = await Models.GroupModel.findOne({ Tutor_id: data.user_id });
      let students = await Models.UserModel.find({ _id: group.Student_id });
      socket.emit("chat_student", {
        students,
      });
    }
    socket.on("send_message", async (data) => {
      let sender = await Models.MessageModel.findOne({
        Sender: socket.user,
        Receiver: data.id,
      });
      let receiver = await Models.MessageModel.findOne({
        Sender: data.id,
        Receiver: socket.user,
      });
      let message = data.message;
      let time = data.time;
      if (sender == null) {
        let new_mess_sender = new Models.MessageModel({
          Sender: socket.user,
          Receiver: data.id,
          Message: [
            {
              message: message,
              Date: data.time,
            },
          ],
        });
        await new_mess_sender.save();
      } else {
        await Models.MessageModel.findByIdAndUpdate(
          { _id: sender._id },
          { $addToSet: { Message: { message: message, Date: data.time } } }
        );
      }
      io.sockets.to(data.id).emit("user-message", {
        message,
        time,
      });
    });
    socket.on("get_mess", async (data) => {
      let sender = await Models.MessageModel.findOne({
        Sender: socket.user,
        Receiver: data.id,
      }).populate("Receiver, Sender");
      let receiver = await Models.MessageModel.findOne({
        Sender: data.id,
        Receiver: socket.user,
      }).populate("Receiver, Sender");
      let name = data.name;
      socket.emit("list_message", sender, receiver, name);
    });
    socket.on("Set-meet", async (date, hours, place, note, id) => {
      let sender = await Models.MessageModel.findOne({
        Sender: socket.user,
        Receiver: id,
      });
      if (sender != null) {
        await Models.MessageModel.findOneAndUpdate(
          {
            Sender: socket.user,
            Receiver: id,
          },
          {
            $addToSet: {
              Meet: { Date: date, Time: hours, Place: place, Note: note },
            },
          }
        );
        await Models.MessageModel.findOneAndUpdate(
          {
            Sender: id,
            Receiver: socket.user,
          },
          {
            $addToSet: {
              Meet: { Date: date, Time: hours, Place: place, Note: note },
            },
          }
        );
      } else {
        let new_meet_send = new Models.MessageModel({
          Sender: socket.user,
          Receiver: id,
          Meet: [
            {
              Date: date,
              Time: hours,
              Place: place,
              Note: note,
            },
          ],
        });
        let new_meet_receive = new Models.MessageModel({
          Sender: id,
          Receiver: socket.user,
          Meet: [
            {
              Date: date,
              Time: hours,
              Place: place,
              Note: note,
            },
          ],
        });
        await new_meet_send.save();
        await new_meet_receive.save();
      }
      io.sockets.to(id).emit("P-set-meet", { date, hours, place, note });
    });
    socket.on("send-file", async (my_file, my_filename, id, note) => {
      fs.writeFile(
        __dirname + "/Public/Files/" + my_filename,
        my_file,
        (err) => {}
      );
      if (sender != null) {
        await Models.MessageModel.findOneAndUpdate(
          {
            Sender: socket.user,
            Receiver: id,
          },
          { $addToSet: { Document_Share: { File: my_filename, Note: note } } }
        );
        await Models.MessageModel.findOneAndUpdate(
          {
            Sender: id,
            Receiver: socket.user,
          },
          { $addToSet: { Document_Share: { File: my_filename, Note: note } } }
        );
      } else {
        let new_file_sender = new Models.MessageModel({
          Sender: socket.user,
          Receiver: id,
          Document_Share: [
            {
              File: my_filename,
              Note: note,
            },
          ],
        });
        let new_file_receive = new Models.MessageModel({
          Sender: id,
          Receiver: socket.user,
          Document_Share: [
            {
              File: my_filename,
              Note: note,
            },
          ],
        });
        await new_file_sender.save();
        await new_file_receive.save();
      }
      io.sockets.to(id).emit("P-send-file", my_filename, note);
    });
  });
  socket.on("RoleId", async (data) => {
    let User = await Models.UserModel.find({ User_role: data });
    let arr_sender = [];
    let arr_receiver = [];
    for (let i = 0; i <= User.length - 1; i++) {
      let sender = await Models.MessageModel.find({ Sender: User[i]._id });
      arr_sender.push(sender.length);
      let receiver = await Models.MessageModel.find({ Receiver: User[i]._id });
      arr_receiver.push(receiver.length);
    }
    socket.emit("Sender_Receiver", arr_sender, arr_receiver, User);
  });
  socket.on("detail-mess", async (data) => {
    let arr_mess_sent = new Array();
    let arr_mess_receiver = new Array();
    let Mess_send = await Models.MessageModel.find({ Sender: data });
    let Mess_receive = await Models.MessageModel.find({ Receiver: data });
    Mess_send.forEach((message) => {
      for (i = 0; i <= message.Message.length - 1; i++) {
        arr_mess_sent.push(message.Message[i]);
      }
    });
    Mess_receive.forEach((message) => {
      for (i = 0; i <= message.Message.length - 1; i++) {
        arr_mess_receiver.push(message.Message[i]);
      }
    });
    socket.emit("message_detail", arr_mess_sent, arr_mess_receiver);
  });
  socket.on("student_support", async () => {
    let student = await Models.RoleModel.findOne({ roleName: "Student" });
    let Student = await Models.UserModel.find({ User_role: student._id });
    let Group = await Models.GroupModel.find({});
    let Student_support = [];
    let Student_not_Support = [];
    for (i = 0; i <= Group.length - 1; i++) {
      Student_support = Student_support.concat(Group[i].Student_id);
    }
    for (i = 0; i <= Student.length - 1; i++) {
      Student_not_Support.push(Student[i]._id);
    }
    socket.emit("list_student", Student_support, Student_not_Support);
    socket.on("Student_notSupport", async (Student_not_Support) => {
      let List_student = await Models.UserModel.find({ _id: Student_support });
      let Student_notSupport = await Models.UserModel.find({
        _id: Student_not_Support,
      });
      socket.emit("detail_student", List_student, Student_notSupport);
    });
  });
  socket.on("tutor", async (tutor_id) => {
    let Tutor = await Models.UserModel.find({ User_role: tutor_id });
    let sum_student = [];
    for (i = 0; i <= Tutor.length - 1; i++) {
      let group = await Models.GroupModel.find({ Tutor_id: Tutor[i]._id });
      sum_student.push(group);
    }
    socket.emit("sum_student_of_tutor", Tutor, sum_student);
  });
  socket.on("data_dashboard", async (user_id) => {
    let Sent = await Models.MessageModel.find({ Sender: user_id }).populate(
      "Receiver"
    );
    let Receive = await Models.MessageModel.find({
      Receiver: user_id,
    }).populate("Sender");
    socket.emit("Your_data", Sent, Receive);
    let group = await Models.GroupModel.find({ Tutor_id: user_id });
    let list_student = new Array();
    group.forEach((student) => {
      list_student = list_student.concat(student.Student_id);
    });
    let student = await Models.UserModel.find({ _id: list_student });
    socket.emit("list_student", list_student, student);
  });
  socket.on("list_student_support", async (tutor_id) => {
    let group = await Models.GroupModel.find({ Tutor_id: tutor_id });
    let list_student = [];
    group.forEach((student) => {
      list_student = list_student.concat(student.Student_id);
    });
    let Student = await Models.UserModel.find({ _id: list_student });
    socket.emit("sum_student_support", list_student, Student);
  });
});
server.listen(1000);
module.exports = app;
