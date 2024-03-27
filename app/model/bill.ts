
enum StatusBill { OWE = '3_OWE', SERIOUS_DELAY = '1_SERIOUS_DELAY', HIGH_DELAY = '2_HIGH_DELAY' }
// '3_OWE' | '1_SERIOUS_DELAY' | '2_HIGH_DELAY'

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const billSchema = new Schema({
    startTime: { type: Date }, /** 过账送达时间 */
    customer: { type: String }, /**  客户 ID */
    endTime: { type: Date }, /** 清账时间 */
    state: {
      type: StatusBill,
    }, /** 订单状态 */
    amount: { type: Number }, /** 金额 */
    orderCode: { type: String, unique: true }, /** 订单编号 */
    manager: { type: String }, /** 经手人*/
    delivery: { type: String }, /** 配送人*/
    img: { type: String }, /** 图片*/
    imgUploader: { type: String }, /** 图片上传人*/
  });

  return mongoose.model('Bill', billSchema);
};
