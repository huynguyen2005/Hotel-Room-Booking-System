/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright (c)2023 - Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import { Empty, Result, Skeleton } from 'antd';
import axios from 'axios';
import getConfig from 'next/config';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Banner from '../../components/home/Banner';
import Hero from '../../components/home/Hero';
import MainLayout from '../../components/layout';
import RoomFilter from '../../components/rooms/RoomsFilter';
import RoomList from '../../components/rooms/RoomsList';

const { publicRuntimeConfig } = getConfig();

function Rooms(props) {
  const [ourRooms, setOurRooms] = useState([]);
  const [ourFilteredRooms, setOurFilteredRooms] = useState([]);

  useEffect(() => {
    if (props?.rooms) {
      setOurRooms(props?.rooms?.data?.rows);
      setOurFilteredRooms(props?.rooms?.data?.rows);
    }
  }, [props]);

  return (
    <MainLayout title='Beach Resort - Danh sách phòng'>
      <Hero hero='roomsHero'>
        <Banner title='danh sách phòng'>
          <Link className='btn-primary' href='/'>
            về trang chủ
          </Link>
        </Banner>
      </Hero>

      <Skeleton loading={!props?.rooms && !props?.error} paragraph={{ rows: 10 }} active>
        {props?.rooms?.data?.rows?.length === 0 ? (
          <Empty
            className='mt-10'
            description={(<span>Không tìm thấy dữ liệu.</span>)}
          />
        ) : props?.error ? (
          <Result
            title='Tải dữ liệu thất bại'
            subTitle={props?.error?.message || 'Đã có lỗi xảy ra từ máy chủ.'}
            status='error'
          />
        ) : (
          <>
            <RoomFilter
              ourRooms={ourRooms}
              setOurFilteredRooms={setOurFilteredRooms}
            />
            <RoomList
              rooms={ourFilteredRooms}
            />
          </>
        )}
      </Skeleton>
    </MainLayout>
  );
}

export async function getServerSideProps() {
  try {
    const response = await axios.get(`${publicRuntimeConfig.API_BASE_URL}/api/v1/all-rooms-list`);
    const rooms = response?.data?.result;

    return {
      props: {
        rooms,
        error: null
      }
    };
  } catch (err) {
    return {
      props: {
        rooms: null,
        error: err?.data
      }
    };
  }
}

export default Rooms;
