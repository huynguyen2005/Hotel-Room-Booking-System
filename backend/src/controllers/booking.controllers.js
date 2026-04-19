/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

const Room = require('../models/room.model');
const Booking = require('../models/booking.model');
const { errorResponse, successResponse } = require('../configs/app.response');
const MyQueryHelper = require('../configs/api.feature');
const logger = require('../middleware/winston.logger');
const { sendMail, buildEmailHtml } = require('../configs/send.mail');
const {
  bookingDatesBeforeCurrentDate,
  hasOverlappingBookingDates
} = require('../lib/booking.dates.validator');

const findApprovedBookingConflicts = async (roomId, bookingDates, excludedBookingId = null) => {
  const approvedBookings = await Booking.find({
    room_id: roomId,
    booking_status: 'approved',
    ...(excludedBookingId ? { _id: { $ne: excludedBookingId } } : {})
  });

  return approvedBookings.filter((approvedBooking) => (
    hasOverlappingBookingDates(approvedBooking.booking_dates, bookingDates)
  ));
};

const formatBookingDatesForEmail = (bookingDates = []) => bookingDates
  .map((bookingDate) => {
    const date = new Date(bookingDate);
    return date.toISOString().split('T')[0];
  })
  .join(', ');

const mapBookingResponse = (data) => ({
  id: data?.id,
  booking_dates: data?.booking_dates,
  booking_status: data?.booking_status,
  customer_info: {
    customer_name: data?.customer_info?.customer_name,
    customer_phone: data?.customer_info?.customer_phone,
    customer_email: data?.customer_info?.customer_email
  },
  payment_info: {
    payment_method: data?.payment_info?.payment_method,
    payment_status: data?.payment_info?.payment_status,
    transaction_id: data?.payment_info?.transaction_id,
    paid_at: data?.payment_info?.paid_at
  },
  stay_info: {
    checked_in_at: data?.stay_info?.checked_in_at,
    checked_out_at: data?.stay_info?.checked_out_at
  },
  reviews: !data?.reviews ? null : {
    id: data?.reviews.id,
    room_id: data?.reviews.room_id,
    booking_id: data?.reviews.booking_id,
    rating: data?.reviews.rating,
    message: data?.reviews.message,
    reviews_by: {
      id: data?.reviews?.user_id?._id,
      userName: data?.reviews?.user_id?.userName,
      fullName: data?.reviews?.user_id?.fullName,
      email: data?.reviews?.user_id?.email,
      phone: data?.reviews?.user_id?.phone,
      avatar: process.env.APP_BASE_URL + data?.reviews?.user_id?.avatar,
      gender: data?.reviews?.user_id?.gender,
      dob: data?.reviews?.user_id?.dob,
      address: data?.reviews?.user_id?.address,
      role: data?.reviews?.user_id?.role,
      verified: data?.reviews?.user_id?.verified,
      status: data?.reviews?.user_id?.status,
      createdAt: data?.reviews?.user_id?.createdAt,
      updatedAt: data?.reviews?.user_id?.updatedAt
    },
    created_at: data?.reviews?.createdAt,
    updated_at: data?.reviews?.updatedAt
  },
  booking_by: {
    id: data?.booking_by?._id,
    userName: data?.booking_by?.userName,
    fullName: data?.booking_by?.fullName,
    email: data?.booking_by?.email,
    phone: data?.booking_by?.phone,
    avatar: process.env.APP_BASE_URL + data?.booking_by?.avatar,
    gender: data?.booking_by?.gender,
    dob: data?.booking_by?.dob,
    address: data?.booking_by?.address,
    role: data?.booking_by?.role,
    verified: data?.booking_by?.verified,
    status: data?.booking_by?.status,
    createdAt: data?.booking_by?.createdAt,
    updatedAt: data?.booking_by?.updatedAt
  },
  room: {
    id: data?.room_id?._id,
    room_name: data?.room_id?.room_name,
    room_slug: data?.room_id?.room_slug,
    room_type: data?.room_id?.room_type,
    room_price: data?.room_id?.room_price,
    room_size: data?.room_id?.room_size,
    room_capacity: data?.room_id?.room_capacity,
    allow_pets: data?.room_id?.allow_pets,
    provide_breakfast: data?.room_id?.provide_breakfast,
    featured_room: data?.room_id?.featured_room,
    room_description: data?.room_id?.room_description,
    room_status: data?.room_id?.room_status,
    extra_facilities: data?.room_id?.extra_facilities,
    room_images: data?.room_id?.room_images?.map(
      (img) => ({ url: process.env.APP_BASE_URL + img.url })
    )
  },
  created_at: data?.createdAt,
  updated_at: data?.updatedAt
});

const sendBookingStatusMail = async (booking, status) => {
  if (!booking?.booking_by?.verified || !booking?.booking_by?.email) {
    return;
  }

  const roomName = booking?.room_id?.room_name || 'your room';
  const bookingDates = formatBookingDatesForEmail(booking.booking_dates);
  const bookingPageUrl = `${process.env.APP_SERVICE_URL}/profile?tab=booking-history`;
  const statusMailMap = {
    approved: {
      subject: 'Room Booking Approved',
      title: 'Room Booking Approved',
      message: `Your booking for ${roomName} has been approved. Booked dates: ${bookingDates}.`,
      ctaLabel: 'View Booking'
    },
    rejected: {
      subject: 'Room Booking Rejected',
      title: 'Room Booking Rejected',
      message: `Your booking for ${roomName} has been rejected. Requested dates: ${bookingDates}.`,
      ctaLabel: 'View Booking'
    },
    'no-show': {
      subject: 'Room Booking Marked As No-Show',
      title: 'Room Booking Marked As No-Show',
      message: `Your booking for ${roomName} has been marked as no-show because the guest did not check in.`,
      ctaLabel: 'View Booking'
    },
    completed: {
      subject: 'Room Booking Completed',
      title: 'Room Booking Completed',
      message: `Your booking for ${roomName} has been marked as completed. Stay dates: ${bookingDates}.`,
      ctaLabel: 'View Booking'
    }
  };

  const selectedMailConfig = statusMailMap[status];

  if (!selectedMailConfig) {
    return;
  }

  await sendMail({
    to: booking.booking_by.email,
    subject: selectedMailConfig.subject,
    text: `${selectedMailConfig.message} View your booking history: ${bookingPageUrl}`,
    html: buildEmailHtml({
      title: selectedMailConfig.title,
      message: selectedMailConfig.message,
      url: bookingPageUrl,
      ctaLabel: selectedMailConfig.ctaLabel
    })
  });
};

// TODO: controller for placed booking order
exports.placedBookingOrder = async (req, res) => {
  try {
    const {
      booking_dates: bookingDates,
      customer_info: customerInfo,
      payment_info: paymentInfo
    } = req.body;

    // finding by room id
    let myRoom = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      myRoom = await Room.findById(req.params.id);
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Something went wrong. Probably room id missing/incorrect'
      ));
    }

    // check room available
    if (!myRoom) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Room does not exist'
      ));
    }

    // check room status is`unavailable`
    if (myRoom.room_status === 'unavailable') {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Sorry! Current your sleeted room can\'t available'
      ));
    }

    if (!Array.isArray(bookingDates) || bookingDates.length === 0) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`booking_dates` field is required'
      ));
    }

    if (!customerInfo?.customer_name || !customerInfo?.customer_phone || !customerInfo?.customer_email) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Please provide full customer information'
      ));
    }

    if (!paymentInfo?.payment_method || paymentInfo.payment_method !== 'counter') {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Only counter payment is supported'
      ));
    }

    const preparedPaymentInfo = {
      payment_method: 'counter',
      payment_status: 'unpaid',
      transaction_id: null,
      paid_at: null
    };

    const data = {
      room_id: req.params.id,
      booking_dates: bookingDates,
      booking_by: req.user.id,
      customer_info: {
        customer_name: customerInfo.customer_name.trim(),
        customer_phone: customerInfo.customer_phone.trim(),
        customer_email: customerInfo.customer_email.trim().toLowerCase()
      },
      payment_info: preparedPaymentInfo,
      stay_info: {
        checked_in_at: null,
        checked_out_at: null
      }
    };

    const conflictingBookings = await findApprovedBookingConflicts(
      req.params.id,
      bookingDates
    );

    if (conflictingBookings.length > 0) {
      return res.status(409).json(errorResponse(
        9,
        'ALREADY EXIST',
        'Sorry! Your selected booking dates are not available for this room'
      ));
    }

    // save room data in database
    const booking = await Booking.create(data);

    // success response with register new user
    res.status(201).json(successResponse(
      0,
      'SUCCESS',
      'Your room booking order has been placed successful. Please wait for confirmation.',
      booking
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: controller for get all specific user booking order
exports.getBookingOrderByUserId = async (req, res) => {
  try {
    const myBooking = await Booking.find({ booking_by: req.user.id })
      .populate('room_id')
      .populate('booking_by')
      .populate({
        path: 'reviews',
        populate: { path: 'user_id', model: 'Users' }
      });

    // if no bookings found for the user id, return an error response
    if (!myBooking || myBooking.length === 0) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'No bookings found for the specified user'
      ));
    }

    // filtering booking orders based on different types query
    const bookingQuery = new MyQueryHelper(Booking.find({ booking_by: req.user.id })
      .populate('room_id')
      .populate('booking_by')
      .populate(
        { path: 'reviews', populate: { path: 'user_id', model: 'Users' } }
      ), req.query)
      .sort()
      .paginate();
    const findBooking = await bookingQuery.query;

    const mapperBooking = findBooking?.map(mapBookingResponse);

    // success response with the booking list
    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Booking list retrieved successful',
      {
        rows: mapperBooking,
        total_rows: myBooking.length,
        response_rows: findBooking.length,
        total_page: req?.query?.keyword ? Math.ceil(findBooking.length / req.query.limit) : Math.ceil(myBooking.length / req.query.limit),
        current_page: req?.query?.page ? parseInt(req.query.page, 10) : 1
      }
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: controller for cancel self booking order
exports.cancelSelfBookingOrder = async (req, res) => {
  try {
    // finding by room id
    let booking = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      // find the booking by id and check if the booking_by user id matches the authenticated user id
      booking = await Booking.findOne({ _id: req.params.id, booking_by: req.user.id });
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Something went wrong. Probably booking id missing/incorrect'
      ));
    }

    // if booking not found or user is not authorized to cancel this booking, return an error response
    if (!booking) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Booking not found or you are not authorized to cancel this booking'
      ));
    }

    // if booking status is not 'pending', return an error response
    if (booking.booking_status !== 'pending') {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'This booking cannot be `cancel` as it is no longer in the `pending` status'
      ));
    }

    // update the booking status to 'cancel'
    booking.booking_status = 'cancel';
    await booking.save({ validateBeforeSave: false });

    // success response after canceling the booking
    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Booking order has been canceled successful',
      booking
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: controller for get all booking order by admin
exports.getBookingOrderForAdmin = async (req, res) => {
  try {
    const myBooking = await Booking.find()
      .populate('room_id')
      .populate('booking_by')
      .populate({
        path: 'reviews',
        populate: { path: 'user_id', model: 'Users' }
      });

    // if no bookings found for the user id, return an error response
    if (!myBooking || myBooking.length === 0) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'No bookings found for the specified user'
      ));
    }

    // filtering booking orders based on different types query
    const bookingQuery = new MyQueryHelper(Booking.find()
      .populate('room_id')
      .populate('booking_by')
      .populate(
        { path: 'reviews', populate: { path: 'user_id', model: 'Users' } }
      ), req.query)
      .sort()
      .paginate();
    const findBooking = await bookingQuery.query;

    const mapperBooking = findBooking?.map(mapBookingResponse);

    // success response with the booking list
    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Booking list retrieved successful',
      {
        rows: mapperBooking,
        total_rows: myBooking.length,
        response_rows: findBooking.length,
        total_page: req?.query?.keyword ? Math.ceil(findBooking.length / req.query.limit) : Math.ceil(myBooking.length / req.query.limit),
        current_page: req?.query?.page ? parseInt(req.query.page, 10) : 1
      }
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: controller for updated booking order by admin
exports.updatedBookingOrderByAdmin = async (req, res) => {
  try {
    // finding by room by room id
    let booking = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      // find the booking by id and check if the booking_by user id matches the authenticated user id
      booking = await Booking.findOne({ _id: req.params.id });
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Something went wrong. Probably booking id missing/incorrect'
      ));
    }

    // if booking not found or user is not authorized to cancel this booking, return an error response
    if (!booking) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Booking not found or you are not authorized to cancel this booking'
      ));
    }

    // check `booking_status` filed exits
    if (!req.body.booking_status) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`booking_status` filed is required'
      ));
    }

    // finding by room by room id
    let myRoom = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      myRoom = await Room.findById(booking.room_id);
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Something went wrong. Probably room id missing/incorrect'
      ));
    }

    // check room available
    if (!myRoom) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Room does not exist'
      ));
    }

    // handle update booking status
    switch (req.body.booking_status) {
      case 'approved':
        if (booking.booking_status === 'pending') {
          if (!bookingDatesBeforeCurrentDate(booking?.booking_dates).isAnyDateInPast) {
            const conflictingBookings = await findApprovedBookingConflicts(
              booking.room_id,
              booking.booking_dates,
              booking._id
            );

            if (conflictingBookings.length > 0) {
              return res.status(409).json(errorResponse(
                9,
                'ALREADY EXIST',
                'This booking cannot be `approved` because the selected dates are already booked'
              ));
            }

            // update the booking status to `approved`
            booking.booking_status = 'approved';
            await booking.save({ validateBeforeSave: false });

            const approvedBooking = await Booking.findById(booking._id)
              .populate('booking_by')
              .populate('room_id');

            if (approvedBooking?.booking_by?.verified) {
              try {
                await sendBookingStatusMail(approvedBooking, 'approved');
              } catch (mailError) {
                logger.error(mailError);
              }
            }
          } else {
            return res.status(400).json(errorResponse(
              1,
              'FAILED',
              'Sorry! This booking cannot be `approved` because of booking data is past'
            ));
          }
        } else {
          return res.status(400).json(errorResponse(
            1,
            'FAILED',
            'This booking cannot be `approved` as it is no longer in the `pending` status'
          ));
        }
        break;
      case 'rejected':
        if (booking.booking_status === 'pending') {
          // update the booking status to `rejected`
          booking.booking_status = 'rejected';
          await booking.save({ validateBeforeSave: false });

          const rejectedBooking = await Booking.findById(booking._id)
            .populate('booking_by')
            .populate('room_id');

          if (rejectedBooking?.booking_by?.verified) {
            try {
              await sendBookingStatusMail(rejectedBooking, 'rejected');
            } catch (mailError) {
              logger.error(mailError);
            }
          }
        } else {
          return res.status(400).json(errorResponse(
            1,
            'FAILED',
            'This booking cannot be `rejected` as it is no longer in the `pending` status'
          ));
        }
        break;
      default:
        return res.status(400).json(errorResponse(
          1,
          'FAILED',
          `Your provided booking_status '${booking.booking_status}' can't match our system. Please try again using a correct booking_status`
        ));
    }

    // success response after canceling the booking
    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      `Booking order has been '${booking.booking_status}' successful`,
      booking
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: controller for check-in booking by admin
exports.checkInBookingByAdmin = async (req, res) => {
  try {
    let booking = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      booking = await Booking.findById(req.params.id);
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Something went wrong. Probably booking id missing/incorrect'
      ));
    }

    if (!booking) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Booking not found'
      ));
    }

    if (booking.booking_status !== 'approved') {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Only approved bookings can be checked in'
      ));
    }

    if (booking?.stay_info?.checked_in_at) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'This booking has already been checked in'
      ));
    }

    booking.stay_info = {
      ...(booking.stay_info || {}),
      checked_in_at: new Date(),
      checked_out_at: booking?.stay_info?.checked_out_at || null
    };
    await booking.save({ validateBeforeSave: false });

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Booking check-in successful',
      booking
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: controller for check-out booking by admin
exports.checkOutBookingByAdmin = async (req, res) => {
  try {
    let booking = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      booking = await Booking.findById(req.params.id);
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Something went wrong. Probably booking id missing/incorrect'
      ));
    }

    if (!booking) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Booking not found'
      ));
    }

    if (booking.booking_status !== 'approved') {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Only approved bookings can be checked out'
      ));
    }

    if (!booking?.stay_info?.checked_in_at) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'This booking must be checked in before checkout'
      ));
    }

    if (booking?.stay_info?.checked_out_at) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'This booking has already been checked out'
      ));
    }

    booking.stay_info = {
      ...(booking.stay_info || {}),
      checked_in_at: booking.stay_info.checked_in_at,
      checked_out_at: new Date()
    };

    if (booking?.payment_info?.payment_method === 'counter') {
      booking.payment_info = {
        ...(booking.payment_info || {}),
        payment_method: 'counter',
        payment_status: 'paid',
        transaction_id: booking?.payment_info?.transaction_id || null,
        paid_at: new Date()
      };
    }

    await booking.save({ validateBeforeSave: false });

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Booking check-out successful',
      booking
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: controller for mark booking as no-show by admin
exports.markBookingAsNoShowByAdmin = async (req, res) => {
  try {
    let booking = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      booking = await Booking.findById(req.params.id);
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Something went wrong. Probably booking id missing/incorrect'
      ));
    }

    if (!booking) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Booking not found'
      ));
    }

    if (booking.booking_status !== 'approved') {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Only approved bookings can be marked as no-show'
      ));
    }

    if (booking?.stay_info?.checked_in_at) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Checked-in bookings cannot be marked as no-show'
      ));
    }

    booking.booking_status = 'no-show';
    await booking.save({ validateBeforeSave: false });

    const noShowBooking = await Booking.findById(booking._id)
      .populate('booking_by')
      .populate('room_id');

    if (noShowBooking?.booking_by?.verified) {
      try {
        await sendBookingStatusMail(noShowBooking, 'no-show');
      } catch (mailError) {
        logger.error(mailError);
      }
    }

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Booking marked as no-show successful',
      booking
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};
