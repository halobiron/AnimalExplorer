# Animal Explorer

A web application that uses AI to identify animal species from uploaded images. Users can build a personal collection of species they've discovered.

## Demo
https://github.com/user-attachments/assets/fee084fc-9edf-454c-ab6d-b4ea45b93ef4
## Architecture
![Architecture](image.png)
## Features

- **CNN demo nhận diện** — Upload ảnh để xem pipeline preprocessing, Softmax Top-5 và Grad-CAM
- **Animal dictionary** — Browse 90+ species with biological information
- **Personal collection** — Each user builds a unique Pokédex-style collection (requires login)
- **Authentication** — Register / login with JWT cookie-based sessions
- **CNN Learning Lab** — Ngay trong trang CNN Demo có các tab giải thích yêu cầu, dataset, kiến trúc và mã nguồn NumPy/Keras/PyTorch.

## Đáp ứng yêu cầu môn học

| Nội dung | Nơi kiểm tra |
|---|---|
| Dataset ảnh dùng chung | `model/dataset_raw/animals/animals` |
| CNN tự cài đặt bằng NumPy | [model/cnn_from_scratch.py](model/cnn_from_scratch.py) |
| CNN Keras/TensorFlow | [model/train_keras.ipynb](model/train_keras.ipynb), notebook và FastAPI |
| CNN PyTorch | [model/train_pytorch.ipynb](model/train_pytorch.ipynb) |
| Ma trận yêu cầu, kiến trúc cải tiến và kịch bản bảo vệ | [docs/REQUIREMENTS_TRACEABILITY.md](docs/REQUIREMENTS_TRACEABILITY.md) |

Mở `/identify` để chạy model, quan sát Top-5 Softmax và Grad-CAM; phía dưới cùng trang là các tab mô tả yêu cầu, kiến trúc và mã nguồn trọng tâm.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TailwindCSS 4, React Router 7 |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose |
| Storage | Cloudinary (animal reference images) |
| AI Service | FastAPI + TensorFlow (thư mục `model/`) |
| Auth | JWT stored in HttpOnly cookies |

## Project Structure

```
AnimalExplorer/
├── client/          # React frontend (Vite)
│   └── src/             # có Learning.jsx và CNN Interactive Lab
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
└── server/          # Express backend
    ├── configs/
    ├── controllers/
    ├── data/            # animals.json + local images (for seeding)
    ├── middlewares/
    ├── models/
    ├── routes/
    └── scripts/         # seedAnimals.js
├── model/               # NumPy, TensorFlow/Keras, PyTorch và FastAPI
└── docs/                # tài liệu truy vết yêu cầu
```

## Huấn luyện và tái lập thí nghiệm

Ba notebook dùng chung thư mục `model/dataset_raw/animals/animals`, theo cấu trúc `class_name/image_file`. Sửa một đường dẫn duy nhất trong từng notebook nếu dataset được đặt ở nơi khác.

```powershell
cd model
# 1) Minh hoạ CNN tự viết, không dùng framework deep learning
python cnn_from_scratch.py

# 2) Mở notebook Keras/TensorFlow hoặc PyTorch
jupyter notebook train_keras.ipynb
jupyter notebook train_pytorch.ipynb
```

## Prerequisites

- Node.js >= 18
- MongoDB (local or MongoDB Atlas)
- Cloudinary account
- FastAPI AI service running separately

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/AnimalExplorer.git
cd AnimalExplorer
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

AI_SERVICE_URL=http://localhost:8000/predict
```

### 3. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Seed the database (first time only)

Place animal images (`.webp` format) in `server/data/images/`, then run:

```bash
cd server
node scripts/seedAnimals.js
```

This uploads images to Cloudinary and saves all animal data to MongoDB.

### 5. Run the application

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd server
npm run server
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

The app will be available at `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new account |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | No | Logout |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/identify` | No | CNN demo: nhận diện, Softmax Top-5 và Grad-CAM |
| GET | `/api/animals` | No | Get all animals in the dictionary |
| GET | `/api/collection` | Yes | Get the user's personal collection |

## Environment Variables Reference

| Variable | Description |
|---|---|
| `PORT` | Port for the Express server (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `CLIENT_URL` | Frontend URL for CORS (default: http://localhost:5173) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `AI_SERVICE_URL` | URL of the FastAPI inference endpoint |
