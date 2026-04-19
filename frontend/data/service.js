/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright (c)2023 - Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import {
  FaBeer, FaCocktail, FaHiking, FaShuttleVan
} from 'react-icons/fa';

const services = [
  {
    icon: <FaCocktail />,
    title: 'cocktail miễn phí',
    info: 'Khách lưu trú được phục vụ đồ uống miễn phí trong không gian nghỉ dưỡng thư giãn và tiện nghi.'
  },
  {
    icon: <FaHiking />,
    title: 'trải nghiệm dã ngoại',
    info: 'Khu nghỉ dưỡng hỗ trợ các hoạt động khám phá ngoài trời phù hợp cho gia đình và nhóm bạn.'
  },
  {
    icon: <FaShuttleVan />,
    title: 'xe đưa đón miễn phí',
    info: 'Dịch vụ xe đưa đón giúp việc di chuyển của khách thuận tiện hơn trong suốt thời gian lưu trú.'
  },
  {
    icon: <FaBeer />,
    title: 'đồ uống đa dạng',
    info: 'Thực đơn đồ uống phong phú được phục vụ linh hoạt để đáp ứng nhu cầu nghỉ dưỡng của khách.'
  }
];

export default services;
