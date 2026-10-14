# SellTime: đánh giá sản phẩm và khả năng đưa ra thị trường

Ngày đánh giá: 07/10/2026. Đối tượng: mã nguồn hiện tại trong workspace, gồm cả các thay đổi chưa commit.

## 1. Kết luận

SellTime có hướng sản phẩm đáng thử: kết nối sinh viên có giờ rảnh với quán cần người theo ca ngắn, đặc biệt giờ cao điểm. Bản hiện tại phù hợp trình diễn và phỏng vấn khách hàng; chưa đủ điều kiện mở dịch vụ giao dịch thật. Có thể thử nghiệm vận hành quy mô nhỏ sau khi hoàn thành các điểm chặn dưới đây.

Đây là đánh giá dựa trên mã nguồn và tài liệu, chưa phải kết quả thử nghiệm người dùng, xác nhận nhu cầu trả tiền hay kiểm toán bảo mật hệ thống đang triển khai.

## 2. Những điểm nên giữ

- Tìm việc từ giờ rảnh, vị trí và mức lương: bám đúng tác vụ người dùng.
- Ca ngắn và ca SOS: nhu cầu cụ thể hơn một sàn tuyển dụng tổng quát.
- Mẫu đăng ca, ứng tuyển nhanh, lịch và trao đổi: có thể tạo luồng thao tác ngắn.
- Điểm phù hợp có phân tích thành phần: giúp giải thích gợi ý, nếu diễn đạt đúng là điểm xếp hạng chứ không phải xác suất được tuyển.
- Logic matching và uy tín tách trong domain: thuận lợi để kiểm thử và điều chỉnh.

Chưa có bằng chứng cho các tuyên bố trong báo cáo cũ như giảm 80% thao tác, tìm việc trong 3 giây, UX 8.8/10 hoặc độ tin cậy thương mại. Cần đo trên người dùng thật.

## 3. Các điểm chặn ra mắt

| Ưu tiên | Bằng chứng hiện tại | Cần thay đổi và điều kiện nghiệm thu |
|---|---|---|
| P0 — Tài khoản, định danh | `AuthModal.tsx` chỉ kiểm tra mật khẩu có nội dung, chọn persona theo email/SĐT; đăng ký tự gán `is_kyc_verified: true`. `page.tsx` mặc định đăng nhập persona và có chuyển vai trò. | Xác thực thật, phiên trên máy chủ, kiểm tra quyền theo tài khoản; bỏ badge xác minh khi chưa có quy trình xác minh. Tài khoản A không đọc/sửa hồ sơ, ca hoặc chat riêng của B. |
| P0 — Chat riêng tư | `/api/messages` nhận `sender_id` từ client, không kiểm tra thành viên hội thoại; truyền nội dung lên `ntfy.sh` bằng topic `selltime_v1_chat_<conversation_id>` và không gửi thông tin xác thực. | Lưu chat bền vững, kiểm tra thành viên ở máy chủ, xác định người gửi từ phiên. Chuyển sang kênh có kiểm soát truy cập. Tài liệu ntfy cho biết cấu hình công khai mặc định cho phép đọc/ghi topic; việc topic cụ thể có được bảo vệ bên ngoài hay không chưa kiểm tra. [Tài liệu ntfy](https://docs.ntfy.sh/config/). |
| P0 — Tiền thật | `PaymentQrModal.tsx` dùng `setTimeout` để báo thành công, đã có nhãn demo. `ProfileTab.tsx` mô phỏng rút tiền. `page.tsx` cộng số dư trong state. Không thấy route PayOS/webhook trong danh sách API. | Tạo giao dịch trên máy chủ, xác thực webhook, đối chiếu số tiền/mã đơn, sổ giao dịch, chống xử lý lặp, hoàn tiền và đối soát. QR chuyển khoản chưa chứng minh cơ chế giữ và giải ngân tiền. [Quy trình tích hợp payOS](https://payos.vn/docs/), [xác thực webhook](https://payos.vn/docs/sdks/back-end/node/). |
| P0 — Trạng thái ca | Ứng tuyển/check-in/checkout chủ yếu cập nhật React state và một số khóa localStorage. Duyệt ứng viên ở dashboard là state riêng. | Lưu ứng tuyển, duyệt, điểm danh, hoàn thành và hủy vào database; máy chủ kiểm tra chuyển trạng thái. Hai thiết bị phải thấy cùng dữ liệu; reload không đổi số dư hoặc xóa chế tài. |
| P0 — Ghi dữ liệu | `/api/shifts` có thể trả `success: true` dù cả Supabase và SQL Server không lưu được; nhận ca từ client với kiểm tra tối thiểu. | Chọn một nguồn dữ liệu chính; xác nhận thành công chỉ sau khi lưu bền vững. Kiểm tra chủ sở hữu, dữ liệu đầu vào và giới hạn số người nhận bằng giao dịch database. |
| P1 — Điểm danh | `CheckinModal.tsx` có tọa độ mẫu, nút mô phỏng tại quán và quét QR bằng timer; PIN chung `8866` kiểm tra ở client. Khoảng cách được làm tròn 0.1 km trước khi so geofence. | Bỏ công cụ demo khỏi production; mã ngắn hạn gắn với ca/cơ sở, kiểm tra máy chủ, chống dùng lại; dùng khoảng cách chưa làm tròn và độ chính xác GPS. GPS vẫn là một tín hiệu, không phải bằng chứng tuyệt đối. |
| P1 — Khớp lịch | `calculateTimeScore` so buổi và thời lượng, không kiểm tra đầy đủ ngày/giờ rảnh cụ thể. `rankShiftsForCandidate` chỉ lọc cứng từ khóa và loại việc. Dữ liệu có ngày `Hôm nay`. | Lọc ca hợp lệ trước, xếp hạng sau; dùng ngày/giờ cụ thể, xử lý qua đêm, trùng lịch, thời gian di chuyển, ca đầy và ca đã kết thúc. |
| P1 — Tính lương | `CheckoutModal.tsx` lấy lương giờ nhân thời lượng dự kiến; chưa dùng thời gian check-in/out thực tế. | Chọn rõ mô hình trả theo ca cố định hay theo giờ thực tế. Nếu theo giờ: quy tắc nghỉ, đến muộn, làm thêm, làm tròn và xác nhận hai bên phải được áp dụng trên máy chủ. |
| P1 — AI | `gemini.ts` gọi `gemini-1.5-flash`, có fallback theo kịch bản. Google đã đóng model này ngày 29/09/2025. | Chọn model còn hỗ trợ, cấu hình qua môi trường và kiểm thử tích hợp thật; công khai nguồn fallback, kiểm soát chi phí và không dùng điểm AI chưa được xác thực làm bằng chứng uy tín. [Google changelog](https://ai.google.dev/gemini-api/docs/changelog). |

Schema Supabase được lưu trong repo chưa có định nghĩa RLS/policy. Điều này không chứng minh cấu hình database đang chạy giống hệt; cần kiểm tra trực tiếp trước pilot. Repo cũng đang track một tệp dưới `src/Password-Supabase/`; chưa đọc nội dung, nên chưa kết luận chứa bí mật. Cần kiểm tra riêng, và thu hồi/đổi credential nếu có dữ liệu thật.

## 4. Cải thiện sản phẩm

Ưu tiên câu hỏi “Bạn rảnh từ mấy giờ đến mấy giờ, ngày nào?” thay vì chỉ “mấy tiếng” và “buổi tối”. Ví dụ người rảnh 19:00–23:00 không thể nhận đầy đủ ca 18:00–22:00 dù cùng buổi tối và đều bốn giờ.

Trang ca nên ghi rõ việc phải làm, địa điểm, người phụ trách, kỹ năng bắt buộc, giờ bắt đầu/kết thúc, thu nhập và thời hạn trả. Đưa thuật ngữ Escrow/AHP/PartyMode xuống phần giải thích; giao diện chính dùng “tiền đã xác nhận”, “độ tin cậy”, “lý do phù hợp”.

Độ tin cậy cần dựa vào sự kiện có kiểm chứng, phân biệt lỗi sinh viên và lỗi chủ quán, có khiếu nại và xét ngoại lệ. Không nên để việc người lao động chấm sao chủ quán quyết định trực tiếp điểm uy tín của chính họ như luồng thưởng hiện tại.

MVP nên tập trung: tài khoản → đăng ca → lịch hợp lệ → ứng tuyển → duyệt → nhắc lịch → điểm danh → xác nhận hoàn thành và tiền công → hỗ trợ. AI CV, phỏng vấn đa ngôn ngữ, thao tác vuốt và ngành gia sư/logistics có thể để sau. Cần kiểm tra UX thật trên điện thoại và mạng yếu; phân tích này chưa kiểm thử trực quan.

## 5. Cơ hội thị trường và định vị

Không nên quảng bá “tìm việc linh hoạt theo ca” là tính năng chưa có trên thị trường. Việc Có đã mô tả tìm nhân sự ngắn hạn, chấm công, tính và trả lương; hướng dẫn người lao động có chọn lịch và tránh trùng giờ. [Việc Có](https://viec.co/), [hướng dẫn chọn lịch](https://huongdan.viec.co/tim-viec-lam-phu-hop/dang-ky-lich-lam-viec).

Suy luận chiến lược: cơ hội của SellTime nằm ở phục vụ tốt một cụm địa phương — ca 2–4 giờ tại quán quanh trường, hồ sơ người làm đáng tin, tốc độ lấp ca và hỗ trợ thay người. Chưa có dữ liệu để xác nhận quy mô thị trường, nhu cầu tại Thái Nguyên hoặc lợi thế cạnh tranh đã hình thành.

Rủi ro kinh doanh chính là thiếu mật độ cung/cầu đúng giờ; chủ quán và sinh viên giao dịch trực tiếp sau ca đầu; sinh viên thiếu kỹ năng; chi phí hỗ trợ mỗi ca vượt phí thu. Thuật toán tốt không tự tạo ra nguồn ca và người sẵn sàng làm.

## 6. Cách thử nghiệm đề xuất

Các con số sau là mục tiêu thử nghiệm đề xuất, không phải chuẩn ngành hay dự báo:

1. Phỏng vấn 10–15 chủ quán và 20–30 sinh viên tại một cụm gần TNUT. Hỏi về ca thiếu người gần nhất, cách xử lý, tổn thất, lịch rảnh và người đã từng trả phí tuyển; dùng sự kiện thật thay vì chỉ hỏi “có thích app không”.
2. Tuyển 5–10 quán và 30–50 sinh viên đã kiểm tra thông tin, tập trung hai khung cao điểm. Thử demo/đăng ký quan tâm có thể làm ngay. Pilot ca thật chỉ sau khi xử lý P0 liên quan và có quy trình vận hành.
3. Vận hành 4–6 tuần, có người điều phối và hỗ trợ. Nếu chưa có cơ chế giữ/chi trả hợp lệ và được xác minh, ghi nhận trả tiền trực tiếp giữa hai bên, không quảng bá ví hay bảo chứng tiền. Cách này vẫn cần tài khoản, bảo vệ dữ liệu và trạng thái ca đáng tin.
4. Đo tối thiểu 100 lượt bố trí người vào ca; các ca tuyển nhiều người cần tính riêng từng chỗ làm. Mục tiêu sơ bộ: lấp ≥70% chỗ trước giờ bắt đầu, đến làm ≥95% lượt đã nhận, ≥40% quán dùng lại trong 30 ngày, có ít nhất 3 quán thực trả phí. Mẫu nhỏ chỉ giúp quyết định vòng thử tiếp theo.
5. Mở rộng sau khi chỉ số ổn định qua nhiều tuần và lãi đóng góp mỗi ca dương: phí thực thu trừ chi phí thanh toán, hỗ trợ, ưu đãi và tổn thất.

Thử thu phí phía chủ quán cho ca được lấp thành công trước; chưa nên thu phí ứng tuyển của sinh viên. Ví dụ tính toán giả định: ca 150.000đ, phí 10% tạo 15.000đ doanh thu; nếu hỗ trợ, thanh toán và ưu đãi đã tốn 20.000đ thì lỗ 5.000đ trước chi phí cố định. Cần thử mức phí bằng hành vi thanh toán thật.

Trước khi xử lý tiền hoặc dữ liệu định danh thật, cần xác định rõ ai tuyển và trả công, ai giữ tiền, ai chịu trách nhiệm khi hủy/tranh chấp, cách bảo vệ dữ liệu và điều khoản với các bên; cần chuyên gia phù hợp xác nhận mô hình dự định vận hành. Báo cáo này không kết luận các nghĩa vụ pháp lý cụ thể.

## 7. Kiểm chứng đã thực hiện và giới hạn

- `node --experimental-strip-types src/__tests__/selltime-core.test.mjs`: 45/45 đạt.
- `node src/__tests__/verify-matching.mjs`: 7/7 đạt, nhưng file tự định nghĩa lại nhiều hàm; không phải bằng chứng trực tiếp cho toàn bộ mã production.
- `npx tsc --noEmit --incremental false`: hoàn tất với exit code 0.
- Một số test lõi kiểm tra biến/metadata mẫu hoặc logic guard được dựng trong test; chưa kiểm thử kết nối Gemini thật, xử lý đồng thời hoặc thanh toán thật.
- Chưa chạy lại production build, kiểm thử UI/E2E, truy cập database live, gửi chat ra dịch vụ ngoài hoặc giao dịch thanh toán. Không sửa mã ứng dụng hay các thay đổi sẵn có của người dùng.
- Các tài liệu hiện tại ghi `done` cho nhiều tính năng mô phỏng. Nên tách trạng thái “demo hoàn thành”, “backend tích hợp”, “đã kiểm thử thực tế”, “đã nghiệm thu production” để tránh dùng báo cáo sprint làm bằng chứng sẵn sàng thương mại.

Quyết định hiện tại: tiếp cận khách hàng để kiểm chứng nhu cầu ngay; hoàn thiện nền tảng tối thiểu rồi pilot tại một cụm; chưa mở marketplace và dòng tiền thật rộng rãi.
