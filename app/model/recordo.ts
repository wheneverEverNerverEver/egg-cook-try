

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const recordoSchema = new Schema({
    operationTime: { type: Number }, /**  操作时间 */
    operationDetail: { type: String }, /** 操作详情 */
    operator: { type: String }, /** 操作人 */
  });


  return mongoose.model('Recordo', recordoSchema);
};
