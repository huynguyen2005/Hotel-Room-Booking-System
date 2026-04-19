/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import { ExclamationCircleFilled } from '@ant-design/icons';
import {
  Avatar, Button, Empty, Modal, Pagination, Result, Skeleton, Tag
} from 'antd';
import React, { useEffect, useState } from 'react';
import { v4 as uniqueId } from 'uuid';
import useFetchData from '../../hooks/useFetchData';
import ApiService from '../../utils/apiService';
import notificationWithIcon from '../../utils/notification';
import { roomStatusAsResponse, roomTypeAsColor } from '../../utils/responseAsStatus';
import QueryOptions from '../shared/QueryOptions';
import RoomEdit from './RoomEdit';

const { confirm } = Modal;

function RoomsList({ add }) {
  const [query, setQuery] = useState({
    search: '', sort: 'asce', page: '1', rows: '10'
  });
  const [roomEditModal, setRoomEditModal] = useState(
    { open: false, roomId: null }
  );
  const [fetchAgain, setFetchAgain] = useState(false);

  // fetch room-list API data
  const [loading, error, response] = useFetchData(`/api/v1/all-rooms-list?keyword=${query.search}&limit=${query.rows}&page=${query.page}&sort=${query.sort}`, fetchAgain);

  // reset query options
  useEffect(() => {
    setQuery((prevState) => ({ ...prevState, page: '1' }));
  }, [query.rows, query.search]);

  // function to handle delete
  const handleDeleteRoom = (id) => {
    confirm({
      title: 'XÓA PHÒNG',
      icon: <ExclamationCircleFilled />,
      content: 'Bạn có chắc muốn xóa vĩnh viễn phòng này không?',
      onOk() {
        return new Promise((resolve, reject) => {
          ApiService.delete(`/api/v1/delete-room/${id}`)
            .then((res) => {
              if (res?.result_code === 0) {
                notificationWithIcon('success', 'THÀNH CÔNG', res?.result?.message || 'Xóa phòng thành công.');
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

  return (
    <div>
      {/* room list ― query section */}
      <QueryOptions query={query} setQuery={setQuery} />

      {/* room list ― content section */}
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
                    {/* data table ― head */}
                    <thead className='data-table-head'>
                      <tr className='data-table-head-tr'>
                        <th className='data-table-head-tr-th' scope='col'>
                          Hình ảnh
                        </th>
                        <th className='data-table-head-tr-th' scope='col'>
                          Tên phòng
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Loại phòng
                        </th>
                        <th className='data-table-head-tr-th' scope='col'>
                          Giá phòng
                        </th>
                        <th className='data-table-head-tr-th' scope='col'>
                          Diện tích
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Trạng thái phòng
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Thao tác
                        </th>
                      </tr>
                    </thead>

                    {/* data table ― body */}
                    <tbody>
                      {response?.data?.rows?.map((data) => (
                        <tr className='data-table-body-tr' key={uniqueId()}>
                          <td className='data-table-body-tr-td'>
                            <Avatar.Group>
                              {data?.room_images?.map((image) => (
                                <Avatar
                                  key={uniqueId()}
                                  src={image.url}
                                  crossOrigin='anonymous'
                                  size='large'
                                />
                              ))}
                            </Avatar.Group>
                          </td>
                          <td className='data-table-body-tr-td'>
                            {data?.room_name}
                          </td>
                          <td className='data-table-body-tr-td text-center'>
                            <Tag
                              className='text-center uppercase'
                              color={roomTypeAsColor(data?.room_type)}
                            >
                              {data?.room_type}
                            </Tag>
                          </td>
                          <td className='data-table-body-tr-td !lowercase'>
                            {`$ ${data?.room_price}`}
                          </td>
                          <td className='data-table-body-tr-td'>
                            {`${data?.room_size} sq. ft.`}
                          </td>
                          <td className='data-table-body-tr-td text-center'>
                            <Tag
                              className='w-[80px] text-center uppercase'
                              color={roomStatusAsResponse(data?.room_status).color}
                            >
                              {roomStatusAsResponse(data?.room_status).level}
                            </Tag>
                          </td>
                          <td className='data-table-body-tr-td !px-0 text-center'>
                            <Button
                              className='inline-flex items-center !px-2'
                              onClick={() => add(data?.id)}
                              type='link'
                            >
                              Xem
                            </Button>
                            <Button
                              className='inline-flex items-center !px-2'
                              onClick={() => setRoomEditModal(
                                (prevState) => ({ ...prevState, open: true, roomId: data?.id })
                              )}
                              type='link'
                            >
                              Sửa
                            </Button>
                            <Button
                              className='inline-flex items-center !px-2'
                              onClick={() => handleDeleteRoom(data?.id)}
                              type='link'
                            >
                              Xóa
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

      {/* room list ― pagination */}
      {response?.data?.total_page > 1 && (
        <Pagination
          className='my-5'
          onChange={(e) => setQuery((prevState) => ({ ...prevState, page: e }))}
          total={response?.data?.total_page * 10}
          current={response?.data?.current_page}
        />
      )}

      {/* room edit modal component */}
      {roomEditModal.open && (
        <RoomEdit
          roomEditModal={roomEditModal}
          setRoomEditModal={setRoomEditModal}
        />
      )}
    </div>
  );
}

export default React.memo(RoomsList);
