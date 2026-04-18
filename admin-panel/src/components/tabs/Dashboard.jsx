/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright Â©2023 â€• Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import { Result, Skeleton, Tag } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import React from 'react';
import useFetchData from '../../hooks/useFetchData';
import BookingCard from '../dashboard/BookingCard';
import RoomCard from '../dashboard/RoomCard';
import UsersCard from '../dashboard/UsersCard';

function Dashboard() {
  const [loading, error, response] = useFetchData('/api/v1/dashboard');
  const usersInfo = response?.data?.users_info;
  const roomsInfo = response?.data?.rooms_info;
  const bookingsInfo = response?.data?.booking_info;
  const totalRevenueSignals = (bookingsInfo?.approved_bookings || 0) + (bookingsInfo?.completed_bookings || 0);

  return (
    <div className='dashboard-shell'>
      <section className='dashboard-overview-banner'>
        <div>
          <p className='dashboard-overview-kicker'>Beach Resort Control Center</p>
          <h2 className='dashboard-overview-title'>Admin Dashboard</h2>
          <p className='dashboard-overview-copy'>
            Theo doi suc khoe van hanh cua he thong qua user, phong va booking theo mot bo cuc de doc hon.
          </p>
        </div>

        <div className='dashboard-overview-pills'>
          <Tag color='processing' icon={<BarChartOutlined />}>Live metrics</Tag>
          <div className='dashboard-overview-pill'>
            <span>Users</span>
            <strong>{usersInfo?.total_users || 0}</strong>
          </div>
          <div className='dashboard-overview-pill'>
            <span>Rooms</span>
            <strong>{roomsInfo?.total_rooms || 0}</strong>
          </div>
          <div className='dashboard-overview-pill'>
            <span>Active Orders</span>
            <strong>{totalRevenueSignals}</strong>
          </div>
        </div>
      </section>

      {loading && !response ? (
        <div className='dashboard-cards-grid'>
          <Skeleton active className='dashboard-skeleton-card' />
          <Skeleton active className='dashboard-skeleton-card' />
          <Skeleton active className='dashboard-skeleton-card dashboard-skeleton-card-wide' />
        </div>
      ) : error ? (
        <Result
          title='Failed to fetch'
          subTitle={error}
          status='error'
        />
      ) : (
        <div className='dashboard-cards-grid'>
          <UsersCard
            loading={loading}
            data={usersInfo}
          />

          <RoomCard
            loading={loading}
            data={roomsInfo}
          />

          <BookingCard
            loading={loading}
            data={bookingsInfo}
          />
        </div>
      )}
    </div>
  );
}

export default React.memo(Dashboard);
