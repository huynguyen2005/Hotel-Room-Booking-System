/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright (c)2023 - Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import {
  LockOutlined, MailOutlined, PhoneOutlined, UserOutlined
} from '@ant-design/icons';
import {
  Button, DatePicker, Form, Input, Select
} from 'antd';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import MainLayout from '../../components/layout';
import PublicRoute from '../../components/routes/PublicRoute';
import ApiService from '../../utils/apiService';
import notificationWithIcon from '../../utils/notification';

const { TextArea } = Input;

function Registration() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish = (values) => {
    setLoading(true);
    const data = {
      userName: values.userName,
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      dob: dayjs(values.dob).format('YYYY-MM-DD'),
      gender: values.gender,
      address: values.address,
      password: values.password
    };

    ApiService.post('/api/v1/auth/registration', data)
      .then((response) => {
        setLoading(false);
        if (response?.result_code === 0) {
          notificationWithIcon('success', 'THÀNH CÔNG', response?.result?.message || 'Đăng ký tài khoản thành công.');
          form.resetFields();
          router.push('/auth/login');
        } else {
          notificationWithIcon('error', 'LỖI', 'Đã có lỗi xảy ra từ máy chủ.');
        }
      })
      .catch((err) => {
        setLoading(false);
        notificationWithIcon('error', 'LỖI', err?.response?.data?.result?.error?.message || err?.response?.data?.result?.error || 'Đã có lỗi xảy ra từ máy chủ.');
      });
  };

  return (
    <PublicRoute>
      <MainLayout title='Beach Resort - Đăng ký'>
        <div style={{ width: '400px', height: 'calc(100vh - 205px)', margin: '0 auto' }}>
          <Form
            form={form}
            className='login-form'
            style={{ padding: '20px 0' }}
            initialValues={{ remember: true }}
            name='beach-resort-registration-form'
            onFinish={onFinish}
          >
            <Form.Item
              name='userName'
              rules={[{
                required: true,
                message: 'Vui lòng nhập tên đăng nhập.'
              }]}
            >
              <Input
                prefix={<UserOutlined className='site-form-item-icon' />}
                placeholder='Tên đăng nhập'
                size='large'
                allowClear
              />
            </Form.Item>

            <Form.Item
              name='fullName'
              rules={[{
                required: true,
                message: 'Vui lòng nhập họ và tên.'
              }]}
            >
              <Input
                prefix={<UserOutlined className='site-form-item-icon' />}
                placeholder='Họ và tên'
                size='large'
                allowClear
              />
            </Form.Item>

            <Form.Item
              name='email'
              rules={[{
                required: true,
                message: 'Vui lòng nhập email.'
              }]}
            >
              <Input
                prefix={<MailOutlined className='site-form-item-icon' />}
                placeholder='Email'
                size='large'
                allowClear
              />
            </Form.Item>

            <Form.Item
              name='phone'
              rules={[{
                required: true,
                message: 'Vui lòng nhập số điện thoại.'
              }]}
            >
              <Input
                prefix={<PhoneOutlined className='site-form-item-icon' />}
                placeholder='Số điện thoại'
                size='large'
                allowClear
                type='tel'
              />
            </Form.Item>

            <Form.Item
              name='dob'
              rules={[{
                required: true,
                message: 'Vui lòng chọn ngày sinh.'
              }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder='Chọn ngày sinh'
                size='large'
                allowClear
              />
            </Form.Item>

            <Form.Item
              name='gender'
              rules={[{
                required: true,
                message: 'Vui lòng chọn giới tính.'
              }]}
            >
              <Select placeholder='-- chọn giới tính --' size='large' allowClear>
                <Select.Option value='male'>Nam</Select.Option>
                <Select.Option value='female'>Nữ</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name='address'
              rules={[{
                required: true,
                message: 'Vui lòng nhập địa chỉ.'
              }]}
            >
              <TextArea
                placeholder='Địa chỉ'
                size='large'
                allowClear
                rows={2}
              />
            </Form.Item>

            <Form.Item
              name='password'
              rules={[{
                required: true,
                message: 'Vui lòng nhập mật khẩu.'
              }]}
            >
              <Input.Password
                prefix={<LockOutlined className='site-form-item-icon' />}
                placeholder='Mật khẩu'
                size='large'
                allowClear
                type='tel'
              />
            </Form.Item>

            <Form.Item>
              <Button
                style={{ marginTop: '10px' }}
                className='login-form-button'
                htmlType='submit'
                type='primary'
                size='large'
                block
                loading={loading}
                disabled={loading}
              >
                Đăng ký
              </Button>
            </Form.Item>

            <Link
              className='btn-login-registration'
              href='/auth/login'
            >
              Hoặc đăng nhập tại đây
            </Link>
          </Form>
        </div>
      </MainLayout>
    </PublicRoute>
  );
}

export default Registration;
