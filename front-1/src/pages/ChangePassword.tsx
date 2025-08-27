import { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';

const ChangePassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 비밀번호 일치 여부
    const [passwordsMatch, setPasswordsMatch] = useState(false);

    // 비밀번호 일치 여부 확인
    useEffect(() => {
        if (confirmPassword && newPassword) {
            setPasswordsMatch(newPassword === confirmPassword);
        } else {
            setPasswordsMatch(false);
        }
    }, [newPassword, confirmPassword]);


    // 비밀번호 변경 처리
    const handlePasswordChange = async () => {
        if (!passwordsMatch) {
            alert('비밀번호를 확인해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            // TODO: 실제 비밀번호 변경 API 호출
            console.log('새 비밀번호:', newPassword);

            // 성공 시 입력 필드 초기화
            setNewPassword('');
            setConfirmPassword('');
            setPasswordsMatch(false);

            alert('비밀번호가 성공적으로 변경되었습니다.');
        } catch (error) {
            console.error('비밀번호 변경 실패:', error);
            alert('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* 서비스 로고 */}
                <div className="text-center">
                    <div className="text-2xl font-bold">GenauH2</div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        비밀번호 변경
                    </h2>
                </div>

                <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
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
                                placeholder="새 비밀번호를 입력하세요"
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
                        onClick={handlePasswordChange}
                        disabled={!passwordsMatch || isLoading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${passwordsMatch && !isLoading
                            ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            : 'bg-gray-400 cursor-not-allowed'
                            } transition-colors duration-200`}
                    >
                        {isLoading ? '변경 중...' : '비밀번호 변경하기'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;