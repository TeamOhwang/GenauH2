import Button from "@/components/ui/Button";
import { useState } from "react";

export default function Setting() {

    const [emailNotification, setEmailNotification] = useState(true);
    const [smsNotification, setSmsNotification] = useState(true);
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [isSmsOpen, setIsSmsOpen] = useState(false);

    const handleEmailButtonClick = () => {
        console.log("이메일 추가 클릭");
        setIsEmailOpen(!isEmailOpen);
    };

    const handleSmsButtonClick = () => {
        console.log("SMS 추가 클릭");
        setIsSmsOpen(!isSmsOpen);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-xl font-bold">비밀번호 변경</p>
                <Button type="submit">비밀번호 변경</Button>
                <span className="text-sm text-red-500"></span>
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
                                    <input type="email" placeholder="이메일 추가" className="w-1/3 p-2 border border-gray-300 rounded-md" />
                                    <Button type="submit" onClick={handleEmailButtonClick}>추가</Button>
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
                                    <input type="text" placeholder="SMS 추가" className="w-1/3 p-2 border border-gray-300 rounded-md" />
                                    <Button type="submit" onClick={handleSmsButtonClick}>추가</Button>
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
