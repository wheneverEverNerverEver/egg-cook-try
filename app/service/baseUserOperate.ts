import { Service } from 'egg';
import { changeSpecialCharacter, compactObj } from '../commonJs';
import { PageType, RoleType, UserType } from '../commonJs/type';

/**
 * 用户的基本增删改查
 */
export default class baseUserOperate extends Service {
  /**
   * 新增
   */
  public async insertUser(userObj: UserType) {
    const { ctx } = this;
    try {
      const userFind = await ctx.model.User.insertMany([{ ...userObj }]);
      return userFind;
    } catch (error) {
      console.log('======>>>>insertUser', error);
      return false;
    }
  }

  /**
   * 找唯一一个
   * @param userObj - 用户信息 id、账号集合
   */
  public async findUser(userObj: { name?: string }) {
    const { ctx } = this;
    try {
      const userFind = await ctx.model.User.find({
        accountName: changeSpecialCharacter(userObj.name || undefined),
      });

      return userFind?.[0];
    } catch (error) {
      console.log('======>>>>>>findUser', error);
      return false;
    }
  }
  /**
 * 找用户权限
 */
  public async findUserCodeAndUrl(trole?: string) {
    const { ctx } = this;
    const role = trole || ctx.session.role;
    try {
      const roleRight: Array<{
        pageCode?: string,
        url?: string
      }> = [];
      if (role) {

        const roleList: RoleType[] = await ctx.model.Role.find({ _id: changeSpecialCharacter(role) });
        const pageCodeArr = roleList?.[0]?.pageCode;
        if (pageCodeArr) {
          await Promise.all(pageCodeArr.map(async v => {
            const tempArr: PageType[] = await ctx.model.Page.find({ pageCode: changeSpecialCharacter(v) });
            const trmpOne = tempArr?.[0];
            if (trmpOne) {
              roleRight.push({
                pageCode: trmpOne?.pageCode,
                url: trmpOne?.url,
              });
            }
            return true;
          }));
        }

      }
      return roleRight;
    } catch (error) {
      console.log('======>>>>>>findUser', error);
      return [];
    }
  }
  /**
   * 编辑 findByIdAndUpdate
   */
  public async updateUser(id: string, updateObj: UserType) {
    const { ctx } = this;
    try {
      compactObj(updateObj);
      const userFind = await ctx.model.User.findByIdAndUpdate(
        {
          _id: id,
        },
        updateObj,
      );
      const userFind0 = userFind?.[0] ?? {};
      return userFind0;
    } catch (error) {
      return false;
    }
  }

  /**
   * 删除
   */
  public async deleteUser(id: string) {
    const { ctx } = this;
    try {
      await ctx.model.User.deleteOne({
        _id: id,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 查找
   */
  public async searchUser() {
    const { ctx } = this;
    try {
      const data: UserType[] = await ctx.model.User.find({});
      const outData = await Promise.all(data.map(async item => {
        let roleObj: {} | undefined;
        if (item.role) {
          roleObj = await ctx.model.Role.find({ _id: changeSpecialCharacter(item.role) }).select('-password');
        }
        return {
          _id: item._id,
          userName: item.userName,
          accountName: item.accountName,
          role: roleObj?.[0]?._id,
          roleObj: item.role ? {
            _id: roleObj?.[0]?._id,
            roleName: roleObj?.[0]?.roleName,
          } : undefined,
        };

      }));
      return outData;
    } catch (error) {
      console.error('======>>>>>searchUser', error);
      return [];
    }
  }
}
