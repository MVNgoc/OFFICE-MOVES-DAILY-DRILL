/**
 * Script for the guided tour. Each step points at an element marked with a
 * `data-tour` attribute; a step without a target is shown as a centred card
 * (the welcome and the sign-off).
 */
export interface TourStep {
  /** CSS selector of the element to spotlight, or `null` for a centred card. */
  target: string | null
  title: string
  body: string
  /** Extra breathing room around the spotlight, in px. */
  padding?: number
}

export const TOUR_STEPS: readonly TourStep[] = [
  {
    target: null,
    title: 'CHÀO MỪNG!',
    body:
      'Office Moves là máy quay bài tập cho dân văn phòng: chọn thời gian rảnh, nhấn SPIN, ' +
      'và làm theo động tác máy chọn. Để mình dẫn bạn đi một vòng nhé — chỉ mất 30 giây.',
  },
  {
    target: '[data-tour="filters-time"]',
    title: 'CHỌN THỜI GIAN',
    body:
      'Bạn có bao nhiêu phút? 3, 5 hay 10. Con số này quyết định độ dài cả buổi tập, ' +
      'và máy sẽ tự chia thời lượng cho từng bài.',
  },
  {
    target: '[data-tour="filters-area"]',
    title: 'CHỌN KHU VỰC',
    body:
      'Đang mỏi cổ hay mỏi lưng? Bấm chọn nhóm cơ bạn muốn tập. ' +
      'Chọn nhiều cũng được — không chọn gì thì máy lấy tất cả.',
  },
  {
    target: '[data-tour="filters-difficulty"]',
    title: 'CHỌN ĐỘ KHÓ',
    body:
      'Đây là mức tối đa: 2 sao nghĩa là lấy cả bài 1 sao lẫn 2 sao. ' +
      'Dòng ngay dưới cho biết bộ lọc hiện khớp bao nhiêu bài.',
  },
  {
    target: '[data-tour="spin"]',
    title: 'NHẤN SPIN',
    body:
      'Trái tim của máy. Mỗi lần quay là một bài tập ngẫu nhiên trong bộ lọc của bạn. ' +
      'Không muốn rời tay khỏi bàn phím? Nhấn phím SPACE cũng quay được.',
    padding: 10,
  },
  {
    target: '[data-tour="display"]',
    title: 'MÀN HÌNH BÀI TẬP',
    body:
      'Sau khi quay, chỗ này hiện tên bài, hướng dẫn từng bước và một đồng hồ đếm ngược. ' +
      'Bấm [BẮT ĐẦU] để chạy đồng hồ, xong bài là có pháo giấy chúc mừng.',
  },
  {
    target: '[data-tour="session"]',
    title: 'TIẾN ĐỘ BUỔI TẬP',
    body:
      'Thanh này đầy dần theo từng bài bạn hoàn thành, cho tới khi đủ số phút đã chọn. ' +
      'Muốn làm lại từ đầu thì bấm "làm mới".',
  },
  {
    target: '[data-tour="terminal"]',
    title: 'KHUNG LỜI THOẠI',
    body: 'Máy nói chuyện với bạn ở đây: bài vừa quay, thời gian còn lại và lời động viên sau mỗi hiệp.',
  },
  {
    target: '[data-tour="streak"]',
    title: 'CHUỖI NGÀY TẬP',
    body:
      'Tập xong trong ngày thì bấm [ĐÁNH DẤU ĐÃ TẬP] để cộng streak. ' +
      'Nghỉ một ngày là chuỗi về 0, nên ráng giữ nhé! Dữ liệu lưu ngay trên máy bạn, không gửi đi đâu cả.',
  },
  {
    target: '[data-tour="dock"]',
    title: 'BẢNG NHÓM CƠ',
    body: 'Năm ô dưới thùng máy là năm nhóm cơ. Ô nào sáng vàng nghĩa là bài đang tập thuộc nhóm đó.',
  },
  {
    target: '[data-tour="help"]',
    title: 'XEM LẠI BẤT CỨ LÚC NÀO',
    body: 'Cần xem lại vòng hướng dẫn này? Nút [?] luôn nằm ở đây. Nút bên cạnh để bật/tắt âm thanh.',
    padding: 8,
  },
  {
    target: null,
    title: 'SẴN SÀNG CHƯA?',
    body: 'Vậy là xong! Chọn bộ lọc, nhấn SPIN và đứng dậy vận động thôi. Cột sống của bạn sẽ cảm ơn.',
  },
]
