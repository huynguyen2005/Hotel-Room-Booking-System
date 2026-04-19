/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import { SearchOutlined } from '@ant-design/icons';
import { Input, Select } from 'antd';
import React from 'react';

function QueryOptions({ query, setQuery, disabledSearch }) {
  return (
    <div className='flex flex-col items-center justify-between space-x-0 space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0'>
      <Input
        className='space-x-4'
        onChange={(e) => setQuery((prevState) => ({ ...prevState, search: e.target.value }))}
        placeholder='Nhập từ khóa để tìm kiếm...'
        prefix={<SearchOutlined />}
        disabled={disabledSearch}
        value={query.search}
        size='large'
        allowClear
      />

      <Select
        className='w-full sm:w-[240px]'
        onChange={(value) => setQuery((prevState) => ({ ...prevState, rows: value }))}
        placeholder='-- số dòng hiển thị --'
        defaultValue={query.rows}
        size='large'
      >
        <Select.Option value='05'>05 dòng</Select.Option>
        <Select.Option value='10'>10 dòng</Select.Option>
        <Select.Option value='20'>20 dòng</Select.Option>
        <Select.Option value='30'>30 dòng</Select.Option>
        <Select.Option value='40'>40 dòng</Select.Option>
        <Select.Option value='50'>50 dòng</Select.Option>
      </Select>

      <Select
        className='w-full sm:w-[240px]'
        onChange={(value) => setQuery((prevState) => ({ ...prevState, sort: value }))}
        placeholder='-- chọn kiểu sắp xếp --'
        defaultValue={query.sort}
        size='large'
      >
        <Select.Option value='asce'>Sắp xếp tăng dần</Select.Option>
        <Select.Option value='desc'>Sắp xếp giảm dần</Select.Option>
      </Select>
    </div>
  );
}

export default React.memo(QueryOptions);
