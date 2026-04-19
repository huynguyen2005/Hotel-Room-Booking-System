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
import React from 'react';
import Banner from '../components/home/Banner';
import FeaturedRooms from '../components/home/FeaturedRooms';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import MainLayout from '../components/layout';

const { publicRuntimeConfig } = getConfig();

function Home(props) {
  return (
    <MainLayout title='Beach Resort - Trang chủ'>
      <Hero>
        <Banner
          title='phòng nghỉ sang trọng'
          subtitle='phòng cao cấp chỉ từ 299 đô mỗi đêm'
        >
          <Link href='/rooms' className='btn-primary'>
            xem phòng
          </Link>
        </Banner>
      </Hero>
      <Services />

      <Skeleton loading={!props?.featuredRooms && !props?.error} paragraph={{ rows: 5 }} active>
        {props?.featuredRooms?.data?.rows?.length === 0 ? (
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
          <FeaturedRooms
            featuredRoom={props?.featuredRooms?.data?.rows}
          />
        )}
      </Skeleton>
    </MainLayout>
  );
}

export async function getServerSideProps() {
  try {
    const response = await axios.get(`${publicRuntimeConfig.API_BASE_URL}/api/v1/featured-rooms-list`);
    const featuredRooms = response?.data?.result;

    return {
      props: {
        featuredRooms,
        error: null
      }
    };
  } catch (err) {
    return {
      props: {
        featuredRooms: null,
        error: err?.data
      }
    };
  }
}

export default Home;
