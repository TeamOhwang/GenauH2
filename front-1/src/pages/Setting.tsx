import { getNotificationSettingsApi, requestPasswordResetApi, updateNotificationSettingsApi, withdrawalApi } from "@/api/userApi";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useTargetSettingStore } from "@/stores/useTargetSettingStore";
import { TARGET_RATE_OPTIONS } from "@/utils/chartDataBuilder";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import FacilityManagement from "@/components/FacilityManagement";

export default function Setting() {

    const [emailNotification, setEmailNotification] = useState(false);
    const [smsNotification, setSmsNotification] = useState(false);
    const [isSmsOpen, setIsSmsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 비밀번호 변경 메일 발송 여부
    const [isPasswordReset, setIsPasswordReset] = useState(false);

    // 회원 탈퇴 관련 상태
    const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
    const [withdrawalPassword, setWithdrawalPassword] = useState("");
    const [withdrawalConfirm, setWithdrawalConfirm] = useState("");
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    // 알림 설정 번호
    const [notificationSms, setNotificationSms] = useState("");

    // 이메일과 SMS 계정 목록 상태 추가
    const [smsAccounts, setSmsAccounts] = useState<string[]>([]);

    // 입력값 상태 추가
    const [smsInput, setSmsInput] = useState("");

    // 목표 설정 스토어
    const { hydrogenTargetRate, setHydrogenTargetRate, resetHydrogenTargetRate } = useTargetSettingStore();

    const { updateUserStatusAction } = useAdmin();
    const { orgId, logout } = useAuthStore();
    const navigate = useNavigate();

    // 알림 설정 불러오기
    const loadNotificationSettings = async () => {
        try {
            setIsLoading(true);
            const res = await getNotificationSettingsApi();
            console.log("알림 설정 조회 결과:", res);
            
            if (res) {
                setEmailNotification(res.emailNotification || false);
                setSmsNotification(res.smsNotification || false);
                setNotificationSms(res.phoneNum || "");
            }
        } catch (error) {
            console.error("알림 설정 조회 실패:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 이메일 알림 토글 처리
    const handleEmailNotificationToggle = async (checked: boolean) => {
        try {
            setEmailNotification(checked);
            const res = await updateNotificationSettingsApi({
                emailNotification: checked,
                smsNotification: smsNotification
            });
            console.log("이메일 알림 설정 업데이트 결과:", res);
        } catch (error) {
            console.error("이메일 알림 설정 업데이트 실패:", error);
            // 실패 시 원래 상태로 되돌리기
            setEmailNotification(!checked);
        }
    };

    // SMS 알림 토글 처리
    const handleSmsNotificationToggle = async (checked: boolean) => {
        try {
            setSmsNotification(checked);
            const res = await updateNotificationSettingsApi({
                emailNotification: emailNotification,
                smsNotification: checked
            });
            console.log("SMS 알림 설정 업데이트 결과:", res);
        } catch (error) {
            console.error("SMS 알림 설정 업데이트 실패:", error);
            // 실패 시 원래 상태로 되돌리기
            setSmsNotification(!checked);
        }
    };

    const handleSmsButtonClick = () => {
        console.log("SMS 변경 클릭");
        setIsSmsOpen(!isSmsOpen);
        if (isSmsOpen) {
            setSmsInput(""); // 모달 닫을 때 입력값 초기화
        }
    };

    // SMS 계정 변경
    const handleSmsUpdate = () => {
        if (smsInput.trim() && !smsAccounts.includes(smsInput.trim())) {
            setSmsAccounts([...smsAccounts, smsInput.trim()]);
            setSmsInput("");
            setIsSmsOpen(!isSmsOpen);
        } else {
            setIsSmsOpen(!isSmsOpen);
        }
    };

    const handleSmsKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSmsUpdate();
        }
    };

    const handleChangePassword = () => {
        console.log("비밀번호 변경 클릭");
        requestPasswordResetApi().then((res: any) => {
            setIsPasswordReset(!isPasswordReset);
            console.log(res);
            
            // 비밀번호 변경 메일 발송 후 로그아웃 및 로그인 페이지로 이동
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000); // 2초 후 로그아웃 (사용자가 메시지를 볼 수 있도록)
        });
    }

    const handleWithdrawal = () => {
        console.log("회원 탈퇴 클릭");
        setIsWithdrawalModalOpen(true);
    }

    const handleWithdrawalSubmit = async () => {
        if (!withdrawalPassword.trim()) {
            alert("현재 비밀번호를 입력해주세요.");
            return;
        }

        if (withdrawalConfirm !== "탈퇴") {
            alert("확인란에 '탈퇴'를 정확히 입력해주세요.");
            return;
        }

        try {
            setIsWithdrawing(true);
            const result = await withdrawalApi(withdrawalPassword);
            
            if (result.success) {
                alert("회원 탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.");
                logout();
                navigate('/login');
            } else {
                alert(result.message || "회원 탈퇴 중 오류가 발생했습니다.");
            }
        } catch (error: any) {
            console.error("회원 탈퇴 실패:", error);
            alert(error.response?.data?.message || "회원 탈퇴 중 오류가 발생했습니다.");
        } finally {
            setIsWithdrawing(false);
            setIsWithdrawalModalOpen(false);
            setWithdrawalPassword("");
            setWithdrawalConfirm("");
        }
    }

    const handleWithdrawalCancel = () => {
        setIsWithdrawalModalOpen(false);
        setWithdrawalPassword("");
        setWithdrawalConfirm("");
    }

    useEffect(() => {
        loadNotificationSettings();
    }, []);

    // 로딩 중일 때 표시할 내용
    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <p className="text-xl font-bold">비밀번호 변경</p>
                <button onClick={handleChangePassword} className="text-blue-500 dark:bg-blue-500 dark:text-white text-sm font-medium border border-blue-500 dark:border-blue-500 rounded-md px-2 py-1 mt-3">비밀번호 변경</button>
                {isPasswordReset && <p className="text-red-500 dark:text-red-400 text-xs font-light mt-3">비밀번호 변경 메일이 발송되었습니다.</p>}
            </div>

            {/* 알림 설정 섹션 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-black dark:text-white mb-6">알림 설정</h2>

                {/* 이메일 알림 */}
                <div className="mb-8">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-black dark:text-white mb-2">이메일</h3>
                            <p className="text-black dark:text-white mb-3">이메일 계정으로 알림을 발송합니다.</p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer ml-4">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={emailNotification}
                                onChange={(e) => handleEmailNotificationToggle(e.target.checked)}
                            />
                            <div className={`
                                relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
                                ${emailNotification ? 'bg-blue-600 dark:bg-blue-700' : 'bg-gray-300 dark:bg-gray-700'}
                            `}>
                                <div className={`
                                    absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out
                                    ${emailNotification ? 'translate-x-5' : 'translate-x-0.5'}
                                `}></div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* SMS 알림 */}
                <div>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-black dark:text-white mb-2">SMS</h3>
                            <p className="text-black dark:text-white mb-3">SMS로 알림을 발송합니다.</p>
                            {smsNotification && (
                                <>
                                    <p className="text-black dark:text-white mb-3">등록된 번호 : {notificationSms}</p>
                                    {!isSmsOpen && <button
                                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                        onClick={handleSmsButtonClick}
                                    >
                                        번호 변경
                                    </button>}
                                    {isSmsOpen && (
                                        <div className="mt-4">
                                            <input
                                                type="text"
                                                placeholder="등록 번호 변경"
                                                value={smsInput}
                                                onChange={(e) => setSmsInput(e.target.value)}
                                                onKeyPress={handleSmsKeyPress}
                                                className="w-1/3 p-2 border border-gray-300 rounded-md mr-2"
                                            />
                                            <Button type="submit" onClick={handleSmsUpdate}>변경</Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <label className="inline-flex items-center cursor-pointer ml-4">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={smsNotification}
                                onChange={(e) => handleSmsNotificationToggle(e.target.checked)}
                            />
                            <div className={`
                                relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
                                ${smsNotification ? 'bg-blue-600 dark:bg-blue-700' : 'bg-gray-300 dark:bg-gray-700'}
                            `}>
                                <div className={`
                                    absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out
                                    ${smsNotification ? 'translate-x-5' : 'translate-x-0.5'}
                                `}></div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* 수소 생산량 목표 설정 섹션 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-black dark:text-white mb-6">수소 생산량 목표 설정</h2>
                
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">목표 비율 설정</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        예측 생산량 대비 목표 비율을 설정합니다. 예를 들어 80%로 설정하면 예측치의 80%를 목표로 합니다.
                    </p>
                    
                    <div className="flex items-center space-x-4">
                        <label htmlFor="target-rate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            목표 비율:
                        </label>
                        <select
                            id="target-rate"
                            value={hydrogenTargetRate}
                            onChange={(e) => setHydrogenTargetRate(Number(e.target.value))}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {TARGET_RATE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={resetHydrogenTargetRate}
                            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            기본값으로 리셋
                        </button>
                    </div>
                    
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>현재 설정:</strong> 예측 생산량의 {(hydrogenTargetRate * 100).toFixed(0)}%를 목표로 설정
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                            이 설정은 대시보드의 수소 생산량 달성률 계산에 사용됩니다.
                        </p>
                    </div>
                </div>
            </div>

            {/* 시설 관리 섹션 */}
            <FacilityManagement />
            <div>
                <button 
                className="text-red-500 text-md dark:bg-red-500 dark:text-white font-medium border border-red-500 dark:border-red-500 rounded-md px-2 py-1 mt-3"
                onClick={handleWithdrawal}>회원 탈퇴</button>
            </div>

            {/* 회원 탈퇴 모달 */}
            {isWithdrawalModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">회원 탈퇴</h3>
                        
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                회원 탈퇴 시 모든 데이터가 삭제되며, 복구할 수 없습니다.<br/>
                                탈퇴 후 6개월이 지나면 계정이 완전히 삭제됩니다.
                            </p>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    현재 비밀번호
                                </label>
                                <input
                                    type="password"
                                    value={withdrawalPassword}
                                    onChange={(e) => setWithdrawalPassword(e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="현재 비밀번호를 입력하세요"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    확인: 아래에 "탈퇴"를 입력하세요
                                </label>
                                <input
                                    type="text"
                                    value={withdrawalConfirm}
                                    onChange={(e) => setWithdrawalConfirm(e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="탈퇴"
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleWithdrawalCancel}
                                disabled={isWithdrawing}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleWithdrawalSubmit}
                                disabled={isWithdrawing}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isWithdrawing ? "처리 중..." : "탈퇴하기"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
