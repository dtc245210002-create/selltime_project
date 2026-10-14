// Không còn singleton hoặc credential database cũ trong đường dẫn Auth thật.
// Mỗi request phải xác minh session trước khi nhận client chịu RLS.
export { authenticate as getAuthenticatedSupabaseClient } from "../auth/server";
