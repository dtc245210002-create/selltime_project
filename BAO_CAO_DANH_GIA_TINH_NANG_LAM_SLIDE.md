# BÁO CÁO ĐÁNH GIÁ TÍNH NĂNG NỀN TẢNG SELL TIME
## PHỤC VỤ XÂY DỰNG SLIDE THUYẾT TRÌNH, BẢO VỆ ĐỀ TÀI & PITCHING

---

## 📌 I. TỔNG QUAN ĐỀ TÀI & BỐI CẢNH THỰC TẾ
* **Tên dự án**: **Sell Time** — Nền tảng kết nối việc làm linh hoạt theo ca gãy (Split-Shift) cho sinh viên tại TP. Thái Nguyên.
* **Đối tượng mục tiêu**:
  * **Sinh viên**: Sinh viên các trường ĐH Kỹ thuật Công nghiệp (TNUT), Sư phạm, Nông lâm... có lịch học đan xen, cần làm thêm 2h - 4h kiếm thêm thu nhập tức thì.
  * **Chủ quán (F&B / Bán lẻ)**: Các quán cà phê, trà sữa, quán ăn, cửa hàng tiện lợi thiếu nhân sự đột xuất vào khung giờ cao điểm (trưa 11h-13h30, tối 18h-22h) hoặc ca khẩn cấp (SOS).
* **Mục tiêu của báo cáo**: Đánh giá khách quan, chi tiết từng tính năng về mức độ **"Đã sát thực tế"** (thực chứng kiểm nghiệm được) và **"Chưa sát thực tế"** (khoảng cách giữa MVP/Demo với môi trường Production ngoài đời), cung cấp luận cứ vững chắc để bảo vệ trước Hội đồng chấm đề tài / Nhà đầu tư.

---

## 📊 II. BẢNG MA TRẬN ĐÁNH GIÁ TÍNH NĂNG (FEATURE REALITY MATRIX)

| STT | Phân Hệ Tính Năng | Mức Độ Sát Thực Tế | Điểm Mạnh Đã Sát Thực Tế | Điểm Chưa Sát Với Thực Tế Ngoài Đời | Đề Xuất Trình Bày Slide |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **1** | **Matching Engine AHP (Time-First Core)** | **85%** | • Lọc theo từng block 30 phút rảnh.<br>• Phạt khoảng cách & lệch giờ phi tuyến.<br>• Thuật toán AHP 4 biến số động. | • Dùng khoảng cách đường chim bay (Haversine), chưa tính tắc đường thực tế.<br>• Chưa phân tích thời gian di chuyển từ giảng đường ra quán. | Nêu bật tính sáng tạo của mô hình "Time-First" thay vì "Title-First" truyền thống. |
| **2** | **Điểm Danh GPS 2 Lớp & PIN Quầy** | **90%** | • Tích hợp Geolocation API thực của trình duyệt.<br>• Bán kính Geofence $\le 100\text{m}$.<br>• Mã PIN quầy động do Chủ quán đổi thời gian thực. | • GPS điện thoại có thể bị nhảy vị trí khi ở trong nhà (indoor).<br>• Nguy cơ ứng viên dùng ứng dụng Fake GPS (Mock Location). | Trình bày đây là giải pháp "Chống bùng ca 2 lớp" tối ưu chi phí không cần máy vân tay. |
| **3** | **Quỹ Bảo Đảm Tiền Lương (Escrow PayOS)** | **80%** | • Cơ chế tự động giải ngân tức thì khi Checkout.<br>• Tiền từ Quỹ tạm giữ chuyển thẳng vào ví sinh viên.<br>• Chính sách ân hạn 1h khi ấn nhầm. | • Chưa tích hợp Webhook API ngân hàng thật (đang dùng mô phỏng sổ quỹ).<br>• Chưa tự động khấu trừ thuế TNCN hoặc phí sàn tự động. | Nhấn mạnh giải pháp "Giải quyết triệt để nỗi sợ bị quỵt lương của sinh viên". |
| **4** | **Chat Trực Tuyến 2 Chiều (Realtime Channel)** | **85%** | • Kết nối Supabase Realtime WebSocket.<br>• Đồng bộ tức thì 2 thiết bị (Máy tính $\leftrightarrow$ Điện thoại).<br>• Nút bấm 1-chạm: Đến nơi, Xin PIN, Vị trí. | • Chưa có Web Push Notification khi sinh viên tắt màn hình điện thoại.<br>• Chưa gửi được hình ảnh chụp trực tiếp quầy làm việc. | Trực quan hóa tương tác nhanh giữa Chủ quán & Sinh viên lúc vào ca gấp. |
| **5** | **Pin Uy Tín (Trust Battery System)** | **90%** | • Thang điểm 0 - 100% tự động điều chỉnh.<br>• Khóa ca SOS nếu Pin $< 80\%$ hoặc vi phạm.<br>• Cơ chế ân hạn huỷ ca linh hoạt. | • Chưa có quy trình khiếu nại (Dispute/Appeal) khi ứng viên gặp sự cố bất khả kháng (hỏng xe, ốm đau có giấy viện). | Mô hình "PartyMode Gamification" giữ chân và sàng lọc sinh viên uy tín. |
| **6** | **Xác Thực Danh Tính & Tuân Thủ Pháp Lý** | **70%** | • Không thu thập lưu trữ CCCD trái phép (tuân thủ Nghị định 13/2023/NĐ-CP).<br>• Xác thực sinh viên qua hồ sơ trường & email. | • Chưa kết nối dữ liệu định danh VNeID của Bộ Công An.<br>• Chưa có hợp đồng điện tử giao kết lao động thời vụ theo Bộ luật Lao động. | Trình bày định hướng tuân thủ quyền riêng tư dữ liệu cá nhân. |
| **7** | **Hệ Thống Phân Quyền & Quản Trị (Admin Console)** | **85%** | • 3 vai trò rõ ràng: Sinh viên, Chủ quán, Quản trị viên.<br>• Quản trị sổ quỹ, ca làm, can thiệp tài khoản. | • Chưa có Audit Log chi tiết ghi nhận IP/thiết bị từng thao tác admin.<br>• Chưa hỗ trợ chuỗi cửa hàng (Multi-branch). | Chứng minh tính khả thi trong vận hành và kiểm soát rủi ro thị trường. |

---

## 🔍 III. PHÂN TÍCH CHI TIẾT TỪNG PHÂN HỆ CHO NỘI DUNG SLIDE

### 1. Phân Hệ: Khớp Nối Thông Minh (Time-First Matching Engine)
* **Ý nghĩa thực tế**: Sinh viên không tìm việc theo kiểu *"Hôm nay có việc gì làm không?"* mà tìm theo *"Hôm nay mình rảnh từ 11h30 đến 13h30 giữa 2 tiết học, có quán nào gần cổng trường cần người không?"*.
* **Đã sát thực tế**:
  * Ma trận 7 ngày $\times$ 4 khung giờ (Sáng, Trưa, Chiều, Tối).
  * Công thức chấm điểm AHP trọng số đa biến (Thời gian 40%, Khoảng cách 25%, Kỹ năng 20%, Thu nhập 15%).
  * Thẻ ca gãy gắn nhãn trực quan: `96% Khớp`, `Ca SOS Thưởng Nóng`, `Gần KTX`.
* **Chưa sát thực tế & Hướng khắc phục khi ra mắt thật**:
  * *Khoảng cách tính theo đường thẳng*: Trên thực tế, khoảng cách 1km qua ngã ba đường ray có thể mất 10 phút. *Giải pháp Production*: Tích hợp Google Maps Distance Matrix API hoặc Mapbox API để tính thời gian di chuyển thực tế bằng xe máy/xe đạp điện.
  * *Chưa tính thời gian thay đồ/chuẩn bị*: Cần đệm thêm 15 phút trước ca làm.

---

### 2. Phân Hệ: Điểm Danh & Chống Bùng Ca (GPS & Dynamic PIN)
* **Ý nghĩa thực tế**: Nỗi đau lớn nhất của chủ quán là sinh viên nhận ca SOS xong không đến, hoặc check-in hộ từ phòng trọ.
* **Đã sát thực tế**:
  * Gọi Geolocation API thật của trình duyệt lấy vĩ độ/kinh độ thiết bị.
  * Tính bán kính Geofencing $\le 100\text{m}$ so với vị trí quán.
  * **Cơ chế đối soát 2 lớp**: GPS + Mã PIN quầy thời gian thực do Chủ quán thiết lập trên bảng quản trị (ngăn chặn hoàn toàn việc sinh viên ở nhà bấm nhận ca).
* **Chưa sát thực tế & Hướng khắc phục khi ra mắt thật**:
  * *Vị trí GPS trong nhà (Indoor GPS Drifting)*: Trong các quán cà phê tầng hầm hoặc nhiều tầng bê tông, GPS có thể sai số 150m. *Giải pháp thực tế*: Mã PIN quầy đóng vai trò dự phòng an toàn tuyệt đối, hoặc quét mã QR Code dán cố định tại quầy thu ngân.
  * *Fake GPS / Mock Location*: Ứng viên am hiểu công nghệ có thể giả lập tọa độ trên điện thoại Android. *Giải pháp Production*: Kiểm tra cờ `isFromMockProvider` qua mobile native app.

---

### 3. Phân Hệ: Sổ Quỹ Ký Quỹ & Giải Ngân Tự Động (Escrow PayOS)
* **Ý nghĩa thực tế**: Sinh viên làm ca gãy sợ nhất là làm xong chủ quán không thanh toán ngay, hoặc chây ì trừ lương vô lý.
* **Đã sát thực tế**:
  * **Ký quỹ trước (Pre-funded Escrow)**: Chủ quán phải nạp ký quỹ trước khi ca làm hiển thị ứng tuyển (đặc biệt là ca SOS).
  * **Tự động giải ngân (Instant Payout)**: Ngay khi sinh viên checkout và nhập đúng mã PIN quầy, hệ thống tự động trừ tiền từ quỹ tạm giữ và cộng tức thì vào số dư ví của sinh viên.
  * Thông báo Toast thời gian thực hiển thị minh bạch số dư.
* **Chưa sát thực tế & Hướng khắc phục khi ra mắt thật**:
  * *Kết nối cổng ngân hàng thật*: Hiện tại luồng tiền đang ghi nhận vào sổ cái cơ sở dữ liệu và ví hệ thống. Để tiền chạy thẳng về tài khoản MBBank/Vietcombank của sinh viên sau 2 giây, cần ký hợp đồng cổng thanh toán (PayOS / MoMo / VNPay) có tài khoản doanh nghiệp bảo chứng.
  * *Khấu trừ thuế TNCN*: Chưa có cơ chế trích 10% thuế TNCN cho thu nhập vãng lai trên 2.000.000đ/lần theo quy định hiện hành.

---

### 4. Phân Hệ: Kênh Trò Chuyện Thời Gian Thực (Supabase Realtime)
* **Ý nghĩa thực tế**: Giao tiếp tức thì giữa chủ quán và sinh viên trước giờ vào ca mà không cần chia sẻ số Zalo cá nhân.
* **Đã sát thực tế**:
  * Kênh WebSocket Supabase Realtime đồng bộ tin nhắn hai chiều lập tức giữa máy tính chủ quán và điện thoại sinh viên.
  * Mẫu tin nhắn 1-chạm thiết kế chuẩn sát nhu cầu:
    * Sinh viên: *"Tôi đã đến quán"*, *"Vui lòng cho tôi xin mã PIN"*, *"Gửi vị trí chỉ đường"*.
    * Chủ quán: Tự động gửi mã PIN quầy hiện hành, hướng dẫn vị trí đối diện cổng trường TNUT.
* **Chưa sát thực tế & Hướng khắc phục khi ra mắt thật**:
  * *Thông báo đẩy (Push Notification)*: Khi sinh viên khoá màn hình điện thoại thì không nhận được rung chuông nếu chưa cấu hình Service Worker Push / Firebase Cloud Messaging (FCM).
  * *Tải lên tệp đa phương tiện*: Chưa hỗ trợ gửi ảnh chụp quầy thu ngân hoặc chụp bằng chứng ca làm.

---

### 5. Phân Hệ: Điểm Uy Tín Pin (Trust Battery & Chế Tài Hủy Ca)
* **Ý nghĩa thực tế**: Xây dựng văn hóa trách nhiệm, loại bỏ tình trạng nhận ca bừa bãi rồi hủy sát giờ.
* **Đã sát thực tế**:
  * Chính sách ân hạn 1 giờ: Nếu ấn nhầm, trong vòng 60 phút được hủy miễn phạt hoàn toàn.
  * Phạt lũy tiến theo thời gian: Hủy trước ca 2h-12h phạt nhẹ (-15%), hủy gấp dưới 2h phạt nặng (-35% Pin, khóa ca SOS 24h), bùng ca tự ý nghỉ (-50% Pin, khóa 48h).
  * Điều kiện nhận ca SOS nghiêm ngặt: Phải đạt Pin Uy Tín $\ge 80\%$.
* **Chưa sát thực tế & Hướng khắc phục khi ra mắt thật**:
  * *Thiếu cơ chế kháng cáo tự động (Dispute Resolution)*: Sinh viên bị tai nạn trên đường tới quán có giấy xác nhận y tế hiện chưa có nút tải đơn khiếu nại để Admin hoàn lại Pin Uy Tín.

---

## 🎯 IV. GỢI Ý DÀN Ý SLIDE THUYẾT TRÌNH (SLIDE OUTLINE)

### Slide 1: Tiêu Đề & Tuyên Ngôn Sứ Mệnh (Title & Vision)
* **Tiêu đề**: Sell Time — Nền Tảng Việc Làm Ca Gãy & Cứu Trợ SOS Cho Sinh Viên Thái Nguyên.
* **Thông điệp chính**: *"Biến giờ rảnh của sinh viên thành thu nhập tức thì — Giải quyết bài toán thiếu hụt nhân sự giờ cao điểm của quán ăn, cà phê."*

### Slide 2: Nỗi Đau Thị Trường (The Problem)
* **Sinh viên**: Lịch học theo tín chỉ phân mảnh, không thể làm ca cố định 8 tiếng; nỗi sợ bị quỵt tiền công.
* **Chủ quán**: Khách đông đột biến giờ trưa/tối; nhân viên cũ ốm đột xuất không ai thay; tuyển người trên Facebook mất 2 ngày mới có phản hồi.

### Slide 3: Giải Pháp Đột Phá Của Sell Time (The Solution)
* **3 Trụ cột cốt lõi**:
  1. *Time-First Matching*: Tìm việc theo khung giờ rảnh thay vì chức danh.
  2. *Escrow PayOS*: Chủ quán ký quỹ trước — Xong ca nhận tiền ngay sau 2.8s.
  3. *GPS & PIN Quầy*: Điểm danh 2 lớp chống bùng ca, không cần lắp máy chấm công.

### Slide 4: Kiến Trúc Công Nghệ Thực Chứng (Tech Stack & Architecture)
* Next.js 16 + React 19 + TypeScript (Clean Architecture).
* Supabase Realtime Channels (WebSocket Broadcast P2P).
* Geolocation Web API + Haversine Metric Geofencing $\le 100\text{m}$.
* Thuật toán tối ưu đa tiêu chí AHP (Analytic Hierarchy Process).

### Slide 5: Kịch Bản Live Demo Thực Tế (User Journey Flow)
* **Bước 1**: Huy (Sinh viên TNUT) rảnh tối 18h-22h $\rightarrow$ Nhận ca SOS 153k tại The Cuppa Coffee.
* **Bước 2**: Huy đến quán $\rightarrow$ Trình duyệt đo GPS cách quán 45m $\rightarrow$ Bấm Check-in mã PIN 8866.
* **Bước 3**: Hai bên nhắn tin trực tiếp qua Kênh Realtime $\rightarrow$ Mẫu 1-chạm trao đổi công việc.
* **Bước 4**: Hết ca $\rightarrow$ Nhập mã Checkout $\rightarrow$ Tiền Escrow 153.000đ tự động cộng vào ví sinh viên.

### Slide 6: Đánh Giá Tính Sát Thực & Định Hướng Nâng Cấp (Reality Gap & Roadmap)
* **Đã hoàn thiện thực tế**: Thuật toán khớp nối, Điểm danh GPS, Chat WebSocket 2 thiết bị, Cơ chế ký quỹ & giải ngân ví nội bộ.
* **Lộ trình lên Production**:
  * Tích hợp Webhook tài khoản ngân hàng liên kết Napas 24/7.
  * Tích hợp định danh VNeID & Web Push Notification.
  * Mở rộng thêm mạng lưới F&B tại khu vực Đại học Thái Nguyên.

### Slide 7: Lời Kết & Q&A
* Lời cảm ơn và sẵn sàng trả lời phản biện của Hội đồng.
