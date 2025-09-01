// src/pages/LoginPage.tsx
import { useState } from "react";
import { useLogin } from "@/hooks/useLogin";
import LoginForm from "@/components/LoginForm";
import SignupModal from "@/components/SignupModal";


export default function LoginPage() {
  const { submit, loading, error } = useLogin();
  const [signupOpen, setSignupOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen">
      {/* 왼쪽 로그인 패널 */}
      <div className="flex w-full md:w-1/2 flex-col items-center justify-center p-8 bg-white">
        <h2 className="text-2xl font-bold mb-6">로그인</h2>

        {/* 로그인 폼 */}
        <LoginForm loading={loading} error={error} onSubmit={submit} />

        {/* 회원가입 버튼 */}
        <button
          onClick={() => setSignupOpen(true)}
          className="mt-6 text-blue-600 underline"
        >
          회원가입
        </button>
      </div>

      {/* 오른쪽 이미지 패널 */}
      <div className="hidden md:block md:w-1/2">
        <img
          src="/images/img_h2.jpg"
          alt="로그인 배경 이미지"
          className="h-full w-full object-cover"
        />
      </div>

      {/* 회원가입 모달 */}
      {signupOpen && <SignupModal onClose={() => setSignupOpen(false)} />}
    </div>
  );
}
