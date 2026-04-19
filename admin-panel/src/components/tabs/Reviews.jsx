/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright (c)2023 - Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import {
  DeleteOutlined, ExclamationCircleFilled, EyeOutlined
} from '@ant-design/icons';
import {
  Button, Descriptions, Empty, Modal, Pagination, Rate, Result, Skeleton, Tag
} from 'antd';
import React, { useEffect, useState } from 'react';
import useFetchData from '../../hooks/useFetchData';
import ApiService from '../../utils/apiService';
import notificationWithIcon from '../../utils/notification';
import QueryOptions from '../shared/QueryOptions';

const { confirm } = Modal;

function Reviews() {
  const [fetchAgain, setFetchAgain] = useState(false);
  const [query, setQuery] = useState({
    search: '', sort: 'desc', page: '1', rows: '10'
  });
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  const [loading, error, response] = useFetchData(`/api/v1/get-all-reviews?keyword=${query.search}&limit=${query.rows}&page=${query.page}&sort=${query.sort}`, fetchAgain);

  useEffect(() => {
    setQuery((prevState) => ({ ...prevState, page: '1' }));
  }, [query.rows, query.search]);

  const handleDeleteReview = (reviewId) => {
    confirm({
      icon: <ExclamationCircleFilled />,
      title: 'Xóa đánh giá',
      content: 'Bạn có chắc muốn xóa đánh giá này không?',
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk() {
        return new Promise((resolve, reject) => {
          setActionLoading(reviewId);
          ApiService.delete(`/api/v1/delete-review/${reviewId}`)
            .then((res) => {
              if (res?.result_code === 0) {
                notificationWithIcon('success', 'THÀNH CÔNG', res?.result?.message || 'Xóa đánh giá thành công.');
                setSelectedReview(null);
                setFetchAgain((prevState) => !prevState);
                resolve();
              } else {
                notificationWithIcon('error', 'LỖI', 'Đã có lỗi xảy ra từ máy chủ.');
                reject();
              }
            })
            .catch((err) => {
              notificationWithIcon('error', 'LỖI', err?.response?.data?.result?.error?.message || err?.response?.data?.result?.error || 'Đã có lỗi xảy ra từ máy chủ.');
              reject();
            })
            .finally(() => setActionLoading(null));
        });
      }
    });
  };

  return (
    <div>
      <QueryOptions query={query} setQuery={setQuery} />

      <div className='w-full flex flex-row flex-wrap items-center justify-center gap-2'>
        {error ? (
          <Result
            title='Tải dữ liệu thất bại'
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
                          Người đánh giá
                        </th>
                        <th className='data-table-head-tr-th' scope='col'>
                          Phòng
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Số sao
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Ngày tạo
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Ngày cập nhật
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Thao tác
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {response?.data?.rows?.map((data) => (
                        <tr className='data-table-body-tr' key={data?.id}>
                          <td className='data-table-body-tr-td'>
                            <div className='flex flex-col'>
                              <span>{data?.reviews_by?.fullName || 'N/A'}</span>
                              <small>{data?.reviews_by?.email || 'N/A'}</small>
                            </div>
                          </td>
                          <td className='data-table-body-tr-td'>
                            {data?.room?.room_name || 'N/A'}
                          </td>
                          <td className='data-table-body-tr-td text-center'>
                            <Rate value={data?.rating} disabled />
                          </td>
                          <td className='data-table-body-tr-td text-center'>
                            {data?.created_at ? data.created_at.split('T')[0] : 'N/A'}
                          </td>
                          <td className='data-table-body-tr-td text-center'>
                            {data?.updated_at ? data.updated_at.split('T')[0] : 'N/A'}
                          </td>
                          <td className='data-table-body-tr-td text-center'>
                            <Button
                              icon={<EyeOutlined />}
                              onClick={() => setSelectedReview(data)}
                            >
                              Xem chi tiết
                            </Button>
                          </td>
                        </tr>
                      ))}
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

      <Modal
        title='Chi tiết đánh giá'
        open={!!selectedReview}
        onCancel={() => setSelectedReview(null)}
        footer={[
          <Button key='close' onClick={() => setSelectedReview(null)}>
            Đóng
          </Button>,
          <Button
            key='delete'
            danger
            icon={<DeleteOutlined />}
            loading={actionLoading === selectedReview?.id}
            disabled={!selectedReview || !!actionLoading}
            onClick={() => handleDeleteReview(selectedReview?.id)}
          >
            Xóa đánh giá
          </Button>
        ]}
        width={760}
      >
        {selectedReview && (
          <Descriptions bordered column={1} size='middle'>
            <Descriptions.Item label='Người đánh giá'>
              <div className='flex flex-col'>
                <span>{selectedReview?.reviews_by?.fullName || 'N/A'}</span>
                <small>{selectedReview?.reviews_by?.email || 'N/A'}</small>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label='Phòng'>
              {selectedReview?.room?.room_name || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label='Số sao'>
              <Rate value={selectedReview?.rating} disabled />
            </Descriptions.Item>
            <Descriptions.Item label='Trạng thái đánh giá'>
              <Tag color='processing'>Đang hiển thị</Tag>
            </Descriptions.Item>
            <Descriptions.Item label='Nội dung'>
              {selectedReview?.message || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label='Ngày tạo'>
              {selectedReview?.created_at ? selectedReview.created_at.split('T')[0] : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label='Ngày cập nhật'>
              {selectedReview?.updated_at ? selectedReview.updated_at.split('T')[0] : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

export default Reviews;
