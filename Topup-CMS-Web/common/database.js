const mongoose = require("mongoose");
module.exports = () => {
  const MONGODB_RUI ='mongodb+srv://hoangpn:hoangpn123@team2-ojrxy.mongodb.net/Cms_database?retryWrites=true&w=majority'
  mongoose.set("useCreateIndex", true);
  mongoose.connect(MONGODB_RUI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify:false
  });
  // mongoose.connection.on('connected', ()=>{
  //   console.log('ok')
  // })

  return mongoose;
};
