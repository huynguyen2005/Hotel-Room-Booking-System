/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 • Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import { ExclamationCircleFilled } from '@ant-design/icons';
import {
  Button, Descriptions, Image, Modal, Result, Skeleton, Tag
} from 'antd';
import React from 'react';
import { useDispatch } from 'react-redux';
import useFetchData from '../../hooks/useFetchData';
import { reFetchData } from '../../store/slice/appSlice';
import ApiService from '../../utils/apiService';
import { getSessionUser } from '../../utils/authentication';
import notificationWithIcon from '../../utils/notification';
import { userStatusAsResponse } from '../../utils/responseAsStatus';

const { confirm } = Modal;

function UserDetails({ id }) {
  const dispatch = useDispatch();
  const user = getSessionUser();

  const [loading, error, response] = useFetchData(`/api/v1/get-user/${id}`);

  const blockedUser = () => {
    confirm({
      title: 'KHÓA NGƯỜI DÙNG',
      icon: <ExclamationCircleFilled />,
      content: 'Bạn có chắc muốn khóa người dùng này không?',
      onOk() {
        return new Promise((resolve, reject) => {
          ApiService.put(`/api/v1/blocked-user/${id}`)
            .then((res) => {
              if (res?.result_code === 0) {
                notificationWithIcon('success', 'THÀNH CÔNG', res?.result?.message || 'Khóa người dùng thành công.');
                dispatch(reFetchData());
                resolve();
              } else {
                notificationWithIcon('error', 'LỖI', 'Đã có lỗi xảy ra từ máy chủ.');
                reject();
              }
            })
            .catch((err) => {
              notificationWithIcon('error', 'LỖI', err?.response?.data?.result?.error?.message || err?.response?.data?.result?.error || 'Đã có lỗi xảy ra từ máy chủ.');
              reject();
            });
        }).catch(() => notificationWithIcon('error', 'LỖI', 'Đã có lỗi xảy ra.'));
      }
    });
  };

  const unblockedUser = () => {
    confirm({
      title: 'MỞ KHÓA NGƯỜI DÙNG',
      icon: <ExclamationCircleFilled />,
      content: 'Bạn có chắc muốn mở khóa người dùng này không?',
      onOk() {
        return new Promise((resolve, reject) => {
          ApiService.put(`/api/v1/unblocked-user/${id}`)
            .then((res) => {
              if (res?.result_code === 0) {
                notificationWithIcon('success', 'THÀNH CÔNG', res?.result?.message || 'Mở khóa người dùng thành công.');
                dispatch(reFetchData());
                resolve();
              } else {
                notificationWithIcon('error', 'LỖI', 'Đã có lỗi xảy ra từ máy chủ.');
                reject();
              }
            })
            .catch((err) => {
              notificationWithIcon('error', 'LỖI', err?.response?.data?.result?.error?.message || err?.response?.data?.result?.error || 'Đã có lỗi xảy ra từ máy chủ.');
              reject();
            });
        }).catch(() => notificationWithIcon('error', 'LỖI', 'Đã có lỗi xảy ra.'));
      }
    });
  };

  return (
    <Skeleton loading={loading} paragraph={{ rows: 10 }} active avatar>
      {error ? (
        <Result
          title='Không thể tải dữ liệu'
          subTitle={error}
          status='error'
        />
      ) : (
        <Descriptions
          title='Thông tin người dùng'
          bordered
          extra={user?.id !== id && (response?.data?.status === 'blocked' ? (
            <Button onClick={unblockedUser} type='default' danger>
              Mở khóa người dùng
            </Button>
          ) : (
            <Button onClick={blockedUser} type='default' danger>
              Khóa người dùng
            </Button>
          ))}
        >
          <Descriptions.Item label='Ảnh đại diện' span={3}>
            {response?.data?.avatar ? (
              <Image
                className='!w-[100px] !h-[100px]'
                src={response?.data?.avatar}
                crossOrigin='anonymous'
                alt='user-image'
              />
            ) : 'Không có'}
          </Descriptions.Item>

          <Descriptions.Item label='Họ và tên'>
            {response?.data?.fullName}
          </Descriptions.Item>
          <Descriptions.Item label='Tên đăng nhập' span={2}>
            {response?.data?.userName}
          </Descriptions.Item>
          <Descriptions.Item label='Email'>
            {response?.data?.email}
          </Descriptions.Item>
          <Descriptions.Item label='Số điện thoại' span={2}>
            {response?.data?.phone}
          </Descriptions.Item>

          <Descriptions.Item label='Vai trò'>
            <Tag
              className='w-[60px] text-center uppercase'
              color={response?.data?.role === 'admin' ? 'magenta' : 'purple'}
            >
              {response?.data?.role}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label='Trạng thái' span={2}>
            <Tag
              className='w-[70px] text-center uppercase'
              color={userStatusAsResponse(response?.data?.status).color}
            >
              {userStatusAsResponse(response?.data?.status).level}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label='Đã xác minh'>
            <Tag
              className='w-[50px] text-center uppercase'
              color={response?.data?.verified ? 'success' : 'error'}
            >
              {response?.data?.verified ? 'Có' : 'Không'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label='Ngày sinh' span={2}>
            {response?.data?.dob?.split('T')[0] || 'Không có'}
          </Descriptions.Item>

          <Descriptions.Item label='Ngày cập nhật gần nhất'>
            {response?.data?.updatedAt?.split('T')[0]}
          </Descriptions.Item>
          <Descriptions.Item label='Ngày đăng ký tài khoản' span={2}>
            {response?.data?.createdAt?.split('T')[0]}
          </Descriptions.Item>

          <Descriptions.Item label='Địa chỉ' span={3}>
            {response?.data?.address}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Skeleton>
  );
}

export default React.memo(UserDetails);
