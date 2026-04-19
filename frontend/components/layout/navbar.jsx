/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright (c)2023 - Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import { Button } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { FaAlignRight } from 'react-icons/fa';
import { getSessionToken, getSessionUser } from '../../utils/authentication';
import UserPopover from './popover';

function Navbar() {
  const [isOpen, setIsOpen] = useState();
  const user = getSessionUser();
  const token = getSessionToken();
  const router = useRouter();

  return (
    <nav className='navbar'>
      <div className='nav-center'>
        <div className='nav-header'>
          <Link href='/'>
            <img src='/images//svg/logo.svg' alt='Beach Resort' />
          </Link>

          <button
            className='nav-btn'
            onClick={() => setIsOpen(!isOpen)}
            type='button'
          >
            <FaAlignRight className='nav-icon' />
          </button>
        </div>

        {user?.id && token ? (
          <UserPopover />
        ) : (
          <Button
            style={{ position: 'absolute', right: '100px', top: '20px' }}
            onClick={() => router.push('/auth/login')}
            type='primary'
            size='large'
          >
            Đăng nhập
          </Button>
        )}

        <ul className={isOpen ? 'nav-links show-nav' : 'nav-links'}>
          <li>
            <Link href='/'>Trang chủ</Link>
          </li>
          <li>
            <Link href='/rooms'>Phòng</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
