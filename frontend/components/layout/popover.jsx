/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright (c)2023 - Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import {
  HistoryOutlined, LockOutlined, LogoutOutlined, UserOutlined
} from '@ant-design/icons';
import {
  Avatar, Button, Popover, Typography
} from 'antd';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import ChangePasswordModal from '../utilities/ChangePasswordModal';
import useMediaQuery from '../../hooks/useMediaQuery';
import ApiService from '../../utils/apiService';
import { getSessionUser, removeSessionAndLogoutUser } from '../../utils/authentication';
import notificationWithIcon from '../../utils/notification';

const { Title } = Typography;

function UserPopover() {
  const isDesktop = useMediaQuery('(min-width: 1200px)');
  const [loading, setLoading] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const user = getSessionUser();
  const router = useRouter();

  const userLogout = async () => {
    setLoading(true);
    try {
      const response = await ApiService.post('/api/v1/auth/logout');
      if (response?.result_code === 0) {
        removeSessionAndLogoutUser();
        setLoading(false);
      } else {
        notificationWithIcon('error', 'LỖI', 'Đã có lỗi xảy ra từ máy chủ.');
        removeSessionAndLogoutUser();
        setLoading(false);
      }
    } catch (error) {
      notificationWithIcon('error', 'LỖI', error?.response?.data?.result?.error || 'Đã có lỗi xảy ra từ máy chủ.');
      removeSessionAndLogoutUser();
      setLoading(false);
    }
  };

  return (
    <>
      <Popover
        placement='bottomRight'
        trigger='hover'
        title={(<span style={{ fontSize: '18px' }}>{user?.fullName}</span>)}
        content={(
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
            <Button
              style={{ color: '#000', padding: '0px' }}
              onClick={() => router.push('/profile?tab=my-profile')}
              icon={<UserOutlined />}
              size='middle'
              type='link'
            >
              Hồ sơ cá nhân
            </Button>
            <Button
              style={{ color: '#000', padding: '0px' }}
              onClick={() => router.push('/profile?tab=booking-history')}
              icon={<HistoryOutlined />}
              size='middle'
              type='link'
            >
              Lịch sử đặt phòng
            </Button>
            <Button
              style={{ color: '#000', padding: '0px' }}
              icon={<LockOutlined />}
              onClick={() => setChangePasswordOpen(true)}
              size='middle'
              type='link'
            >
              Đổi mật khẩu
            </Button>
            <Button
              style={{ color: '#000', padding: '0px' }}
              icon={<LogoutOutlined />}
              onClick={userLogout}
              size='middle'
              type='link'
              loading={loading}
              disabled={loading}
            >
              Đăng xuất
            </Button>
          </div>
        )}
      >
        <Avatar
          style={{
            position: 'absolute', right: '100px', top: '20px', cursor: 'pointer'
          }}
          src={(
            <img
              src={user?.avatar || 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg'}
              alt='avatar-img'
            />
          )}
          size='large'
        />
      </Popover>

      {isDesktop && (
        <Title
          style={{ position: 'absolute', right: '150px', top: '22px' }}
          level={3}
        >
          {`Xin chào, ${user?.fullName || 'N/A'}`}
        </Title>
      )}

      <ChangePasswordModal
        open={changePasswordOpen}
        setOpen={setChangePasswordOpen}
      />
    </>
  );
}

export default UserPopover;
