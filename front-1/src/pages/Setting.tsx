import { verifyPasswordApi } from "@/api/userApi";
import Button from "@/components/ui/Button";
import { useState } from "react";

export default function Setting() {

    const [emailNotification, setEmailNotification] = useState(true);
    const [smsNotification, setSmsNotification] = useState(true);
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [isSmsOpen, setIsSmsOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);

    // 이메일과 SMS 계정 목록 상태 추가
    const [emailAccounts, setEmailAccounts] = useState<string[]>([]);
    const [smsAccounts, setSmsAccounts] = useState<string[]>([]);

    // 입력값 상태 추가
    const [emailInput, setEmailInput] = useState("");
    const [smsInput, setSmsInput] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleEmailButtonClick = () => {
        console.log("이메일 추가 클릭");
        setIsEmailOpen(!isEmailOpen);
        if (isEmailOpen) {
            setEmailInput(""); // 모달 닫을 때 입력값 초기화
        }
    };

    const handleSmsButtonClick = () => {
        console.log("SMS 추가 클릭");
        setIsSmsOpen(!isSmsOpen);
        if (isSmsOpen) {
            setSmsInput(""); // 모달 닫을 때 입력값 초기화
        }
    };

    // 이메일 계정 추가
    const handleEmailAdd = () => {
        if (emailInput.trim() && !emailAccounts.includes(emailInput.trim())) {
            setEmailAccounts([...emailAccounts, emailInput.trim()]);
            setEmailInput("");
            setIsEmailOpen(!isEmailOpen);
        }
    };

    // SMS 계정 추가
    const handleSmsAdd = () => {
        if (smsInput.trim() && !smsAccounts.includes(smsInput.trim())) {
            setSmsAccounts([...smsAccounts, smsInput.trim()]);
            setSmsInput("");
            setIsSmsOpen(!isSmsOpen);
        }
    };

    // 이메일 계정 삭제
    const handleEmailDelete = (index: number) => {
        setEmailAccounts(emailAccounts.filter((_, i) => i !== index));
    };

    // SMS 계정 삭제
    const handleSmsDelete = (index: number) => {
        setSmsAccounts(smsAccounts.filter((_, i) => i !== index));
    };

    // 엔터키 처리
    const handleEmailKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleEmailAdd();
        }
    };

    const handleSmsKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSmsAdd();
        }
    };

    const handleChangePassword = () => {
        
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-xl font-bold">비밀번호 변경</p>
                <button onClick={handleChangePassword}>비밀번호 변경</button>
            </div>

            {/* 알림 설정 섹션 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-black mb-6">알림 설정</h2>

                {/* 이메일 알림 */}
                <div className="mb-8">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-black mb-2">이메일</h3>
                            <p className="text-black mb-3">이메일 계정으로 알림을 발송합니다.</p>
                            {!isEmailOpen && <button
                                className="text-sm text-gray-500 hover:text-gray-700"
                                onClick={handleEmailButtonClick}
                            >
                                계정 추가+
                            </button>}
                            {isEmailOpen && (
                                <div className="mt-4">
                                    <input
                                        type="email"
                                        placeholder="이메일 추가"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        onKeyPress={handleEmailKeyPress}
                                        className="w-1/3 p-2 border border-gray-300 rounded-md mr-2"
                                    />
                                    <Button type="submit" onClick={handleEmailAdd}>추가</Button>
                                </div>
                            )}

                            {/* 이메일 계정 목록 */}
                            {emailAccounts.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">등록된 이메일 계정:</h4>
                                    <div className="space-y-2">
                                        {emailAccounts.map((email, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                                <span className="text-sm text-gray-800">{email}</span>
                                                <button
                                                    onClick={() => handleEmailDelete(index)}
                                                    className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <label className="inline-flex items-center cursor-pointer ml-4">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={emailNotification}
                                onChange={(e) => setEmailNotification(e.target.checked)}
                            />
                            <div className={`
                                relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
                                ${emailNotification ? 'bg-blue-600' : 'bg-gray-300'}
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
                            <h3 className="text-lg font-bold text-black mb-2">SMS</h3>
                            <p className="text-black mb-3">SMS로 알림을 발송합니다.</p>
                            {!isSmsOpen && <button
                                className="text-sm text-gray-500 hover:text-gray-700"
                                onClick={handleSmsButtonClick}
                            >
                                계정 추가+
                            </button>}
                            {isSmsOpen && (
                                <div className="mt-4">
                                    <input
                                        type="text"
                                        placeholder="SMS 추가"
                                        value={smsInput}
                                        onChange={(e) => setSmsInput(e.target.value)}
                                        onKeyPress={handleSmsKeyPress}
                                        className="w-1/3 p-2 border border-gray-300 rounded-md mr-2"
                                    />
                                    <Button type="submit" onClick={handleSmsAdd}>추가</Button>
                                </div>
                            )}

                            {/* SMS 계정 목록 */}
                            {smsAccounts.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">등록된 SMS 계정:</h4>
                                    <div className="space-y-2">
                                        {smsAccounts.map((sms, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                                <span className="text-sm text-gray-800">{sms}</span>
                                                <button
                                                    onClick={() => handleSmsDelete(index)}
                                                    className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <label className="inline-flex items-center cursor-pointer ml-4">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={smsNotification}
                                onChange={(e) => setSmsNotification(e.target.checked)}
                            />
                            <div className={`
                                relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
                                ${smsNotification ? 'bg-blue-600' : 'bg-gray-300'}
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

            <div className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-xl font-bold">시설 추가 / 수정 요청</p>
            </div>
            <h1>회원 탈퇴</h1>
        </div>
    )
}
