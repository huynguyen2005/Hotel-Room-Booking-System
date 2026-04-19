/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright (c)2023 - Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import {
  DashboardOutlined,
  FileProtectOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  HomeOutlined,
  LogoutOutlined,
  MessageOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Button, Layout, Menu, Tooltip
} from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Logo from '../assets/images/logo.svg';
import UserBox from '../components/shared/UserBox';
import Dashboard from '../components/tabs/Dashboard';
import MyProfile from '../components/tabs/MyProfile';
import Orders from '../components/tabs/Orders';
import Reviews from '../components/tabs/Reviews';
import Rooms from '../components/tabs/Rooms';
import Users from '../components/tabs/Users';
import useFullScreen from '../hooks/useFullScreen';
import ApiService from '../utils/apiService';
import { removeSessionAndLogoutUser } from '../utils/authentication';
import notificationWithIcon from '../utils/notification';

const {
  Header, Content, Footer, Sider
} = Layout;

function Main() {
  window.document.title = 'Beach Resort - Quản trị';
  const { isFullscreen, toggleFullScreen } = useFullScreen();
  const [selectedKeys, setSelectedKeys] = useState('1');
  const navigate = useNavigate();
  const { tab } = useParams();

  const userLogout = async () => {
    try {
      const response = await ApiService.post('/api/v1/auth/logout');
      if (response?.result_code === 0) {
        removeSessionAndLogoutUser();
      } else {
        notificationWithIcon('error', 'LỖI', 'Đã có lỗi xảy ra từ máy chủ.');
        removeSessionAndLogoutUser();
      }
    } catch (error) {
      notificationWithIcon('error', 'LỖI', error?.response?.data?.result?.error || 'Đã có lỗi xảy ra từ máy chủ.');
      removeSessionAndLogoutUser();
    }
  };

  const handleTabChange = (key) => {
    switch (key) {
      case '1':
        navigate('/main/dashboard');
        break;
      case '2':
        navigate('/main/users');
        break;
      case '3':
        navigate('/main/hotel-rooms');
        break;
      case '4':
        navigate('/main/booking-orders');
        break;
      case '5':
        navigate('/main/reviews');
        break;
      case '6':
        navigate('/main/profile');
        break;
      case '7':
        userLogout();
        break;
      default:
        navigate('/main/dashboard');
    }
  };

  useEffect(() => {
    if (!tab) return;

    switch (tab) {
      case 'dashboard':
        setSelectedKeys('1');
        break;
      case 'users':
        setSelectedKeys('2');
        break;
      case 'hotel-rooms':
        setSelectedKeys('3');
        break;
      case 'booking-orders':
        setSelectedKeys('4');
        break;
      case 'reviews':
        setSelectedKeys('5');
        break;
      case 'profile':
        setSelectedKeys('6');
        break;
      case 'logout':
        setSelectedKeys('7');
        break;
      default:
        navigate('/not-found');
    }
  }, [tab, navigate]);

  useEffect(() => {
    switch (selectedKeys) {
      case '1':
        window.document.title = 'Beach Resort - Bảng điều khiển';
        break;
      case '2':
        window.document.title = 'Beach Resort - Người dùng';
        break;
      case '3':
        window.document.title = 'Beach Resort - Phòng';
        break;
      case '4':
        window.document.title = 'Beach Resort - Đơn đặt phòng';
        break;
      case '5':
        window.document.title = 'Beach Resort - Đánh giá';
        break;
      case '6':
        window.document.title = 'Beach Resort - Hồ sơ';
        break;
      case '7':
        window.document.title = 'Beach Resort - Đăng xuất';
        break;
      default:
        window.document.title = 'Beach Resort - Bảng điều khiển';
    }
  }, [selectedKeys]);

  return (
    <Layout className='w-full h-screen'>
      <Sider width={250} breakpoint='lg' collapsedWidth='0'>
        <UserBox />

        <Menu
          theme='dark'
          mode='inline'
          selectedKeys={[selectedKeys]}
          onClick={(e) => {
            handleTabChange(e.key);
          }}
          items={[
            { key: '1', icon: <DashboardOutlined />, label: 'Bảng điều khiển' },
            { key: '2', icon: <TeamOutlined />, label: 'Người dùng' },
            { key: '3', icon: <HomeOutlined />, label: 'Phòng' },
            { key: '4', icon: <FileProtectOutlined />, label: 'Đơn đặt phòng' },
            { key: '5', icon: <MessageOutlined />, label: 'Đánh giá' },
            { key: '6', icon: <UserOutlined />, label: 'Hồ sơ của tôi' },
            { key: '7', icon: <LogoutOutlined />, label: 'Đăng xuất' }
          ]}
        />
      </Sider>

      <Layout>
        <Header className='p-0 !bg-bg-white'>
          <Link to='/'>
            <img
              className='w-[280px] h-[65px] mx-auto'
              alt='beach-resort-logo'
              src={Logo}
            />
          </Link>

          <Tooltip title='Bấm để bật hoặc thoát toàn màn hình' placement='left'>
            <Button
              className='absolute right-5 top-5'
              icon={isFullscreen ?
                (<FullscreenExitOutlined className='pb-12' />) :
                (<FullscreenOutlined className='pb-12' />)}
              onClick={toggleFullScreen}
              shape='default'
              type='default'
              size='middle'
            />
          </Tooltip>
        </Header>

        <Content className='bg-bg-white overflow-y-scroll m-2 p-2'>
          {selectedKeys === '1' && (<Dashboard />)}
          {selectedKeys === '2' && (<Users />)}
          {selectedKeys === '3' && (<Rooms />)}
          {selectedKeys === '4' && (<Orders />)}
          {selectedKeys === '5' && (<Reviews />)}
          {selectedKeys === '6' && (<MyProfile />)}
        </Content>

        <Footer className='text-center font-text-font font-medium '>
          ©2026 Beach Resort
        </Footer>
      </Layout>
    </Layout>
  );
}

export default React.memo(Main);
