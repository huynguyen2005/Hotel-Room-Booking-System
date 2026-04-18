/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

const sgMail = require('@sendgrid/mail');
const { successResponse, errorResponse } = require('./app.response');

const buildEmailHtml = ({ title, message, url, ctaLabel = 'Click Here' }) => {
  const actionMarkup = url
    ? `<p><a href="${url}" target="_blank" rel="noreferrer">${ctaLabel}</a></p>`
    : '';

  return `<div>
    <h4>${title}</h4>
    <p>${message}</p>
    ${actionMarkup}
  </div>`;
};

const sendMail = async ({
  to,
  subject,
  text,
  html
}) => {
  sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

  const msg = {
    to,
    from: process.env.SEND_SENDER_MAIL,
    subject,
    text,
    html
  };

  await sgMail.send(msg);
};

const sendEmail = async (res, user, url, subjects, message, title) => {
  await sendMail({
    to: user.email,
    subject: subjects,
    text: message,
    html: buildEmailHtml({
      title,
      message,
      url,
      ctaLabel: 'Verify Now'
    })
  }).then(() => {
    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      `Email sent to ${user.email} successful`
    ));
  }).catch(async (error) => {
    // eslint-disable-next-line no-param-reassign
    user.resetPasswordToken = undefined;
    // eslint-disable-next-line no-param-reassign
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  });
};

module.exports = {
  sendEmail,
  sendMail,
  buildEmailHtml
};
