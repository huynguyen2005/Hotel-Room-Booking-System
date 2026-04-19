/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 • Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import { EditOutlined } from '@ant-design/icons';
import {
  Button, Descriptions, Image, Result, Skeleton, Tag, Tooltip, Upload
} from 'antd';
import ImgCrop from 'antd-img-crop';
import React, { useState } from 'react';
import useFetchData from '../../hooks/useFetchData';
import { getSessionToken, setSessionUserKeyAgainstValue } from '../../utils/authentication';
import notificationWithIcon from '../../utils/notification';
import { userStatusAsResponse } from '../../utils/responseAsStatus';
import ProfileEditModal from '../shared/ProfileEditModal';

const tagStyle = {
  minWidth: '86px',
  textAlign: 'center',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const nowrapLabel = (text) => <span style={{ whiteSpace: 'nowrap' }}>{text}</span>;

function MyProfile() {
  const token = getSessionToken();
  const [editProfileModal, setEditProfileModal] = useState(false);

  const [loading, error, response] = useFetchData('/api/v1/get-user');

  const props = {
    accept: 'image/*',
    name: 'avatar',
    action: `${process.env.REACT_APP_API_BASE_URL}/api/v1/avatar-update`,
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
            title='Thông tin của tôi'
            bordered
            column={3}
            extra={(
              <Button
                onClick={() => setEditProfileModal(true)}
                shape='default'
                type='primary'
                size='middle'
              >
                Chỉnh sửa hồ sơ
              </Button>
            )}
          >
            <Descriptions.Item label={nowrapLabel('Ảnh đại diện')} span={3}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                {response?.data?.avatar ? (
                  <Image
                    className='!w-[100px] !h-[100px]'
                    src={response?.data?.avatar}
                    crossOrigin='anonymous'
                    alt='user-image'
                  />
                ) : 'Không có'}

                <div style={{ position: 'absolute', top: '8px', right: '-18px' }}>
                  <ImgCrop grid rotate>
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
    </>
  );
}

export default React.memo(MyProfile);
