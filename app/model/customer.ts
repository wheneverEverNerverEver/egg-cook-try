
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const CustomerSchema = new Schema({
    code: { type: String, unique: true },
    name: { type: String },
    deadline: { type: Number }, /** 账期允许长度，默认3天 */
    district: { type: String }, /** 所属线路 */
    updateTime: { type: Date }, /** 更新时间 */
    label: { type: String }, /** 客户类别标签 */
    oweTotal: { string: Number }, /** 总共欠款 */
    manager: { type: String }, /** ※业务员※=地区 */
    phone: { type: String },
    trUsed: { type: Number }, /** 在有赞导入中，当有电话号码重复的情况数字越大表示越常使用 */
  });

  return mongoose.model('customer', CustomerSchema);
};
