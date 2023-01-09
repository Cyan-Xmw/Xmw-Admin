/*
 * @Description: 睡眠弹窗
 * @Version: 2.0
 * @Author: Cyan
 * @Date: 2023-01-06 16:40:34
 * @LastEditors: Cyan
 * @LastEditTime: 2023-01-09 14:21:40
 */
import type { FC } from 'react'
import { useIntl } from '@umijs/max'
import { useBoolean, useInterval, useEventListener, useSessionStorageState } from 'ahooks'
import { Modal, Button, Row, Col, Avatar, Typography, Form, Input, message } from 'antd'
import { useModel } from '@umijs/max';
import { encryptionAesPsd } from '@/utils'

const { Title } = Typography;

//用户未操作超时时间: 60分钟
const timeOut = 60 * 60 * 1000

const LockSleep: FC = () => {
  const { formatMessage } = useIntl();
  const { initialState } = useModel('@@initialState');
  // 弹窗显示
  const [openModal, { setTrue, setFalse }] = useBoolean(false);
  // 表单实例
  const [form] = Form.useForm()
  // 记录用户最后一次移动鼠标的时间
  const [moveLastTime, setmMveLastTime] = useSessionStorageState<number>(
    'lock_last_time',
    {
      defaultValue: new Date().getTime(),
    },
  );
  // 判断用户未操作时间是否拆过设定值
  const checkTimeout = () => {
    const currentTime = new Date().getTime()
    // 判断是否超时
    if (currentTime - moveLastTime > timeOut) {
      setTrue()
    }
  }
  // 提交表单
  const hanlderSubmit = () => {
    // 触发表单校验
    form.validateFields().then((values: { password: string }) => {
      if (initialState?.CurrentUser?.password === encryptionAesPsd(values.password)) {
        setFalse()
      } else {
        message.error(formatMessage({ id: 'components.RightContent.LockSleep.password.error' }))
      }
    })
  };

  // 每隔10分钟执行一次
  useInterval(() => {
    checkTimeout()
  }, 10 * 60 * 1000);

  // 监听用户是否有操作行为
  useEventListener('mousemove', () => {
    setmMveLastTime(new Date().getTime())
  })
  return (
    <Modal
      title={formatMessage({ id: 'components.RightContent.LockSleep.title' })}
      open={openModal}
      maskClosable={false}
      closable={false}
      footer={<Button type="primary" onClick={hanlderSubmit}>{formatMessage({ id: 'global.button.confirm' })}</Button>}
    >
      <Row justify="center" style={{ flexDirection: 'column', textAlign: 'center' }}>
        <Col>
          <Avatar
            size={120}
            src={initialState?.CurrentUser?.avatar_url}
          />
        </Col>
        <Col>
          <Title level={2}>{initialState?.CurrentUser?.cn_name}</Title>
        </Col>
        <Col>
          <Form form={form} style={{ textAlign: 'left' }}>
            <Form.Item name="password" label={formatMessage({ id: 'components.RightContent.LockSleep.password' })} rules={[{ required: true }]}>
              <Input.Password placeholder={formatMessage({ id: 'components.RightContent.LockSleep.password.placeholder' })} />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Modal>
  )
}
export default LockSleep