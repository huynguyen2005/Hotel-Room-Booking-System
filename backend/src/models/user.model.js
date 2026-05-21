/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const usersSchema = new mongoose.Schema({
  userName: {
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    required: [true, 'User name filed is required'],
    minlength: [3, 'Username must be between 3 and 20 characters'],
    maxlength: [20, 'Username must be between 3 and 20 characters'],
    match: [/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers']
  },
  fullName: {
    type: String,
    trim: true,
    required: [true, 'Full name filed is required'],
    minlength: [8, 'Full name must be between 8 and 30 characters'],
    maxlength: [30, 'Full name must be between 8 and 30 characters'],
    validate: {
      validator(value) {
        return /^[\p{L}\s]+$/u.test(value);
      },
      message: 'Full name can only contain letters and spaces'
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: [true, 'Email filed is required'],
    validate: [validator.isEmail, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone filed is required'],
    match: [/^0\d{9}$/, 'Phone number must start with 0 and have exactly 10 digits']
  },
  password: {
    type: String,
    required: [true, 'Password filed is required'],
    minlength: [6, 'Password must be between 6 and 16 characters'],
    maxlength: [16, 'Password must be between 6 and 16 characters'],
    validate: {
      validator(value) {
        // At least one uppercase letter, one special character and no whitespace.
        return /^(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=\S+$).{6,16}$/.test(value);
      },
      message: 'Password must include 1 uppercase letter, 1 special character, and no spaces'
    },
    select: false
  },
  avatar: {
    type: String
  },
  gender: {
    type: String,
    required: [true, 'Gender field is required'],
    enum: {
      values: ['male', 'female'],
      message: 'Gender must be male or female'
    }
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth filed is required'],
    validate: {
      validator(value) {
        return value && new Date(value) <= new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  address: {
    type: String,
    trim: true,
    required: [true, 'Address field is required'],
    minlength: [5, 'Address must be between 5 and 255 characters'],
    maxlength: [255, 'Address must be between 5 and 255 characters']
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  verified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['register', 'login', 'logout', 'blocked'],
    default: 'register'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// after save, hash password
usersSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 8);
});

// JWT Access Token
usersSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES
  });
};

// JWT Refresh Token
usersSchema.methods.getJWTRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES
  });
};

// compare password
usersSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// generating password reset token
usersSchema.methods.getResetPasswordToken = function () {
  // generating token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // hashing and adding resetPasswordToken to usersSchema
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

// generating email verification token
usersSchema.methods.getEmailVerificationToken = function () {
  // generating token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // hashing and adding emailVerificationToken to usersSchema
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpire = Date.now() + 15 * 60 * 1000;
  return verificationToken;
};

module.exports = mongoose.model('Users', usersSchema);
