const socket = io();
$("#list_mess").hide();
$("#set_met").hide();
$("#send-file").hide()
$("#file_share").hide()
$("#meet").hide()
let Create_at = new Date();
let date =
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

$(document).ready(() => {
    $(document).on('click', '#list_meet', ()=>{
        $("#meet").show(500)
        $(document).on('click', '#list_meet', ()=>{
            $("#meet").hide()
        })
    })
    $(document).on('click', '#list-upload-file', ()=>{
        $("#file_share").show(500)
        $(document).on('click', '#list-upload-file', ()=>{
            $("#file_share").hide()
        })
    })
})
$(document).ready(() => {
    let user_id = $("#user_id").val();
    let user_role = $("#role").val();
    let user_full = $("#user_full").val();
    let user_img = $("#us_img").val();
    socket.emit("user_info", {
        user_id,
        user_role,
        user_full,
    });
    socket.on("chat_tutor", (data) => {
        let tutor =
            "<li id='chat-icon'><div Id ='" +
            data.tutor_id +
            "' name ='" +
            data.tutor_full +
            "' class='a-user'><img src='/static/images/" +
            data.tutor_avatar +
            "' alt='sunil' class='chat_img'><div class='chat_title' >" +
            data.tutor_full +
            "</div><br><div class='chat_ib'></div><div class='clearfix'></div></div></li>";
        $(".list_people").append(tutor);
    });
    socket.on("chat_student", (data) => {
        data.students.forEach((student) => {
            let user =
                "<li id='chat-icon'><div Id ='" +
                student._id +
                "'  name ='" +
                student.User_full +
                "'class='a-user'><img src='/static/images/" +
                student.User_avatar +
                "' alt='sunil' class='chat_img'><div class='chat_title' >" +
                student.User_full +
                "</div><br><div class='chat_ib'></div><div class='clearfix'></div></div></li>";
            $(".list_people").append(user);
        });
    });
    $(document).on("click", ".a-user", function() {
        let id = $(this).attr("Id");
        let name = $(this).attr("name");
        $("#list_mess").show(500);
        socket.emit("get_mess", { id, name });
        socket.on("list_message", (sender, receiver, name) => {
            $("#my_msg").html("");
            sender.Message.forEach((msg_sender) => {
                let msg =
                    "<p>" +
                    msg_sender.message +
                    "</p><span class='time_date'>" +
                    msg_sender.Date +
                    "</span>";
                $("#my_msg").append(msg);
            });
            let receiver_info = new Array(receiver.Sender);
            $("#msg_come").html("");
            $("#img_come").html("");
            receiver_info.forEach((img_receiver) => {
                let img =
                    "<img class='chat_img' src='/static/images/" +
                    img_receiver.User_avatar +
                    "' alt='sunil'>";
                $("#img_come").append(img);
            });
            receiver.Message.forEach((msg_receiver) => {
                let msg =
                    "<p>" +
                    msg_receiver.message +
                    "</p><span class='time_date'>" +
                    msg_receiver.Date +
                    "</span>";
                $("#msg_come").append(msg);
            });
            $("#date_meet").html("");
            $("#time_meet").html("");
            $("#place_meet").html("");
            $("#note_meet").html("");
            sender.Meet.forEach((meet) => {
                let date_meet = "<li>" + meet.Date + "</li>";
                let time_meet = "<li>" + meet.Time + "</li>";
                let place_meet = "<li>" + meet.Place + "</li>";
                let note_meet = "<li>" + meet.Note + "</li>";
                $("#date_meet").append(date_meet);
                $("#time_meet").append(time_meet);
                $("#place_meet").append(place_meet);
                $("#note_meet").append(note_meet);
            });
            $('#l_files').html("")
            $('#note_file').html("")
            sender.Document_Share.forEach((file)=>{
                let l_file = "<li><a href='/static/Files/"+file.File+"' download='/static/Files/"+file.File+"'>"+file.File+"</a></li>"
                let l_note = "<li>"+file.Note+"</li>"
                $('#l_files').append(l_file)
                $('#note_file').append(l_note)
            })
        });
        $(document).on("click", "#set_meet", () => {
            $("#set_met").show(500);
            $(document).on("click", "#set", () => {
                let date = $("#Date").val();
                let hours = $("#hours").val();
                let place = $("#place").val();
                let note = $("#note").val();
                let date_meet = "<li>" + date + "</li>";
                let time_meet = "<li>" + hours + "</li>";
                let place_meet = "<li>" + place + "</li>";
                let note_meet = "<li>" + note + "</li>";
                $("#date_meet").append(date_meet);
                $("#time_meet").append(time_meet);
                $("#place_meet").append(place_meet);
                $("#note_meet").append(note_meet);
                socket.emit("Set-meet", date, hours, place, note, id);
                $("#set_met").hide();
            });
            $(document).on('click', '#set_meet', ()=>{
                $('#set_met').hide()
            })
        });
        $("#input-message").on("keyup", (event) => {
            let message = $("#input-message").val();
            if (event.keyCode === 13 && message != "") {
                let my_msg =
                    "<p>" + message + "</p><span class='time_date'>" + date + "</span>";
                $("#my_msg").append(my_msg);
                socket.emit("send_message", {
                    id,
                    message,
                    time: date,
                    user_img,
                });
                $("#input-message").val("");
            } else if (event.keyCode === 13) {
                alert("Please enter your message");
            }
        });
        $(document).on('click', '#upload-file', ()=>{
            $('#send-file').show(500)
            $(document).on('click', '#send', () => {
                let my_file = $('#fileinput').prop('files')[0]
                let note = $('#note-File').val()
                let size_file = my_file.size
                let name = `${Date.now()}-${my_file.name}`
                if(size_file > 4194304)
                {
                    alert('File is too large')
                }
                else
                {
                    $('#fileinput').val('')
                    $('#note-File').val('')
                    socket.emit('send-file', my_file, name,id, note)
                    let l_file = "<li><a href='/static/Files/"+file.File+"' download='/static/Files/"+file.File+"'>"+file.File+"</a></li>"
                    let l_note = "<li>"+note+"</li>"
                    $('#l_files').append(l_file)
                    $('#note_file').append(l_note)
                    $('#send-file').hide()
                }
            })
        })
    });
    socket.on('P-send-file', (my_filename, note)=>{
        let l_file = "<li><a href='/static/Files/"+file.File+"' download='/static/Files/"+file.File+"'>"+file.File+"</a></li>"
        let l_note = "<li>"+note+"</li>"
        $('#l_files').append(l_file)
        $('#note_file').append(l_note)
        bt = setInterval(() => {
            $("#chat-icon").css("background-color", "blue");
        }, 50);
    })
    socket.on("user-message", (data) => {
        let msg =
            "<p>" +
            data.message +
            "</p><span class='time_date'>" +
            data.time +
            "</span>";
        $("#msg_come").append(msg);
        bt = setInterval(() => {
            $("#chat-icon").css("background-color", "blue");
        }, 50);
    });
    socket.on("P-set-meet", (data) => {
        let date = "<li>" + data.date + "</li>";
        let time = "<li>" + data.hours + "</li>";
        let place = "<li>" + data.place + "</li>";
        let note = "<li>" + data.note + "</li>";
        $("#date_meet").append(date);
        $("#time_meet").append(time);
        $("#place_meet").append(place);
        $("#note_meet").append(note);
        bt = setInterval(() => {
            $("#chat-icon").css("background-color", "blue");
        }, 50);
    });

});