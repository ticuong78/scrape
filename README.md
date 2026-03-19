# WebScraper Pro - Ứng dụng Scrape Trang Vàng Việt Nam

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-latest-47848F?logo=electron&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

Trang Vàng Việt Nam là một trong những trang cung cấp thông tin chính xác nhất về các doanh nghiệp. Trang không những chỉ đưa thông tin về phương thức liên hệ mà còn các thông tin có độ chi tiết cao, ngoài ra, thông tin của Trang Vàng không chỉ dừng lại ở việc có đầy đủ thông tin mà còn rất dài và nhiều.
Đặc biệt là bạn có thể tìm thấy doanh nghiệp ở hầu hết mọi tỉnh thành, mọi ngành nghề mà không còn bận tâm đến việc tìm thiếu hoặc không thể tiếp cận.
Chính vì thế, chúng tôi cung cấp một công cụ giúp người dùng có thể thu thập được thông tin của Trang Vàng thông qua gọi GET Request tới các trang `.html` của miền.

---

## Yêu cầu hệ thống

| Yêu cầu      | Phiên bản                           |
| ------------ | ----------------------------------- |
| Node.js      | >= 18.x                             |
| Yarn         | >= 4.x (via Corepack)               |
| Hệ điều hành | Windows, macOS, hoặc Linux mới nhất |

---

## Cài đặt và chạy

```bash
# 1. Clone repository
git clone https://github.com/ticuong78/scrape.git
cd webscraper-pro

# 2. Kích hoạt Corepack và cài dependency
corepack enable
yarn install

# 3. Chạy ở chế độ development
yarn dev

# 4. Build ứng dụng
yarn build
```

---

## Một số tính năng chính

**1. Xoay tên thuộc tính (field mapping)**

Cho phép đổi tên các thuộc tính trước khi gửi lên API hoặc lưu vào tệp, giúp dữ liệu
đầu ra khớp với schema của hệ thống đích mà không cần chỉnh sửa thủ công.

**2. Xuất nhiều định dạng phổ biến**

Hỗ trợ xuất dữ liệu ra các định dạng thông dụng như `JSON` và `Excel`, phù hợp với
nhiều luồng xử lý và công cụ phân tích khác nhau.

**3. Gửi thẳng lên API tùy chỉnh**

Sau khi dữ liệu được đóng gói hoàn tất, hệ thống có thể gửi trực tiếp đến một endpoint
API do người dùng cấu hình, không cần bước trung gian.

**4. Xem trước dữ liệu và thông tin tệp**

Cho phép kiểm tra nhanh dữ liệu đã cào hoặc xem thông tin tệp sắp được lưu trước khi
thực sự ghi xuống, giúp phát hiện sai sót sớm.

**5. Tự động phân trang**

Hệ thống tự động phát hiện và duyệt qua toàn bộ các trang phân trang trong một tệp
`.html`. Ví dụ, nếu một trang chứa 19 phân trang, hệ thống sẽ lần lượt cào và tích lũy
dữ liệu vào tệp mà không cần can thiệp thủ công.

**6. Log Panel chi tiết**

Hiển thị đầy đủ tiến độ cào theo thời gian thực, bao gồm tổng số phân trang phát hiện
được trong tệp `.html` và trạng thái hoàn thành của từng trang.

## Một số ứng dụng thực tế

**1. Doanh nghiệp có nhu cầu thu thập lead**

Điển hình là các công ty sales, telesales, hoặc B2B marketing. Họ dùng dữ liệu từ
Trang Vàng để xây dựng danh sách khách hàng tiềm năng (lead list) theo ngành nghề,
khu vực địa lý, hoặc quy mô doanh nghiệp — thay vì tốn chi phí mua data từ bên thứ ba.

**2. Nghiên cứu thị trường**

Các công ty tư vấn hoặc startup có thể phân tích mật độ doanh nghiệp theo từng lĩnh
vực và khu vực để đánh giá mức độ cạnh tranh, tìm khoảng trống thị trường, hoặc lập
báo cáo ngành.

**3. Xây dựng cơ sở dữ liệu doanh nghiệp nội bộ**

Thay vì dùng các dịch vụ dữ liệu doanh nghiệp tốn phí, các tổ chức có thể tự tổng hợp
thông tin liên hệ, địa chỉ, số điện thoại của các đối tác hoặc nhà cung cấp tiềm năng.

**4. Lĩnh vực bất động sản**

Môi giới hoặc nhà đầu tư BĐS có thể thu thập danh sách các doanh nghiệp trong một khu
vực để đánh giá tiềm năng thương mại của mặt bằng, hoặc tìm kiếm khách thuê tiềm năng.

**5. Hỗ trợ cơ quan nhà nước và tổ chức phi lợi nhuận**

Dùng để khảo sát, kiểm tra sự tồn tại và thông tin liên lạc của các doanh nghiệp trong
một địa bàn nhất định, phục vụ công tác thống kê hoặc hỗ trợ chính sách.

**6. Kiểm chứng và làm sạch dữ liệu (data validation)**

Các hệ thống CRM có thể dùng dữ liệu cào từ Trang Vàng để tự động cập nhật hoặc xác
minh thông tin doanh nghiệp đã có trong cơ sở dữ liệu của mình.

## Chồng công nghệ (Tech Stack)

**WebScraper Pro** được xây dựng trên nền tảng **Electron**, cho phép phát triển ứng dụng
Desktop đa nền tảng bằng HTML, CSS và JavaScript — mang lại sự linh hoạt cao trong thiết
kế giao diện và trải nghiệm người dùng.

Toàn bộ codebase được viết bằng **TypeScript** kết hợp với **TSX**, giúp định nghĩa rõ
ràng các lược đồ thực thể (entity schema), giảm thiểu lỗi kiểu dữ liệu và tăng khả năng
bảo trì về lâu dài.

Giao diện người dùng được xây dựng với **React**, bundled bởi **Vite** để đảm bảo tốc độ
build nhanh và trải nghiệm phát triển mượt mà. Dự án sử dụng **Yarn** thông qua
**Corepack** để quản lý dependency một cách nhất quán giữa các môi trường. Chất lượng mã
nguồn được kiểm soát bởi **ESLint**, đảm bảo tuân thủ các quy tắc coding convention
xuyên suốt dự án.

### Danh sách công nghệ

| Công nghệ  | Vai trò                                |
| ---------- | -------------------------------------- |
| Electron   | Nền tảng ứng dụng Desktop đa nền tảng  |
| TypeScript | Ngôn ngữ chính, kiểm soát kiểu dữ liệu |
| TSX        | Viết React component với TypeScript    |
| React      | Xây dựng giao diện người dùng          |
| Vite       | Build tool & dev server                |
| Yarn       | Quản lý dependency                     |
| Corepack   | Quản lý phiên bản package manager      |
| ESLint     | Kiểm soát chất lượng và chuẩn mã nguồn |

## Đóng góp (Contributing)

Mọi đóng góp cho **WebScraper Pro** đều được chào đón, dù là báo lỗi, đề xuất tính năng
hay gửi pull request.

### Quy trình đóng góp

1. Fork repository về tài khoản của bạn.
2. Tạo branch mới từ `main`:

```bash
   git checkout -b feature/ten-tinh-nang
```

3. Thực hiện thay đổi và commit theo chuẩn [Conventional Commits](https://www.conventionalcommits.org):

```bash
   git commit -m "feat: mô tả ngắn gọn thay đổi"
```

4. Push branch lên remote:

```bash
   git push origin feature/ten-tinh-nang
```

5. Mở Pull Request vào branch `main` và mô tả rõ nội dung thay đổi.

### Một số lưu ý

- Đảm bảo code pass toàn bộ kiểm tra ESLint trước khi gửi PR.
- Ưu tiên viết TypeScript với kiểu dữ liệu rõ ràng, tránh dùng `any`.
- Nếu thêm tính năng mới, vui lòng cập nhật tài liệu liên quan.
- Với các thay đổi lớn, nên mở Issue thảo luận trước khi bắt tay vào code.

### Báo lỗi

Nếu gặp lỗi, vui lòng mở một [GitHub Issue](../../issues) và cung cấp:

- Mô tả lỗi và các bước tái hiện.
- Phiên bản hệ điều hành và phiên bản ứng dụng.
- Screenshot hoặc log từ Log Panel nếu có.

---

## Video hướng dẫn sử dụng

![Demo](./assets/demo.gif)

---

## Giấy phép (License)

Phân phối dưới giấy phép **MIT**. Xem chi tiết tại [`LICENSE`](./LICENSE).

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/ticuong78">ticuong78</a>
  <br/>
  <sub>WebScraper Pro © 2025</sub>
</p>
