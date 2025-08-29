import { getNotificationSettingsApi, requestPasswordResetApi, updateNotificationSettingsApi } from "@/api/userApi";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";

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
                <button onClick={handleChangePassword}>비밀번호 변경</button>
                {isPasswordReset && <p className="text-red-500 dark:text-red-400 text-xs font-light mb-3">비밀번호 변경 메일이 발송되었습니다.</p>}
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

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <p className="text-xl font-bold text-black dark:text-white">시설 추가 / 수정 요청</p>
            </div>
            <h1 className="text-black dark:text-white">회원 탈퇴</h1>
        </div>
    )
}
