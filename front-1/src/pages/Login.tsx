import { useState } from "react";
import { useLogin } from "@/hooks/useLogin";
import LoginForm from "@/components/LoginForm";
import SignupModal from "@/components/SignupModal";
import { motion, AnimatePresence } from "framer-motion";
import type { LoginValues } from "@/hooks/useLogin";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { roleHome } from "@/routes/paths";

export default function LoginPage() {
  const { submit, loading, error } = useLogin();
  const [signupOpen, setSignupOpen] = useState(false);
  const [playExit, setPlayExit] = useState(false);
  const navigate = useNavigate();

  // 로그인 성공 시 애니메이션 + 라우팅
  const handleLogin = async (values: LoginValues): Promise<boolean> => {
    const ok = await submit(values);
    if (ok) {
      setPlayExit(true);
      setTimeout(() => {
        // 사용자 역할에 따라 적절한 페이지로 리다이렉트
        const role = useAuthStore.getState().role;
        const homePath = role ? roleHome(role) : "/dashboard";
        console.log(`로그인 성공 - 역할 ${role}에 따라 ${homePath}로 리다이렉트`);
        navigate(homePath);
      }, 1000); // 애니메이션 후 라우팅
    }
    return ok;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* 왼쪽 로그인 패널 */}
      <div className="flex w-full md:w-1/2 flex-col items-center justify-center p-8 bg-white relative z-10">
        <h2 className="text-2xl font-bold mb-6">로그인</h2>

        {/* 로그인 폼 */}
        <LoginForm loading={loading} error={error} onSubmit={handleLogin} />

        {/* 회원가입 버튼 */}
        <button
          onClick={() => setSignupOpen(true)}
          className="mt-6 text-blue-600 underline"
        >
          회원가입
        </button>
      </div>

      {/* 오른쪽 이미지 패널 */}
      <AnimatePresence mode="wait">
        {!playExit && (
          <motion.div
            className="hidden md:block md:w-1/2 h-full"
            initial={{ x: 0 }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <img
              src="/images/img_h2.jpg"
              alt="로그인 배경 이미지"
              className="h-full w-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 회원가입 모달 */}
      {signupOpen && <SignupModal onClose={() => setSignupOpen(false)} />}
    </div>
  );
}
