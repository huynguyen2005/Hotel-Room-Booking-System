# Hotel Room Booking System

Tài liệu tổng hợp cho toàn bộ dự án: Backend API (`Express + MongoDB`), Frontend khách hàng (`Next.js`) và Admin Panel (`React`).

## 1. Kiến Trúc Dự Án

- `backend/`: REST API, xác thực JWT, upload ảnh, nghiệp vụ đặt phòng.
- `frontend/`: Website người dùng (xem phòng, đặt phòng, quản lý hồ sơ, lịch sử đặt phòng, đánh giá).
- `admin-panel/`: Trang quản trị (dashboard, người dùng, phòng, đơn đặt phòng, đánh giá).

## 2. Chức Năng Chính

### 2.1 Guest (chưa đăng nhập)

- Xem trang chủ và danh sách phòng nổi bật.
- Xem danh sách tất cả phòng.
- Xem chi tiết phòng theo slug/id.
- Tìm/lọc phòng theo loại phòng, giá, bữa sáng, thú cưng (lọc phía frontend).
- Đăng ký, đăng nhập, quên mật khẩu, đặt lại mật khẩu.

### 2.2 User (đã đăng nhập)

- Đăng xuất.
- Xem/cập nhật hồ sơ cá nhân.
- Cập nhật avatar.
- Gửi mail xác thực email và xác thực email.
- Đổi mật khẩu.
- Đặt phòng.
- Xem lịch sử đơn đặt phòng của bản thân.
- Hủy đơn đặt phòng của bản thân.
- Thêm/sửa đánh giá phòng của bản thân.

### 2.3 Admin

- Tất cả quyền của user.
- Xem dashboard thống kê.
- Quản lý người dùng: danh sách, chi tiết, tạo mới, khóa/mở khóa, xóa.
- Quản lý phòng: danh sách, chi tiết, tạo, sửa, xóa.
- Quản lý đơn đặt phòng: danh sách, duyệt/cập nhật trạng thái, check-in, check-out, no-show.
- Quản lý đánh giá: xem tất cả, xóa đánh giá.

## 3. API Backend

Base URL:

- Local: `http://localhost:<APP_PORT>/api/v1`

Response format chuẩn:

```json
{
  "result_code": 0,
  "time": "...",
  "maintenance_info": null,
  "result": {
    "title": "SUCCESS",
    "message": "...",
    "data": {}
  }
}
```

Xác thực:

- Header: `Authorization: Bearer <access_token>`
- Một số endpoint yêu cầu role admin (`isAdmin`) và user không bị block (`isBlocked`).

### 3.1 Auth

- `POST /auth/registration` - Đăng ký người dùng.
- `POST /auth/login` - Đăng nhập.
- `POST /auth/logout` - Đăng xuất (auth).
- `POST /auth/forgot-password` - Gửi link quên mật khẩu.
- `POST /auth/reset-password/:token` - Đặt lại mật khẩu.
- `POST /auth/change-password` - Đổi mật khẩu (auth).
- `POST /auth/send-email-verification-link` - Gửi link xác thực email (auth).
- `POST /auth/verify-email/:token` - Xác thực email (auth).
- `GET /auth/refresh-token` - Làm mới access token từ refresh token.

### 3.2 User

- `GET /get-user` - Lấy thông tin user hiện tại (auth).
- `GET /get-user/:id` - Lấy thông tin user theo id (admin).
- `PUT /update-user` - Cập nhật thông tin user hiện tại (auth).
- `PUT /avatar-update` - Cập nhật avatar (auth, multipart/form-data).
- `DELETE /delete-user` - User tự xóa tài khoản (auth).
- `DELETE /delete-user/:id` - Admin xóa user.
- `GET /all-users-list` - Admin lấy danh sách user.
- `PUT /blocked-user/:id` - Admin khóa user.
- `PUT /unblocked-user/:id` - Admin mở khóa user.

### 3.3 App/Dashboard

- `GET /dashboard` - Dữ liệu tổng quan cho admin dashboard.

### 3.4 Room

- `POST /create-room` - Tạo phòng mới (admin, multipart/form-data, `room_images[]`).
- `GET /all-rooms-list` - Danh sách tất cả phòng (hỗ trợ query `keyword`, `limit`, `page`, `sort`).
- `GET /get-room-by-id-or-slug-name/:id` - Chi tiết phòng theo id hoặc slug.
- `GET /featured-rooms-list` - Danh sách phòng nổi bật.
- `PUT /edit-room/:id` - Cập nhật phòng (admin, multipart/form-data).
- `DELETE /delete-room/:id` - Xóa phòng (admin).

### 3.5 Booking

- `POST /placed-booking-order/:id` - Đặt phòng cho room `:id` (auth).
- `GET /get-user-booking-orders` - Lịch sử đặt phòng của user hiện tại (auth).
- `PUT /cancel-booking-order/:id` - User hủy booking của mình (auth).
- `GET /get-all-booking-orders` - Admin lấy danh sách booking.
- `PUT /updated-booking-order/:id` - Admin cập nhật trạng thái booking.
- `PUT /booking-check-in/:id` - Admin check-in booking.
- `PUT /booking-check-out/:id` - Admin check-out booking.
- `PUT /booking-no-show/:id` - Admin đánh dấu no-show.

### 3.6 Review

- `POST /room-review-add/:id` - Thêm đánh giá cho booking/room (auth).
- `GET /get-room-reviews-list/:room_id` - Danh sách đánh giá của phòng.
- `PUT /edit-room-review/:review_id` - Sửa đánh giá của chính user (auth).
- `GET /get-all-reviews` - Admin lấy tất cả đánh giá.
- `DELETE /delete-review/:review_id` - Admin xóa đánh giá.

## 4. Mapping Chức Năng Theo Ứng Dụng

### 4.1 Frontend (`frontend/`)

- Trang chủ: gọi `GET /featured-rooms-list`.
- Danh sách phòng: gọi `GET /all-rooms-list`.
- Chi tiết phòng: gọi `GET /get-room-by-id-or-slug-name/:slug`.
- Đặt phòng (modal): gọi `POST /placed-booking-order/:id`.
- Lịch sử booking: gọi `GET /get-user-booking-orders`, hủy bằng `PUT /cancel-booking-order/:id`.
- Hồ sơ cá nhân: `GET /get-user`, `PUT /update-user`, `PUT /avatar-update`.
- Đánh giá phòng: `GET /get-room-reviews-list/:room_id`, `POST /room-review-add/:id`, `PUT /edit-room-review/:review_id`.
- Auth UI: đăng ký/đăng nhập/quên mật khẩu/xác thực email.

### 4.2 Admin Panel (`admin-panel/`)

Các tab chính:

- `dashboard`: `GET /dashboard`.
- `users`: `GET /all-users-list`, `GET /get-user/:id`, `PUT /blocked-user/:id`, `PUT /unblocked-user/:id`, `DELETE /delete-user/:id`, `POST /auth/registration` (tạo user).
- `hotel-rooms`: `GET /all-rooms-list`, `GET /get-room-by-id-or-slug-name/:id`, `POST /create-room`, `PUT /edit-room/:id`, `DELETE /delete-room/:id`.
- `booking-orders`: `GET /get-all-booking-orders`, `PUT /updated-booking-order/:id`, `PUT /booking-check-in/:id`, `PUT /booking-check-out/:id`, `PUT /booking-no-show/:id`.
- `reviews`: `GET /get-all-reviews`, `DELETE /delete-review/:review_id`.
- `profile`: `GET /get-user`, `PUT /update-user`, `PUT /avatar-update`.

## 5. Cài Đặt Môi Trường

### 5.1 Backend

Tạo file `.env` trong `backend/` (tham khảo các biến được dùng trong code):

```env
APP_PORT=5000
APP_BASE_URL=http://localhost:5000
APP_SERVICE_URL=http://localhost:3034
APP_NODE_ENV=development
APP_LOG_LEVEL=info

MONGO_URI=mongodb://127.0.0.1:27017/hotel-room-booking

JWT_SECRET_KEY=your_access_secret
JWT_ACCESS_TOKEN_EXPIRES=1d
JWT_REFRESH_TOKEN_SECRET_KEY=your_refresh_secret
JWT_REFRESH_TOKEN_EXPIRES=7d
JWT_TOKEN_COOKIE_EXPIRES=7

SEND_GRID_API_KEY=your_sendgrid_key
SEND_SENDER_MAIL=no-reply@example.com
```

Run:

```bash
cd backend
npm install
npm run dev
```

### 5.2 Frontend (Next.js)

Tạo `.env.local` trong `frontend/`:

```env
API_BASE_URL=http://localhost:5000
```

Run:

```bash
cd frontend
npm install
npm run dev
```

Mặc định chạy ở `http://localhost:3034`.

### 5.3 Admin Panel (React)

Tạo `.env` trong `admin-panel/`:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

Run:

```bash
cd admin-panel
npm install
npm start
```

Mặc định chạy ở `http://localhost:3033`.

## 6. Gợi Ý Kiểm Thử API

- Import Postman collection trong `backend/docs/Hotel Room Booking System.postman_collection.json`.
- Đăng nhập để lấy `access_token` trước khi test endpoint cần auth/admin.
- Khi test upload ảnh, dùng `multipart/form-data` với field đúng tên (`avatar`, `room_images`).

## 7. Tài Liệu Thành Phần

- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`
- Admin README: `admin-panel/README.md`
