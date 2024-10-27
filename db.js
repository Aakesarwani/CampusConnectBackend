const mongoose = require("mongoose");

const url =
  "mongodb+srv://akesarwani950:5f1QQaphxr0nEomZ@stackcluster0.5ordw.mongodb.net/?retryWrites=true&w=majority&appName=StackCluster0";
module.exports.connect = () => {
  mongoose
    .connect(url, {
      useNewUrlParser: true,
      // useFindAndModify: false,
      useUnifiedTopology: true,
      // useCreateIndex: true,
      serverSelectionTimeoutMS: 20000,
    })
    .then(() => console.log("MongoDB is connected successfully"))
    .catch((err) => console.log("Error: ", err));
};
