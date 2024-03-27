
/* eslint-disable array-bracket-spacing */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const productDetailSchema = new Schema({
    productId: { type: Schema.ObjectId }, // 对应的商品Id
    code: { type: String }, // 管家婆商品编码
    yzretailPrice: { type: Number }, // 有赞零售单位价格
    yzrestPrice: { type: Number }, // 有赞餐饮单位价格
    yzwholesPrice: { type: Number }, // 有赞批发单位价格
    gjretailPrice: { type: Number }, // 管家婆零售单位价格
    gjrestPrice: { type: Number }, // 管家婆餐饮单位价格
    gjwholesPrice: { type: Number }, // 管家婆批发单位价格
    yzunit: { type: String }, // 有赞单位
    gjunit: { type: String }, // 管家婆单位
    sxunit: { type: String }, // 食享单位
  });

  return mongoose.model('ProductDetail', productDetailSchema);
};
