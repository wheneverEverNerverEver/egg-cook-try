/* eslint-disable array-bracket-spacing */

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const ViewSchema = [String];

  const UserSchema = new Schema({
    accountName: { type: String, unique: true },
    userName: { type: String },
    password: { type: String },
    role: { type: String },
    phone: { type: String },
    viewDelivery: { typeof: ViewSchema },
    viewManager: { typeof: ViewSchema },
  });

  return mongoose.model('User', UserSchema);
};
