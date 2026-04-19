/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright (c)2023 - Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import { ExclamationCircleFilled, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import {
  Button, Modal, Rate, Result, Space, Table, Tag, Tooltip
} from 'antd';
import Link from 'next/link';
import React, { useState } from 'react';
import useFetchData from '../../hooks/useFetchData';
import ApiService from '../../utils/apiService';
import arrayToCommaSeparatedText from '../../utils/arrayToCommaSeparatedText';
import notificationWithIcon from '../../utils/notification';
import { bookingStatusAsResponse } from '../../utils/responseAsStatus';
import ReviewAddModal from '../utilities/ReviewAddModal';

const { confirm } = Modal;

function BookingHistory() {
  const [fetchAgain, setFetchAgain] = useState(false);
  const [filter, setFilter] = useState({
    page: 1, limit: 10, sort: 'desc'
  });
  const [addReviewModal, setAddReviewModal] = useState({
    open: false, bookingId: null
  });

  const [loading, error, response] = useFetchData(`/api/v1/get-user-booking-orders?limit=${filter.limit}&page=${filter.page}&sort=${filter.sort}`, fetchAgain);

  const handleCancelBookingOrder = (id) => {
    confirm({
      icon: <ExclamationCircleFilled />,
      content: 'Bạn có chắc muốn hủy đơn đặt phòng này không?',
      onOk() {
        return new Promise((resolve, reject) => {
          ApiService.put(`/api/v1/cancel-booking-order/${id}`)
            .then((res) => {
              if (res?.result_code === 0) {
                notificationWithIcon('success', 'THÀNH CÔNG', res?.result?.message || 'Hủy đơn đặt phòng thành công.');
                setFetchAgain(!fetchAgain);
                resolve();
              } else {
                notificationWithIcon('error', 'LỖI', 'Đã có lỗi xảy ra từ máy chủ.');
                reject();
              }
            })
            .catch((err) => {
              notificationWithIcon('error', 'LỖI', err?.response?.data?.result?.error?.message || err?.response?.data?.result?.error || 'Đã có lỗi xảy ra từ máy chủ.');
              reject();
            });
        }).catch(() => notificationWithIcon('error', 'LỖI', 'Đã có lỗi xảy ra.'));
      }
    });
  };

  const nowrapCell = { whiteSpace: 'nowrap' };

  return (
    <>
      {error ? (
        <Result
          title='Tải dữ liệu thất bại'
          subTitle={error}
          status='500'
          extra={(
            <Button
              className='gradient-primary-btn'
              onClick={() => setFetchAgain(!fetchAgain)}
              type='primary'
              size='large'
              loading={loading}
              disabled={loading}
            >
              Thử lại
            </Button>
          )}
        />
      ) : (
        <Table
          className='w-full'
          columns={[
            {
              key: 1,
              title: (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', whiteSpace: 'nowrap'
                }}
                >
                  Ngày đặt phòng
                  {filter.sort === 'asce'
                    ? (<SortAscendingOutlined />)
                    : (<SortDescendingOutlined />)}
                </div>
              ),
              dataIndex: 'booking_dates',
              render: (data) => (
                arrayToCommaSeparatedText(data?.map(
                  (date) => (date.split('T')[0])
                ))
              ),
              sorter: true,
              sortOrder: filter.sort,
              onCell: () => ({ style: nowrapCell }),
              align: 'left'
            },
            {
              key: 2,
              title: 'Phòng đã đặt',
              dataIndex: 'room',
              render: (data) => (
                <Link href={`/rooms/${data?.room_slug}`} target='_blank'>
                  <Button
                    className='btn-primary'
                    size='large'
                    type='link'
                  >
                    {data?.room_name || 'N/A'}
                  </Button>
                </Link>
              ),
              onCell: () => ({ style: nowrapCell }),
              align: 'center'
            },
            {
              key: 3,
              title: 'Trạng thái booking',
              dataIndex: 'booking_status',
              render: (data) => (
                <Tag color={bookingStatusAsResponse(data).color}>
                  {bookingStatusAsResponse(data).level}
                </Tag>
              ),
              onCell: () => ({ style: nowrapCell }),
              align: 'center'
            },
            {
              key: 4,
              title: 'Nhận phòng',
              dataIndex: 'stay_info',
              render: (data) => (data?.checked_in_at ? data.checked_in_at.split('T')[0] : 'Chưa có'),
              onCell: () => ({ style: nowrapCell }),
              align: 'center'
            },
            {
              key: 5,
              title: 'Trả phòng',
              dataIndex: 'stay_info',
              render: (data) => (data?.checked_out_at ? data.checked_out_at.split('T')[0] : 'Chưa có'),
              onCell: () => ({ style: nowrapCell }),
              align: 'center'
            },
            {
              key: 6,
              title: 'Đánh giá',
              dataIndex: 'reviews',
              render: (data) => (
                <Tooltip
                  title={data?.message}
                  placement='top'
                  trigger='hover'
                >
                  <span style={{ whiteSpace: 'nowrap' }}>
                    {data ? (
                      <Rate value={data?.rating} disabled />
                    ) : 'N/A'}
                  </span>
                </Tooltip>
              ),
              onCell: () => ({ style: nowrapCell }),
              align: 'center'
            },
            {
              key: 7,
              title: 'Thao tác',
              dataIndex: 'actions',
              render: (_, record) => {
                const canReview = (
                  record?.booking_status === 'approved'
                  && !!record?.stay_info?.checked_out_at
                  && !record?.reviews
                );

                return (
                  <Space size='middle' style={{ whiteSpace: 'nowrap' }}>
                    {record?.booking_status === 'pending' && (
                      <Button
                        className='w-[95px]'
                        type='default'
                        size='middle'
                        danger
                        onClick={() => handleCancelBookingOrder(record?.id)}
                      >
                        Hủy booking
                      </Button>
                    )}

                    {canReview && (
                      <Button
                        className='w-[110px]'
                        type='primary'
                        size='middle'
                        onClick={() => setAddReviewModal(
                          (prevState) => ({ ...prevState, open: true, bookingId: record?.id })
                        )}
                      >
                        Thêm đánh giá
                      </Button>
                    )}

                    {(record?.booking_status === 'cancel'
                      || record?.booking_status === 'rejected'
                      || record?.booking_status === 'no-show'
                      || record?.booking_status === 'completed'
                      || (record?.booking_status === 'approved' && (!record?.stay_info?.checked_out_at || !!record?.reviews))) && 'Không có thao tác phù hợp'}
                  </Space>
                );
              },
              onCell: () => ({ style: nowrapCell }),
              align: 'center'
            }
          ]}
          dataSource={response?.data?.rows}
          pagination={{
            total: response?.data?.total_page,
            current: response?.data?.current_page,
            hideOnSinglePage: false,
            onChange: (data) => setFilter((prevSate) => ({ ...prevSate, page: data })),
            defaultPageSize: filter?.limit,
            pageSize: response?.result?.limit,
            pageSizeOptions: [5, 10, 20, 30, 40, 50, 100],
            showSizeChanger: true,
            onShowSizeChange: (_, num) => setFilter((prevSate) => ({ ...prevSate, limit: num })),
            position: ['bottomCenter']
          }}
          sortDirections={['asce', 'desc']}
          onChange={(_, __, sorter) => setFilter(
            (prevSate) => ({ ...prevSate, sort: sorter?.order || 'asce' })
          )}
          showSorterTooltip={false}
          loading={loading}
          rowKey='id'
          scroll={{ x: 'max-content' }}
          bordered
        />
      )}

      {addReviewModal?.open && (
        <ReviewAddModal
          addReviewModal={addReviewModal}
          setAddReviewModal={setAddReviewModal}
          setFetchAgain={setFetchAgain}
        />
      )}
    </>
  );
}

export default BookingHistory;
