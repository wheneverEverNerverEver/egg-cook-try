
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const pageSchema = new Schema({
    url: { type: String }, /** 对应的操作链接 */
    pageName: { type: String }, /** 操作描述 */
    pageCode: { type: String, unique: true }, /** 操作码 */
    level: { type: Number }, /** 0表示父元素，1表示子元素 */
    parentCode: { type: String }, /** 父元素code */
  });

  return mongoose.model('Page', pageSchema);
};
