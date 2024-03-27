/* eslint-disable array-bracket-spacing */

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const RoleSchema = new Schema({
    roleName: { type: String, unique: true }, /** 角色名称 */
    pageCode: { type: [String] }, /** 对应的操作code */
  });

  return mongoose.model('Role', RoleSchema);
};

