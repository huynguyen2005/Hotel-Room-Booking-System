/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright (c)2023 - Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  Button, Form, Input, Modal, Steps, Typography, message
} from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Calendar } from 'react-multi-date-picker';
import DatePanel from 'react-multi-date-picker/plugins/date_panel';
import DatePickerHeader from 'react-multi-date-picker/plugins/date_picker_header';
import Toolbar from 'react-multi-date-picker/plugins/toolbar';
import ApiService from '../../utils/apiService';
import { getSessionUser } from '../../utils/authentication';
import notificationWithIcon from '../../utils/notification';

const { confirm } = Modal;
const { Text } = Typography;

function OrderPlaceModal({ bookingModal, setBookingModal, unavailableDates }) {
  const [selectedDates, setSelectedDates] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const sessionUser = getSessionUser();
  const unavailableDateSet = new Set(unavailableDates);

  useEffect(() => {
    if (bookingModal.open) {
      form.setFieldsValue({
        customer_name: sessionUser?.fullName || '',
        customer_phone: sessionUser?.phone || '',
        customer_email: sessionUser?.email || '',
        payment_method: 'counter'
      });
    }
  }, [bookingModal.open, form, sessionUser]);

  const handleClose = () => {
    setBookingModal((prevState) => ({ ...prevState, open: false, roomId: null }));
    setSelectedDates([]);
    setCurrentStep(0);
    form.resetFields();
  };

  const handleDateChange = (dates) => {
    const formattedDates = dates.map((date) => dayjs(date.toDate ? date.toDate() : date).format('YYYY-MM-DD'));
    const filteredDates = formattedDates.filter((date) => !unavailableDateSet.has(date));

    if (filteredDates.length !== formattedDates.length) {
      notificationWithIcon('error', 'ERROR', 'One or more selected dates are already booked for this room.');
    }

    setSelectedDates(filteredDates);
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      if (selectedDates.length === 0) {
        notificationWithIcon('error', 'ERROR', 'Please select at least one booking date.');
        return;
      }

      if (selectedDates.length > 5) {
        notificationWithIcon('error', 'ERROR', 'You can select a maximum of 5 booking dates.');
        return;
      }

      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      try {
        await form.validateFields(['customer_name', 'customer_phone', 'customer_email']);
        setCurrentStep(2);
      } catch (error) {
        // validation handled by Form.Item
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(['customer_name', 'customer_phone', 'customer_email']);

      confirm({
        title: 'Confirm this booking order?',
        icon: <ExclamationCircleOutlined />,
        okText: 'Confirm',
        cancelText: 'Back',
        async onOk() {
          try {
            setSubmitting(true);
            const payload = {
              booking_dates: selectedDates,
              customer_info: {
                customer_name: values.customer_name,
                customer_phone: values.customer_phone,
                customer_email: values.customer_email
              },
              payment_info: {
                payment_method: 'counter'
              }
            };

            const response = await ApiService.post(`/api/v1/placed-booking-order/${bookingModal?.roomId}`, payload);

            if (response?.result_code === 0) {
              notificationWithIcon(
                'success',
                'SUCCESS',
                'Your booking has been created. Payment will be made at the reception desk.'
              );
              handleClose();
              router.push('/profile?tab=booking-history');
            } else {
              notificationWithIcon('error', 'ERROR', 'Something went wrong on the server.');
            }
          } catch (err) {
            notificationWithIcon(
              'error',
              'ERROR',
              err?.response?.data?.result?.error?.message
                || err?.response?.data?.result?.error
                || err?.message
                || 'Something went wrong on the server.'
            );
            throw err;
          } finally {
            setSubmitting(false);
          }
        }
      });
    } catch (err) {
      message.error(err?.message || 'Please review the form information.');
    }
  };

  const renderCurrentStep = () => {
    if (currentStep === 0) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Calendar
            style={{ width: '100%' }}
            plugins={[
              <DatePickerHeader
                key='date-picker-header'
                position='top'
                size='medium'
              />,
              <DatePanel
                style={{ width: '100%' }}
                key='date-panel'
                position='right'
                sort='date'
              />,
              <Toolbar
                key='toolbar'
                position='bottom'
              />
            ]}
            minDate={new Date(new Date()).setDate(new Date().getDate() + 1)}
            maxDate={new Date(new Date()).setDate(new Date().getDate() + 30)}
            onChange={handleDateChange}
            value={selectedDates}
            format='YYYY/MM/DD'
            highlightToday
            multiple
            mapDays={({ date }) => {
              const formattedDate = dayjs(date.toDate()).format('YYYY-MM-DD');

              if (unavailableDateSet.has(formattedDate)) {
                return {
                  disabled: true,
                  style: { color: '#bfbfbf', textDecoration: 'line-through' },
                  title: 'Already booked'
                };
              }

              return {};
            }}
          />
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <>
          <Form.Item
            label='Customer Full Name'
            name='customer_name'
            rules={[{ required: true, message: 'Please enter the customer full name.' }]}
          >
            <Input placeholder='Enter customer full name' size='large' />
          </Form.Item>

          <Form.Item
            label='Customer Phone'
            name='customer_phone'
            rules={[{ required: true, message: 'Please enter the customer phone number.' }]}
          >
            <Input placeholder='Enter customer phone number' size='large' />
          </Form.Item>

          <Form.Item
            label='Customer Email'
            name='customer_email'
            rules={[
              { required: true, message: 'Please enter the customer email.' },
              { type: 'email', message: 'Please enter a valid email address.' }
            ]}
          >
            <Input placeholder='Enter customer email' size='large' />
          </Form.Item>
        </>
      );
    }

    return (
      <>
        <div
          style={{
            border: '1px solid #d9d9d9',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '16px'
          }}
        >
          <Text strong>Payment Method: </Text>
          <Text>Pay at reception</Text>
          <div style={{ marginTop: '6px' }}>
            <Text type='secondary'>The booking will be created with unpaid status and will be marked as paid when the admin checks out the booking.</Text>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
          <Text strong>Selected Dates: </Text>
          <Text>{selectedDates.join(', ')}</Text>
        </div>
      </>
    );
  };

  return (
    <Modal
      title='Place Booking Order'
      open={bookingModal.open}
      onCancel={handleClose}
      closable={!submitting}
      centered
      footer={[
        <Button
          key='cancel'
          onClick={handleClose}
          disabled={submitting}
        >
          Cancel
        </Button>,
        currentStep > 0 && (
          <Button
            key='prev'
            onClick={() => setCurrentStep((prevState) => prevState - 1)}
            disabled={submitting}
          >
            Previous
          </Button>
        ),
        currentStep < 2 ? (
          <Button
            key='next'
            type='primary'
            onClick={handleNext}
            disabled={submitting}
          >
            Next
          </Button>
        ) : (
          <Button
            key='submit'
            type='primary'
            onClick={handleSubmit}
            loading={submitting}
            disabled={submitting}
          >
            Complete Booking
          </Button>
        )
      ]}
      width={820}
    >
      <Steps
        current={currentStep}
        items={[
          { title: 'Select Dates' },
          { title: 'Customer Info' },
          { title: 'Payment' }
        ]}
        style={{ marginBottom: '24px' }}
      />

      <Form
        form={form}
        layout='vertical'
        preserve
      >
        {renderCurrentStep()}
      </Form>
    </Modal>
  );
}

OrderPlaceModal.defaultProps = {
  bookingModal: { open: false, roomId: null },
  unavailableDates: []
};

OrderPlaceModal.propTypes = {
  bookingModal: PropTypes.object,
  unavailableDates: PropTypes.arrayOf(PropTypes.string)
};

export default OrderPlaceModal;
