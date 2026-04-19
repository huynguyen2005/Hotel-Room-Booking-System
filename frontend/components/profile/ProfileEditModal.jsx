/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 • Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import {
  EnvironmentOutlined, PhoneOutlined, UserOutlined
} from '@ant-design/icons';
import {
  Button, DatePicker, Form, Input, Modal, Result, Select
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import useFetchData from '../../hooks/useFetchData';
import { reFetchData } from '../../store/slices/appSlice';
import ApiService from '../../utils/apiService';
import { setSessionUserKeyAgainstValue } from '../../utils/authentication';
import notificationWithIcon from '../../utils/notification';
import Loading from '../shared/Loading';

function ProfileEditModal({ editProfileModal, setEditProfileModal }) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [fetchLoading, fetchError, fetchResponse] = useFetchData('/api/v1/get-user');

  useEffect(() => {
    if (fetchResponse) {
      form.setFieldsValue({
        fullName: fetchResponse?.data?.fullName || undefined,
        phone: fetchResponse?.data?.phone || undefined,
        gender: fetchResponse?.data?.gender || undefined,
        dob: fetchResponse?.data?.dob ? dayjs(fetchResponse?.data?.dob) : undefined,
        address: fetchResponse?.data?.address || undefined
      });
    }
  }, [fetchResponse, form]);

  const onFinish = (values) => {
    setLoading(true);
    ApiService.put('/api/v1/update-user', values)
      .then((response) => {
        setLoading(false);
        if (response?.result_code === 0) {
          notificationWithIcon('success', 'THÀNH CÔNG', response?.result?.message || 'Cập nhật thông tin hồ sơ thành công.');

          setSessionUserKeyAgainstValue('fullName', response?.result?.data?.fullName);
          setSessionUserKeyAgainstValue('phone', response?.result?.data?.phone);
          setSessionUserKeyAgainstValue('gender', response?.result?.data?.gender);
          setSessionUserKeyAgainstValue('dob', response?.result?.data?.dob);
          setSessionUserKeyAgainstValue('address', response?.result?.data?.address);

          form.resetFields();
          dispatch(reFetchData());
          setEditProfileModal(false);
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
    <Modal
      title='Chỉnh sửa thông tin hồ sơ'
      open={editProfileModal}
      onOk={() => setEditProfileModal(false)}
      onCancel={() => setEditProfileModal(false)}
      footer={[]}
      width={800}
    >
      {fetchLoading ? (<Loading />) : fetchError ? (
        <Result
          title='Không thể tải dữ liệu'
          subTitle={fetchError}
          status='error'
        />
      ) : (
        <Form
          form={form}
          className='login-form'
          name='create-new-user'
          onFinish={onFinish}
          layout='vertical'
        >
          <Form.Item
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

          <Form.Item
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

          <Form.Item
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
              style={{ width: '100%' }}
              placeholder='Chọn ngày sinh'
              format='YYYY-MM-DD'
              size='large'
              allowClear
            />
          </Form.Item>

          <Form.Item
            className='w-full'
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

          <Form.Item>
            <Button
              className='login-form-button mt-4'
              htmlType='submit'
              type='primary'
              size='large'
              loading={loading}
              disabled={loading}
            >
              Cập nhật thông tin
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}

export default React.memo(ProfileEditModal);
