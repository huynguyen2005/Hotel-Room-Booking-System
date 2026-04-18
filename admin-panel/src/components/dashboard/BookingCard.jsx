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
  ClockCircleOutlined,
  FieldTimeOutlined,
  FileDoneOutlined
} from '@ant-design/icons';
import React from 'react';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';

const formatter = (value) => <CountUp end={value} separator=',' />;

function BookingCard({ loading, data }) {
  const navigate = useNavigate();
  const totalBookings = data?.total_bookings || 0;
  const approvedBookings = data?.approved_bookings || 0;
  const pendingBookings = data?.pending_bookings || 0;
  const rejectedBookings = data?.rejected_bookings || 0;
  const cancelBookings = data?.cancel_bookings || 0;
  const inReviewBookings = data?.in_reviews_bookings || 0;
  const completedBookings = data?.completed_bookings || 0;
  const approvalPercent = totalBookings ? Math.round((approvedBookings / totalBookings) * 100) : 0;
  const completionPercent = totalBookings ? Math.round((completedBookings / totalBookings) * 100) : 0;

  return (
    <Card
      className='dashboard-analytics-card dashboard-analytics-card-wide w-full cursor-pointer'
      onClick={() => navigate('/main/booking-orders')}
      loading={loading}
      bordered={false}
    >
      <div className='dashboard-card-head'>
        <div>
          <p className='dashboard-card-kicker'>Booking Pipeline</p>
          <h3 className='dashboard-card-title'>Reservations</h3>
        </div>

        <Tag color='green' icon={<FileDoneOutlined />}>Orders</Tag>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <div className='dashboard-hero-stat dashboard-hero-stat-bookings'>
            <Statistic
              title='Total Bookings'
              formatter={formatter}
              value={totalBookings}
            />
            <div className='dashboard-hero-meta'>
              <span>
                <CheckCircleOutlined />
                {' '}
                {approvedBookings}
                {' '}
                approved
              </span>
              <span>
                <ClockCircleOutlined />
                {' '}
                {pendingBookings}
                {' '}
                pending
              </span>
            </div>
          </div>
        </Col>

        <Col xs={24} lg={14}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div className='dashboard-mini-stat'>
                <Statistic
                  title='Approved'
                  formatter={formatter}
                  prefix={<CheckCircleOutlined />}
                  value={approvedBookings}
                />
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className='dashboard-mini-stat'>
                <Statistic
                  title='Pending'
                  formatter={formatter}
                  prefix={<ClockCircleOutlined />}
                  value={pendingBookings}
                />
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className='dashboard-mini-stat'>
                <Statistic
                  title='In Reviews'
                  formatter={formatter}
                  prefix={<FieldTimeOutlined />}
                  value={inReviewBookings}
                />
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className='dashboard-mini-stat'>
                <Statistic
                  title='Completed'
                  formatter={formatter}
                  prefix={<FileDoneOutlined />}
                  value={completedBookings}
                />
              </div>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <div className='dashboard-progress-block'>
            <div className='dashboard-progress-row'>
              <span>Approval Rate</span>
              <strong>
                {approvalPercent}
                %
              </strong>
            </div>
            <Progress percent={approvalPercent} strokeColor='#52c41a' showInfo={false} />

            <div className='dashboard-progress-row'>
              <span>Completion Rate</span>
              <strong>
                {completionPercent}
                %
              </strong>
            </div>
            <Progress percent={completionPercent} strokeColor='#722ed1' showInfo={false} />
          </div>
        </Col>

        <Col span={24}>
          <div className='dashboard-breakdown-grid dashboard-breakdown-grid-booking'>
            <div className='dashboard-breakdown-item'>
              <span>Cancelled</span>
              <strong>{formatter(cancelBookings)}</strong>
            </div>
            <div className='dashboard-breakdown-item'>
              <span>Rejected</span>
              <strong>{formatter(rejectedBookings)}</strong>
            </div>
            <div className='dashboard-breakdown-item'>
              <span>Review Queue</span>
              <strong>{formatter(inReviewBookings)}</strong>
            </div>
            <div className='dashboard-breakdown-item'>
              <span>Done</span>
              <strong>{formatter(completedBookings)}</strong>
            </div>
            <div className='dashboard-breakdown-item'>
              <span>Open Queue</span>
              <strong>{formatter(pendingBookings + approvedBookings + inReviewBookings)}</strong>
            </div>
            <div className='dashboard-breakdown-item'>
              <span>Dropped</span>
              <strong>{formatter(cancelBookings + rejectedBookings)}</strong>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
}

export default BookingCard;
