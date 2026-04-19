/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import {
  EnvironmentOutlined, LockOutlined, MailOutlined, PhoneOutlined, UserOutlined
} from '@ant-design/icons';
import {
  Button, DatePicker, Form, Input, Select
} from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { reFetchData } from '../../store/slice/appSlice';
import ApiService from '../../utils/apiService';
import notificationWithIcon from '../../utils/notification';

function CreateUser() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  // function to handle register new user
  const onFinish = (values) => {
    setLoading(true);
    const data = {
      userName: values.userName,
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      role: values.role,
      gender: values.gender,
      dob: dayjs(values.dob).format('YYYY-MM-DD'),
      address: values.address,
      password: values.password
    };

    ApiService.post('/api/v1/auth/registration', data)
      .then((response) => {
        setLoading(false);
        if (response?.result_code === 0) {
          notificationWithIcon('success', 'THÀNH CÔNG', response?.result?.message || 'Tạo người dùng mới thành công.');
          form.resetFields();
          dispatch(reFetchData());
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
    <Form
      form={form}
      className='login-form'
      name='create-new-user'
      onFinish={onFinish}
      layout='vertical'
    >
      <div className='two-grid-column'>
        <Form.Item
          className='w-full md:w-1/2'
          label='Tên đăng nhập'
          name='userName'
          rules={[{
            required: true,
            message: 'Vui lòng nhập tên đăng nhập.'
          }]}
        >
          <Input
            prefix={<UserOutlined className='site-form-item-icon' />}
            placeholder='Nhập tên đăng nhập'
            size='large'
            type='text'
            allowClear
          />
        </Form.Item>

        <Form.Item
          className='w-full md:w-1/2'
          label='Họ và tên'
          name='fullName'
          rules={[{
            required: true,
            message: 'Vui lòng nhập họ và tên.'
          }]}
        >
          <Input
            prefix={<UserOutlined className='site-form-item-icon' />}
            placeholder='Nhập họ và tên'
            size='large'
            type='text'
            allowClear
          />
        </Form.Item>
      </div>

      <div className='two-grid-column'>
        <Form.Item
          className='w-full md:w-1/2'
          label='Email'
          name='email'
          rules={[{
            type: 'email',
            required: true,
            message: 'Vui lòng nhập email.'
          }]}
        >
          <Input
            prefix={<MailOutlined className='site-form-item-icon' />}
            placeholder='Nhập email'
            size='large'
            type='email'
            allowClear
          />
        </Form.Item>

        <Form.Item
          className='w-full md:w-1/2'
          label='Số điện thoại'
          name='phone'
          rules={[{
            required: true,
            message: 'Vui lòng nhập số điện thoại.'
          }]}
        >
          <Input
            prefix={<PhoneOutlined className='site-form-item-icon' />}
            placeholder='Nhập số điện thoại'
            size='large'
            type='text'
            allowClear
          />
        </Form.Item>
      </div>

      <div className='two-grid-column'>
        <Form.Item
          className='w-full md:w-1/2'
          label='Vai trò'
          name='role'
          rules={[{
            required: true,
            message: 'Vui lòng chọn vai trò.'
          }]}
        >
          <Select
            placeholder='-- chọn vai trò --'
            optionFilterProp='children'
            options={[
              { value: 'user', label: 'Người dùng' },
              { value: 'admin', label: 'Admin' }
            ]}
            size='large'
            allowClear
          />
        </Form.Item>

        <Form.Item
          className='w-full md:w-1/2'
          label='Giới tính'
          name='gender'
          rules={[{
            required: true,
            message: 'Vui lòng chọn giới tính.'
          }]}
        >
          <Select
            placeholder='-- chọn giới tính --'
            optionFilterProp='children'
            options={[
              { value: 'male', label: 'Nam' },
              { value: 'female', label: 'Nữ' }
            ]}
            size='large'
            allowClear
          />
        </Form.Item>
      </div>

      <div className='two-grid-column'>
        <Form.Item
          className='w-full md:w-1/2'
          label='Ngày sinh'
          name='dob'
          rules={[{
            required: true,
            message: 'Vui lòng chọn ngày sinh.'
          }]}
        >
          <DatePicker
            className='w-full'
            placeholder='Chọn ngày sinh'
            size='large'
            allowClear
          />
        </Form.Item>

        <Form.Item
          className='w-full md:w-1/2'
          label='Địa chỉ'
          name='address'
          rules={[{
            required: true,
            message: 'Vui lòng nhập địa chỉ.'
          }]}
        >
          <Input
            prefix={<EnvironmentOutlined className='site-form-item-icon' />}
            placeholder='Nhập địa chỉ'
            size='large'
            type='text'
            allowClear
          />
        </Form.Item>
      </div>

      <div className='two-grid-column'>
        <Form.Item
          className='w-full md:w-[49.5%]'
          label='Mật khẩu'
          name='password'
          rules={[{
            required: true,
            message: 'Vui lòng nhập mật khẩu.'
          }]}
        >
          <Input.Password
            prefix={<LockOutlined className='site-form-item-icon' />}
            placeholder='Nhập mật khẩu'
            size='large'
            type='text'
            allowClear
          />
        </Form.Item>
      </div>

      <Form.Item>
        <Button
          className='login-form-button mt-4'
          htmlType='submit'
          type='primary'
          size='large'
          loading={loading}
          disabled={loading}
        >
          Tạo người dùng
        </Button>
      </Form.Item>
    </Form>
  );
}

export default React.memo(CreateUser);
