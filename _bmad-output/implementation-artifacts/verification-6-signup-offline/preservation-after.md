# Hậu kiểm preservation offline

HEAD trước/sau: `96f4be8575718d50eab2285ab5241d1583f3423a`.

SHA256 `.git/index` trước/sau: `2CCEC39D9D69A39044F41840197966E9D329EC3DEF5935BF7372CE342253888A`.

Staged deletion vẫn giữ: `src/Password-Supabase/New Text Document.txt` (`D` trong index). Không chạy Git mutation. Danh sách tracked dirty paths từ `git diff --name-only` giữ như checkpoint `git-before.log`. Chỉ thêm artifact SQL/tests/docs/script/evidence mới trong scope; không sửa tracked dirty files hoặc canonical spec.

Static script đã đối chiếu lại 8 SHA256 trong `preserved-before.json`: 006 migration, schema/bootstrap, cả hai SQL fixture cũ, route Auth, auth server và auth-ownership test đều bằng snapshot trước. Kiểm tra này không thay thế database/runtime evidence.

SQL/provider/concurrency/Unicode integration: **NOT RUN**. Full regression/tsc/build do orchestration thực hiện sau handoff, trạng thái cuối cần đọc log tương ứng sau khi được tạo.
