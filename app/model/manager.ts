/* eslint-disable array-bracket-spacing */

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const ManagerSchema = new Schema({
    sxCode: { type: String },
    gjCode: { type: String },
    name: { type: String },
    updateTime: { type: Date },
  });

  return mongoose.model('Manager', ManagerSchema);
};

