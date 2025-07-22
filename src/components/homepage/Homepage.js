import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

import useProjectStore from '../store/projectStore';  // 경로 확인


const HomePage = () => {
    const { setUserId } = useProjectStore();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const isFormValid = username.trim() !== '' && password.trim() !== '';

    const handleLogin = () => {
        if (isFormValid) {
            setUserId(username);  // ✅ store에 저장

            navigate('/dashboard', {
                state: {
                    user: username,
                    previousPage: "/",
                    timestamp: new Date().toISOString(),
                }
            });
        }
    };

    return (
        <div className="homepage-container">
            <h2 className="homepage-title">로그인</h2>
            <div className="homepage-form">
                <input
                    type="text"
                    placeholder="아이디 입력"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="homepage-input"
                />
                <input
                    type="password"
                    placeholder="비밀번호 입력"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="homepage-input"
                />
            </div>
            <button
                onClick={handleLogin}
                disabled={!isFormValid}
                className="homepage-btn"
            >
                로그인
            </button>
        </div>
    );
};

export default HomePage;