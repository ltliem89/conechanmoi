# FROG POND 3D — ĐẶC TẢ XÂY DỰNG GAME CHỌN TÊN HỌC SINH

> **Mục tiêu:** Dùng tài liệu này làm đặc tả chính để Google AI Studio/Gemini xây dựng một ứng dụng web game 3D chạy được thật, dùng để chọn ngẫu nhiên học sinh trong lớp. Không chỉ tạo ảnh minh họa hoặc bản demo tĩnh.
>
> **Tên hiển thị đề xuất:** **FROG POND 3D — Ao Sen Săn Tên**
>
> **Ngôn ngữ giao diện:** Tiếng Việt, hỗ trợ đầy đủ dấu tiếng Việt.
>
> **Ưu tiên cao nhất:** Dễ sử dụng trên lớp học; tên học sinh đọc được rõ; bộ đếm thời gian hoạt động chính xác; kết quả chọn ngẫu nhiên, không trùng; hoạt cảnh 3D và âm thanh sinh động nhưng không rối mắt.

---

## 1. TỔNG QUAN SẢN PHẨM

Xây dựng trò chơi chọn học sinh trong bối cảnh một ao sen 3D. Giáo viên dán danh sách học sinh vào ô nhập liệu trước khi chơi. Mỗi dòng không rỗng trong danh sách tương ứng với một học sinh và được thể hiện bằng một côn trùng hoạt hình có gắn nhãn tên: ong mật, chuồn chuồn, bọ rùa, bướm, ruồi hoạt hình hoặc bọ cánh cứng nhỏ. Các côn trùng mang tên bay vòng quanh ở khu vực phía trên mặt nước. Phía dưới là các lá sen nổi, trên đó có số lượng ếch do giáo viên lựa chọn.

Các chú ếch chớp mắt, kêu “ộp ộp/quạc quạc” theo phong cách hoạt hình, nhìn theo côn trùng, nhún người, nhảy qua lại giữa các lá sen và đớp các nhãn tên. Mỗi lần đớp thành công, tên tương ứng rời khỏi vòng chơi. Khi bộ đếm thời gian về 0, trò chơi kết thúc vòng săn, chỉ còn một tên được công bố ở chính giữa màn hình bằng hoạt cảnh chiến thắng.

**Quan trọng:** Kết quả được chọn bằng thuật toán ngẫu nhiên độc lập với vị trí, kích thước, tốc độ bay hoặc việc một côn trùng vô tình ở gần con ếch. Hoạt ảnh 3D minh họa quá trình chọn; không được để quỹ đạo hay lỗi va chạm làm thiên lệch kết quả.

### 1.1. Mục đích sử dụng

- Chọn học sinh trả lời câu hỏi, phát biểu, trình bày bài hoặc tham gia hoạt động.
- Tạo không khí vui vẻ trong lớp, đặc biệt khi sử dụng máy chiếu hoặc màn hình lớn.
- Cho giáo viên điều chỉnh thời gian chơi, số lượng ếch, âm lượng và danh sách học sinh.

### 1.2. Định hướng hình ảnh

Phong cách **3D hoạt hình bán chân thực**: môi trường ao sen có chiều sâu, nước có gợn sóng và phản chiếu nhẹ; lá sen có độ cong; ếch và côn trùng có hình khối, ánh sáng, bóng đổ và chuyển động tự nhiên. Không làm theo kiểu ảnh thực tế đáng sợ, cũng không dùng emoji hoặc hình dán phẳng làm đối tượng chính.

Cảnh phải sinh động nhưng có trọng tâm: mắt người xem cần ưu tiên đọc được tên học sinh, quan sát hành động đớp mồi và thấy rõ tên cuối cùng.

---

## 2. CÁC YÊU CẦU BẮT BUỘC

1. Có ô nhập hoặc dán danh sách học sinh trước khi bắt đầu.
2. **Mỗi dòng không rỗng là một tên học sinh.** Không tự tách họ tên theo dấu cách. Ví dụ `Nguyễn Minh An` là một tên, không phải ba học sinh.
3. Hỗ trợ dán danh sách từ Excel/Google Sheets khi mỗi hàng có một tên. Chuẩn hóa xuống dòng Windows/Mac/Linux.
4. Có lựa chọn số lượng ếch; mặc định 3, cho phép chọn từ 1 đến 8.
5. Số lá sen chính tương ứng với số ếch, tự dàn bố cục theo chiều rộng màn hình.
6. Có lựa chọn thời gian đếm ngược **từ 5 đến 30 giây**, tuyệt đối không cho chọn quá 30 giây. Mặc định đề xuất 15 giây. Có thể dùng thanh trượt theo từng giây hoặc các nút nhanh 5, 10, 15, 20, 25, 30 giây.
7. Bộ đếm bắt đầu khi giáo viên nhấn **BẮT ĐẦU**; bộ đếm dựa trên thời gian thực, không dựa trên số khung hình hoạt ảnh.
8. Khi thời gian về 0, dừng giai đoạn săn mồi và đi vào công bố kết quả. Có thể phát hoạt cảnh kết thúc ngắn sau khi đồng hồ dừng, nhưng không được tiếp tục đếm ngược.
9. Một học sinh chỉ có một mã định danh trong mỗi vòng. Không thể bị bắt hai lần hoặc xuất hiện trở lại sau khi đã bị loại.
10. Vòng chơi luôn kết thúc bằng đúng một học sinh được chọn, miễn danh sách có ít nhất một tên hợp lệ.
11. Tên chiến thắng phải được hiển thị lớn ở chính giữa màn hình, không bị côn trùng, lá sen, nút giao diện hoặc hiệu ứng che khuất.
12. Có nút **Tạm dừng/Tiếp tục**, **Bật/Tắt âm thanh**, **Chơi lại**, **Quay về cài đặt**.
13. Không tự phát âm thanh trước khi người dùng tương tác lần đầu. Nút âm thanh phải thực sự hoạt động.
14. Giao diện không được phụ thuộc bắt buộc vào một URL tài nguyên bên ngoài đang có thể mất. Nếu thiếu model hoặc file âm thanh, phải có phương án tạo bằng hình học và Web Audio API, không để màn hình trống.
15. Bàn giao ứng dụng chạy được, có cấu trúc tệp rõ ràng, không chỉ đưa ra kế hoạch, pseudocode hoặc ảnh concept.

---

## 3. LUỒNG SỬ DỤNG

### Bước 1 — Cài đặt trò chơi

Hiển thị một bảng cài đặt gọn, bao gồm:

- Ô văn bản lớn để dán/nhập danh sách học sinh.
- Số lượng tên đã nhận dạng, ví dụ `Đã nhận 32 học sinh`.
- Điều khiển số lượng ếch: 1–8, mặc định 3.
- Điều khiển thời gian: 5–30 giây, mặc định 15 giây.
- Điều khiển âm lượng tổng và công tắc âm thanh.
- Nút **BẮT ĐẦU SĂN TÊN**.
- Nút **Xóa danh sách** và khả năng sửa danh sách trước khi chơi.

Ví dụ nội dung được dán vào ô:

```text
Nguyễn Minh An
Trần Gia Bảo
Lê Ngọc Chi
Phạm Quốc Dũng
Võ Thanh Hà
```

Kết quả nhận dạng phải là 5 học sinh, không phải 15 từ. Bỏ qua dòng trống ở đầu/cuối và dòng chỉ chứa khoảng trắng. Giữ nguyên dấu tiếng Việt. Không tự ý đổi thứ tự các dòng trong phần danh sách cài đặt.

Nếu người dùng dán vùng dữ liệu có tab giữa các cột, hãy xử lý một cách thận trọng: ưu tiên lấy ô đầu tiên không rỗng của mỗi hàng hoặc thông báo rõ dữ liệu có nhiều cột và yêu cầu người dùng xác nhận trước khi chơi. Không nối nhiều học sinh thành một tên.

### Bước 2 — Chuẩn bị ao sen

Khi nhấn bắt đầu:

1. Kiểm tra danh sách có ít nhất một tên hợp lệ.
2. Khóa danh sách và số lượng ếch trong suốt vòng chơi để tránh thay đổi giữa chừng.
3. Tạo ngẫu nhiên thứ tự loại học sinh bằng thuật toán Fisher–Yates hoặc phương pháp ngẫu nhiên tương đương.
4. Tạo đủ số ếch và lá sen theo lựa chọn.
5. Gán mỗi tên vào một côn trùng được chọn ngẫu nhiên từ nhiều loại côn trùng, nhưng giữ nhãn tên đọc rõ và gắn đúng với đối tượng.
6. Phân bố côn trùng vào vùng bay phía trên ao, tránh đặt tất cả chồng lên nhau ở khung hình đầu tiên.
7. Bắt đầu bộ đếm ngay khi người dùng khởi chạy vòng chơi. Không bắt buộc một màn đếm `3-2-1` riêng vì màn đó có thể làm sai cảm nhận về thời lượng đã chọn.

### Bước 3 — Giai đoạn săn tên

- Đồng hồ hiển thị rõ, dễ đọc ở phần trên giao diện.
- Côn trùng bay theo các quỹ đạo mềm mại, khác nhau, có đổi hướng bất ngờ nhưng không rung giật.
- Các chú ếch thực hiện hoạt ảnh chờ, nhìn theo mục tiêu, nhún người, nhảy ngắn và đớp.
- Khi tên bị bắt, chỉ loại đúng mục tiêu đang được hệ thống chọn; tên biến mất bằng một hoạt ảnh ngắn.
- Không để hai chú ếch cùng bắt một tên.
- Những tên còn lại tiếp tục di chuyển. Không để các tên bay ra ngoài vùng nhìn thấy.
- Cho phép tạm dừng: đồng hồ và hoạt ảnh gameplay phải dừng đồng bộ. Khi tiếp tục, chúng chạy lại từ trạng thái trước đó.

### Bước 4 — Hết giờ và công bố kết quả

Khi bộ đếm về 0:

1. Dừng timer ngay, không để số âm.
2. Khóa mọi sự kiện đớp mới để tránh thay đổi kết quả nhiều lần.
3. Kết thúc nhanh các hoạt ảnh đang dang dở theo một chuyển cảnh mượt.
4. Làm mờ hoặc đưa các tên không thắng ra khỏi vùng trung tâm.
5. Đưa duy nhất tên người thắng vào chính giữa, phóng lớn và giữ cố định đủ lâu để cả lớp đọc được.
6. Phát âm thanh chiến thắng một lần; cho ếch nhảy mừng và tạo một lượng confetti nhỏ, vừa phải.
7. Hiện nút **CHƠI LẠI** và **QUAY VỀ CÀI ĐẶT**.

**Ràng buộc thời gian:** Thời gian được chọn 5–30 giây là thời lượng của giai đoạn săn tên. Hoạt cảnh công bố kết quả là phần kết thúc cố định, đồng hồ đã dừng và không cộng thêm thời gian chơi.

### Bước 5 — Chơi lại

- Chơi lại dùng danh sách hiện tại, nhưng phải tạo thứ tự ngẫu nhiên mới.
- Không lặp lại kết quả vòng trước theo mặc định.
- Không nhân đôi côn trùng, ếch, âm thanh hoặc bộ đếm sau nhiều lần chơi.
- Khi quay lại cài đặt, mở khóa danh sách để giáo viên sửa hoặc dán danh sách khác.

---

## 4. QUY TẮC THỜI GIAN VÀ CHỌN NGƯỜI THẮNG

### 4.1. Bộ đếm ngược

- Giá trị tối thiểu: **5 giây**.
- Giá trị tối đa: **30 giây**.
- Mặc định: **15 giây**.
- Nút lựa chọn nhanh: `5s`, `10s`, `15s`, `20s`, `25s`, `30s`.
- Nếu dùng thanh trượt, bước nhảy là 1 giây; giá trị vẫn phải được giới hạn trong khoảng 5–30.
- Hiển thị dạng `00:15` hoặc `15 giây` với cỡ chữ lớn, tương phản tốt.
- Dùng thời gian thực (`performance.now()` hoặc deadline dựa trên đồng hồ đơn điệu) để tránh timer chậm do frame rate thấp.
- Không chỉ giảm biến timer một giây trong mỗi `setInterval` rồi giả định chính xác; khi cập nhật, tính thời gian còn lại từ thời điểm kết thúc dự kiến.
- Khi pause, ghi nhận thời gian còn lại và thời điểm pause; khi resume, tính lại deadline. Không được tiếp tục trừ thời gian khi pause.
- Bảo đảm hàm kết thúc vòng chỉ chạy một lần, kể cả khi callback timer và animation trùng thời điểm.

### 4.2. Nguyên tắc chọn ngẫu nhiên công bằng

Đây là trò chơi chọn học sinh, vì vậy thuật toán chọn và hoạt ảnh phải được tách riêng.

- Mỗi hàng tên được chuyển thành một mục dữ liệu có `id` riêng, ví dụ `student-001`, `student-002`. Hai học sinh trùng tên vẫn là hai mục riêng.
- Tạo thứ tự ngẫu nhiên bằng Fisher–Yates trên các mục có `id`.
- Tên nằm cuối cùng trong thứ tự loại là người chiến thắng.
- Các hoạt ảnh đớp mô phỏng lần lượt loại tên theo thứ tự đã định; không chọn mục tiêu chỉ dựa vào côn trùng đang gần ếch nhất.
- Nếu cần tăng cảm giác tự nhiên, có thể tạo một thứ tự loại ngẫu nhiên, sau đó phân bổ thời điểm xuất hiện của các lần đớp trong thời lượng được chọn. Không thay đổi thứ tự thắng sau khi animation đã bắt đầu.
- Nếu số lượng học sinh lớn nhưng thời lượng chỉ 5 giây, sử dụng hoạt cảnh loại nhanh theo cụm hoặc montage gọn, nhưng vẫn giữ được ý nghĩa “mỗi tên bị loại đúng một lần”. Tránh bắt buộc từng tên phải có hoạt cảnh đớp kéo dài làm timer vượt giới hạn.
- Khi đồng hồ về 0, đảm bảo đúng một tên được công bố. Không phụ thuộc vào việc animation có kịp vẽ hết mọi lần đớp hay không.

### 4.3. Trường hợp biên

- Danh sách rỗng: không bắt đầu; báo `Vui lòng nhập ít nhất một tên học sinh.`
- Có một tên: cho phép chơi; tên đó được công bố là người được chọn, kèm thông báo nhỏ rằng danh sách chỉ có một học sinh.
- Có dòng trống: bỏ qua, không tính là học sinh.
- Có tên trùng: mặc định giữ cả hai mục riêng và đếm riêng; khuyến nghị giáo viên dùng họ tên đầy đủ. Không xóa âm thầm.
- Danh sách rất dài: giới hạn an toàn ban đầu 100 tên để bảo vệ hiệu năng; nếu vượt giới hạn, hiển thị thông báo và yêu cầu giảm danh sách. Có thể tăng giới hạn sau khi tối ưu.
- Nhấn BẮT ĐẦU nhiều lần liên tiếp: chỉ mở một phiên chơi.
- Nhấn chơi lại nhiều lần: không tạo nhiều timer hoặc nhiều vòng hoạt ảnh cùng lúc.
- Đổi tab hoặc cửa sổ bị treo: khi tiếp tục hiển thị, thời gian phải được tính theo deadline; nếu đã hết giờ thì chuyển sang kết quả, không âm thầm cộng thời gian.

---

## 5. BỐ CỤC MÀN HÌNH

Thiết kế ưu tiên màn hình máy tính và máy chiếu tỷ lệ 16:9, vẫn co giãn trên màn hình nhỏ.

### 5.1. Màn hình cài đặt

Bố cục rõ ràng, nền ao sen vẫn thấy nhẹ ở phía sau nhưng không ảnh hưởng độ đọc của ô nhập. Các thiết lập nằm trong một bảng bán trong suốt hoặc nền sáng dễ nhìn.

Thành phần:

1. Tiêu đề `FROG POND 3D — AO SEN SĂN TÊN`.
2. Ô dán danh sách học sinh, đủ lớn cho 30–50 dòng.
3. Dòng trạng thái số lượng đã nhận dạng.
4. Bộ chọn số lượng ếch `1–8`.
5. Bộ chọn thời lượng `5–30 giây`.
6. Điều khiển âm lượng/tắt tiếng.
7. Nút bắt đầu nổi bật.

Không chiếm phần lớn màn hình bằng các cài đặt trang trí. Giáo viên phải hiểu cách sử dụng chỉ sau vài giây.

### 5.2. Màn hình trò chơi

Chia cảnh theo chiều ngang:

- **Vùng giao diện trên cùng (khoảng 10–15% chiều cao):** tiêu đề nhỏ, đồng hồ đếm ngược, số tên còn lại nếu phù hợp.
- **Vùng bay (khoảng 45–55% chiều cao):** tên học sinh gắn với các côn trùng bay; là vùng cần độ đọc cao nhất.
- **Vùng ao sen (khoảng 30–40% chiều cao):** mặt nước, lá sen và ếch.
- **Thanh điều khiển:** nút tạm dừng/tiếp tục, âm thanh và về cài đặt; dùng icon kèm tooltip hoặc nhãn để tránh hiểu lầm.

Tỷ lệ này là mốc thiết kế, được phép điều chỉnh khi cần để tránh chồng lấn.

### 5.3. Màn hình công bố kết quả

- Nền ao sen chuyển sang ánh sáng ấm hơn một chút.
- Chỉ giữ một tên lớn ở khu vực trung tâm.
- Tiêu đề đề xuất: `HÔM NAY, CHÚNG TA CHỌN BẠN...`.
- Tên người thắng là thành phần chữ lớn nhất.
- Dòng phụ: `Đến lượt bạn rồi!` hoặc `Chúc mừng!` theo chế độ trò chơi.
- Ếch nhảy mừng ở phần dưới, không chồng lên tên.
- Confetti hoặc đom đóm chỉ xuất hiện ngắn, không che tên.
- Có nút `CHƠI LẠI` và `QUAY VỀ CÀI ĐẶT`.

### 5.4. Quy tắc tương phản và đọc tên

- Nhãn tên luôn quay về camera hoặc luôn được vẽ theo hướng camera.
- Chữ có nền tương phản, đường viền hoặc bóng rất nhẹ để đọc trên nền sáng và tối.
- Không để nhãn tự xoay 3D theo thân côn trùng đến mức chữ nghiêng hoặc bị lộn ngược.
- Không thu nhỏ chữ đến mức không đọc được khi danh sách có nhiều học sinh.
- Tự giảm độ lớn nhãn hoặc phân bố thành nhiều lớp bay nếu số lượng cao, nhưng không làm mất dấu tiếng Việt.
- Tránh để côn trùng đi qua sau một đối tượng lớn hoặc ra ngoài khung hình. Nhãn có thể tránh nhau bằng lực đẩy nhẹ, nhưng chuyển động phải tự nhiên, không thành sơ đồ có tổ chức cứng nhắc.

---

## 6. THIẾT KẾ AO SEN 3D

### 6.1. Bối cảnh

Tạo một ao sen có chiều sâu và ánh sáng tự nhiên cách điệu:

- Mặt nước xanh ngọc/xanh lam lục, chuyển động gợn sóng nhẹ.
- Lá sen nhiều kích cỡ, bề mặt có độ cong và gân lá tinh tế.
- Một vài bông sen hồng/trắng ở hậu cảnh.
- Bờ ao có cỏ, đá nhỏ hoặc lau sậy, đặt ở rìa cảnh.
- Có phản chiếu và bóng mềm nhưng không cần mô phỏng chất lỏng vật lý nặng.
- Ánh sáng ấm dịu, có chiều sâu trường nhìn vừa phải; không dùng blur mạnh khiến tên bị mờ.
- Có thể có đom đóm hoặc bướm trang trí ở xa, nhưng không được nhầm với các côn trùng đang mang tên học sinh.

### 6.2. Camera

- Camera cố định gần chính diện, hơi cao hơn mặt ao để thấy được mặt nước và các lá sen.
- Góc nhìn 3/4 nhẹ, không quá xiên.
- Tránh quay camera liên tục, rung camera hoặc zoom bất ngờ khi chơi bình thường.
- Khi công bố người thắng, chỉ zoom nhẹ hoặc làm mờ hậu cảnh vừa phải; tên vẫn sắc nét.
- Bố cục phải hoạt động tốt ở 16:9 và có phương án responsive khi cửa sổ hẹp hơn.

### 6.3. Lá sen và bố trí ếch

Mỗi ếch có một lá sen chính. Số lá sen chính bằng số lượng ếch đã chọn.

- 1 ếch: một lá sen lớn ở giữa.
- 2 ếch: hai lá cân đối trái/phải.
- 3 ếch: bố trí cân đối, khoảng cách đều.
- 4–5 ếch: dàn theo chiều ngang, tự co giãn kích thước.
- 6–8 ếch: có thể dùng bố cục so le theo hai hàng hoặc cong nhẹ theo bờ ao, không chen chúc.

Lá sen nhấp nhô nhẹ. Khi ếch đáp xuống, lá sen lún xuống một chút rồi nảy trở lại, tạo cảm giác có trọng lượng. Tạo gợn nước nhỏ nơi lá tiếp xúc mặt nước.

### 6.4. Chất lượng và hiệu năng

- Dùng đèn, bóng đổ và vật liệu vừa phải; ưu tiên tốc độ ổn định trên laptop giáo viên.
- Không bắt buộc tải môi trường 3D ngoài hoặc model dung lượng lớn từ mạng.
- Nếu không có model bên ngoài, dựng các đối tượng bằng hình học Three.js có tổ chức, vật liệu đẹp và silhouette rõ ràng.
- Hạn chế hiệu ứng hậu kỳ như bloom/DOF nặng; nếu dùng phải có phương án tắt khi máy yếu.
- Tạo chuyển động dựa trên delta time, không phụ thuộc thiết bị chạy 30 hay 60 FPS.

---

## 7. NHÂN VẬT ẾCH

### 7.1. Thiết kế ngoại hình

Các chú ếch là nhân vật chính ở nửa dưới màn hình:

- Đầu tương đối lớn, mắt tròn có con ngươi chuyển động.
- Thân xanh lục, bụng sáng hơn.
- Chân trước nhỏ, chân sau khỏe và có thể co lại khi chuẩn bị nhảy.
- Miệng rộng, có thể mở ra; lưỡi vươn nhanh trong hoạt cảnh đớp.
- Chất liệu da hơi bóng nhưng không quá nhựa.
- Mỗi con có biến thể nhẹ về sắc xanh, đốm hoặc biểu cảm để phân biệt nhưng vẫn đồng nhất phong cách.

Không dùng hình ếch phẳng hoặc emoji làm nhân vật chính. Nếu không có model 3D, dựng ếch bằng nhóm mesh hình cầu/ellipsoid và hình học đơn giản có khớp hoạt ảnh.

### 7.2. Trạng thái hoạt ảnh

Tạo state machine hoặc hệ thống hoạt ảnh có trạng thái rõ ràng:

1. `IDLE`: chớp mắt, thở nhẹ, đầu và bụng chuyển động tinh tế.
2. `LOOK_AT_TARGET`: mắt/đầu hướng về một côn trùng mục tiêu.
3. `PREPARE_JUMP`: hạ thân, co chân sau, hơi nghiêng về phía trước.
4. `JUMP`: nhảy theo quỹ đạo vòng cung ngắn.
5. `LAND`: đáp xuống lá sen; lá sen lún, nước gợn sóng.
6. `PREPARE_CATCH`: mở miệng và hướng về nhãn tên được chọn.
7. `TONGUE_CATCH`: lưỡi vươn nhanh, tạo đường chuyển động rõ.
8. `EAT/REACT`: miệng đóng lại, nuốt hoặc chớp mắt vui vẻ.
9. `CELEBRATE`: nhảy mừng ngắn khi có người thắng.

Mỗi hoạt ảnh có easing mượt; không teleport đột ngột. Các trạng thái phải kết thúc đúng cách và quay về `IDLE` nếu vòng chơi tiếp tục.

### 7.3. Hành vi

- Ếch thỉnh thoảng kêu hoặc chớp mắt khi đang chờ.
- Khi một côn trùng được chọn làm mục tiêu, ếch hướng ánh nhìn về nó trong thời gian ngắn.
- Có thể luân phiên ếch nào thực hiện lần bắt tiếp theo, để nhiều nhân vật cùng tham gia.
- Chỉ một sự kiện đớp được phép nhận quyền loại một `studentId` nhất định.
- Khi ếch nhảy, không để nó che đồng hồ hoặc khu vực trung tâm của tên chiến thắng.
- Không cần mô phỏng sinh học phức tạp; ưu tiên biểu cảm rõ, chuyển động có trọng lượng và vui nhộn.

### 7.4. Sự phong phú vừa đủ

Thêm biến thể nhỏ: một chú ếch có thể nghiêng đầu, một con chớp mắt chậm, một con nhún nhẹ. Không cho tất cả ếch nhảy/kêu cùng lúc theo cùng nhịp vì sẽ trông máy móc và tạo hỗn loạn âm thanh.

---

## 8. CÔN TRÙNG MANG TÊN HỌC SINH

### 8.1. Loại côn trùng

Hỗ trợ nhiều kiểu nhân vật bay hoạt hình, chọn ngẫu nhiên hoặc phân bố lần lượt:

- Ong mật: thân vàng-đen, hai cánh trong.
- Chuồn chuồn: thân dài, bốn cánh mảnh, bay linh hoạt.
- Bọ rùa: thân tròn đỏ có chấm đen, cánh mở/đóng nhẹ.
- Bướm: cánh màu nhẹ, vỗ mềm.
- Ruồi hoạt hình: mắt lớn, cánh trong, bay nhanh hơn một chút.
- Bọ cánh cứng nhỏ: thân bóng, cánh mở nhẹ khi bay.

Các kiểu côn trùng cần dễ phân biệt bằng hình dáng/màu sắc, nhưng không dùng bảng màu chói loạn. Tránh đặt nhiều vật thể trang trí giống côn trùng mang tên ở sát vùng bay vì học sinh sẽ khó phân biệt đối tượng tham gia.

### 8.2. Nhãn tên

Mỗi côn trùng gồm hai lớp logic:

- `insect body`: mô hình 3D côn trùng và cánh.
- `name label`: nhãn tên 2D/HTML hoặc sprite luôn quay về camera.

Nhãn tên phải gắn đúng vào côn trùng qua một điểm neo; khi côn trùng di chuyển, tên đi cùng nó, không bị trễ hoặc trôi khỏi thân. Đặt nhãn phía dưới hoặc phía trên thân tùy bố trí để không che mắt/cánh. Nền nhãn sáng hoặc bán trong suốt, chữ đậm, có khoảng đệm.

Các tên được phép bay theo nhiều độ cao và quỹ đạo, nhưng nhãn luôn đọc được; không xoay nhãn theo roll của côn trùng.

### 8.3. Chuyển động bay

Kết hợp các chuyển động nhỏ:

- Quỹ đạo cong hoặc hình số 8 không đều.
- Dao động lên xuống nhẹ.
- Đổi hướng mềm bằng nội suy.
- Thỉnh thoảng tăng tốc một chút rồi chậm lại.
- Cánh vỗ liên tục bằng xoay cánh có biên độ vừa phải.
- Thân có thể nghiêng theo hướng bay một ít, nhưng nhãn không nghiêng theo thân.

Mỗi côn trùng có seed hoặc tham số chuyển động riêng để tránh bay đồng bộ. Dùng vùng bay giới hạn; nếu đến gần mép thì chuyển hướng về trong thay vì biến mất khỏi khung hình.

### 8.4. Tránh chồng nhãn

- Khi bắt đầu, phân phối tên theo lưới mềm hoặc các điểm khởi đầu được xáo trộn để tránh chồng tất cả nhãn.
- Trong khi bay, dùng lực đẩy nhẹ giữa các nhãn gần nhau hoặc bố trí theo tầng độ cao.
- Không cần bảo đảm khoảng cách hoàn hảo trong mọi khung hình, nhưng tránh chồng hai tên lâu hơn một khoảnh khắc.
- Khi số tên còn ít, tăng nhẹ khoảng cách và mở rộng quỹ đạo để tạo cảm giác cao trào.
- Khi chỉ còn một tên, nó cần được chuyển rõ về vùng trung tâm trước lúc công bố.

### 8.5. Côn trùng bị ếch bắt

Khi hệ thống phát lệnh bắt một học sinh:

1. Chọn đúng côn trùng gắn với `studentId` đã được xác định trong thứ tự loại.
2. Tạm thời giảm hoặc điều chỉnh quỹ đạo để ếch hướng lưỡi đến nhãn mục tiêu.
3. Phát hoạt ảnh lưỡi theo một cung ngắn, nhanh.
4. Tại thời điểm chạm nhãn, phát hiệu ứng nhỏ và chuyển trạng thái mục tiêu sang `CAUGHT`.
5. Thu gọn/fade đối tượng, không để tên bay lại.
6. Kết thúc hoạt ảnh, giải phóng mục tiêu cho hành động tiếp theo.

Không được để cả con côn trùng hoặc nhãn tên biến mất trước khi lưỡi chạm đến; phải có cảm giác nhìn thấy ếch bắt được mồi.

---

## 9. ÂM THANH

### 9.1. Lớp âm thanh

Thiết kế âm thanh theo sự kiện để tránh tất cả âm thanh phát cùng lúc:

| Sự kiện | Âm thanh | Cường độ tương đối |
|---|---|---|
| Môi trường ao | Nước nhẹ, chim xa hoặc âm thanh thiên nhiên rất nhỏ | Thấp |
| Ếch chờ | Tiếng ếch “ộp ộp/quạc quạc” ngắn, thỉnh thoảng | Thấp–vừa |
| Cánh côn trùng | Vo ve/vù nhẹ, có giới hạn âm lượng | Rất thấp |
| Ếch nhảy | Âm bật nhẹ, có thể kèm nước động | Vừa |
| Đớp mồi | “Chụp/chẹp” vui nhộn, rõ | Cao hơn tiếng nền |
| Bắt thành công | Pop ngắn | Vừa |
| Còn ít tên | Nhạc hồi hộp ngắn hoặc nhịp nhẹ | Thấp–vừa |
| Công bố người thắng | Âm thanh chiến thắng ngắn | Nổi bật |
| Ếch ăn mừng | Một tiếng ộp vui hoặc hiệu ứng nhảy | Vừa |

### 9.2. Tránh hỗn loạn âm thanh

- Không phát tiếng vo ve riêng với âm lượng lớn cho từng tên học sinh.
- Dùng tối đa một lớp nền côn trùng tổng hợp hoặc chỉ phát tiếng vo ve gần mục tiêu.
- Giới hạn tần suất tiếng ếch; không để các con kêu liên tục chồng lên nhau.
- Âm thanh đớp phải đồng bộ với khoảnh khắc lưỡi chạm mục tiêu.
- Âm thanh chiến thắng chỉ phát một lần mỗi vòng.
- Khi tạm dừng, ngắt hoặc giảm các âm thanh gameplay đúng cách; khi tiếp tục, không phát chồng các âm đã bỏ lỡ.
- Có nút tắt toàn bộ âm thanh và thanh điều chỉnh âm lượng tổng.

### 9.3. Phương án không có file âm thanh ngoài

Không được dùng đường dẫn âm thanh giả hoặc phụ thuộc URL không tồn tại. Nếu chưa có file âm thanh, tạo hiệu ứng đơn giản bằng Web Audio API (oscillator, envelope, noise đã lọc) làm phương án dự phòng. Tổ chức âm thanh trong một `AudioManager` hoặc module tương tự để có thể thay bằng file WAV/MP3 sau này.

Âm thanh tự tạo chỉ là phương án an toàn để ứng dụng có âm thanh ngay từ đầu; không tuyên bố chúng là bản ghi âm thật. Nút âm thanh phải hoạt động sau lần tương tác đầu tiên của người dùng để tuân thủ chính sách autoplay của trình duyệt.

---

## 10. GIAO DIỆN VÀ ĐIỀU KHIỂN

### 10.1. Nút cần có

- **BẮT ĐẦU SĂN TÊN** — kiểm tra đầu vào và bắt đầu vòng.
- **TẠM DỪNG** — đóng băng timer, chuyển động gameplay và các sự kiện loại tên.
- **TIẾP TỤC** — tiếp tục đúng trạng thái cũ, không khởi tạo vòng mới.
- **ÂM THANH BẬT/TẮT** — đổi trạng thái thực tế của âm thanh.
- **CHƠI LẠI** — quay một vòng mới bằng danh sách đã lưu, thứ tự ngẫu nhiên mới.
- **QUAY VỀ CÀI ĐẶT** — kết thúc/thoát vòng và mở màn hình danh sách.
- **XÓA DANH SÁCH** — hỏi xác nhận trước khi xóa toàn bộ tên.

Không tạo nút trang trí không hoạt động. Các nút phải có trạng thái disabled hợp lý khi vòng chơi đang diễn ra hoặc đã kết thúc.

### 10.2. Trạng thái ứng dụng

Dùng state machine cấp cao:

- `SETUP` — nhập danh sách và chọn cấu hình.
- `READY` — dữ liệu hợp lệ, sẵn sàng chạy.
- `PLAYING` — timer đang đếm, hoạt ảnh săn tên hoạt động.
- `PAUSED` — timer và hoạt ảnh gameplay tạm dừng.
- `REVEALING` — thời gian đã dừng, hoạt cảnh công bố đang diễn ra.
- `RESULT` — tên người thắng được hiển thị, chờ chơi lại hoặc quay về cài đặt.

Ngăn chuyển trạng thái không hợp lệ, ví dụ không cho pause sau khi kết quả đã khóa hoặc chạy hai vòng cùng lúc.

### 10.3. Trạng thái từng học sinh

Mỗi học sinh có `id`, `name`, `insectType` và trạng thái:

- `FLYING` — đang tham gia.
- `TARGETED` — đang được hoạt ảnh bắt mồi xử lý.
- `CAUGHT` — đã bị loại khỏi vòng.
- `WINNER` — học sinh được chọn cuối cùng.

Chỉ một đối tượng được ở trạng thái `TARGETED` trong cùng một sự kiện bắt; có thể có nhiều hoạt ảnh phụ, nhưng quyền loại tên phải được tuần tự hóa để tránh race condition.

---

## 11. LƯU DANH SÁCH

- Lưu danh sách gần nhất trong `localStorage` theo cách đơn giản, để giáo viên không phải dán lại sau mỗi lần tải lại trang.
- Khi mở ứng dụng, khôi phục danh sách đã lưu và cho phép chỉnh sửa.
- Không gửi danh sách học sinh lên máy chủ nếu không có yêu cầu rõ ràng; trò chơi nên hoạt động hoàn toàn tại trình duyệt.
- Có nút xóa danh sách và xác nhận thao tác.
- Không lưu lịch sử kết quả học sinh mặc định; mục tiêu chỉ là chọn trong phiên hiện tại.
- Không đưa danh sách tên vào log console không cần thiết.

---

## 12. ĐỀ XUẤT CÔNG NGHỆ

Ưu tiên một web app nhẹ, dễ chạy và dễ chỉnh sửa:

- **Vite + React + TypeScript** — cấu trúc ứng dụng và build.
- **Three.js** — render cảnh 3D.
- **React Three Fiber** — kết nối Three.js với React nếu cần.
- **@react-three/drei** — chỉ sử dụng các tiện ích cần thiết như HTML label luôn hướng camera, không kéo theo quá nhiều tính năng không dùng.
- **Web Audio API** — âm thanh sự kiện nếu chưa có file ngoài.
- **CSS** — bảng cài đặt, timer, nút và màn hình kết quả.
- **localStorage** — lưu danh sách ở trình duyệt.

Có thể sử dụng cấu trúc component/module như sau (được phép điều chỉnh miễn giữ ranh giới trách nhiệm rõ ràng):

```text
src/
  app/
    App.tsx
    gameState.ts
  components/
    SetupPanel.tsx
    GameHUD.tsx
    WinnerOverlay.tsx
    GameControls.tsx
  scene/
    PondScene.tsx
    PondWater.tsx
    LilyPad.tsx
    Frog.tsx
    Insect.tsx
    NameLabel.tsx
  game/
    parseStudentList.ts
    shuffleStudents.ts
    gameScheduler.ts
    timer.ts
    types.ts
  audio/
    AudioManager.ts
  styles/
    global.css
```

Đây là cấu trúc gợi ý, không phải yêu cầu cứng. Có thể đổi cách tổ chức nếu code dễ bảo trì hơn.

### 12.1. Kỹ thuật triển khai cần chú ý

- Không tạo mesh mới trong mỗi frame render; tái sử dụng geometry/material khi phù hợp.
- Tách trạng thái game khỏi hoạt ảnh render để animation không làm rối logic chọn người.
- Cập nhật chuyển động bằng `deltaTime`.
- Dùng ref hoặc bộ scheduler có thể hủy để quản lý animation events.
- Hủy timer, audio nodes và listener khi kết thúc vòng hoặc unmount component.
- Tránh `setInterval` dày đặc cho hàng chục côn trùng; dùng `useFrame`/animation loop và state tối thiểu.
- Khi tab bị ẩn, không được làm lệch kết quả: timer vẫn phải được tính theo deadline, rồi xử lý kết thúc đúng một lần.
- Chạy được không cần API key, backend hoặc gọi mô hình AI lúc trò chơi đang chạy. AI Studio được dùng để tạo mã nguồn; bản game không cần gọi Gemini để chọn tên.

---

## 13. LOGIC THỜI GIAN VÀ THỨ TỰ LOẠI — PSEUDOCODE

Pseudocode dưới đây giải thích hành vi cần đạt được; hãy triển khai bằng TypeScript thực tế và xử lý đầy đủ lỗi.

```text
parse names from textarea
remove blank rows
create one Student object per valid row with unique id
if names.length == 0: show validation error
else:
    randomizedOrder = FisherYatesShuffle(copy(names))
    winner = last student in randomizedOrder
    eliminationOrder = all students except winner
    create insects and attach each name label
    create configured number of frogs and lily pads
    start timer with selected duration (5..30 seconds)
    schedule visual catch events in eliminationOrder sequence

on timer reaches zero:
    if round already finalized: return
    set round finalized = true
    stop timer
    cancel pending catch events
    ensure no student has been caught twice
    visually clear/fade non-winner names without changing winner
    show winner centered
    play victory sound once
    set phase = RESULT
```

Trong triển khai thực tế, có thể hoàn tất một số hoạt ảnh loại trước khi hết giờ. Mọi sự kiện loại phải đọc `eliminationOrder` đã cố định ngay từ đầu, không tự chọn lại mục tiêu theo vị trí vật thể. Khi bộ đếm kết thúc, kết quả luôn là `winner` đã xác định, bất kể frame rate hoặc animation đang ở khung nào.

**Lưu ý công bằng:** Đây là chọn ngẫu nhiên về mặt thuật toán, không phải mô phỏng vật lý nơi con ếch bắt con côn trùng gần nhất. Không để tốc độ côn trùng, màu sắc, loại côn trùng hoặc vị trí tên quyết định khả năng được chọn.

---

## 14. QUY TẮC HOẠT ẢNH THEO THỜI GIAN

Thời lượng tổng của giai đoạn săn do người dùng chọn là 5–30 giây. Thay đổi nhịp độ theo thời gian còn lại để tạo cao trào nhưng vẫn không vượt giới hạn:

- **Đầu vòng:** Côn trùng bay tương đối rộng, ếch quan sát và kêu thỉnh thoảng.
- **Giữa vòng:** Có các lần đớp có khoảng nghỉ; mỗi lần bắt tạo một điểm nhấn âm thanh/hình ảnh.
- **Khi còn khoảng 5 giây:** Côn trùng bay gần trung tâm hơn một chút, nhạc hồi hộp tăng nhẹ, nhưng tên vẫn phải đọc được.
- **Khi còn 2–3 giây:** Tăng nhịp hoạt cảnh; tránh rung lắc hoặc nhấp nháy nhanh gây khó chịu.
- **Khi về 0:** Timer dừng chính xác; chuyển sang hoạt cảnh công bố. Nếu còn tên chưa kịp bị đớp theo lịch animation, dùng montage ngắn để đưa chúng khỏi vùng trung tâm nhưng tuyệt đối không thay đổi tên chiến thắng đã xác định.

Ở chế độ 5 giây với lớp đông, có thể sử dụng bắt theo cụm hoặc hoạt ảnh loại nhanh. Không để việc cố hiển thị đủ mọi hoạt ảnh bắt khiến bộ đếm kéo dài hơn số giây đã chọn.

---

## 15. TIÊU CHÍ KIỂM THỬ VÀ NGHIỆM THU

Chỉ coi phiên bản đầu tiên hoàn tất khi vượt qua các mục sau.

### 15.1. Nhập danh sách

- [ ] Dán 30 tên theo từng dòng tạo đúng 30 đối tượng.
- [ ] Tên có họ, tên đệm và tên chính vẫn là một học sinh.
- [ ] Dòng trống không tạo côn trùng.
- [ ] Dấu tiếng Việt hiển thị đúng.
- [ ] Sửa/xóa danh sách trước khi bắt đầu được.
- [ ] Danh sách khôi phục sau khi tải lại trang nếu tính năng lưu đã bật.
- [ ] Tên trùng được giữ thành hai mục riêng, không tự xóa âm thầm.

### 15.2. Điều khiển

- [ ] Có thể chọn 1–8 ếch; mặc định 3.
- [ ] Số lá sen chính bằng số ếch.
- [ ] Chỉ có thể chọn thời gian 5–30 giây.
- [ ] Không xuất hiện lựa chọn 31 giây hoặc cao hơn.
- [ ] Đồng hồ chạy gần đúng thời gian thực đã chọn và không xuống số âm.
- [ ] Pause dừng đồng hồ; Resume tiếp tục từ thời gian còn lại.
- [ ] Tắt âm thanh làm im mọi âm thanh gameplay.

### 15.3. Gameplay và chọn tên

- [ ] Tên học sinh gắn chặt với đúng côn trùng khi bay.
- [ ] Côn trùng không bay khỏi màn hình.
- [ ] Nhãn tên không lộn ngược, luôn hướng về camera và có thể đọc.
- [ ] Ếch có hoạt ảnh chờ, nhìn theo, nhảy, đáp và đớp.
- [ ] Lá sen phản ứng nhẹ khi ếch đáp xuống.
- [ ] Mỗi mục học sinh chỉ bị loại tối đa một lần.
- [ ] Không có hai ếch cùng loại một mục học sinh trong cùng sự kiện.
- [ ] Thời gian bằng 0 sẽ khóa game và hiện đúng một người thắng.
- [ ] Chạy lại tạo thứ tự ngẫu nhiên mới, không tái sử dụng kết quả cũ theo mặc định.
- [ ] Với chỉ một học sinh, trò chơi xử lý đúng và không lỗi.

### 15.4. Hình ảnh và âm thanh

- [ ] Bối cảnh thực sự là cảnh 3D có chiều sâu, không phải ảnh nền tĩnh.
- [ ] Ao sen, nước, lá, ếch và côn trùng đều có chuyển động phù hợp.
- [ ] Tên là tâm điểm thị giác, không bị hiệu ứng che khuất.
- [ ] Không có số lượng hạt sáng/confetti quá lớn.
- [ ] Âm thanh đớp đồng bộ với tiếp xúc.
- [ ] Âm thanh chiến thắng chỉ phát một lần.
- [ ] Không tự động phát âm thanh lớn trước khi có tương tác.
- [ ] Nút bật/tắt tiếng hoạt động ở cả khi đang chơi và khi công bố kết quả.

### 15.5. Kỹ thuật

- [ ] Ứng dụng chạy bằng hướng dẫn dev server của dự án.
- [ ] Build production thành công.
- [ ] Không có lỗi runtime nghiêm trọng trong console.
- [ ] Không có lỗi khi nhấn liên tiếp Bắt đầu/Chơi lại/Tạm dừng.
- [ ] Timer, animation scheduler và audio được dọn dẹp khi đổi màn hình.
- [ ] Không cần API key hoặc server để chơi vòng chọn tên.
- [ ] Không có nút giả, TODO quan trọng hoặc link âm thanh/model bị hỏng.

---

## 16. CHẤT LƯỢNG THIẾT KẾ — CẦN TRÁNH

Không làm các lỗi sau:

- Không để toàn bộ tên học sinh chồng thành một cụm khó đọc.
- Không để nhãn tên quay xoay ngẫu nhiên như vật thể 3D thông thường.
- Không cho ếch nhảy liên tục khiến mắt người xem không tập trung vào tên.
- Không để tất cả côn trùng phát tiếng vo ve lớn cùng lúc.
- Không phủ confetti hoặc hiệu ứng phát sáng lên tên người thắng.
- Không cho timer chạy sai vì thiết bị giảm FPS.
- Không chọn người thắng theo côn trùng ở gần ếch nhất.
- Không để game chạy mãi vì hoạt ảnh chưa kết thúc.
- Không để một lần bắt mồi loại nhiều tên ngoài dự kiến.
- Không chỉ dựng cảnh 3D mà thiếu chức năng nhập tên, thời gian và kết quả.
- Không dùng emoji làm thay thế lâu dài cho mô hình 3D của ếch/côn trùng.
- Không tự thêm đăng nhập, tài khoản, cơ sở dữ liệu cloud hoặc API không cần thiết.

---

## 17. PROMPT TRIỂN KHAI DÙNG TRONG GOOGLE AI STUDIO

Sao chép toàn bộ phần prompt trong khung dưới đây, đồng thời đính kèm file Markdown này làm tài liệu đặc tả. Chọn mô hình lập trình/suy luận mạnh nhất đang hiển thị trong Google AI Studio.

```text
Bạn là kỹ sư phần mềm senior chuyên về React, TypeScript, Three.js và game 3D tương tác.

Hãy đọc toàn bộ file FROG_POND_GAME_SPEC.md và triển khai một ứng dụng web hoàn chỉnh có tên FROG POND 3D — AO SEN SĂN TÊN.

YÊU CẦU BẮT BUỘC:
1. Hãy tạo mã nguồn thật chạy được; không chỉ mô tả, không chỉ tạo hình minh họa, không chỉ trả pseudocode.
2. Tuân thủ file đặc tả, đặc biệt: nhập danh sách theo từng dòng; mỗi dòng không rỗng là một học sinh; số lượng ếch 1–8; timer 5–30 giây, mặc định 15 giây; ao sen 3D; nhiều loại côn trùng có cánh; nhãn tên luôn rõ; ếch nhảy và đớp; âm thanh có công tắc; kết quả cuối cùng nổi bật ở trung tâm.
3. Tách thuật toán chọn ngẫu nhiên khỏi hoạt ảnh. Tạo thứ tự chọn/loại một lần khi bắt đầu vòng; không chọn dựa vào vị trí va chạm hay tốc độ côn trùng. Mỗi học sinh có id riêng. Khi timer chạm 0, khóa vòng và công bố đúng một người thắng.
4. Timer phải tính theo thời gian thực, không lệ thuộc FPS; pause/resume đúng; không có timer hoặc sự kiện trùng lặp sau khi chơi lại.
5. Nếu không có model hoặc tệp âm thanh bên ngoài, tạo hình học 3D có tổ chức và hiệu ứng âm thanh dự phòng bằng Web Audio API. Không dùng URL giả và không để đối tượng chính thành emoji phẳng.
6. Ưu tiên chất lượng hình ảnh: ao nước có chiều sâu, lá sen cong, ếch hoạt hình 3D có mắt và lưỡi, côn trùng có cánh chuyển động, tên gắn đúng với côn trùng và luôn hướng camera. Tránh rối mắt; tên học sinh và tên người thắng phải dễ đọc khi chiếu trên lớp.
7. Làm đầy đủ giao diện tiếng Việt, có dấu, phản hồi lỗi, trạng thái loading nếu cần, các nút hoạt động thật, layout responsive và hiệu năng hợp lý.
8. Không thêm đăng nhập, API key, backend hoặc dịch vụ cloud không cần thiết. Lưu danh sách gần nhất tại localStorage.
9. Tạo cấu trúc component/module dễ bảo trì. Kiểm tra các ca biên trong file đặc tả.
10. Sau khi viết mã, tự chạy build/test nếu môi trường hỗ trợ, sửa mọi lỗi phát hiện được. Không kết luận là hoàn thành nếu build đang lỗi hoặc các nút chính chưa hoạt động.

THỨ TỰ THỰC HIỆN:
A. Xem cấu trúc dự án hiện có trước khi sửa; giữ lại thiết lập hợp lệ.
B. Lập kế hoạch ngắn rồi thực hiện trực tiếp trong dự án.
C. Xây dựng chức năng nhập danh sách, parser và thuật toán chọn trước.
D. Xây dựng cảnh Three.js/R3F, ếch, lá sen, côn trùng và nhãn tên.
E. Xây dựng timer, pause/resume, state machine và hoạt ảnh loại.
F. Xây dựng âm thanh, công bố kết quả và chơi lại.
G. Chạy build, sửa lỗi, rà soát các tiêu chí nghiệm thu.

KẾT QUẢ CUỐI:
- Ứng dụng chạy được trong Preview.
- Liệt kê các file chính đã tạo/sửa.
- Nêu chính xác lệnh chạy và lệnh build.
- Báo rõ những tiêu chí nào đã kiểm thử; không khẳng định đã kiểm thử nếu thực tế chưa chạy.
- Nếu có tiêu chí chưa hoàn thành, nói rõ và ưu tiên sửa trước khi bàn giao.
```

---

## 18. CÁCH DÙNG FILE ĐẶC TẢ

1. Mở Google AI Studio và tạo một ứng dụng/dự án mới có khả năng chỉnh sửa mã nguồn.
2. Chọn mô hình Gemini mạnh nhất đang có trong bộ chọn mô hình của tài khoản.
3. Đính kèm hoặc đưa nội dung file `FROG_POND_GAME_SPEC.md` vào ngữ cảnh dự án.
4. Gửi prompt ở Mục 17.
5. Sau khi AI tạo mã, yêu cầu nó chạy build, sửa lỗi và tự kiểm thử theo Mục 15. Không chỉ đánh giá bằng ảnh Preview đầu tiên.
6. Kiểm tra trực tiếp bằng danh sách 30 học sinh, 3 ếch, thời gian 10 giây và 30 giây; thử pause/resume, tắt âm thanh, chơi lại và tải lại trang.

**Gợi ý phiên bản đầu tiên:** Giữ phạm vi tập trung vào một cảnh ao sen, tối đa 8 ếch, tối đa 100 tên, timer 5–30 giây. Hoàn thiện sự ổn định và độ đọc của tên trước khi bổ sung những hiệu ứng trang trí nâng cao.

---

## 19. TÓM TẮT CẤU HÌNH ĐÃ CHỐT

| Hạng mục | Quy định |
|---|---|
| Tên game | FROG POND 3D — Ao Sen Săn Tên |
| Phong cách | 3D hoạt hình bán chân thực |
| Danh sách | Dán văn bản; mỗi dòng không rỗng là một học sinh |
| Côn trùng | Ong, chuồn chuồn, bọ rùa, bướm, ruồi hoạt hình, bọ cánh cứng |
| Số lượng ếch | 1–8, mặc định 3 |
| Số lá sen | Bằng số lượng ếch |
| Bộ đếm | 5–30 giây, mặc định 15 giây; không vượt 30 giây |
| Cách chọn | Xáo trộn ngẫu nhiên một lần; kết quả không phụ thuộc vật lý/animation |
| Kết thúc | Timer về 0 thì khóa vòng và công bố đúng một tên |
| Điều khiển | Bắt đầu, tạm dừng/tiếp tục, âm thanh, chơi lại, về cài đặt |
| Âm thanh | Ếch, cánh bay, nhảy, đớp, chiến thắng; có tắt tiếng và âm lượng |
| Lưu trữ | Danh sách gần nhất trong localStorage; không cần backend |
| Tiêu chuẩn hoàn thành | Chạy được, build không lỗi, đủ các tiêu chí nghiệm thu ở Mục 15 |

**Kết thúc đặc tả.**
