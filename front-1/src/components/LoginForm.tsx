import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";

type Props = {
  loading?: boolean;
  error?: string | null;
  onSubmit: (v: { email: string; password: string }) => void | Promise<void>;
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
    <div >
      <Text variant="title">로그인</Text>

      <form onSubmit={handleSubmit} >
        <label>
          <Text>이메일</Text>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
            autoComplete="email"
          />
        </label>

        <label>
          <Text>비밀번호</Text>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            autoComplete="current-password"
          />
        </label>

        {error && <Text>{error}</Text>}

        <Button type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </Button>
      </form>
    </div>
  );
}