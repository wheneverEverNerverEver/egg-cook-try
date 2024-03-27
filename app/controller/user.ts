/* eslint-disable @typescript-eslint/no-var-requires */
import { Controller } from 'egg';
import { UserType } from '../commonJs/type';
const ms = require('ms');
const CryptoJS = require('crypto-js');

export default class UserController extends Controller {
  public async login() {
    const { ctx, app } = this;
    const { accountName, password } = ctx.request.body;
    try {

      if (!accountName || !password) {
        throw Error('登录错误');
      }
      const resultBack = await ctx.service.baseUserOperate.findUser({
        name: accountName,
      });
      if (!resultBack?.password) {
        throw Error('登录错误');
      }
      const originalPassword = CryptoJS.AES.decrypt(password, 'caikeluofusiji').toString(CryptoJS.enc.Utf8);
      const passwordGive = CryptoJS.AES.decrypt(resultBack?.password, 'caikeluofusiji').toString(CryptoJS.enc.Utf8);
      // const originalPassword = CryptoJS.AES.encrypt(password, 'caikeluofusiji').toString();


      if (
        originalPassword &&
      originalPassword === passwordGive
      ) {
        const tempH = `${ctx.csrf}`;
        ctx.session.user = tempH;
        await app.redis.set(tempH, resultBack._id); // 取个人
        ctx.session.maxAge = ms('0.25d'); // 设置过期时间


        ctx.session.role = resultBack.role;
        ctx.session.userName = resultBack.userName;
        const roleRight = await ctx.service.baseUserOperate.findUserCodeAndUrl(resultBack.role);
        ctx.session.roleRight = JSON.stringify(roleRight);
        ctx.session.id = resultBack._id;
        ctx.session.accountName = resultBack.accountName;
        ctx.set('token', ctx.csrf);
        ctx.body = {
          userName: resultBack.userName,
          accountName: resultBack.accountName,
          roleCode: roleRight?.map(v => v.pageCode),
          _id: resultBack._id,

        };
      } else {
        ctx.body = { error: true };
      }
    } catch (e) {
      ctx.body = { error: true };
    }
  }
  public async logout() {
    const { ctx, app } = this;
    const tempH = ctx.session.user;

    if (tempH) {
      await app.redis.del(tempH);
      ctx.session.role = null;
      ctx.session.roleRight = null;
      ctx.session.id = null;
      ctx.session.accountName = null;
      ctx.body = { error: false };
    } else {
      ctx.body = { error: true };
    }
  }
  public async currentUser() {
    const { ctx, app } = this;
    const token = ctx.session.user;
    if (token) {
      const userID = await app.redis.get(token);
      if (!userID) {
        ctx.session.role = null;
        ctx.session.roleRight = null;
        ctx.session.id = null;
        ctx.session.accountName = null;
        throw Error('登录已过期');
      }
      const userList: UserType = await ctx.model.User.findById(userID).select('-password');
      if (!userList) {
        throw Error('找不到该用户');
      }
      const roleRight = await ctx.service.baseUserOperate.findUserCodeAndUrl(userList.role);
      ctx.body = {
        _id: userList._id,
        userName: decodeURIComponent(userList.userName ?? ''),
        accountName: decodeURIComponent(userList.accountName ?? ''),
        roleCode: roleRight?.map(v => decodeURIComponent(v.pageCode || '')),
      } || false;
    } else {
      ctx.body = { error: true };
    }
  }

  public async addUser() {
    const { ctx } = this;
    const { accountName, password, userName, role } = ctx.request.body;
    const depassword = CryptoJS.AES.decrypt(
      password,
      'caikeluofusiji',
    ).toString(CryptoJS.enc.Utf8);

    try {
      if (!userName) throw Error('姓名不能为空');
      const addResult = await ctx.service.baseUserOperate.insertUser({
        accountName: accountName ?? '',
        password: depassword ?? '',
        userName: userName ?? '',
        role,
      });
      ctx.body = (addResult as any)?.length > 0 ? {
        accountName,
        userName,
      } : { error: false };
    } catch (e) {
      ctx.body = { error: true };
    }
  }

  public async deleteUser() {
    const { ctx } = this;
    const { id } = ctx.request.query;
    try {
      await ctx.service.baseUserOperate.deleteUser(id);
      ctx.body = { error: false };
    } catch (e) {
      ctx.body = { error: true };
    }
  }
  public async findUser() {
    const { ctx } = this;
    try {
      const dataBack = await ctx.service.baseUserOperate.searchUser();
      ctx.body = {
        data: dataBack,
      };
    } catch (e) {
      ctx.body = [];
    }
  }
  public async updateUser() {
    const { ctx } = this;
    const { id, userName, role } = ctx.request.body;
    try {
      if (!userName) throw Error('姓名不能为空');
      await ctx.service.baseUserOperate.updateUser(id, { userName: userName ?? '', role });
      ctx.body = { error: false };
    } catch (e) {
      ctx.body = { error: true };
    }
  }
  public async changePassWord() {
    const { ctx } = this;
    const { id, newWord } = ctx.request.body;
    try {
      if (!id || !newWord) throw Error('参数错误');
      const originalPassword = CryptoJS.AES.decrypt(newWord, 'caikeluofusiji').toString(CryptoJS.enc.Utf8);

      const passwordGive = CryptoJS.AES.encrypt(originalPassword, 'caikeluofusiji').toString();
      await ctx.model.User.updateOne({ _id: id }, { password: passwordGive });
      ctx.body = { error: false };

    } catch (e) {
      console.error('=======>>>changePassword error', e);
      ctx.body = {
        error: true,
      };
    }
  }
}
