

/* eslint-disable array-bracket-spacing */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;


  const productNewSchema = new Schema({
    barCode: { type: String }, // 有赞商品条码
    code: { type: String, unique: true }, //  管家婆商品编码
    gjname: { type: String }, // 商品名称
    sxName: { type: String }, // 食享名称
    yzName: { type: String }, // 有赞名称
    gjspecifications: { type: String }, // 管家婆规格
    yzspecifications: { type: String }, // 有赞规格
    sxspecifications: { type: String }, // 食享名称
    updateTime: { type: Date }, /** 更新时间 */

  });

  return mongoose.model('ProductNew', productNewSchema);
};
