
enum ProcessNowDIc { WAITING = 'WAITING', DONE = 'DONE' }// 待处理，处理完成
/** NEEDREFUND 只退款
 * NEEDRETURNREFUNF 退货退款
  */
enum ReasontypeDIc { NEEDREFUND = 'NEEDREFUND', NEEDRETURNREFUNF = 'NEEDRETURNREFUNF' }

// 客户名称	售后截图（使用超链接的方式）	售后原因	售后申请时间	售后结束时间	售后配送员	售后退款截图


module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const aftermarketSchema = new Schema({
    startTime: { type: Date }, /** 售后申请时间 */
    customer: { type: String }, /**  客户 ID */
    endTime: { type: Date }, /** 售后结束时间 */
    state: {
      type: ProcessNowDIc,
    }, /** 处理状态 */
    reasonType: {
      type: ReasontypeDIc,
    },
    reason: { type: String }, /** 售后原因 */
    orderCode: { type: String }, /** 订单编号 */
    handler: { type: String }, /** 处理人ID*/
    // creater: { type: String }, /** 创建人*/
    delivery: { type: String }, /** 售后配送员*/
    imgFromCus: { type: String }, /** 售后截图*/
    imgFromCusUploader: { type: String }, /** 售后截图*/
    imgFromWebHref: { type: String }, /** 使用超链接*/
    imgRefund: { type: String }, /** 售后退款截图*/
    imgRefundUploader: { type: String }, /** 售后退款截图*/
  });

  return mongoose.model('Aftermarket', aftermarketSchema);
};
