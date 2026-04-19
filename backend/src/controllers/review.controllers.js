/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

const Booking = require('../models/booking.model');
const Review = require('../models/review.modal');
const { errorResponse, successResponse } = require('../configs/app.response');
const MyQueryHelper = require('../configs/api.feature');

const mapReviewResponse = (data) => ({
  id: data?.id,
  rating: data?.rating,
  message: data?.message,
  room_id: data?.room_id?._id || data?.room_id,
  room: data?.room_id?._id ? {
    id: data?.room_id?._id,
    room_name: data?.room_id?.room_name,
    room_slug: data?.room_id?.room_slug
  } : null,
  booking_id: data?.booking_id?._id || data?.booking_id,
  reviews_by: {
    id: data?.user_id?._id,
    userName: data?.user_id?.userName,
    fullName: data?.user_id?.fullName,
    email: data?.user_id?.email,
    phone: data?.user_id?.phone,
    avatar: process.env.APP_BASE_URL + data?.user_id?.avatar,
    role: data?.user_id?.role,
    status: data?.user_id?.status
  },
  created_at: data?.createdAt,
  updated_at: data?.updatedAt
});

// TODO: controller for room review add
exports.roomReviewAdd = async (req, res) => {
  try {
    const { rating, message } = req.body;

    // check `rating` filed exits
    if (!rating) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`rating` filed is required'
      ));
    }

    // check `message` filed exits
    if (!message) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`message` filed is required'
      ));
    }

    // finding by a booking by id
    let myBooking = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      myBooking = await Booking.findById(req.params.id);
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Something went wrong. Probably booking id missing/incorrect'
      ));
    }

    // check room available
    if (!myBooking) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Booking does not exist'
      ));
    }

    // ensure only the booking owner can review
    if (myBooking.booking_by.toString() !== req.user.id.toString()) {
      return res.status(403).json(errorResponse(
        6,
        'UNABLE TO ACCESS',
        'Sorry! You can review only your own booking'
      ));
    }

    // check booking already add reviews
    if (myBooking.reviews) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Sorry! This booking already add an review'
      ));
    }

    // check booking is eligible for review only after checkout
    if (myBooking.booking_status !== 'approved') {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Invalid booking status for adding a review'
      ));
    }

    if (!myBooking?.stay_info?.checked_out_at) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'You can review this booking only after checkout'
      ));
    }

    // create a user new room review
    const newReview = new Review({
      user_id: req.user.id,
      room_id: myBooking.room_id,
      booking_id: req.params.id,
      rating,
      message
    });

    // save the review in database
    const savedReview = await newReview.save();

    // update the booking with the review ID
    myBooking.reviews = savedReview._id;
    myBooking.booking_status = 'completed';
    await myBooking.save({ validateBeforeSave: false });

    // success response with register new user
    res.status(201).json(successResponse(
      0,
      'SUCCESS',
      'Your room review placed successful',
      savedReview
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: controller for get an room reviews list
exports.getRoomReviewsList = async (req, res) => {
  try {
    // finding by a review by id
    let myReviews = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.room_id)) {
      myReviews = await Review.find({ room_id: req.params.room_id })
        .populate('user_id');
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Something went wrong. Probably booking id missing/incorrect'
      ));
    }

    // check review available
    if (!myReviews) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Review does not exist'
      ));
    }

    // filtering reviews based on different types query
    const reviewQuery = new MyQueryHelper(Review.find({ room_id: req.params.room_id })
      .populate('user_id'), req.query)
      .sort()
      .paginate();
    const findReviews = await reviewQuery.query;

    const mapperReviews = findReviews?.map(mapReviewResponse);

    // success response with the reviews list
    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Reviews list retrieved successful',
      {
        rows: mapperReviews,
        total_rows: myReviews.length,
        response_rows: findReviews.length,
        total_page: req?.query?.keyword ? Math.ceil(findReviews.length / req.query.limit) : Math.ceil(myReviews.length / req.query.limit),
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

// TODO: controller for get all reviews list by admin
exports.getAllReviewsForAdmin = async (req, res) => {
  try {
    const myReviews = await Review.find()
      .populate('user_id')
      .populate('room_id')
      .populate('booking_id');

    if (!myReviews || myReviews.length === 0) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'No reviews found'
      ));
    }

    const reviewQuery = new MyQueryHelper(Review.find()
      .populate('user_id')
      .populate('room_id')
      .populate('booking_id'), req.query)
      .search('message')
      .sort()
      .paginate();
    const findReviews = await reviewQuery.query;

    const mapperReviews = findReviews?.map(mapReviewResponse);

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Reviews list retrieved successful',
      {
        rows: mapperReviews,
        total_rows: myReviews.length,
        response_rows: findReviews.length,
        total_page: req?.query?.keyword ? Math.ceil(findReviews.length / req.query.limit) : Math.ceil(myReviews.length / req.query.limit),
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

// TODO: controller for delete review by admin
exports.deleteReviewByAdmin = async (req, res) => {
  try {
    let myReview = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.review_id)) {
      myReview = await Review.findById(req.params.review_id);
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Something went wrong. Probably review id missing/incorrect'
      ));
    }

    if (!myReview) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Review does not exist'
      ));
    }

    await Booking.findByIdAndUpdate(
      myReview.booking_id,
      { $unset: { reviews: 1 } },
      { new: true }
    );

    await Review.findByIdAndDelete(req.params.review_id);

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Review deleted successful',
      null
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: controller for edit self room review
exports.editSelfRoomReview = async (req, res) => {
  try {
    const { rating, message } = req.body;

    // check `rating` filed exits
    if (!rating) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`rating` filed is required'
      ));
    }

    // check `message` filed exits
    if (!message) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`message` filed is required'
      ));
    }

    // finding by a review by id
    let myReviews = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.review_id)) {
      myReviews = await Review.findById(req.params.review_id)
        .populate('user_id');
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Something went wrong. Probably booking id missing/incorrect'
      ));
    }

    // check review available
    if (!myReviews) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Review does not exist'
      ));
    }

    if (myReviews?.user_id?.id !== req?.user?.id) {
      return res.status(406).json(errorResponse(
        6,
        'UNABLE TO ACCESS',
        'Sorry! You can update only self room reviews'
      ));
    }

    // update review info & save database
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.review_id,
      { rating, message },
      { runValidators: true, new: true }
    );

    // success response with the update review
    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Your room review update successful',
      updatedReview
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};
