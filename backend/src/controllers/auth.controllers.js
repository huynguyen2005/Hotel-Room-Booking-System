/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

const fs = require('fs');
const crypto = require('crypto');
const appRoot = require('app-root-path');
const User = require('../models/user.model');
const logger = require('../middleware/winston.logger');
const { errorResponse, successResponse } = require('../configs/app.response');
const loginResponse = require('../configs/login.response');
const { sendEmail } = require('../configs/send.mail');

// TODO: Controller for registration new user
exports.register = async (req, res) => {
  try {
    const {
      userName, fullName, email, phone, password, dob, address, gender
    } = req.body;
    const normalizedUserName = (userName || '').trim().toLowerCase();
    const normalizedFullName = (fullName || '').trim();
    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedPhone = (phone || '').trim();
    const normalizedPassword = (password || '').toString();
    const normalizedAddress = (address || '').trim();
    const normalizedGender = (gender || '').trim().toLowerCase();
    const normalizedDob = (dob || '').toString().trim();

    if (
      !normalizedUserName || !normalizedFullName || !normalizedEmail
      || !normalizedPhone || !normalizedPassword || !normalizedDob
      || !normalizedGender || !normalizedAddress
    ) {
      // delete uploaded avatar image
      if (req?.file?.filename) {
        fs.unlink(`${appRoot}/public/uploads/users/${req.file.filename}`, (err) => {
          if (err) { logger.error(err); }
        });
      }

      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Please enter all required fields'
      ));
    }

    if (!/^[a-zA-Z0-9]{3,20}$/.test(normalizedUserName)) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Username must be 3-20 characters and only letters/numbers'
      ));
    }

    if (!/^[\p{L}\s]{8,30}$/u.test(normalizedFullName)) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Full name must be 8-30 characters, letters and spaces only'
      ));
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Please enter a valid email address'
      ));
    }

    if (!/^0\d{9}$/.test(normalizedPhone)) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Phone number must start with 0 and contain exactly 10 digits'
      ));
    }

    if (!/^(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=\S+$).{6,16}$/.test(normalizedPassword)) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Password must be 6-16 characters, include 1 uppercase, 1 special character, and no spaces'
      ));
    }

    if (!['male', 'female'].includes(normalizedGender)) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Gender must be male or female'
      ));
    }

    if (normalizedAddress.length < 5 || normalizedAddress.length > 255) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Address must be between 5 and 255 characters'
      ));
    }

    const dobDate = new Date(normalizedDob);
    if (Number.isNaN(dobDate.getTime()) || dobDate > new Date()) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Date of birth cannot be in the future'
      ));
    }

    // check if userName or email already exists
    const findUserName = await User.findOne({ userName: normalizedUserName });
    const findEmail = await User.findOne({ email: normalizedEmail });

    if (findUserName) {
      // delete uploaded avatar image
      if (req?.file?.filename) {
        fs.unlink(`${appRoot}/public/uploads/users/${req.file.filename}`, (err) => {
          if (err) { logger.error(err); }
        });
      }

      return res.status(409).json(errorResponse(
        9,
        'ALREADY EXIST',
        'Sorry, Username already exists'
      ));
    }

    if (findEmail) {
      // delete uploaded avatar image
      if (req?.file?.filename) {
        fs.unlink(`${appRoot}/public/uploads/users/${req.file.filename}`, (err) => {
          if (err) { logger.error(err); }
        });
      }

      return res.status(409).json(errorResponse(
        9,
        'ALREADY EXIST',
        'Sorry, Email already exists'
      ));
    }

    // create new user and store in database
    const user = await User.create({
      userName: normalizedUserName,
      fullName: normalizedFullName,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: normalizedPassword,
      avatar: req.file ? `/uploads/users/${req.file.filename}` : '/avatar.png',
      gender: normalizedGender,
      dob: dobDate,
      address: normalizedAddress
    });

    // success response with register new user
    res.status(201).json(successResponse(
      0,
      'SUCCESS',
      'User registered successful',
      {
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: process.env.APP_BASE_URL + user.avatar,
        gender: user.gender,
        dob: user.dob,
        address: user.address,
        role: user.role,
        verified: user.verified,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    ));
  } catch (error) {
    // delete uploaded avatar image
    if (req?.file?.filename) {
      fs.unlink(`${appRoot}/public/uploads/users/${req.file.filename}`, (err) => {
        if (err) { logger.error(err); }
      });
    }

    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for login existing user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { loginType } = req.query;

    // check if email or password is empty
    if (!email || !password) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Please enter email and password'
      ));
    }

    // check user already exists
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    // if query loginType is "admin"
    if (loginType === 'admin') {
      if (user.role !== 'admin') {
        return res.status(406).json(errorResponse(
          6,
          'UNABLE TO ACCESS',
          'Accessing the page or resource you were trying to reach is forbidden'
        ));
      }
    }

    // check if user is "blocked"
    if (user.status === 'blocked') {
      return res.status(406).json(errorResponse(
        6,
        'UNABLE TO ACCESS',
        'Accessing the page or resource you were trying to reach is forbidden'
      ));
    }

    // check password matched
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'User credentials are incorrect'
      ));
    }

    // update user status & updateAt time
    const logUser = await User.findByIdAndUpdate(
      user._id,
      { status: 'login', updatedAt: Date.now() },
      { new: true }
    );

    // response user with JWT access token token
    loginResponse(res, logUser);
  } catch (error) {
    res.status(500).json(errorResponse(
      1,
      'FAILED',
      error
    ));
  }
};

// TODO: Controller for logout user
exports.logoutUser = async (req, res) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Unauthorized access. Please login to continue'
      ));
    }

    // update user status & updateAt time
    await User.findByIdAndUpdate(
      user._id,
      { status: 'logout', updatedAt: Date.now() },
      { new: true }
    );

    // remove cookie
    res.clearCookie('AccessToken');

    // response user
    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'User logged out successful'
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for user forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    // reset password token
    const resetToken = user.getResetPasswordToken();

    // save update user
    await user.save({ validateBeforeSave: false });

    // mailing data
    const url = `${process.env.APP_SERVICE_URL}/auth/forgot-password/${resetToken}`;
    const subjects = 'Password Recovery Email';
    const message = 'Click below link to reset your password. If you have not requested this email simply ignore this email.';
    const title = 'Recovery Your Password';

    // sending mail
    sendEmail(res, user, url, subjects, message, title);
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for user reset password
exports.resetPassword = async (req, res) => {
  try {
    if (req.params.token && req.body.password && req.body.confirmPassword) {
      // creating token crypto hash
      const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(404).json(errorResponse(
          4,
          'UNKNOWN ACCESS',
          'Reset Password Token is invalid or has been expired'
        ));
      }

      if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json(errorResponse(
          1,
          'FAILED',
          'Password and Confirm password does not match'
        ));
      }

      // reset user password in database
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(200).json(successResponse(
        0,
        'SUCCESS',
        'User password reset successful'
      ));
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Please enter all required fields'
      ));
    }
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for user change password
exports.changePassword = async (req, res) => {
  try {
    if (req.body.oldPassword && req.body.newPassword) {
      const { user } = req;

      if (!user) {
        return res.status(404).json(errorResponse(
          4,
          'UNKNOWN ACCESS',
          'User does not exist'
        ));
      }

      const { email } = user;
      const user2 = await User.findOne({ email }).select('+password');

      // check old password matched
      const isPasswordMatch = await user2.comparePassword(req.body.oldPassword.toString());
      if (!isPasswordMatch) {
        return res.status(400).json(errorResponse(
          1,
          'FAILED',
          'User credentials are incorrect'
        ));
      }

      // change user password in database
      user.password = req.body.newPassword;
      await user.save();

      res.status(200).json(successResponse(
        0,
        'SUCCESS',
        'User password reset successful'
      ));
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Please enter all required fields'
      ));
    }
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for user email verification link send
exports.sendEmailVerificationLink = async (req, res) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    // check user already verified
    if (user.verified) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Ops! Your mail already verified'
      ));
    }

    // email verification token
    const verificationToken = user.getEmailVerificationToken();

    // save updated user
    await user.save({ validateBeforeSave: false });

    // mailing data
    const url = `${process.env.APP_SERVICE_URL}/auth/verify-email/${verificationToken}`;
    const subjects = 'User Email Verification';
    const message = 'Click below link to verify your email. If you have not requested this email simply ignore this email.';
    const title = 'Verify Your Email';

    // sending mail
    sendEmail(res, user, url, subjects, message, title);
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for user email verification
exports.emailVerification = async (req, res) => {
  try {
    if (req.params.token) {
      // creating token crypto hash
      const emailVerificationToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      const user = await User.findOne({
        emailVerificationToken,
        emailVerificationExpire: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(404).json(errorResponse(
          4,
          'UNKNOWN ACCESS',
          'Email verification token is invalid or has been expired'
        ));
      }

      // reset user password in database
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      user.verified = true;
      await user.save();

      res.status(200).json(successResponse(
        0,
        'SUCCESS',
        'User email verification successful'
      ));
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Please enter all required fields'
      ));
    }
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for user refresh-token
exports.refreshToken = async (req, res) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    const accessToken = user.getJWTToken();
    const refreshToken = user.getJWTRefreshToken();

    // options for cookie
    const options = {
      expires: new Date(Date.now() + process.env.JWT_TOKEN_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
      httpOnly: true
    };

    res
      .status(200)
      .cookie('AccessToken', accessToken, options)
      .json(successResponse(
        0,
        'SUCCESS',
        'JWT refreshToken generate successful',
        { accessToken, refreshToken }
      ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};
