/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 • Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import { Button, Modal, Select } from 'antd';
import React, { useState } from 'react';
import ApiService from '../../utils/apiService';
import notificationWithIcon from '../../utils/notification';

function RoomStatusUpdateModal({ statusUpdateModal, setStatusUpdateModal, setFetchAgain }) {
  const [bookingStatus] = useState([
    { value: 'approved', label: 'Đã duyệt', disabled: false },
    { value: 'rejected', label: 'Từ chối', disabled: false }
  ]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleClose = () => {
    setStatus(null);
    setStatusUpdateModal((prevState) => ({ ...prevState, open: false, status: null }));
  };

  const handleUpdateStatus = () => {
    if (!status) {
      notificationWithIcon('error', 'LỖI', 'Vui lòng chọn trạng thái trước.');
    } else {
      setLoading(true);
      ApiService.put(
        `/api/v1/updated-booking-order/${statusUpdateModal?.roomId}`,
        { booking_status: status }
      )
        .then((res) => {
          setLoading(false);
          if (res?.result_code === 0) {
            notificationWithIcon('success', 'THÀNH CÔNG', res?.result?.message || 'Cập nhật trạng thái đơn đặt phòng thành công.');
            handleClose();
            setFetchAgain((prevState) => !prevState);
          } else {
            notificationWithIcon('error', 'LỖI', 'Đã có lỗi xảy ra từ máy chủ.');
          }
        })
        .catch((err) => {
          setLoading(false);
          notificationWithIcon('error', 'LỖI', err?.response?.data?.result?.error?.message || err?.response?.data?.result?.error || 'Đã có lỗi xảy ra từ máy chủ.');
        });
    }
  };

  return (
    <Modal
      title='Cập nhật trạng thái đơn đặt phòng'
      open={statusUpdateModal?.open}
      onOk={handleClose}
      onCancel={handleClose}
      footer={[
        <Button
          onClick={handleClose}
          key='back'
        >
          Hủy
        </Button>,
        <Button
          onClick={handleUpdateStatus}
          type='primary'
          key='submit'
          disabled={loading}
          loading={loading}
        >
          Đồng ý
        </Button>
      ]}
    >
      <Select
        className='w-full my-5'
        placeholder='-- chọn trạng thái đơn đặt phòng --'
        optionFilterProp='children'
        options={bookingStatus}
        size='large'
        allowClear
        value={status}
        onChange={(value) => setStatus(value)}
      />
    </Modal>
  );
}

export default RoomStatusUpdateModal;
