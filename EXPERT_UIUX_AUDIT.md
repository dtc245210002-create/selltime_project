# BÁO CÁO PHÂN TÍCH & ĐÁNH GIÁ TOÀN DIỆN UI/UX NỀN TẢNG SELL TIME
### Dưới Góc Nhìn Của Chuyên Gia Thiết Kế Sản Phẩm & Người Dùng Chuyên Nghiệp (Senior UX/Product Audit)

---

## I. TỔNG QUAN ĐÁNH GIÁ (EXECUTIVE SUMMARY)

* **Điểm Trải Nghiệm Tổng Thể (UX Maturity Score):** **8.8 / 10** (Xếp hạng: **Professional Marketplace Grade**)
* **Điểm mạnh cốt lõi:** Đảo ngược mô hình tìm việc (Time-First), minh bạch thuật toán so khớp AHP, giải quyết triệt để rủi ro bùng tiền/bùng ca bằng Escrow & Trust Battery.
* **Ngôn ngữ thiết kế:** Modern Dark Marketplace (Linear/GitHub style), bo góc chuẩn mực 6px–12px, độ tương phản sắc nét, loại bỏ hoàn toàn các hiệu ứng màu mè dư thừa.
* **Mục tiêu nâng cấp để đạt 9.8/10:** Tối ưu cơ chế phòng ngừa lỗi (Error Prevention), lưu vết trạng thái check-in bền vững (Persistence) và tối ưu thao tác một tay (Thumb Zone Swiping).

```
                        MA TRẬN ĐÁNH GIÁ TRẢI NGHIỆM
    ┌────────────────────────────────────────────────────────┐
    │ 1. Kiến trúc thông tin (Information Architecture) : 9.5│
    │ 2. Tính khả dụng & Hiệu quả tác vụ (Usability)    : 9.0│
    │ 3. Phân cấp thị giác & Thẩm mỹ (Visual Hierarchy) : 9.0│
    │ 4. Độ tin cậy & An tâm tâm lý (Psychological Trust): 9.2│
    │ 5. Công thái học di động (Mobile Ergonomics)      : 8.2│
    │ 6. Xử lý kịch bản ngoại lệ & Phục hồi lỗi (Recovery): 8.0│
    └────────────────────────────────────────────────────────┘
```

---

## II. 5 ĐIỂM SÁNG ĐẲNG CẤP DƯỚI GÓC NHÌN CHUYÊN NGHIỆP

### 1. Đảo ngược tư duy tìm việc (Inverted Paradigm - Time-First Core)
* **Thực trạng ngành:** Hầu hết các ứng dụng (TopCV, Grab, Freelancer) bắt người dùng tìm theo chức danh hoặc lướt vô tận.
* **Sell Time đột phá:** Bắt đầu bằng câu hỏi sinh viên quan tâm nhất: **"Tôi đang rảnh mấy tiếng?"**. Thanh trượt thời gian (Time Slider) kết hợp 4 buổi Sáng/Chiều/Tối/Đêm giải phóng 80% gánh nặng nhận thức (Cognitive Load). Người dùng có việc làm phù hợp trong 3 giây.

### 2. Sự minh bạch triệt để (Radical Transparency - Matching Engine AHP)
* Thay vì gắn nhãn "Độ phù hợp 95%" một cách mơ hồ, việc cho phép bấm mở rộng xem **4 biến số độc lập**:
  - Thời gian ($35\%$) • Khoảng cách ($25\%$) • Kỹ năng ($25\%$) • Mức lương ($15\%$)
  khiến ứng viên cảm thấy được tôn trọng và hệ thống có căn cứ khoa học chứ không phải "bốc thuốc".

### 3. Giải tỏa "Khoảng cách ngờ vực" (Closing the Trust Gap)
* Thị trường lao động thời vụ sinh viên luôn tồn tại 2 nỗi sợ lớn:
  1. *Sinh viên sợ bị quỵt lương / bùng tiền sau ca.* $\rightarrow$ **Sell Time giải quyết:** Ký quỹ VietQR Napas 24/7 PayOS giữ tiền trước (`HELD`), giải ngân tức thì (`RELEASED`) sau ca.
  2. *Chủ cơ sở sợ sinh viên bùng ca giờ cao điểm.* $\rightarrow$ **Sell Time giải quyết:** Pin Uy Tín (PartyMode Trust Battery) phạt trừ tới 50% điểm và khóa nhận ca.

### 4. Thiết kế thực địa chống gian lận 2 lớp (Dual-Layer Anti-Fraud)
* Điểm danh bằng GPS thường gặp sự cố trôi sóng (GPS drift) trong nhà cao tầng hoặc tầng hầm. Việc có ngay tab **nhập mã PIN quầy `8866` dự phòng** chứng minh sản phẩm được thiết kế từ trải nghiệm thực tế công trường chứ không phải lý thuyết phòng lab.

### 5. Sự chuyển mình xuất sắc về Visual Design
* Việc chuyển từ phong cách "nhiều viền, gradient tím phát sáng mờ" sang **Modern Dark Marketplace** (Nền sâu `#090D16`, bề mặt `#111726`, viền `#1E293B`, điểm xuyết xanh ngọc monospace cho mức thù lao) mang lại cảm giác của một công cụ tài chính tin cậy (Fintech/Linear-like).

---

## III. ĐÁNH GIÁ THEO 10 NGUYÊN LÝ KHẢ DỤNG JAKOB NIELSEN

| Nguyên lý Heuristic | Điểm | Phân tích chuyên sâu | Điểm cần cải thiện |
| :--- | :---: | :--- | :--- |
| **1. Visibility of system status** (Hiển thị trạng thái hệ thống) | **9.0** | Đồng hồ đếm từng giây trong ca làm việc và số dư ví nhảy tức thì mang lại phản hồi cực tốt. | Cần lưu timestamp check-in vào `localStorage` để khi F5 trình duyệt không bị mất đồng hồ. |
| **2. Match between system & real world** (Khớp với thực tế đời sống) | **9.5** | Dùng thuật ngữ thân thuộc: "Ca SOS", "Lương theo giờ", "VietQR Napas 247", "Mã PIN quầy". | Rất tự nhiên, chuẩn ngôn ngữ ngành F&B. |
| **3. User control and freedom** (Quyền tự do và kiểm soát) | **8.5** | Chuyển đổi qua lại giữa Sinh viên và Chủ quán bằng 1-chạm (RoleSwitcher); hủy ca linh hoạt. | Cần thêm modal xác nhận khi bấm "Đăng xuất" hoặc "Từ chối ứng viên". |
| **4. Consistency and standards** (Tính nhất quán và chuẩn mực) | **9.5** | Bo góc chuẩn 6px controls, 12px modals. Font monospace cho toàn bộ số tiền và mã giao dịch. | Nhất quán 100% trên toàn bộ màn hình. |
| **5. Error prevention** (Phòng ngừa lỗi từ trước) | **8.0** | Nút quét QR tự động khóa nếu cách quán $> 100m$. | Khi sinh viên bấm "Hủy ca", cần hiển thị popup dự báo thiệt hại: *"Bạn sẽ bị trừ 15% Pin Uy Tín. Tiếp tục?"*. |
| **6. Recognition rather than recall** (Nhận biết hơn hồi tưởng) | **9.0** | 3 mẫu ca làm mẫu (Phục vụ tối, Pha chế SOS, Thu ngân); 3 nút trả lời nhanh trong chat. | Giúp người dùng không phải nhớ cú pháp. |
| **7. Flexibility and efficiency of use** (Linh hoạt và hiệu quả) | **9.0** | Hỗ trợ cả Desktop 3 cột và Mobile preview 430px; có bộ lọc AI NLP cho người dùng thích gõ câu tự nhiên. | Đáp ứng hoàn hảo cả người dùng mới và Power User. |
| **8. Aesthetic and minimalist design** (Thẩm mỹ & Tối giản) | **9.2** | Dark mode trung tính, phân cấp thẻ phẳng, khoảng cách thở (whitespace) chuẩn mực. | Đạt chuẩn thiết kế hiện đại. |
| **9. Help recognize, diagnose, recover from errors** | **8.0** | Báo lỗi GPS khi cách xa quán, có chỉ dẫn mở bản đồ Google Maps. | Cần bổ sung thông báo khi micro trình duyệt bị từ chối cấp quyền trong AI Coach. |
| **10. Help and documentation** (Trợ giúp & Tài liệu) | **8.5** | Modal hướng dẫn cài PWA; AI Coach hướng dẫn trả lời STAR theo từng bước. | Rõ ràng, dễ tiếp cận. |

---

## IV. TRẢI NGHIỆM THỰC CHIẾN TỪ 2 GÓC NHÌN (PERSONA JOURNEYS)

### Góc nhìn 1: Chủ quán F&B bận rộn (Chị Lan - The Cuppa Coffee)
* **Kịch bản thực tế:** Giờ cao điểm chiều tối, nhân viên pha chế chính báo ốm đột xuất.
* **Cảm nhận của Chị Lan:**
  - *Bước 1:* Vào app, bấm mẫu **"Pha chế SOS"** $\rightarrow$ Đăng xong ca trong 20 giây. Thao tác cực nhanh, không phải gõ lại mô tả.
  - *Bước 2:* Thấy ứng viên Huy TNUT có độ khớp 96%, bấm **"Duyệt & Ký Quỹ VietQR"** $\rightarrow$ Quét mã nạp 153k từ app ngân hàng trong 10 giây. Tiền được hệ thống bảo chứng an toàn.
  - *Bước 3:* Huy tới quán lúc GPS bị chập chờn $\rightarrow$ Chị Lan mở tab *Lịch làm hôm nay*, đọc mã PIN `8866` cho Huy check-in ngay tại quầy. Không làm chậm trễ giờ phục vụ khách.
* **Nhận xét của Chị Lan:** *"App hiểu đúng nỗi đau của chủ quán: Cần người nhanh, thủ tục gọn và không sợ nhân viên bùng giờ chót."*

### Góc nhìn 2: Sinh viên tìm việc sau giờ học (Nguyễn Đức Huy - TNUT)
* **Kịch bản thực tế:** Tiết học buổi chiều tan sớm lúc 17h, trống từ 17h30 đến 21h30.
* **Cảm nhận của Huy:**
  - *Bước 1:* Mở app trên điện thoại, kéo thanh trượt sang **4 tiếng**, chọn buổi **Tối** $\rightarrow$ Xuất hiện ngay ca SOS tại Cafe The Cuppa cách trường 1.1km, lương 32k/h + thưởng nóng 25k.
  - *Bước 2:* Bấm xem điểm khớp: Thời gian 100%, Khoảng cách 1.1km (rất gần), Kỹ năng khớp $\rightarrow$ Bấm **"Ứng tuyển ngay"** 1-chạm.
  - *Bước 3:* Nhận thông báo trúng tuyển $\rightarrow$ Bấm nút Google Maps trên khung chat để định vị đường đi ngắn nhất. Đến quán, quét QR điểm danh, đồng hồ nhảy tiền công theo giây tạo động lực làm việc.
  - *Bước 4:* Hết ca, được giải ngân ngay 153.000đ vào ví và rút thẳng về MBBank để ăn tối cùng bạn bè.
* **Nhận xét của Huy:** *"Không có cảm giác đi xin việc nặng nề, trải nghiệm giống như bật Grab nhận cuốc xe: tiện lợi, minh bạch và tiền tươi ngay sau ca."*

---

## V. 4 KHUYẾN NGHỊ NÂNG TẦM TRẢI NGHIỆM ĐẠT CHUẨN 9.8/10 (ROADMAP TO PERFECTION)

1. **Thao tác một tay vuốt nhận ca (Swipe-to-Apply - Fitts's Law):**
   - Thay vì nút bấm tĩnh, bổ sung thanh trượt **"Vuốt sang phải để Ứng tuyển"** ở cạnh đáy màn hình điện thoại (Bottom Sticky Bar) giúp thao tác bằng ngón tay cái khi đang đi bộ không bị bấm nhầm.
2. **Cơ chế lưu trữ trạng thái phiên làm việc (Local Session Persistence):**
   - Tự động lưu `checkin_timestamp` và `shift_id` vào `localStorage`. Khi trình duyệt bị tải lại (F5) hoặc ứng dụng mở lại từ chế độ chạy ngầm, đồng hồ đếm giờ ca làm việc tiếp tục chạy chính xác mà không bị reset về 0.
3. **Modal cảnh báo mất mát tâm lý (Loss Aversion Dialog khi Hủy ca):**
   - Thay vì nút Hủy ca thông thường, hiển thị bảng đo mức độ sụt giảm Pin Uy Tín (ví dụ: *100% $\rightarrow$ còn 65%*), kèm danh sách các quyền lợi bị tạm khóa để ngăn chặn sinh viên hủy ca tùy tiện.
4. **Smart Empty State (Đề xuất khi không có ca khớp):**
   - Khi kéo Time Slider mà không có ca nào, thay vì để màn hình trống, hiển thị gợi ý thông minh 1-chạm: *"Thử tăng thêm 1 giờ rảnh"* hoặc *"Mở rộng bán kính thêm 2km để xem 3 ca gần nhất"*.
