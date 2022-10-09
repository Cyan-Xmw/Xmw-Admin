/*
 * @Description: xmw_users 表
 * @Version: 2.0
 * @Author: Cyan
 * @Date: 2022-09-09 15:55:13
 * @LastEditors: Cyan
 * @LastEditTime: 2022-10-09 11:40:06
 */
'use strict';

module.exports = {
  // 在执行数据库升级时调用的函数，创建 xmw_users 表
  async up(queryInterface, Sequelize) {
    const { STRING, INTEGER, DATE, UUID, UUIDV4 } = Sequelize;
    await queryInterface.createTable('xmw_users', {
      user_id: { type: UUID, primaryKey: true, allowNull: false, defaultValue: UUIDV4, comment: '用户id' },
      user_name: { type: STRING(20), allowNull: false, comment: '用户名' },
      work_no: { type: STRING(20), allowNull: false, comment: '用户工号' },
      password: { type: STRING(200), allowNull: false, comment: '密码(加密)' },
      cn_name: { type: STRING(20), allowNull: false, comment: '中文名' },
      en_name: { type: STRING(20), allowNull: true, comment: '英文名' },
      age: { type: INTEGER, allowNull: false, validate: { min: 1, max: 120 }, comment: '年龄' },
      email: { type: STRING(50), allowNull: true, validate: { isEmail: true }, comment: '电子邮箱' },
      phone: { type: STRING(11), allowNull: false, validate: { is: /^1\d{10}$/i }, comment: '电话号码' },
      avatar_url: { type: STRING(200), allowNull: true, comment: '头像地址' },
      sex: { type: STRING(10), allowNull: false, comment: '用户性别' },
      sort: { type: INTEGER, allowNull: false, comment: '排序' },
      status: { type: STRING(10), allowNull: false, comment: '是否禁用' },
      token: { type: STRING(255), allowNull: true, comment: '登录token' },
      motto: { type: STRING(32), allowNull: true, comment: '座右铭' },
      tags: { type: STRING(200), allowNull: true, comment: '人物标签' },
      city: { type: STRING(200), allowNull: false, comment: '所属城市' },
      address: { type: STRING(200), allowNull: false, comment: '详细地址' },
      jobs_id: { type: UUID, allowNull: false, comment: '岗位id' },
      org_id: { type: UUID, allowNull: false, comment: '组织id' },
      role_id: { type: UUID, allowNull: false, comment: '权限id' },
      login_num: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '登录次数' },
      last_ip: { type: STRING(20), allowNull: true, validate: { isIP: true }, comment: '最后一次登录id' },
      created_time: { type: DATE, allowNull: false, comment: '创建日期' },
      update_time: { type: DATE, allowNull: true, comment: '最后更新时间' },
      founder: { type: UUID, allowNull: true, comment: '创建人' },
    });
  },

  async down(queryInterface) {
    // 在执行数据库降级时调用的函数，删除 xmw_users 表
    await queryInterface.dropTable('xmw_users');
  }
};
