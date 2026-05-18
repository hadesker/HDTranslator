# HD Translator

HD Translator là extension hỗ trợ tra từ và dịch Anh - Việt / Việt - Anh ngay trong trình duyệt.

## Cài Đặt Từ Store

- [Chrome Web Store](https://chromewebstore.google.com/detail/hd-translator/likbjifbakomfhmnmhejipopjadcmpbe)
- [Firefox Add-ons](https://addons.mozilla.org/vi/firefox/addon/hd-translator)

## Ảnh Chụp Màn Hình

![HD Translator promotional screenshot](store-listing/ads_square.png)

![HD Translator Vietnamese to English lookup](store-listing/vi2en.png)

## Mục Đích

Extension được tạo để giúp người dùng đọc tài liệu, học tiếng Anh và tra cứu nhanh mà không phải chuyển qua lại nhiều tab. Người dùng có thể mở từ điển trong Side Panel, bôi chọn văn bản trên trang web để dịch nhanh, nghe phát âm và sao chép kết quả khi cần.

## Chức Năng Chính

- Tra từ Anh - Việt và Việt - Anh.
- Dịch nhanh văn bản được bôi chọn trên trang web.
- Hiển thị popup dịch nhỏ cạnh vùng chọn khi bật chế độ tự động dịch.
- Mở giao diện tra cứu đầy đủ trong Chrome Side Panel hoặc Firefox Sidebar.
- Xem nghĩa, định nghĩa tiếng Anh, ví dụ, từ đồng nghĩa, IPA và phát âm.
- Nghe phát âm bằng audio có sẵn hoặc giọng đọc của trình duyệt.
- Sao chép từ, ví dụ và bản dịch.
- Chuyển ngôn ngữ giao diện giữa tiếng Anh và tiếng Việt.
- Hỗ trợ dịch câu trong ô tìm kiếm bằng tiền tố `.ve.` / `.ev.`.

## Yêu Cầu

- Node.js.
- Chrome hoặc trình duyệt Chromium hỗ trợ Manifest V3.
- Firefox, nếu muốn build bản Firefox.

Repo này không cần cài thêm package npm để build extension.

## Build

Build bản Chrome:

```sh
node scripts/build-extension.js chrome
```

Kết quả nằm tại:

```text
dist/chrome
```

Build bản Firefox:

```sh
node scripts/build-extension.js firefox
```

Kết quả nằm tại:

```text
dist/firefox
```

Build và nén file upload store:

```sh
node scripts/build-extension.js chrome zip
node scripts/build-extension.js firefox zip
```

File zip được tạo tại:

```text
dist/chrome.zip
dist/firefox.zip
```

File zip được tạo bằng script build để tránh các file ẩn của macOS như `.DS_Store`, `._*` hoặc thư mục `__MACOSX`.

## Cài Đặt Unpacked Trên Chrome

1. Build bản Chrome:

```sh
node scripts/build-extension.js chrome
```

2. Mở Chrome và truy cập:

```text
chrome://extensions
```

3. Bật **Developer mode**.
4. Chọn **Load unpacked**.
5. Chọn thư mục:

```text
dist/chrome
```

6. Sau khi cài, nhấn biểu tượng HD Translator trên toolbar để mở extension trong Side Panel.

## Cài Đặt Tạm Thời Trên Firefox

1. Build bản Firefox:

```sh
node scripts/build-extension.js firefox
```

2. Mở Firefox và truy cập:

```text
about:debugging#/runtime/this-firefox
```

3. Chọn **Load Temporary Add-on...**.
4. Chọn file:

```text
dist/firefox/manifest.json
```

5. Sau khi cài, mở HD Translator từ toolbar hoặc sidebar của Firefox.

Lưu ý: Add-on tạm thời trên Firefox sẽ bị gỡ khi đóng trình duyệt. Cần load lại nếu muốn tiếp tục kiểm thử.

## Cấu Trúc Build

- `manifest.json`: manifest chính cho Chrome MV3.
- `manifest.chrome.json`: manifest dùng khi build bản Chrome.
- `manifest.firefox.json`: manifest dùng khi build bản Firefox.
- `src/pages`: giao diện popup/sidebar.
- `src/scripts`: background script và content script.
- `src/assets`: CSS, JavaScript, icon và thư viện giao diện.
- `scripts/build-extension.js`: script đóng gói extension vào `dist/chrome` hoặc `dist/firefox`.
- Thêm tham số `zip` hoặc `--zip` để tạo file upload store sạch trong thư mục `dist`.

## Tác Giả

- Author: [Hadesker](https://hadesker.dev)
- Email: hello@hadesker.net

## Giấy Phép

Dự án được phát hành theo giấy phép MIT. Xem chi tiết trong file `LICENSE`.
