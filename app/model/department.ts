
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  /** DEPARTENT 部门   | DISTRICT 地区 | CLASS = 'CLASS', BELONG = 'BELONG'*/
  enum LabelType { DEPARTENT = 'DEPARTENT', DISTRICT = 'DISTRICT', CLASS = 'CLASS', BELONG = 'BELONG', WAREHOUSE = 'WAREHOUSE' }
  /**
   * 'DEPARTENT','单据部门'
   * 'CLASS', '来源平台'
   * 'STAFF','默认业务员'
   * 'BELONG','所属店铺'
   * 'DISTRICT','单据经手人'
   */

  const DepartmentSchema = new Schema({
    code: { type: String },
    deName: { type: String },
    label: { type: LabelType },
    showInMenu: { type: Boolean }, // 是经手人（DISTRICT）的时候，可以选择是否出现在页面
  });

  return mongoose.model('Department', DepartmentSchema);
};
