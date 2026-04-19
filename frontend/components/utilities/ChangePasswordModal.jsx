/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 • Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import { LockOutlined } from '@ant-design/icons';
import {
  Button, Form, Input, Modal
} from 'antd';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import ApiService from '../../utils/apiService';
import notificationWithIcon from '../../utils/notification';

function ChangePasswordModal({ open, setOpen }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleClose = () => {
    form.resetFields();
    setOpen(false);
  };

  const onFinish = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      notificationWithIcon('error', 'LỖI', 'Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      setLoading(true);
      const response = await ApiService.post('/api/v1/auth/change-password', {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });

      if (response?.result_code === 0) {
        notificationWithIcon('success', 'THÀNH CÔNG', response?.result?.message || 'Đổi mật khẩu thành công.');
        handleClose();
      } else {
        notificationWithIcon('error', 'LỖI', 'Đã có lỗi xảy ra từ máy chủ.');
      }
    } catch (error) {
      notificationWithIcon(
        'error',
        'LỖI',
        error?.response?.data?.result?.error?.message
          || error?.response?.data?.result?.error
          || 'Đã có lỗi xảy ra từ máy chủ.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title='Đổi mật khẩu'
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      destroyOnClose
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
      >
        <Form.Item
          label='Mật khẩu hiện tại'
          name='oldPassword'
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại.' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder='Nhập mật khẩu hiện tại'
            size='large'
          />
        </Form.Item>

        <Form.Item
          label='Mật khẩu mới'
          name='newPassword'
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới.' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder='Nhập mật khẩu mới'
            size='large'
          />
        </Form.Item>

        <Form.Item
          label='Xác nhận mật khẩu mới'
          name='confirmPassword'
          rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới.' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder='Nhập lại mật khẩu mới'
            size='large'
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button onClick={handleClose}>
              Hủy
            </Button>
            <Button
              type='primary'
              htmlType='submit'
              loading={loading}
              disabled={loading}
            >
              Cập nhật mật khẩu
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

ChangePasswordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

export default ChangePasswordModal;
