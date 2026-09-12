import { useState, useEffect } from "react";
import { Waypoints, Trophy, BarChart3, ArrowRight, Sparkles, Info, Activity, Zap, ShieldCheck } from "lucide-react";
import CnnStageShell from "./CnnStageShell";

const STAGE5_CODE_DATA = {
  concept: "Phẳng hóa tensor và truyền qua tầng Dense để tính logits z_i. Hàm Softmax chuyển đổi điểm số thành xác suất tổng bằng 1.0. Trong huấn luyện, đạo hàm dL/dz = probs - y được dùng để lan truyền ngược (Backpropagation).",
  frameworks: {
    numpy: {
      file: "model/cnn_from_scratch.py",
      code: `def softmax(logits):
    shifted = logits - np.max(logits, axis=1, keepdims=True)
    exp = np.exp(shifted)
    return exp / np.sum(exp, axis=1, keepdims=True)

class Dense:
    def forward(self, x):
        return x @ self.weights + self.bias

def train_step(self, images, labels, lr=0.01):
    probs = self.forward(images)
    loss = -np.mean(np.log(probs[np.arange(len(labels)), labels] + 1e-12))
    # Gradient tại Softmax: dL/dz = (p - y) / N
    grad = (probs - one_hot(labels, 47)) / len(images)
    self.backward(grad, lr)
    return loss`,
    },
    keras: {
      file: "model/train_keras.ipynb",
      code: `from tensorflow.keras import layers

model.add(layers.GlobalAveragePooling2D())
model.add(layers.Dense(256, activation="relu"))
model.add(layers.Dropout(0.3))
model.add(layers.Dense(47, activation="softmax", name="predictions"))

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)
model.fit(train_ds, validation_data=val_ds, epochs=15)`,
    },
    pytorch: {
      file: "model/train_pytorch.ipynb",
      code: `self.classifier = nn.Sequential(
    nn.AdaptiveAvgPool2d((1, 1)),
    nn.Flatten(),
    nn.Linear(256, 128),
    nn.ReLU(),
    nn.Linear(128, 47)
)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

# Vòng lặp huấn luyện
optimizer.zero_grad()
outputs = model(images)
loss = criterion(outputs, labels)
loss.backward()
optimizer.step()`,
    },
  },
};

const CnnStage5Softmax = ({ result, cnnDemo }) => {
  const top5 = result?.top5 || [];
  const classCount = cnnDemo?.classCount || 47;
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 6);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const RANK_BADGES = [
    { rank: 1, label: "Top 1", icon: "🥇" },
    { rank: 2, label: "Top 2", icon: "🥈" },
    { rank: 3, label: "Top 3", icon: "🥉" },
    { rank: 4, label: "Top 4", icon: "4" },
    { rank: 5, label: "Top 5", icon: "5" },
  ];

  // Simulation View
  const simView = (
    <div className="space-y-4">
      {/* Dynamic Synaptic Flow & Top 5 Output */}
      <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-blue-400 uppercase flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            Mạng nơ-ron kết nối đầy đủ (Dense Synapses)
          </p>
          <span className="text-[11px] text-slate-400 font-mono">
            Logits (z) &rarr; Softmax &sigma;(z) &isin; [0, 1]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-cyan-400">1. Flatten Vector 1D</span>
            <div className="font-mono text-cyan-300 font-bold mt-1">2,048 tham số</div>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-amber-400">2. Dense (W·x + b)</span>
            <div className="font-mono text-amber-300 font-bold mt-1">Logits 47 lớp</div>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-emerald-400">3. Softmax &sigma;(z)</span>
            <div className="font-mono text-emerald-300 font-bold mt-1">&sum; P = 100%</div>
          </div>
        </div>
      </div>

      {/* Top-5 Predictions List */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            Phân phối xác suất Top-5 loài động vật
          </p>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            {classCount} loài
          </span>
        </div>

        {top5 && top5.length > 0 ? (
          <div className="space-y-2">
            {top5.map((item, idx) => {
              const badge = RANK_BADGES[idx] || { rank: idx + 1, label: `Top ${idx + 1}`, icon: `${idx + 1}` };
              const isFirst = idx === 0;

              return (
                <div
                  key={item.label || idx}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isFirst
                      ? "bg-gradient-to-r from-emerald-50 to-teal-50/50 border-emerald-300 shadow-sm"
                      : "bg-gray-50 border-gray-200/70"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{badge.icon}</span>
                      <span className={`text-xs font-extrabold capitalize ${isFirst ? "text-emerald-950" : "text-gray-800"}`}>
                        {item.vietnameseName || item.label}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200">
                      {item.confidence}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isFirst ? "bg-gradient-to-r from-emerald-400 to-green-600" : "bg-slate-400"
                      }`}
                      style={{ width: `${Math.max(item.confidence, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 rounded-xl">
            Tải ảnh lên và nhấn &quot;Nhận diện &amp; Phân tích CNN&quot; để xem biểu đồ xác suất.
          </div>
        )}
      </div>
    </div>
  );

  // Theory View: Deep, structured, and mathematical explanation of Dense & Softmax
  const theoryView = (
    <div className="space-y-4">
      {/* 2 Core Mechanism Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Dense Layer & Logits Formulation */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm">
              <Waypoints className="w-4 h-4" />
            </span>
            <p className="text-xs font-black text-blue-950 uppercase">
              1. Tầng Kết Nối Đầy Đủ (Dense / FC Layer)
            </p>
          </div>
          <p className="text-xs text-blue-900 leading-relaxed">
            Sau khi phẳng hóa Feature Map thành vector 1D, tầng Dense thực hiện phép nhân ma trận trọng số <em>W</em> và cộng hệ số chệch <em>b</em> để tổng hợp đặc trưng thành <strong>vector Logits <em>z</em></strong> gồm 47 điểm số:
          </p>
          <div className="bg-white/90 border border-blue-300/80 rounded-xl p-2.5 text-center font-mono text-xs font-bold text-blue-950 shadow-sm">
            z = W · x + b &isin; ℝ⁴⁷
          </div>
          <ul className="space-y-1 text-[11px] text-blue-800 leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Mỗi nơ-ron:</strong> Đại diện cho điểm thô (Logit) của 1 loài động vật trong số 47 loài của tập dữ liệu huấn luyện.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Tầng Dropout (0.3):</strong> Vô hiệu hóa ngẫu nhiên 30% nơ-ron trong quá trình Train để ngăn ngừa học vẹt.</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Softmax Function with Numerical Stability */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-sm">
              <Activity className="w-4 h-4" />
            </span>
            <p className="text-xs font-black text-emerald-950 uppercase">
              2. Hàm Xác Suất Softmax Chuẩn Hoá
            </p>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            Chuyển đổi các điểm số Logits tự do trong khoảng (-∞, +∞) thành <strong>phân phối xác suất hợp lệ</strong> có tổng đúng bằng 100%:
          </p>
          <div className="bg-white/90 border border-emerald-300/80 rounded-xl p-2.5 text-center font-mono text-xs font-bold text-emerald-950 shadow-sm">
            P(y = i | x) = σ(z)<sub>i</sub> = e<sup>z<sub>i</sub> - max(z)</sup> / ∑<sub>j=1..47</sub> e<sup>z<sub>j</sub> - max(z)</sup>
          </div>
          <ul className="space-y-1 text-[11px] text-emerald-800 leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <span><strong>Kỹ thuật trừ max(z):</strong> Chống tràn số học (Overflow) khi tính hàm mũ eᶻ với các số lớn.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <span><strong>Khuếch đại độ tự tin:</strong> Hàm eᶻ làm nổi bật rõ rệt loài có điểm số cao nhất so với các loài còn lại.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Cross-Entropy Loss & Backprop Card */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Hàm Mất Mát Cross-Entropy &amp; Đạo Hàm Lan Truyền Ngược
          </p>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
            Loss &amp; Gradient
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-slate-300">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-amber-400 block">Công thức hàm mất mát (Categorical Cross-Entropy)</strong>
            <div className="font-mono text-xs text-slate-200">L = - ∑<sub>i=1..47</sub> y<sub>i</sub> · log(p<sub>i</sub>) = - log(p<sub>true</sub>)</div>
            <p className="text-[11px] text-slate-400">Phạt nặng khi mô hình dự đoán sai loài thật với độ tự tin cao.</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-emerald-400 block">Gradient đạo hàm tại tầng Softmax (∂L/∂z)</strong>
            <div className="font-mono text-xs text-emerald-300 font-bold">∂L / ∂z<sub>i</sub> = p<sub>i</sub> - y<sub>i</sub></div>
            <p className="text-[11px] text-slate-400">Công thức đạo hàm cực kỳ đơn giản (Xác suất dự đoán - Nhãn thực tế) giúp Backpropagation siêu nhanh.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CnnStageShell
      stageId={5}
      stageTitle="5. Tầng Kết Nối Đầy Đủ &amp; Softmax (Dense &amp; Classification)"
      stageDesc="Phẳng hóa tensor và tính xác suất Top-5 loài động vật với hàm Softmax"
      badgeTag="Phân loại 47 loài"
      icon={Waypoints}
      simView={simView}
      theoryView={theoryView}
      codeData={STAGE5_CODE_DATA}
    />
  );
};

export default CnnStage5Softmax;
