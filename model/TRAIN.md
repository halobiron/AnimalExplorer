# Huấn luyện mô hình CNN

Quy trình huấn luyện, đánh giá và lưu model nằm trong [train_cnn.ipynb](train_cnn.ipynb).

Ngoài notebook, đồ án có ba cách cài đặt để đối chiếu trực tiếp yêu cầu môn học:

| Cách làm | File | Lệnh |
|---|---|---|
| CNN tự cài đặt (NumPy) | `cnn_from_scratch.py` | `python cnn_from_scratch.py` |
| CNN bằng Keras/TensorFlow | `train_keras.ipynb` | `jupyter notebook train_keras.ipynb` |
| CNN bằng PyTorch | `train_pytorch.ipynb` | `jupyter notebook train_pytorch.ipynb` |

Ba notebook cùng dùng `dataset_raw/animals/animals`, theo cấu trúc `class_name/image_file`. Đặt dataset vào đường dẫn này trước khi chạy.

Mở notebook từ thư mục `model/` để đường dẫn dữ liệu `dataset_raw/animals/animals` hoạt động đúng:

```powershell
cd model
jupyter notebook train_cnn.ipynb
```

Notebook dùng đúng thứ tự nhãn của `labels.py` và ghi model kết quả vào `animal_image_classifier.keras`.

## Chạy CNN demo

Sau khi có `animal_image_classifier.keras`, mở terminal thứ hai tại thư mục `model/` và chạy FastAPI:

```powershell
uvicorn main:app --reload --port 8000
```

FastAPI phải chạy tại `http://localhost:8000` trước khi server Express gọi `POST /api/identify`.
