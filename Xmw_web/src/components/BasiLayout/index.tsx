/*
 * @Description: 入口文件-全局 layout 配置
 * @Version: 2.0
 * @Author: Cyan
 * @Date: 2022-09-19 20:39:53
 * @LastEditors: Cyan
 * @LastEditTime: 2023-01-10 17:17:18
 */
// 引入第三方库
import React from 'react'
import { SettingDrawer } from '@ant-design/pro-components'; // 高级组件
import { history, Link, KeepAliveContext, useIntl } from '@umijs/max';
import { Space } from 'antd' // antd 组件库
import { useLocalStorageState } from 'ahooks'; // ahook 函数
import { createFromIconfontCN } from '@ant-design/icons'; // antd 图标
import { last, isEmpty } from 'lodash' //lodash 工具库
import type { Settings as LayoutSettings } from '@ant-design/pro-components';

// 引入业务组件
import RightContent from '@/components/RightContent'
import { CACHE_KEY, getItemByIdInTree } from '@/utils' // 全局工具函数
import routerConfig from '@/utils/routerConfig' // 路由配置
import Footer from '@/components/Footer'; // 全局底部版权组件
import type { AppLocalCacheModel, InitialStateModel } from '@/global/interface'
import { appList } from './config'

type RouteProps = {
	path: string;
	breadcrumbName: string;
	children: Array<{
		path: string;
		breadcrumbName: string;
	}>;
}

export const BasiLayout = ({ initialState, setInitialState }: any) => {
	const { formatMessage } = useIntl();
	const { CurrentUser, RouteMenu, Locales } = initialState
	// 使用 iconfont.cn 资源
	const IconFont = createFromIconfontCN({
		scriptUrl: process.env.ICONFONT_URL,
	});
	// 获取 localstorage key
	const [appCache, setappCache] = useLocalStorageState<AppLocalCacheModel | undefined>(CACHE_KEY);
	// 多标签切换
	const { updateTab } = React.useContext(KeepAliveContext);
	return {
		/* 菜单图标使用iconfont */
		iconfontUrl: process.env.ICONFONT_URL,
		/* 右侧工具栏 */
		rightContentRender: () => <RightContent />,
		/* 水印 */
		waterMarkProps: {
			content: CurrentUser?.cn_name,
		},
		/* 底部版权 */
		footerRender: () => <Footer />,
		/* 页面切换时触发 */
		onPageChange: () => {
			const { location } = history;
			// 如果没有登录，重定向到 login
			if (isEmpty(CurrentUser) && location.pathname !== routerConfig.LOGIN) {
				history.push(routerConfig.LOGIN);
			} else if (RouteMenu && Locales) {
				// 获取当前路由信息
				const currentRouteInfo = getItemByIdInTree<API.MENUMANAGEMENT>(RouteMenu, location.pathname, 'path', 'routes')
				if (currentRouteInfo?.icon) {
					updateTab(location.pathname, {
						icon: <IconFont type={currentRouteInfo.icon} />,
						name: formatMessage({ id: `menu${location.pathname.replaceAll('/', '.')}` }),
						closable: true,
					});
				}
			}
		},
		menu: {
			request: async () => RouteMenu
		},
		/* 自定义面包屑 */
		breadcrumbProps: {
			itemRender: (route: RouteProps) => {
				return (
					<Link to={route.path} >
						<Space>
							<IconFont type={`icon-${last(route.path.split('/'))}`} />
							<span>{route.breadcrumbName}</span>
						</Space>
					</Link>
				)
			}
		},
		/* 自定义菜单项的 render 方法 */
		menuItemRender: (menuItemProps: any, defaultDom: React.ReactNode) => {
			return (
				/* 渲染二级菜单图标 */
				<Link to={menuItemProps.path} style={{ display: 'flex', alignItems: 'center' }}>
					{/* 分组布局不用渲染图标，避免重复 */}
					{!(appCache?.UMI_LAYOUT?.siderMenuType === 'group') && menuItemProps.pro_layout_parentKeys?.length &&
						<IconFont type={menuItemProps.icon} style={{ marginRight: 10 }} />}
					{defaultDom}
				</Link>
			);
		},
		// 跨站点导航列表
		appList,
		// 增加一个 loading 的状态
		childrenRender: (children: JSX.Element) => {
			return (
				<>
					{children}
					<SettingDrawer
						disableUrlParams
						enableDarkTheme
						settings={appCache?.UMI_LAYOUT}
						onSettingChange={(settings: LayoutSettings) => {
							setappCache({ ...appCache, UMI_LAYOUT: { ...initialState.Settings, ...settings } })
							setInitialState((preInitialState: InitialStateModel) => ({
								...preInitialState,
								settings,
							}));
						}}
					/>
				</>
			);
		},
		...appCache?.UMI_LAYOUT,
	};
}