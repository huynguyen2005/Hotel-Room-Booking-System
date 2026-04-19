/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright (c)2023 - Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import React, { useEffect, useState } from 'react';
import Title from '../home/Title';

export default function RoomFilter({ ourRooms, setOurFilteredRooms }) {
  const [allowBreakfast, setAllowBreakfast] = useState(false);
  const [allowPets, setAllowPets] = useState(false);

  const roomTypeFiltering = (value) => {
    if (value === 'all') {
      setOurFilteredRooms(ourRooms);
    } else {
      const filteredRooms = ourRooms.filter((room) => room.room_type === value);
      setOurFilteredRooms(filteredRooms);
    }
  };

  const roomPriceFiltering = (value) => {
    const filteredRooms = ourRooms.filter((room) => room.room_price <= parseInt(value, 10));
    setOurFilteredRooms(filteredRooms);
  };

  useEffect(() => {
    if (allowBreakfast) {
      const filteredRooms = ourRooms.filter((room) => room.provide_breakfast === allowBreakfast);
      setOurFilteredRooms(filteredRooms);
    } else {
      setOurFilteredRooms(ourRooms);
    }
  }, [allowBreakfast]);

  useEffect(() => {
    if (allowPets) {
      const filteredRooms = ourRooms.filter((room) => room.allow_pets === allowPets);
      setOurFilteredRooms(filteredRooms);
    } else {
      setOurFilteredRooms(ourRooms);
    }
  }, [allowPets]);

  return (
    <section className='filter-container'>
      <Title title='tìm kiếm phòng' />

      <form className='filter-form'>
        <div className='form-group'>
          <label htmlFor='type'>loại phòng</label>
          <select
            className='form-control'
            onChange={(e) => roomTypeFiltering(e.target.value)}
            defaultValue='all'
            name='type'
            id='type'
          >
            <option value='all'>Tất cả</option>
            <option value='single'>Phòng đơn</option>
            <option value='couple'>Phòng đôi</option>
            <option value='family'>Phòng gia đình</option>
            <option value='presidential'>Phòng tổng thống</option>
          </select>
        </div>

        <div className='form-group'>
          <label htmlFor='price'>mức giá từ 100 đô</label>
          <input
            className='form-control'
            type='range'
            name='price'
            id='price'
            min={100}
            max={1000}
            defaultValue={1000}
            onChange={(e) => roomPriceFiltering(e.target.value)}
          />
        </div>

        <div className='form-group'>
          <div className='single-extra'>
            <input
              name='breakfast'
              type='checkbox'
              id='breakfast'
              checked={allowBreakfast}
              onChange={() => setAllowBreakfast(!allowBreakfast)}
            />
            <label htmlFor='breakfast'>bao gồm bữa sáng</label>
          </div>

          <div className='single-extra'>
            <input
              type='checkbox'
              name='pets'
              id='pets'
              checked={allowPets}
              onChange={() => setAllowPets(!allowPets)}
            />
            <label htmlFor='pets'>cho phép thú cưng</label>
          </div>
        </div>
      </form>
    </section>
  );
}
