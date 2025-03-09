const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors({ origin: 'http://localhost:3000', credentials: true, methods: ['GET', 'POST'] }));

const ACCESS_TOKEN_SECRET = 'access_token_secret_key';
const REFRESH_TOKEN_SECRET = 'refresh_token_secret_key';

const ACCESS_TOKEN_EXPIRY = '2m';
const REFRESH_TOKEN_EXPIRY = '7d';
const users = [
    {
        id: 1,
        username: 'admin',
        password: 'admin123',
    },
    {
        id: 2,
        username: 'user',
        password: 'user123',
    },
];

let refreshTokens = [];

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Không tìm thấy token' });
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
        req.user = user;
        next();
    });
};

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find((u) => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Tạo payload cho JWT (không bao gồm mật khẩu)
    const payload = {
        id: user.id,
        username: user.username,
    };

    // Tạo access token
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

    // Tạo refresh token
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

    // Lưu refresh token
    refreshTokens.push(refreshToken);

    res.status(200).json({
        accessToken,
        refreshToken,
        user,
    });
});

app.post('/api/refresh-token', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh Token không được cung cấp' });
    }

    // Kiểm tra xem refresh token có tồn tại trong danh sách lưu trữ không
    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ message: 'Refresh Token không hợp lệ' });
    }

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Refresh Token không hợp lệ hoặc đã hết hạn' });
        }

        const payload = {
            id: user.id,
            username: user.username,
        };

        // Tạo token mới
        const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        const newRefreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

        // Lưu refresh token
        refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
        refreshTokens.push(newRefreshToken);

        res.json({
            accessToken,
            refreshToken: newRefreshToken,
        });
    });
});

app.post('/api/logout', (req, res) => {
    const { refreshToken } = req.body;

    // Xóa refresh token khỏi danh sách lưu trữ
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    res.status(200).json({ message: 'Đăng xuất thành công' });
});

app.get('/api/user', authenticateToken, (req, res) => {
    // Lấy thông tin từ JWT payload (đã được giải mã trong middleware)
    const { id, username } = req.user;

    // Tìm người dùng trong database
    const user = users.find((u) => u.id === id && u.username === username);

    if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    // Tạo bản sao của user object và loại bỏ mật khẩu trước khi trả về
    const { password, ...userInfo } = user;

    res.status(200).json({
        success: true,
        user: userInfo,
    });
});

app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({
        message: 'Đây là route được bảo vệ',
        user: req.user,
    });
});

app.put('/api/user', authenticateToken, async (req, res) => {
    res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});
