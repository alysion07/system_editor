import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const isFormValid = username.trim() !== '' && password.trim() !== '';

    const handleLogin = () => {
        if (isFormValid) {
            // 로그인 기능은 아직 연결하지 않고, 바로 MinioManager 페이지로 이동
            navigate('/nodeeditor');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
            <h2>로그인</h2>
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="아이디 입력"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: '8px', width: '250px', marginBottom: '10px', display: 'block' }}
                />
                <input
                    type="password"
                    placeholder="비밀번호 입력"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '8px', width: '250px', display: 'block' }}
                />
            </div>
            <button
                onClick={handleLogin}
                disabled={!isFormValid}
                style={{
                    padding: '10px 20px',
                    backgroundColor: isFormValid ? '#007bff' : '#ccc',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isFormValid ? 'pointer' : 'not-allowed',
                }}
            >
                로그인
            </button>
        </div>
    );
};

export default HomePage;
