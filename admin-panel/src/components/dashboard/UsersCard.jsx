/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import {
  Card, Col, Progress, Row, Statistic, Tag
} from 'antd';
import {
  CheckCircleOutlined,
  StopOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import React from 'react';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';

const formatter = (value) => <CountUp end={value} separator=',' />;

function UsersCard({ loading, data }) {
  const navigate = useNavigate();
  const totalUsers = data?.total_users || 0;
  const verifiedUsers = data?.verified_user || 0;
  const blockedUsers = data?.blocked_status_user || 0;
  const activeUsers = (data?.login_status_user || 0) + (data?.logout_status_user || 0);
  const verifiedPercent = totalUsers ? Math.round((verifiedUsers / totalUsers) * 100) : 0;
  const blockedPercent = totalUsers ? Math.round((blockedUsers / totalUsers) * 100) : 0;

  return (
    <Card
      className='dashboard-analytics-card w-full cursor-pointer md:w-[49.5%]'
      onClick={() => navigate('/main/users')}
      loading={loading}
      bordered={false}
    >
      <div className='dashboard-card-head'>
        <div>
          <p className='dashboard-card-kicker'>Audience Overview</p>
          <h3 className='dashboard-card-title'>Users</h3>
        </div>

        <Tag color='blue' icon={<TeamOutlined />}>Live</Tag>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div className='dashboard-hero-stat dashboard-hero-stat-users'>
            <Statistic
              title='Total Users'
              formatter={formatter}
              value={totalUsers}
            />
            <div className='dashboard-hero-meta'>
              <span>
                <CheckCircleOutlined />
                {' '}
                {verifiedUsers}
                {' '}
                verified
              </span>
              <span>
                <StopOutlined />
                {' '}
                {blockedUsers}
                {' '}
                blocked
              </span>
            </div>
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div className='dashboard-mini-stat'>
            <Statistic
              title='Admin Accounts'
              formatter={formatter}
              prefix={<UserOutlined />}
              value={data?.admin_role_user || 0}
            />
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div className='dashboard-mini-stat'>
            <Statistic
              title='Customer Accounts'
              formatter={formatter}
              prefix={<TeamOutlined />}
              value={data?.user_role_user || 0}
            />
          </div>
        </Col>

        <Col span={24}>
          <div className='dashboard-progress-block'>
            <div className='dashboard-progress-row'>
              <span>Verification Rate</span>
              <strong>
                {verifiedPercent}
                %
              </strong>
            </div>
            <Progress percent={verifiedPercent} strokeColor='#1677ff' showInfo={false} />

            <div className='dashboard-progress-row'>
              <span>Blocked Share</span>
              <strong>
                {blockedPercent}
                %
              </strong>
            </div>
            <Progress percent={blockedPercent} strokeColor='#fa541c' showInfo={false} />
          </div>
        </Col>

        <Col span={24}>
          <div className='dashboard-breakdown-grid'>
            <div className='dashboard-breakdown-item'>
              <span>Registered</span>
              <strong>{formatter(data?.register_status_user || 0)}</strong>
            </div>
            <div className='dashboard-breakdown-item'>
              <span>Logged In</span>
              <strong>{formatter(data?.login_status_user || 0)}</strong>
            </div>
            <div className='dashboard-breakdown-item'>
              <span>Logged Out</span>
              <strong>{formatter(data?.logout_status_user || 0)}</strong>
            </div>
            <div className='dashboard-breakdown-item'>
              <span>Active Pool</span>
              <strong>{formatter(activeUsers)}</strong>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
}

export default UsersCard;
