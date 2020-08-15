const socket= io()
$(document).ready(()=>{
    let role_id = $('#role_id').val()
    socket.emit('RoleId', role_id)
    socket.on("Sender_Receiver", (sender, receiver, User)=>{
       User.forEach(user=>{
           let user_full = "<td>"+user.User_full+"| <a href='/staff/DetailMessage/"+user._id+"' title='Detail'><i class='fa fa-eye'>Detail</i></a></th>"
           $('#user_full').append(user_full)
       })
        sender.forEach(element => {
           let num_sender = "<td>"+element+"</td>"
           $('#sender').append(num_sender)
       });
       receiver.forEach(receiver=>{
           let num_receiver = "<td>"+receiver+"</td>"
           $('#receiver').append(num_receiver)
       })
    })
    let user_id = $('#user_id').val()
    socket.emit('detail-mess', user_id)
    socket.on('message_detail', (arr_mess_sent, arr_mess_receiver)=>{
         $('#sent').append(arr_mess_sent.length)
         $('#receive').append(arr_mess_receiver.length)
         let arr_sent = []
         let arr_receive = []
         for(i = 0; i<=arr_mess_sent.length-1; i++)
         {
            arr_sent.push(arr_mess_sent[i].Date)
         }
         for(i = 0; i<=arr_mess_receiver.length -1; i++)
         {
             arr_receive.push(arr_mess_receiver[i].Date)
         }
         $('#h_sent').append(arr_sent.join(' ; '))
         $('#h_receive').append(arr_receive.join(' ; '))
    })
    socket.emit('student_support')
    socket.on('detail_student', (List_student, Student_notSupport)=>{
        List_student.forEach(student=>{
            let ls_student = new Array()
            ls_student.push(student.User_full)
            $('#st_tutor').append(ls_student.join(' ;'))
        })
        Student_notSupport.forEach(student=>{
            let ls_student = new Array()
            ls_student.push(student.User_full)
            $('#st_not_tutor').append(ls_student.join(' ;'))
        })
    })
    socket.emit('tutor', $('#tutor_id').val())
    let tutor_id = $('#tutor_id').val()
    socket.emit('list_student_support', tutor_id)
    socket.on('sum_student_support', (list_student, Student)=>{
        Student.forEach(student=>{
            let user_full = "<li>"+student.User_full+"</li></br>"
            let student_id = "<li>"+student.User_ID+"</li></br>"
            $('#student_name').append(user_full)
            $('#student_id').append(student_id)

        })
    })
})
