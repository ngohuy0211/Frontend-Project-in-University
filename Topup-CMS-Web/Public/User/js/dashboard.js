const socket = io()
$(document).ready(()=>{
    let user_id = $('#user_id').val()
    socket.emit('data_dashboard', user_id)
    socket.on('Your_data', (Sent, Receive)=>{
        Sent.forEach(message=>{
            let receiver = "<li>"+message.Receiver.User_full+"</li>"
            $('#receiver').append(receiver)
            message.Message.forEach(data=>{
                let list_mess = "<li>"+data.message+"</li>"
                $('#message').append(list_mess)
                let list_date = "<li>"+data.Date+"</li>"
                $('#date').append(list_date)
            })
        })
        Receive.forEach(message=>{
            let sender = "<li>"+message.Sender.User_full+"</li></br>"
            $('#sender').append(sender)
            message.Message.forEach(data=>{
                let list_mess = "<li>"+data.message+"</li></br>"
                $('#r_message').append(list_mess)
                let list_date = "<li>"+data.Date+"</li></br>"
                $('#r_date').append(list_date)
            })
        })
    })
    socket.on('list_student', (list_student, student)=>{
        student.forEach(listStudent=>{
            let user_full = "<li>"+listStudent.User_full+"</li></br>"
            $('#user_full').append(user_full)
            let user_id = "<li>"+listStudent.User_ID+"</li><br>"
            $('#student_id').append(user_id)
        })
    })
})