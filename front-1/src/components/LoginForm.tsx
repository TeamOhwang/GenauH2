import { useState, FormEvent } from "react";
import type { LoginValues } from "@/hooks/useLogin";
import Button from "./ui/Button";

type Props = {
  loading?: boolean;
  error?: string | null;
  onSubmit: (v: LoginValues) => Promise<boolean>;
};

export default function LoginForm({ loading = false, error, onSubmit }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    await onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs">
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        required
        disabled={loading}
        className="border rounded px-3 py-2"
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        required
        disabled={loading}
        className="border rounded px-3 py-2"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
