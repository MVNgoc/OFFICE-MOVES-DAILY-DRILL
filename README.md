# OFFICE MOVES: DAILY DRILL

Máy quay bài tập ngẫu nhiên cho dân văn phòng, dựng theo phong cách pixel-art 8-bit.
Chọn bộ lọc, nhấn **SPIN**, nhận một bài tập tại chỗ kèm đồng hồ đếm ngược — và giữ streak mỗi ngày.

![Giao diện tham chiếu](public/assets/ui-mockup.png)

## Chạy dự án

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # bản production vào dist/
npm run lint
```

## Tech stack

| Thành phần | Lựa chọn |
| --- | --- |
| Framework | React 19 + Vite 8 + TypeScript |
| Styling | Tailwind CSS v4 (plugin `@tailwindcss/vite`) + CSS pixel-art thủ công |
| Font | `Press Start 2P` (tiêu đề ASCII), `Handjet` (chữ Việt), `VT323` (nội dung) |
| Âm thanh | Web Audio API — tổng hợp trực tiếp, không cần file audio |
| Hiệu ứng | `canvas-confetti` khi hoàn thành bài tập / tăng streak |

## Cấu trúc

```
src/
  App.tsx                 Bố cục 3 cột, state tổng, phím tắt [SPACE]
  types.ts                Kiểu dữ liệu dùng chung
  data/exercises.json     28 bài tập văn phòng (tiếng Việt)
  lib/
    exercises.ts          Lọc, chọn ngẫu nhiên, ánh xạ sprite, thời lượng gợi ý
    audio.ts              Hiệu ứng âm thanh chiptune (Web Audio API)
    storage.ts            Bọc localStorage an toàn + tiện ích ngày
  hooks/
    useSpin.ts            Vòng quay gacha với nhịp ease-out
    useTimer.ts           Đếm ngược theo deadline (đúng cả khi tab chạy nền)
    useStreak.ts          Streak theo ngày, tự reset khi bỏ lỡ
  components/
    Banner.tsx            Tiêu đề + công tắc âm thanh
    FilterPanel.tsx       THỜI GIAN / KHU VỰC / ĐỘ KHÓ
    Generator.tsx         Nút SPIN, màn hình quay, khung kết quả
    ExerciseCard.tsx      Chi tiết bài tập + chọn khối lượng
    Timer.tsx             Đồng hồ đếm ngược + điều khiển
    StreakPanel.tsx       Bộ đếm streak, mascot, nút đánh dấu
    Terminal.tsx          Hộp thoại kiểu RPG (gõ từng ký tự)
    ExerciseDock.tsx      Dãy icon bài tập dưới cùng
    Pixel.tsx             Sprite / Section / Stars dùng chung
```

## Tài nguyên pixel art

Sprite gốc nằm ở `assets-src/`, chia làm hai đợt:

**Đợt 1 — `area-sheet`, `character-asset`, `exercise-icon-row`, `spin-button-asset`,
`star-sheet`** (1408×768, canvas gốc **120×65**). Nền ca-rô bị *vẽ chết* vào ảnh
chứ không phải alpha thật, nên phải tách bằng chroma/độ sáng. Riêng nút SPIN phải
flood fill từ viền vì chữ kem trùng đúng màu ô ca-rô sáng.

**Đợt 2 — `main-model.png`** (1408×768, canvas gốc **240×131** — gấp đôi đợt 1).
Nền magenta đặc `#FF00FF` nên tách một bước là sạch. Sheet này có kèm chữ nhãn
(`SQUAT`, `PUSH-UP`, …) nên khi gán nhãn thành phần liên thông phải lọc thêm:
component nào không chứa pixel *tươi* (lum > 85 và chroma > 28) thì đó là chữ,
bỏ đi. Cách này tách đúng 14/14 sprite, không lọt nhãn nào.

Sau khi cắt, mọi sprite đều đi qua bước **lượng tử hoá bảng màu** (k-means,
k-means++ seeding, seed cố định). Ảnh nguồn là render mềm có khử răng cưa nên mỗi
pixel một màu khác nhau — phóng to lên là lấm tấm. Quantize kéo từ 200–540 màu
xuống 10–14 màu, tức 0.01–0.04 màu/pixel, đúng mức của pixel art thật.

Viền đen được ghim riêng thành một màu mực. Điều kiện phải là *vừa tối vừa xám*
(`lum < 22` **và** `chroma < 20`): chỉ lọc theo độ tối sẽ nuốt luôn tóc nâu sẫm
(chroma 30–50) và làm mọi nhân vật hói đen.

Kết quả trong `public/assets/`:

- `sprites/` — 18 sprite riêng lẻ mà ứng dụng dùng
- `area-sheet.png`, `star-sheet.png`, `spin-button.png`, `exercise-icon-row.png`,
  `character-asset.png` — bản tách nền của các sheet đợt 1 (giữ để tham chiếu)
- `ui-mockup.png` — ảnh giao diện tham chiếu

Mọi ảnh đều render với `image-rendering: pixelated` và scale bằng bội số nguyên.

## Tính năng

- **Bộ lọc** — thời lượng buổi tập (3/5/10 phút), khu vực cơ thể (chọn nhiều, bỏ
  trống = tất cả), trần độ khó theo sao. Số bài khớp hiển thị trực tiếp.
- **Vòng quay** — người thắng được chọn trước, reel cuộn qua pool với nhịp chậm
  dần (cubic ease-out) kèm tiếng tick tăng dần cao độ.
- **Thẻ bài tập** — hướng dẫn từng bước, mẹo cho dân văn phòng, chọn khối lượng
  (giây hoặc số lần) với gợi ý theo thời lượng buổi tập.
- **Đồng hồ** — đếm ngược theo mốc thời gian thực nên vẫn chính xác khi tab chạy
  nền; beep 3 giây cuối, chime + confetti khi xong.
- **Streak** — lưu `localStorage`, nối tiếp nếu tập hôm qua, reset nếu bỏ lỡ.
- **Âm thanh** — toàn bộ SFX tổng hợp bằng oscillator, bật/tắt bằng nút `SFX`.
- **Bàn phím** — `[SPACE]` để quay.
- **Responsive** — 3 cột trên desktop, xếp dọc trên mobile (generator lên đầu).
- **Giảm chuyển động** — tôn trọng `prefers-reduced-motion`.

### Dữ liệu lưu trên máy

`localStorage` dưới tiền tố `office-moves:` — `streak`, `filters`, `muted`.
Không có backend, không gửi dữ liệu đi đâu.

## Ghi chú kỹ thuật

**Vì sao có hai font pixel?** `Press Start 2P` không có glyph tiếng Việt — dấu bị
rơi sang font fallback và chồng lệch. Trong các font pixel trên Google Fonts, chỉ
`VT323` và `Handjet` có subset `vietnamese`. Vì vậy `Press Start 2P` chỉ dùng cho
chuỗi thuần ASCII (tiêu đề, `GENERATOR`, `PRESS TO SPIN`, chữ số đồng hồ), còn
`Handjet` lo phần chữ Việt in hoa và `VT323` lo phần nội dung.

**Vì sao đồng hồ lưu deadline?** Trình duyệt throttle timer ở tab nền. Đếm ngược
bằng cách trừ dần sẽ chạy chậm lại; lưu mốc kết thúc rồi tính hiệu số với
`Date.now()` cho kết quả đúng ngay khi người dùng quay lại tab.
