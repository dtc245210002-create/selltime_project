- source_spec: `spec-6-auth-and-ownership.md`
  summary: Kiểm tra snapshot DEMO và state transition checkout/cancellation trong vòng lifecycle được duyệt riêng.
  evidence: Blind-01/02/03, Edge-06/07: persistence không đầy đủ, closure checkout và lock overwrite trong user work có sẵn.
- source_spec: `spec-6-auth-and-ownership.md`
  summary: Bổ sung consumer tests DEMO chat và checkout khi được duyệt phạm vi DEMO verification.
  evidence: Blind-04, Gap-02/03: tests hiện tại không chạy MessagesTab, CheckoutModal hoặc callback payout thật.
- source_spec: `spec-6-auth-and-ownership.md`
  summary: Giới hạn request body bằng bounded byte stream trước khi bật Auth LIVE.
  evidence: Blind-07/Edge-01: req.text buffer toàn bộ body trước kiểm tra 32768; Content-Length có thể không có.
- source_spec: `spec-6-auth-and-ownership.md`
  summary: Làm rõ validation ca làm và parity enum trước vòng API tiếp theo.
  evidence: Blind-05/06, Edge-02/03/04/05: giờ không kiểm tra range, enum domain/SQL khác nhau, budget độc lập và số tiền vượt INT được chấp nhận.
- source_spec: `spec-6-auth-and-ownership.md`
  summary: Review tradeoff refresh fail-closed khi provider/profile lookup tạm thời lỗi.
  evidence: Blind-08: cookies bị xóa sau lỗi verifyToken; người dùng có thể cần login lại. Không giữ session chưa xác minh.
- source_spec: `spec-6-auth-and-ownership.md`
  summary: Xử lý signup email collision mà không liên kết danh tính DEMO với Auth thật.
  evidence: Blind-10: users.email UNIQUE, signup trigger INSERT không có chiến lược collision với unbound DEMO.
- source_spec: `spec-6-auth-and-ownership.md`
  summary: Sửa metadata fallback của AiCoach khi có task riêng.
  evidence: Blind-11: catch ghi nguồn fallback nhưng không tạo fallback content; user work có sẵn.
- source_spec: `spec-6-auth-and-ownership.md`
  summary: Chạy RLS integration trên database test được phê duyệt trước nghiệm thu.
  evidence: Gap-01: SQL suite đã có nhưng user xác nhận chưa có môi trường được duyệt; không có kết quả thực thi database.
- source_spec: `spec-6-bounded-request-body.md`
  summary: Bổ sung invariant dữ liệu shifts ở database khi được duyệt scope schema.
  evidence: B1 medium: INSERT RLS kiểm tra identity nhưng baseline thiếu CHECK wage/coords/duration/candidate count; direct Supabase insert bỏ qua API validation.
- source_spec: `spec-6-bounded-request-body.md`
  summary: Xác định validation giờ và quan hệ start/end/duration, gồm ca qua đêm.
  evidence: B2 medium: regex API chấp nhận 99:99, duration kiểm tra độc lập.
- source_spec: `spec-6-bounded-request-body.md`
  summary: Giới hạn các trường tiền theo PostgreSQL INT tại API.
  evidence: B3 medium: Number.isSafeInteger chấp nhận >2147483647, insert trả lỗi generic 503.
- source_spec: `spec-6-bounded-request-body.md`
  summary: Thiết kế deletion/anonymization tài khoản có conversation và message history.
  evidence: B4 medium: FK participants/sender không có deletion action, chặn cascade từ Auth identity xuống users; lifecycle này chưa triển khai.
- source_spec: `spec-6-bounded-request-body.md`
  summary: Xử lý email collision giữa DEMO và signup thật mà không liên kết danh tính.
  evidence: B5 medium: users.email UNIQUE, signup trigger INSERT không phân biệt collision DEMO.
- source_spec: `spec-6-bounded-request-body.md`
  summary: Phân biệt transient Auth UI error và session hết hiệu lực.
  evidence: B6 low: auth/page.tsx xóa identity hiển thị khi HTTP 503, cookie vẫn có thể hợp lệ.
- source_spec: `spec-6-bounded-request-body.md`
  summary: Sửa metadata fallback và HTTP error handling trong AiCoach.
  evidence: B7 medium: catch không tạo fallback content, CV không kiểm tra res.ok.
- source_spec: `spec-6-bounded-request-body.md`
  summary: Đồng bộ DEMO reset với lời hứa khôi phục trạng thái ban đầu.
  evidence: B8 low: reset setMessages([]) rồi persistence effect ghi [] vào key vừa xóa.
- source_spec: `spec-6-bounded-request-body.md`
  summary: Giữ preview tin nhắn DEMO khi chuyển hội thoại và đọc cache.
  evidence: B9 low: DEMO effect xóa toàn bộ lastMessagesMap và không derive preview từ cached history.
- source_spec: `spec-6-bounded-request-body.md`
  summary: Thêm pagination hoặc cờ truncation rõ cho messages/shifts API.
  evidence: B10 medium: reads giới hạn 150/100 không cursor, bản ghi cũ không truy xuất được.
- source_spec: `spec-6-shift-validation.md`
  summary: Validate runtime type của description trước khi gửi TEXT.
  evidence: B1 medium: snapshot route trước task chỉ kiểm tra length; number/object vẫn qua.
- source_spec: `spec-6-shift-validation.md`
  summary: Validate type và kích thước cover_image theo scope field riêng.
  evidence: B2 medium: repo INSERT trực tiếp cover_image, route không validation field này.
- source_spec: `spec-6-shift-validation.md`
  summary: Bổ sung CHECK database tương đương API invariants khi được duyệt migration.
  evidence: B3 medium: direct authenticated INSERT shifts vượt API, RLS chưa ràng buộc time/money/coords/count; task này không sửa migration.
- source_spec: `spec-6-shift-validation.md`
  summary: Giải quyết signup collision với email DEMO, giữ identity separation.
  evidence: B4 medium: email UNIQUE và signup trigger INSERT dùng cùng users table.
- source_spec: `spec-6-shift-validation.md`
  summary: Provision employer_profiles qua thao tác trusted khi cấp Employer.
  evidence: B5 medium: signup chỉ tạo Candidate profile, set_employer_role không tạo Employer profile; authenticated không có INSERT grant.
- source_spec: `spec-6-shift-validation.md`
  summary: Xác định retention/anonymization trước account deletion có lịch sử.
  evidence: B6 medium: FK conversation participants và message sender chặn cascade xóa user.
- source_spec: `spec-6-shift-validation.md`
  summary: Chỉ hiển thị fallback attribution khi AiCoach sinh fallback thật.
  evidence: B7 medium: catch đổi metadata nhưng không tạo response.
- source_spec: `spec-6-shift-validation.md`
  summary: Kiểm tra res.ok trước cập nhật CV result.
  evidence: B8 medium: HTTP error JSON có thể được setCvResult như kết quả phân tích.
- source_spec: `spec-6-shift-validation.md`
  summary: Phân biệt lỗi provider tạm thời và session không hợp lệ tại Auth UI.
  evidence: B9 low: response không ok luôn xóa identity state kể cả 503; server permission vẫn xác minh.
- source_spec: `spec-6-shift-validation.md`
  summary: Thêm pagination hoặc chỉ báo truncation cho API reads.
  evidence: B10 medium: messages 150/shifts 100 records không cursor để lấy bản ghi cũ.
- source_spec: `spec-6-signup-offline.md`
  summary: Review refresh retry và remote revocation khi access token hết hạn.
  evidence: B1/B2 medium: route cũ dọn cookies trên transient errors; expired logout không gọi provider revoke. Giữ admin.signOut hiện có, cần scope/provider evidence riêng.
- source_spec: `spec-6-signup-offline.md`
  summary: Thiết kế lifecycle đồng bộ email Auth/public trước cho phép email change.
  evidence: B3 medium: trigger INSERT-only không sync provider update; explicit non-goal của offline 007, ownership vẫn dùng UUID.
- source_spec: `spec-6-signup-offline.md`
  summary: Chốt quan hệ duration/budget/time khi được duyệt nghiệp vụ ca làm.
  evidence: B5 medium: các field độc lập; không tự thay formula/overnight đã được defer.
- source_spec: `spec-6-signup-offline.md`
  summary: Hardening DB direct shifts INSERT và xác minh protected column ACLs trên target.
  evidence: B6 medium: RLS 006 thiếu field CHECK. E1 high-unverified: table REVOKE có thể giữ column grants cũ; cần catalog/integration, không có bằng chứng target đang có grants đó.
- source_spec: `spec-6-signup-offline.md`
  summary: Validate và persist DEMO snapshot đồng bộ, bảo toàn grace/lock/reward qua reload.
  evidence: B7/B8/B9,E2/E3/E5 medium: booking/wallet/trust/new shifts không đi cùng statuses; JSON shape không validate và lock có thể bị rút ngắn.
- source_spec: `spec-6-signup-offline.md`
  summary: Chặn checkout callbacks lặp trước re-render và test real consumer.
  evidence: E4/B10/G1 medium: state closure guard không atomic; tests hiện tại clone formula/guard thay vì execute modal/handler.
- source_spec: `spec-6-signup-offline.md`
  summary: Validate description và thống nhất domain/API/SQL work types.
  evidence: E6/E7 medium: description runtime type không guard; FULL_TIME/INTERNSHIP khác nhau, ngoài scope email.
- source_spec: `spec-6-signup-offline.md`
  summary: Provision Employer profile qua thao tác trusted khi cấp role.
  evidence: E8 medium: 006 RPC chỉ đổi role và authenticated không có INSERT employer_profiles.
- source_spec: `spec-6-signup-offline.md`
  summary: Sửa fallback attribution và kiểm thử interview contract thật.
  evidence: E9/B10/G2 medium: catch không tạo fallback response; metadata tests fabricated, không execute provider/route.
- source_spec: `spec-6-signup-offline.md`
  summary: Thêm pagination cho messages và shifts.
  evidence: E10/E11 medium: giới hạn 150/100 không cursor/truncation indication.
- source_spec: `spec-6-signup-offline.md`
  summary: Test executable DEMO chat isolation/no network theo persona và conversation.
  evidence: G3 medium: source checks không mount MessagesTab hoặc kiểm fetch/EventSource/storage behavior.
