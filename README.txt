FINANCE BUDDY - BẢN SỬA

1) Sao lưu thư mục dự án đang chạy trước khi thay thế.
2) Chép tất cả file trong gói này vào cùng thư mục chứa dự án hiện tại (ghi đè các file trùng tên).
3) Giữ nguyên firebase-config.js và cấu hình Firebase đang dùng của bạn; file đi kèm chỉ là bản sao cấu hình hiện có trong phiên làm việc. Nếu cấu hình của bạn mới hơn, hãy giữ file của bạn.
4) Mở lại trang và nhấn Ctrl+Shift+R. Service worker mới sẽ xóa cache finance-buddy cũ. Nếu vẫn thấy bản cũ, vào DevTools > Application > Service Workers > Unregister, rồi Clear site data.

Đã thêm: hồ sơ A/B lưu tên và avatar 30 lựa chọn, hiển thị số dư cá nhân ở sidebar, bỏ email liên kết, trang admin CRUD giao dịch, cache network-first để tránh UI cũ.
Lưu ý: admin chỉ dùng nội bộ, không có xác thực; mọi người truy cập được admin.html. Dữ liệu giao dịch lưu trong LocalStorage hiện tại, không tự xóa dữ liệu cũ.
