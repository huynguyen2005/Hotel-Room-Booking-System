/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 • Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import {
  Button, Empty, Modal, Pagination, Rate, Result, Skeleton, Tag, Tooltip
} from 'antd';
import React, { useEffect, useState } from 'react';
import { v4 as uniqueId } from 'uuid';
import useFetchData from '../../hooks/useFetchData';
import ApiService from '../../utils/apiService';
import arrayToCommaSeparatedText from '../../utils/arrayToCommaSeparatedText';
import notificationWithIcon from '../../utils/notification';
import { bookingStatusAsResponse } from '../../utils/responseAsStatus';
import QueryOptions from '../shared/QueryOptions';
import RoomStatusUpdateModal from '../shared/RoomStatusUpdateModal';

function Orders() {
  const { confirm } = Modal;
  const [fetchAgain, setFetchAgain] = useState(false);
  const [query, setQuery] = useState({
    search: '', sort: 'desc', page: '1', rows: '10'
  });
  const [statusUpdateModal, setStatusUpdateModal] = useState(
    { open: false, roomId: null, status: null }
  );
  const [actionLoading, setActionLoading] = useState(null);

  const [loading, error, response] = useFetchData(`/api/v1/get-all-booking-orders?keyword=${query.search}&limit=${query.rows}&page=${query.page}&sort=${query.sort}`, fetchAgain);

  useEffect(() => {
    setQuery((prevState) => ({ ...prevState, page: '1' }));
  }, [query.rows, query.search]);

  const handleBookingStayAction = async (bookingId, actionType) => {
    try {
      setActionLoading(`${actionType}-${bookingId}`);
      let endpoint = `/api/v1/booking-check-out/${bookingId}`;

      if (actionType === 'check-in') {
        endpoint = `/api/v1/booking-check-in/${bookingId}`;
      }

      if (actionType === 'no-show') {
        endpoint = `/api/v1/booking-no-show/${bookingId}`;
      }

      const res = await ApiService.put(endpoint);

      if (res?.result_code === 0) {
        notificationWithIcon(
          'success',
          'THÀNH CÔNG',
          res?.result?.message || `Thao tác ${actionType} cho đơn đặt phòng thành công`
        );
        setFetchAgain((prevState) => !prevState);
      } else {
        notificationWithIcon('error', 'LỖI', 'Đã có lỗi xảy ra từ máy chủ.');
      }
    } catch (err) {
      notificationWithIcon(
        'error',
        'LỖI',
        err?.response?.data?.result?.error?.message ||
          err?.response?.data?.result?.error ||
          'Đã có lỗi xảy ra từ máy chủ.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleNoShowConfirm = (bookingId) => {
    confirm({
      title: 'Xác nhận cập nhật no-show',
      content: 'Bạn có chắc muốn đánh dấu đơn đặt phòng này là không đến không?',
      okText: 'Đánh dấu no-show',
      cancelText: 'Hủy',
      onOk() {
        return handleBookingStayAction(bookingId, 'no-show');
      }
    });
  };

  return (
    <div>
      <QueryOptions query={query} setQuery={setQuery} disabledSearch />

      <div className='w-full flex flex-row flex-wrap items-center justify-center gap-2'>
        {error ? (
          <Result
            title='Không thể tải dữ liệu'
            subTitle={error}
            status='error'
          />
        ) : (
          <Skeleton loading={loading} paragraph={{ rows: 10 }} active>
            {response?.data?.rows?.length === 0 ? (
              <Empty
                className='mt-10'
                description={(<span>Không tìm thấy dữ liệu.</span>)}
              />
            ) : (
              <div className='table-layout'>
                <div className='table-layout-container'>
                  <table className='data-table'>
                    <thead className='data-table-head'>
                      <tr className='data-table-head-tr'>
                        <th className='data-table-head-tr-th' scope='col'>
                          Ngày đặt phòng
                        </th>
                        <th className='data-table-head-tr-th' scope='col'>
                          Trạng thái đơn
                        </th>
                        <th className='data-table-head-tr-th' scope='col'>
                          Nhận phòng
                        </th>
                        <th className='data-table-head-tr-th' scope='col'>
                          Trả phòng
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Khách đặt
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Thanh toán
                        </th>
                        <th className='data-table-head-tr-th' scope='col'>
                          Phòng đã đặt
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Đánh giá
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Thao tác
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {response?.data?.rows?.map((data) => {
                        const isPending = data?.booking_status === 'pending';
                        const isApproved = data?.booking_status === 'approved';
                        const canCheckIn = isApproved && !data?.stay_info?.checked_in_at;
                        const canMarkNoShow = isApproved && !data?.stay_info?.checked_in_at;
                        const canCheckOut = isApproved &&
                          data?.stay_info?.checked_in_at &&
                          !data?.stay_info?.checked_out_at;
                        const currentActionKey = actionLoading && actionLoading.endsWith(data?.id)
                          ? actionLoading
                          : null;

                        return (
                          <tr className='data-table-body-tr' key={uniqueId()}>
                            <td className='data-table-body-tr-td'>
                              {arrayToCommaSeparatedText(data?.booking_dates?.map(
                                (date) => (date.split('T')[0])
                              ))}
                            </td>
                            <td className='data-table-body-tr-td text-center'>
                              <Tag
                                className='w-[100px] text-center uppercase'
                                color={bookingStatusAsResponse(data?.booking_status).color}
                              >
                                {bookingStatusAsResponse(data?.booking_status).level}
                              </Tag>
                            </td>
                            <td className='data-table-body-tr-td text-center'>
                              {data?.stay_info?.checked_in_at ? data.stay_info.checked_in_at.split('T')[0] : 'Chưa có'}
                            </td>
                            <td className='data-table-body-tr-td text-center'>
                              {data?.stay_info?.checked_out_at ? data.stay_info.checked_out_at.split('T')[0] : 'Chưa có'}
                            </td>
                            <td className='data-table-body-tr-td'>
                              <div className='flex flex-col'>
                                <span>{data?.customer_info?.customer_name || data?.booking_by?.fullName}</span>
                                <small>{data?.customer_info?.customer_phone || 'Không có'}</small>
                              </div>
                            </td>
                            <td className='data-table-body-tr-td text-center'>
                              <div className='flex flex-col'>
                                <span>
                                  {data?.payment_info?.payment_method === 'counter'
                                    ? 'Tại quầy'
                                    : (data?.payment_info?.payment_method || 'Không có')}
                                </span>
                                <small>{data?.payment_info?.payment_status || 'Không có'}</small>
                              </div>
                            </td>
                            <td className='data-table-body-tr-td'>
                              {data?.room?.room_name}
                            </td>
                            <Tooltip
                              title={data?.reviews?.message}
                              placement='top'
                              trigger='hover'
                            >
                              <td className='data-table-body-tr-td text-center'>
                                {data?.reviews ? (
                                  <Rate value={data?.reviews?.rating} disabled />
                                ) : 'Không có'}
                              </td>
                            </Tooltip>
                            <td className='data-table-body-tr-td !px-0 text-center'>
                              {isPending && (
                                <Button
                                  className='inline-flex items-center !px-2'
                                  type='primary'
                                  onClick={() => setStatusUpdateModal((prevState) => ({
                                    ...prevState,
                                    open: true,
                                    roomId: data?.id,
                                    status: data?.booking_status
                                  }))}
                                >
                                  Cập nhật trạng thái
                                </Button>
                              )}

                              {canCheckIn && (
                                <div className='inline-flex items-center gap-2'>
                                  <Button
                                    className='inline-flex items-center !px-2'
                                    type='primary'
                                    loading={currentActionKey === `check-in-${data?.id}`}
                                    disabled={!!currentActionKey}
                                    onClick={() => handleBookingStayAction(data?.id, 'check-in')}
                                  >
                                    Nhận phòng
                                  </Button>

                                  {canMarkNoShow && (
                                    <Button
                                      className='inline-flex items-center !px-2'
                                      danger
                                      loading={currentActionKey === `no-show-${data?.id}`}
                                      disabled={!!currentActionKey}
                                      onClick={() => handleNoShowConfirm(data?.id)}
                                    >
                                      Không đến
                                    </Button>
                                  )}
                                </div>
                              )}

                              {canCheckOut && (
                                <Button
                                  className='inline-flex items-center !px-2'
                                  type='primary'
                                  loading={currentActionKey === `check-out-${data?.id}`}
                                  disabled={!!currentActionKey}
                                  onClick={() => handleBookingStayAction(data?.id, 'check-out')}
                                >
                                  Trả phòng
                                </Button>
                              )}

                              {!isPending && !canCheckIn && !canCheckOut && 'Không thể thao tác'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Skeleton>
        )}
      </div>

      {response?.data?.total_page > 1 && (
        <Pagination
          className='my-5'
          onChange={(e) => setQuery((prevState) => ({ ...prevState, page: e }))}
          total={response?.data?.total_page * 10}
          current={response?.data?.current_page}
        />
      )}

      {statusUpdateModal?.open && (
        <RoomStatusUpdateModal
          statusUpdateModal={statusUpdateModal}
          setStatusUpdateModal={setStatusUpdateModal}
          setFetchAgain={setFetchAgain}
        />
      )}
    </div>
  );
}

export default Orders;
