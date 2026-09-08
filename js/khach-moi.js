/* ============================================================================
   DANH SÁCH KHÁCH MỜI — đây là file duy nhất bạn cần sửa để thêm tên.

   Mỗi dòng có dạng:      "mã": "Tên hiện trên bìa thiệp",

   • Mã viết không dấu, không khoảng trắng (dùng gạch ngang nếu dài):
       nam, chi-lan, gia-dinh-cau-tu
   • Tên thì viết thoải mái, có dấu, có "Anh/Chị/Gia đình..." tuỳ bạn.

   Gửi cho từng người đường dẫn kèm mã của họ:
       .../index.html?k=nam            → bìa hiện “Thân mời — Anh Nam”
       .../index.html?k=gia-dinh-cau-tu

   Muốn mời nhanh một người chưa có trong danh sách, gắn thẳng tên vào
   đường dẫn cũng được:
       .../index.html?ten=Anh%20Nam

   Mở file khach-moi.html bằng trình duyệt để xem danh sách kèm đường dẫn
   của từng người và bấm sao chép.

   Không có mã (hoặc mã sai) thì bìa dùng tên mặc định ở cuối file; để trống
   thì bìa không hiện dòng tên, đúng như bản chung.
   ========================================================================== */

window.KHACH_MOI = {
  "nam": "Anh Nam",
  "lan": "Chị Lan",
  "gia-dinh-cau-tu": "Gia đình cậu Tư",
};

/* Tên dùng khi đường dẫn không có mã. Ví dụ: "Quý khách" — để trống ("") thì
   bìa chỉ hiện “Thân mời” như cũ. */
window.KHACH_MAC_DINH = "";
