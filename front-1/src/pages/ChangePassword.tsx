import { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { authToken } from '@/stores/authStorage';
import { PATHS } from '@/routes/paths';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // 이메일 리셋 모드 관련 상태
    const [isResetMode, setIsResetMode] = useState<boolean>(false);
    const [resetToken, setResetToken] = useState<string>('');
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);
    const [isComplete, setIsComplete] = useState<boolean>(false);

    // 비밀번호 일치 여부
    const [passwordsMatch, setPasswordsMatch] = useState<boolean>(false);

    // URL 파라미터 확인하여 리셋 모드 판단
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            // 리셋 모드
            setIsResetMode(true);
            setResetToken(token);
            
            // 토큰 검증
            const validateToken = async () => {
                try {
                    const response = await fetch(`http://localhost:8088/gh/user/validate-reset-token/${token}`);
                    const data = await response.json();
                    setTokenValid(data.success);
                } catch (error) {
                    console.error('토큰 검증 실패:', error);
                    setTokenValid(false);
                }
            };
            
            validateToken();
        } else {
            // 일반 비밀번호 변경 모드
            setIsResetMode(false);
            setTokenValid(true); // 일반 모드에서는 토큰 검증 불필요
        }
    }, []);

    // 비밀번호 일치 여부 확인
    useEffect(() => {
        if (confirmPassword && newPassword) {
            setPasswordsMatch(newPassword === confirmPassword && newPassword.length >= 6);
        } else {
            setPasswordsMatch(false);
        }
    }, [newPassword, confirmPassword]);

    // 일반 비밀번호 변경 (로그인된 사용자)
    const handlePasswordChange = async () => {
        if (!passwordsMatch) {
            alert('비밀번호를 확인해주세요.');
            return;
        }

        if (!currentPassword.trim()) {
            alert('현재 비밀번호를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            const token = authToken.get();
            const response = await fetch('http://localhost:8088/gh/user/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                // 성공 시 입력 필드 초기화
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setPasswordsMatch(false);
                
                alert('비밀번호가 성공적으로 변경되었습니다.');
            } else {
                alert(data.message || '비밀번호 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('비밀번호 변경 실패:', error);
            alert('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    // 이메일 기반 비밀번호 리셋
    const handlePasswordReset = async () => {
        if (!passwordsMatch) {
            alert('비밀번호를 확인해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8088/gh/user/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: resetToken,
                    newPassword,
                    confirmPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                setIsComplete(true);
                // 5초 후 로그인 페이지로 이동
                setTimeout(() => {
                    window.location.href = PATHS.login;
                }, 5000);
            } else {
                alert(data.message || '비밀번호 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('비밀번호 변경 실패:', error);
            alert('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    // 이메일로 비밀번호 리셋 링크 요청
    const requestPasswordReset = async () => {
        try {
            const token = authToken.get();
            const response = await fetch('http://localhost:8088/gh/user/request-password-reset', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error('비밀번호 리셋 요청 실패:', error);
            alert('요청 처리 중 오류가 발생했습니다.');
        }
    };

    // 토큰 검증 중 (리셋 모드)
    if (isResetMode && tokenValid === null) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">토큰을 확인하는 중...</p>
                </div>
            </div>
        );
    }

    // 토큰이 유효하지 않은 경우 (리셋 모드)
    if (isResetMode && tokenValid === false) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full text-center">
                    <div className="text-2xl font-bold mb-6">GenauH2</div>
                    <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-red-200">
                        <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-4">링크가 유효하지 않습니다</h2>
                        <p className="text-gray-600 mb-6">
                            비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.
                            다시 비밀번호 재설정을 요청해주세요.
                        </p>
                        <button
                            onClick={() => window.location.href = PATHS.login}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                        >
                            로그인으로 이동
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 비밀번호 변경 완료 (리셋 모드)
    if (isResetMode && isComplete) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full text-center">
                    <div className="text-2xl font-bold mb-6">GenauH2</div>
                    <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-green-200">
                        <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-4">비밀번호 변경 완료</h2>
                        <p className="text-gray-600 mb-6">
                            비밀번호가 성공적으로 변경되었습니다.
                            새로운 비밀번호로 로그인해주세요.
                        </p>
                        <p className="text-sm text-gray-500 mb-4">5초 후 자동으로 로그인 페이지로 이동합니다.</p>
                        <button
                            onClick={() => window.location.href = PATHS.login}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                        >
                            지금 로그인하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* 서비스 로고 */}
                <div className="text-center">
                    <div className="text-2xl font-bold">GenauH2</div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        {isResetMode ? '새 비밀번호 설정' : '비밀번호 변경'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {isResetMode ? '새로운 비밀번호를 입력해주세요' : '보안을 위해 주기적으로 비밀번호를 변경해주세요'}
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
                    {/* 현재 비밀번호 입력 (일반 모드에서만) */}
                    {!isResetMode && (
                        <div className="mb-6">
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                현재 비밀번호
                            </label>
                            <div className="relative">
                                <input
                                    id="currentPassword"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="현재 비밀번호를 입력하세요"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showCurrentPassword ? (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 새 비밀번호 입력 */}
                    <div className="mb-6">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            새 비밀번호
                        </label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showNewPassword ? (
                                    <Eye className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                        {newPassword && newPassword.length < 6 && (
                            <p className="mt-1 text-sm text-red-600">비밀번호는 최소 6자 이상이어야 합니다.</p>
                        )}
                    </div>

                    {/* 비밀번호 확인 입력 */}
                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            비밀번호 확인
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="비밀번호를 다시 입력하세요"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>

                        {/* 비밀번호 일치 여부 */}
                        {confirmPassword && (
                            <div className={`mt-2 flex items-center text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                                {passwordsMatch ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
                                {passwordsMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                            </div>
                        )}
                    </div>

                    {/* 비밀번호 변경 버튼 */}
                    <button
                        onClick={isResetMode ? handlePasswordReset : handlePasswordChange}
                        disabled={!passwordsMatch || (isResetMode ? newPassword.length < 6 : !currentPassword.trim()) || isLoading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                            passwordsMatch && (isResetMode ? newPassword.length >= 6 : currentPassword.trim()) && !isLoading
                                ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                : 'bg-gray-400 cursor-not-allowed'
                        } transition-colors duration-200`}
                    >
                        {isLoading ? '변경 중...' : '비밀번호 변경하기'}
                    </button>

                    {/* 이메일 리셋 요청 버튼 (일반 모드에서만) */}
                    {!isResetMode && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-3">현재 비밀번호를 잊으셨나요?</p>
                            <button
                                onClick={requestPasswordReset}
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                이메일로 비밀번호 재설정 링크 받기
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;