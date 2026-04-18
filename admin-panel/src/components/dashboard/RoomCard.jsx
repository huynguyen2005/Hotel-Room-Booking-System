/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright Â©2023 â€• Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import {
  Card, Col, Progress, Row, Statistic, Tag
} from 'antd';
import {
  CheckCircleOutlined,
  HomeOutlined,
  PauseCircleOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import React from 'react';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';

const formatter = (value) => <CountUp end={value} separator=',' />;

function RoomCard({ loading, data }) {
  const navigate = useNavigate();
  const totalRooms = data?.total_rooms || 0;
  const availableRooms = data?.available_rooms || 0;
  const unavailableRooms = data?.unavailable_rooms || 0;
  const bookedRooms = data?.booked_rooms || 0;
  const availabilityPercent = totalRooms ? Math.round((availableRooms / totalRooms) * 100) : 0;
  const unavailablePercent = totalRooms ? Math.round((unavailableRooms / totalRooms) * 100) : 0;

  return (
    <Card
      className='dashboard-analytics-card w-full cursor-pointer md:w-[49.5%]'
      onClick={() => navigate('/main/hotel-rooms')}
      loading={loading}
      bordered={false}
    >
      <div className='dashboard-card-head'>
        <div>
          <p className='dashboard-card-kicker'>Inventory Snapshot</p>
          <h3 className='dashboard-card-title'>Rooms</h3>
        </div>

        <Tag color='gold' icon={<HomeOutlined />}>Inventory</Tag>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div className='dashboard-hero-stat dashboard-hero-stat-rooms'>
            <Statistic
              title='Total Rooms'
              formatter={formatter}
              value={totalRooms}
            />
            <div className='dashboard-hero-meta'>
              <span>
                <CheckCircleOutlined />
                {' '}
                {availableRooms}
                {' '}
                available
              </span>
              <span>
                <PauseCircleOutlined />
                {' '}
                {unavailableRooms}
                {' '}
                offline
              </span>
            </div>
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div className='dashboard-mini-stat'>
            <Statistic
              title='Available Now'
              formatter={formatter}
              prefix={<CheckCircleOutlined />}
              value={availableRooms}
            />
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div className='dashboard-mini-stat'>
            <Statistic
              title='Booked Flag'
              formatter={formatter}
              prefix={<ShoppingOutlined />}
              value={bookedRooms}
            />
          </div>
        </Col>

        <Col span={24}>
          <div className='dashboard-progress-block'>
            <div className='dashboard-progress-row'>
              <span>Availability Rate</span>
              <strong>
                {availabilityPercent}
                %
              </strong>
            </div>
            <Progress percent={availabilityPercent} strokeColor='#13c2c2' showInfo={false} />

            <div className='dashboard-progress-row'>
              <span>Unavailable Share</span>
              <strong>
                {unavailablePercent}
                %
              </strong>
            </div>
            <Progress percent={unavailablePercent} strokeColor='#fa8c16' showInfo={false} />
          </div>
        </Col>

        <Col span={24}>
          <div className='dashboard-breakdown-grid'>
            <div className='dashboard-breakdown-item'>
              <span>Available</span>
              <strong>{formatter(availableRooms)}</strong>
            </div>
            <div className='dashboard-breakdown-item'>
              <span>Unavailable</span>
              <strong>{formatter(unavailableRooms)}</strong>
            </div>
            <div className='dashboard-breakdown-item'>
              <span>Booked Status</span>
              <strong>{formatter(bookedRooms)}</strong>
            </div>
            <div className='dashboard-breakdown-item'>
              <span>Coverage</span>
              <strong>{formatter(totalRooms)}</strong>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
}

export default RoomCard;
