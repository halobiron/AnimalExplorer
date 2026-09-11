# Huấn luyện mô hình CNN

Quy trình huấn luyện, đánh giá và lưu model nằm trong [train_cnn.ipynb](train_cnn.ipynb).

Mở notebook từ thư mục `model/` để đường dẫn dữ liệu `dataset_raw/animals/animals` hoạt động đúng:

```powershell
cd model
jupyter notebook train_cnn.ipynb
```

Notebook dùng đúng thứ tự nhãn của `labels.py` và ghi model kết quả vào `animal_image_classifier.keras`.

## Chạy CNN demo

Sau khi có `animal_image_classifier.keras`, mở terminal thứ hai tại thư mục `model/` và chạy FastAPI:

```powershell
.\.venv\Scripts\uvicorn.exe main:app --reload --port 8000
```

FastAPI phải chạy tại `http://localhost:8000` trước khi server Express gọi `POST /api/identify`.
