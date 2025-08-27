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
        {/* 로고 */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 bg-black rounded-sm" />
          <span className="font-bold text-lg">SaveUp</span>
        </div>

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
          src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1200"
          alt="City view"
          className="h-full w-full object-cover"
        />
      </div>

      {/* 회원가입 모달 */}
      {signupOpen && <SignupModal onClose={() => setSignupOpen(false)} />}
    </div>
  );
}
