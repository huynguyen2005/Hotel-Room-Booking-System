/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 • Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import { EditOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import {
  Button, Descriptions, Image, Modal, Result, Skeleton, Tag, Tooltip, Upload
} from 'antd';
import ImgCrop from 'antd-img-crop';
import getConfig from 'next/config';
import React, { useState } from 'react';
import useFetchData from '../../hooks/useFetchData';
import ApiService from '../../utils/apiService';
import { getSessionToken, getSessionUser, setSessionUserKeyAgainstValue } from '../../utils/authentication';
import notificationWithIcon from '../../utils/notification';
import { userStatusAsResponse } from '../../utils/responseAsStatus';
import ChangePasswordModal from '../utilities/ChangePasswordModal';
import ProfileEditModal from './ProfileEditModal';

const { publicRuntimeConfig } = getConfig();
const { confirm } = Modal;

const tagStyle = {
  minWidth: '86px',
  textAlign: 'center',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const nowrapLabel = (text) => <span style={{ whiteSpace: 'nowrap' }}>{text}</span>;

function MyProfile() {
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const token = getSessionToken();
  const user = getSessionUser();

  const [loading, error, response] = useFetchData('/api/v1/get-user');

  const props = {
    accept: 'image/*',
    name: 'avatar',
    action: `${publicRuntimeConfig.API_BASE_URL}/api/v1/avatar-update`,
    method: 'put',
    headers: { authorization: `Bearer ${token}` },
    onChange(info) {
      if (info.file.status === 'done') {
        if (info?.file?.response?.result_code === 0) {
          notificationWithIcon('success', 'THÀNH CÔNG', info?.file?.response?.result?.message || 'Đổi ảnh đại diện thành công.');
          setSessionUserKeyAgainstValue('avatar', info?.file?.response?.result?.data?.avatar);
          window.location.reload();
        } else {
          notificationWithIcon('error', 'LỖI', 'Đã có lỗi xảy ra từ máy chủ.');
        }
      } else {
        notificationWithIcon('error', 'LỖI', info?.file?.response?.result?.error || 'Đã có lỗi xảy ra từ máy chủ.');
      }
    }
  };

  const handleVerifyEmail = () => {
    confirm({
      title: 'GỬI LIÊN KẾT XÁC MINH EMAIL',
      icon: <ExclamationCircleFilled />,
      content: 'Bạn có chắc muốn gửi liên kết xác minh email không?',
      okText: 'Gửi',
      cancelText: 'Hủy',
      onOk() {
        return new Promise((resolve, reject) => {
          ApiService.post('/api/v1/auth/send-email-verification-link')
            .then((res) => {
              if (res?.result_code === 0) {
                notificationWithIcon('success', 'THÀNH CÔNG', res?.result?.message || 'Đã gửi liên kết xác minh email thành công.');
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
        });
      }
    });
  };

  return (
    <>
      <Skeleton loading={loading} paragraph={{ rows: 10 }} active avatar>
        {error ? (
          <Result
            title='Không thể tải dữ liệu'
            subTitle={error}
            status='error'
          />
        ) : (
          <Descriptions
            title='Thông tin hồ sơ'
            bordered
            column={3}
            extra={(
              <>
                {!user?.verified && (
                  <Button
                    style={{ marginTop: '10px', marginRight: '20px' }}
                    onClick={handleVerifyEmail}
                    shape='default'
                    type='primary'
                    size='large'
                  >
                    Xác minh email
                  </Button>
                )}

                <Button
                  style={{ marginTop: '10px', marginRight: '20px' }}
                  onClick={() => setChangePasswordOpen(true)}
                  shape='default'
                  type='default'
                  size='large'
                >
                  Đổi mật khẩu
                </Button>

                <Button
                  style={{ marginTop: '10px', marginRight: '20px' }}
                  onClick={() => setEditProfileModal(true)}
                  shape='default'
                  type='primary'
                  size='large'
                >
                  Chỉnh sửa hồ sơ
                </Button>
              </>
            )}
          >
            <Descriptions.Item label={nowrapLabel('Ảnh đại diện')} span={3}>
              {response?.data?.avatar ? (
                <Image
                  style={{ width: '100px', height: '100px' }}
                  src={response?.data?.avatar}
                  crossOrigin='anonymous'
                  alt='user-image'
                />
              ) : 'Không có'}

              <div style={{ position: 'absolute', marginTop: '-7rem', marginLeft: '5.5rem' }}>
                <ImgCrop showGrid rotationSlider>
                  <Upload {...props}>
                    <Tooltip title='Nhấn để đổi ảnh đại diện'>
                      <Button
                        icon={<EditOutlined />}
                        type='default'
                        shape='circle'
                      />
                    </Tooltip>
                  </Upload>
                </ImgCrop>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={nowrapLabel('Họ và tên')}>
              {response?.data?.fullName}
            </Descriptions.Item>
            <Descriptions.Item label={nowrapLabel('Tên đăng nhập')} span={2}>
              {response?.data?.userName}
            </Descriptions.Item>
            <Descriptions.Item label={nowrapLabel('Email')}>
              {response?.data?.email}
            </Descriptions.Item>
            <Descriptions.Item label={nowrapLabel('Số điện thoại')} span={2}>
              {response?.data?.phone}
            </Descriptions.Item>

            <Descriptions.Item label={nowrapLabel('Vai trò')}>
              <Tag
                style={tagStyle}
                color={response?.data?.role === 'admin' ? 'magenta' : 'purple'}
              >
                {response?.data?.role === 'admin' ? 'Admin' : 'Người dùng'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={nowrapLabel('Trạng thái')} span={2}>
              <Tag
                style={tagStyle}
                color={userStatusAsResponse(response?.data?.status).color}
              >
                {userStatusAsResponse(response?.data?.status).level}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={nowrapLabel('Đã xác minh')}>
              <Tag
                style={tagStyle}
                color={response?.data?.verified ? 'success' : 'error'}
              >
                {response?.data?.verified ? 'Có' : 'Không'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={nowrapLabel('Ngày sinh')} span={2}>
              {response?.data?.dob?.split('T')[0] || 'Không có'}
            </Descriptions.Item>

            <Descriptions.Item label={nowrapLabel('Ngày cập nhật gần nhất')}>
              {response?.data?.updatedAt?.split('T')[0]}
            </Descriptions.Item>
            <Descriptions.Item label={nowrapLabel('Ngày đăng ký tài khoản')} span={2}>
              {response?.data?.createdAt?.split('T')[0]}
            </Descriptions.Item>

            <Descriptions.Item label={nowrapLabel('Địa chỉ')} span={3}>
              {response?.data?.address}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Skeleton>

      {editProfileModal && (
        <ProfileEditModal
          editProfileModal={editProfileModal}
          setEditProfileModal={setEditProfileModal}
        />
      )}

      <ChangePasswordModal
        open={changePasswordOpen}
        setOpen={setChangePasswordOpen}
      />
    </>
  );
}

export default React.memo(MyProfile);
