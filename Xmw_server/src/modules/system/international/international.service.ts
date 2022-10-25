/*
 * @Description: International Service
 * @Version: 2.0
 * @Author: Cyan
 * @Date: 2022-10-15 22:06:24
 * @LastEditors: Cyan
 * @LastEditTime: 2022-10-24 15:08:04
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { XmwInternational } from '@/models/xmw_international.model'; // 数据库实体
import { ResData, ResponseModel } from '@/global/interface'; // interface
import { LOCALES_LANG, initializeTree, initializeLang } from '@/utils'; // 全局工具函数
import { ListInternationalDto, SaveInternationalDto } from './dto';

@Injectable()
export class InternationalService {
  constructor(
    // 使用 InjectModel 注入参数，注册数据库实体
    @InjectModel(XmwInternational)
    private readonly internationaModel: typeof XmwInternational,
  ) {}

  /**
   * @description: 获取当前语言的国际化数据
   * @return {*}
   * @author: Cyan
   */
  async getAllLocalesLang(): Promise<ResData> {
    const result: ResData = {};
    // 查询数据
    const sqlData = await this.internationaModel.findAll({
      order: [['created_time', 'desc']], // 排序规则,
    });
    // 先将数据转成树形结构
    const treeLang = initializeTree(sqlData, 'id', 'parent_id', 'children');
    // 转成层级对象
    for (let i = 0; i < LOCALES_LANG.length; i++) {
      const lang = LOCALES_LANG[i];
      result[lang] = initializeLang(treeLang, lang, 'name');
    }
    return result;
  }

  /**
   * @description: 获取国际化列表
   * @return {*}
   * @author: Cyan
   */
  async getInternationalList(
    internationalInfo: ListInternationalDto,
  ): Promise<XmwInternational[]> {
    // 解构参数
    const { name, start_time, end_time, isMenu } = internationalInfo;
    // 拼接查询参数
    const where: ResData = {};
    if (name) where.name = { [Op.substring]: name };
    if (start_time && end_time)
      where.created_time = { [Op.between]: [start_time, end_time] };
    // 查询数据
    const sqlData = await this.internationaModel.findAll({
      where,
      // 按时间倒序
      order: [
        ['sort', 'desc'],
        ['created_time', 'desc'],
      ], // 排序规则,
    });
    // 将数据转成树形结构
    const result = initializeTree(sqlData, 'id', 'parent_id', 'children');
    return isMenu
      ? result.filter((element: XmwInternational) => element.name == 'menu')[0]
          .children
      : result;
  }

  /**
   * @description: 创建国际化数据
   * @return {*}
   * @author: Cyan
   */
  async createInternational(
    internationalInfo: SaveInternationalDto,
  ): Promise<ResponseModel<ResData>> {
    // 解构参数
    const { name, parent_id } = internationalInfo;
    // 相同层级名称不能相同
    const exist = await this.internationaModel.findOne({
      where: { name },
    });
    // 如果有结果，则证明已存在，这里存在两种情况，
    if (exist && exist.parent_id == parent_id) {
      return { data: {}, msg: '同一层级 name 不能相同！', code: -1 };
    }
    // 如果通过则执行 sql insert 语句
    const result = await this.internationaModel.create(internationalInfo);
    return { data: result };
  }

  /**
   * @description: 更新国际化数据
   * @return {*}
   * @author: Cyan
   */
  async updateInternational(
    id: string,
    internationalInfo: SaveInternationalDto,
  ): Promise<ResponseModel<ResData>> {
    // 解构参数
    const { name, parent_id } = internationalInfo;
    // 判断 parent_id 是否和 id相同
    if (parent_id && parent_id === id) {
      return { data: {}, msg: '父级不能和自己相同！', code: -1 };
    }
    // 相同层级名称不能相同
    const exist = await this.internationaModel.findOne({
      where: { name, parent_id, id: { [Op.ne]: id } },
    });
    // 如果有结果，则证明已存在
    if (exist) {
      return { data: {}, msg: '同一层级 name 不能相同！', code: -1 };
    }
    // 如果通过则执行 sql update 语句
    const result = await this.internationaModel.update(internationalInfo, {
      where: { id },
    });
    return { data: result };
  }

  /**
   * @description: 删除国际化数据
   * @return {*}
   * @author: Cyan
   */
  async deleteInternational(
    id: string,
  ): Promise<ResponseModel<ResData | number>> {
    // 判断当前数据是否有子级，如果有数据的parent_id是id，则存在子级
    const exist = await this.internationaModel.findOne({
      where: { parent_id: id },
    });
    // 如果有结果，则证明已存在
    if (exist) {
      return { data: {}, msg: '当前数据存在子级，不能删除！', code: -1 };
    }
    // 如果通过则执行 sql delete 语句
    const result = await this.internationaModel.destroy({ where: { id } });
    return { data: result };
  }
}
