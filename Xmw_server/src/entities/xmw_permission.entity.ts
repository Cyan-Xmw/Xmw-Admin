/*
 * @Description: XmwPermission Entity
 * @Version: 2.0
 * @Author: Cyan
 * @Date: 2022-10-16 11:14:32
 * @LastEditors: Cyan
 * @LastEditTime: 2022-10-17 18:16:35
 */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'xmw_permission' })
export class XmwPermission {
  @PrimaryGeneratedColumn('uuid', { comment: '权限id' })
  permission_id: string;

  //角色id
  @Column('char', {
    length: 36,
    nullable: true,
    comment: '角色id',
  })
  role_id: string;

  //菜单id
  @Column('char', {
    length: 36,
    nullable: true,
    comment: '菜单id',
  })
  menu_id: string;

  // 创建时间
  @CreateDateColumn({ comment: '创建时间' })
  created_time: Date;
}