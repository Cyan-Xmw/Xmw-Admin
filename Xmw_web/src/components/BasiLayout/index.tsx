/*
 * @Description: 入口文件-全局 layout 配置
 * @Version: 2.0
 * @Author: Cyan
 * @Date: 2022-09-19 20:39:53
 * @LastEditors: Cyan
 * @LastEditTime: 2022-12-08 16:55:50
 */
// 引入第三方库
// @ts-ignore
import type { RouterTypes } from '@ant-design/pro-layout/lib/typings';
import { SettingDrawer, PageLoading } from '@ant-design/pro-components'; // 高级组件
import { history, Link } from '@umijs/max';
import { Space, Button } from 'antd' // antd 组件库
import { useLocalStorageState } from 'ahooks'; // ahook 函数
import { createFromIconfontCN } from '@ant-design/icons'; // antd 图标
import { last, isEmpty } from 'lodash' //lodash 工具库
import type { Settings as LayoutSettings, ProLayoutProps } from '@ant-design/pro-components';

// 引入业务组件间
import { CACHE_KEY } from '@/utils' // 全局工具函数
import routerConfig from '@/utils/routerConfig' // 路由配置
import Footer from '@/components/Footer'; // 全局底部版权组件
import RightContent from '@/components/RightContent'; // 顶部菜单栏工具
import type { AppLocalCacheModel, InitialStateModel } from '@/global/interface'
import { appList } from './config'
import styles from './index.less'
import React from 'react';

export const BasiLayout = ({ initialState, setInitialState }: any) => {
	// 使用 iconfont.cn 资源
	const IconFont = createFromIconfontCN({
		scriptUrl: process.env.ICONFONT_URL,
	});
	// 获取 localstorage key
	const [appCache, setappCache] = useLocalStorageState<AppLocalCacheModel | undefined>(CACHE_KEY);
	return {
		/* 菜单图标使用iconfont */
		iconfontUrl: process.env.ICONFONT_URL,
		/* 右侧工具栏 */
		rightContentRender: () => <RightContent />,
		/* 水印 */
		waterMarkProps: {
			content: initialState?.CurrentUser?.cn_name,
		},
		/* 底部版权 */
		footerRender: () => <Footer />,
		/* 页面切换时触发 */
		onPageChange: () => {
			const { location } = history;
			// 如果没有登录，重定向到 login
			if (isEmpty(initialState?.CurrentUser) && location.pathname !== routerConfig.LOGIN) {
				history.push(routerConfig.LOGIN);
			}
		},
		menu: {
			request: async () => {
				// 获取角色菜单
				return initialState?.RouteMenu
			}
		},
		/* 自定义面包屑 */
		breadcrumbProps: {
			itemRender: (route: RouterTypes) => {
				return (
					<Link to={route.path} >
						<Space>
							<Button
								type="text"
								size="small"
								icon={<IconFont type={`icon-${last(route.path.split('/'))}`} style={{ color: initialState?.Settings?.colorPrimary }} />}
								style={{ color: initialState?.Settings?.colorPrimary }}>
								{route.breadcrumbName}
							</Button>
						</Space>
					</Link >
				)
			}
		},
		/* 自定义菜单项的 render 方法 */
		menuItemRender: (menuItemProps: any, defaultDom: React.ReactNode) => {
			return (
				/* 渲染二级菜单图标 */
				<Link to={menuItemProps.path} className={styles.renderLink}>
					{/* 分组布局不用渲染图标，避免重复 */}
					{!(appCache?.UMI_LAYOUT?.siderMenuType === 'group') && menuItemProps.pro_layout_parentKeys?.length &&
						<IconFont type={menuItemProps.icon} className={styles.renderIcon} />}
					{defaultDom}
				</Link>
			);
		},
		// 跨站点导航列表
		appList,
		// 增加一个 loading 的状态
		childrenRender: (children: JSX.Element, props: ProLayoutProps) => {
			if (initialState?.loading) return <PageLoading />;
			return (
				<>
					{children}
					{!props.location?.pathname?.includes(routerConfig.LOGIN) && (
						<SettingDrawer
							disableUrlParams
							enableDarkTheme
							settings={appCache?.UMI_LAYOUT}
							onSettingChange={(settings: LayoutSettings) => {
								setappCache({ ...appCache, UMI_LAYOUT: settings })
								setInitialState((preInitialState: InitialStateModel) => ({
									...preInitialState,
									settings,
								}));
							}}
						/>
					)}
				</>
			);
		},
		...appCache?.UMI_LAYOUT,
	};
}