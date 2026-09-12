"""CNN mini từ đầu bằng NumPy.

Không dùng TensorFlow/Keras/PyTorch: Conv2D, ReLU, MaxPool, Global Average
Pooling, Dense, Softmax và lan truyền ngược đều được định nghĩa trong file.
Mục tiêu là minh hoạ cơ chế, không phải thay thế model production.
"""
import numpy as np


def softmax(logits):
    shifted = logits - np.max(logits, axis=1, keepdims=True)
    exp = np.exp(shifted)
    return exp / np.sum(exp, axis=1, keepdims=True)


def one_hot(labels, classes):
    output = np.zeros((len(labels), classes), dtype=np.float32)
    output[np.arange(len(labels)), labels] = 1.0
    return output


class Conv2D:
    def __init__(self, in_channels, filters, kernel_size=3, seed=42):
        rng = np.random.default_rng(seed)
        self.weights = rng.normal(0, np.sqrt(2 / (in_channels * kernel_size ** 2)),
                                  (filters, in_channels, kernel_size, kernel_size)).astype(np.float32)
        self.bias = np.zeros(filters, dtype=np.float32)
        self.kernel_size = kernel_size

    def forward(self, x):
        self.x = x
        batch, _, height, width = x.shape
        out_h, out_w = height - self.kernel_size + 1, width - self.kernel_size + 1
        out = np.zeros((batch, len(self.weights), out_h, out_w), dtype=np.float32)
        for row in range(out_h):
            for col in range(out_w):
                patch = x[:, :, row:row+self.kernel_size, col:col+self.kernel_size]
                out[:, :, row, col] = np.einsum("bchw,fchw->bf", patch, self.weights) + self.bias
        return out

    def backward(self, grad, learning_rate):
        grad_w = np.zeros_like(self.weights)
        grad_b = grad.sum(axis=(0, 2, 3))
        grad_x = np.zeros_like(self.x)
        for row in range(grad.shape[2]):
            for col in range(grad.shape[3]):
                patch = self.x[:, :, row:row+self.kernel_size, col:col+self.kernel_size]
                grad_w += np.einsum("bf,bchw->fchw", grad[:, :, row, col], patch)
                grad_x[:, :, row:row+self.kernel_size, col:col+self.kernel_size] += np.einsum(
                    "bf,fchw->bchw", grad[:, :, row, col], self.weights
                )
        self.weights -= learning_rate * grad_w / len(self.x)
        self.bias -= learning_rate * grad_b / len(self.x)
        return grad_x


class ReLU:
    def forward(self, x):
        self.mask = x > 0
        return x * self.mask

    def backward(self, grad, _learning_rate):
        return grad * self.mask


class MaxPool2D:
    def forward(self, x):
        self.x = x
        batch, channels, height, width = x.shape
        out = np.zeros((batch, channels, height // 2, width // 2), dtype=np.float32)
        self.argmax = np.zeros_like(out, dtype=np.int8)
        for row in range(out.shape[2]):
            for col in range(out.shape[3]):
                patch = x[:, :, row*2:row*2+2, col*2:col*2+2].reshape(batch, channels, 4)
                self.argmax[:, :, row, col] = patch.argmax(axis=2)
                out[:, :, row, col] = patch.max(axis=2)
        return out

    def backward(self, grad, _learning_rate):
        grad_x = np.zeros_like(self.x)
        for row in range(grad.shape[2]):
            for col in range(grad.shape[3]):
                idx = self.argmax[:, :, row, col]
                for b in range(grad.shape[0]):
                    for c in range(grad.shape[1]):
                        grad_x[b, c, row*2 + idx[b, c] // 2, col*2 + idx[b, c] % 2] = grad[b, c, row, col]
        return grad_x


class GlobalAveragePool:
    def forward(self, x):
        self.shape = x.shape
        return x.mean(axis=(2, 3))

    def backward(self, grad, _learning_rate):
        _, _, h, w = self.shape
        return np.repeat(np.repeat(grad[:, :, None, None] / (h * w), h, 2), w, 3)


class Dense:
    def __init__(self, inputs, outputs, seed=7):
        rng = np.random.default_rng(seed)
        self.weights = rng.normal(0, np.sqrt(2 / inputs), (inputs, outputs)).astype(np.float32)
        self.bias = np.zeros(outputs, dtype=np.float32)

    def forward(self, x):
        self.x = x
        return x @ self.weights + self.bias

    def backward(self, grad, learning_rate):
        grad_x = grad @ self.weights.T
        self.weights -= learning_rate * (self.x.T @ grad) / len(self.x)
        self.bias -= learning_rate * grad.mean(axis=0)
        return grad_x


class ScratchCNN:
    def __init__(self, classes=3):
        self.layers = [Conv2D(3, 8), ReLU(), MaxPool2D(), GlobalAveragePool(), Dense(8, classes)]

    def forward(self, x):
        for layer in self.layers:
            x = layer.forward(x)
        return x

    def train_step(self, x, labels, learning_rate=0.03):
        logits = self.forward(x)
        probabilities = softmax(logits)
        targets = one_hot(labels, probabilities.shape[1])
        loss = -np.mean(np.sum(targets * np.log(probabilities + 1e-8), axis=1))
        grad = (probabilities - targets)
        for layer in reversed(self.layers):
            grad = layer.backward(grad, learning_rate)
        return float(loss), float((probabilities.argmax(1) == labels).mean())


if __name__ == "__main__":
    # Smoke test: batch NCHW 8x8 RGB, ba nhãn giả lập.
    rng = np.random.default_rng(1)
    images = rng.random((12, 3, 8, 8), dtype=np.float32)
    labels = np.arange(12) % 3
    model = ScratchCNN(classes=3)
    for epoch in range(10):
        loss, accuracy = model.train_step(images, labels)
        print(f"epoch={epoch + 1:02d} loss={loss:.4f} accuracy={accuracy:.2%}")
