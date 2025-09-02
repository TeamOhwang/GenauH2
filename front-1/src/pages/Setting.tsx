import { getNotificationSettingsApi, requestPasswordResetApi, updateNotificationSettingsApi } from "@/api/userApi";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useTargetSettingStore } from "@/stores/useTargetSettingStore";
import { TARGET_RATE_OPTIONS } from "@/utils/chartDataBuilder";
import { useAdmin } from "@/hooks/useAdmin";

export default function Setting() {

    const [emailNotification, setEmailNotification] = useState(false);
    const [smsNotification, setSmsNotification] = useState(false);
    const [isSmsOpen, setIsSmsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 비밀번호 변경 메일 발송 여부
    const [isPasswordReset, setIsPasswordReset] = useState(false);

    // 알림 설정 번호
    const [notificationSms, setNotificationSms] = useState("");

    // 이메일과 SMS 계정 목록 상태 추가
    const [smsAccounts, setSmsAccounts] = useState<string[]>([]);

    // 입력값 상태 추가
    const [smsInput, setSmsInput] = useState("");

    // 목표 설정 스토어
    const { hydrogenTargetRate, setHydrogenTargetRate, resetHydrogenTargetRate } = useTargetSettingStore();

    const { updateUserStatusAction } = useAdmin();

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
        });
    }

    const handleWithdrawal = async () => {
        console.log("회원 탈퇴 클릭");
        const result = await updateUserStatusAction(orgId, "SUSPENDED");
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

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <p className="text-xl font-bold text-black dark:text-white">시설 추가 / 수정 요청</p>
            </div>
            <div>
                <button 
                className="text-red-500 text-md dark:bg-red-500 dark:text-white font-medium border border-red-500 dark:border-red-500 rounded-md px-2 py-1 mt-3"
                onClick={handleWithdrawal}>회원 탈퇴</button>
            </div>
        </div>
    )
}
