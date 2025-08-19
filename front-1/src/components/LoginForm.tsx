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
    <div style={{ maxWidth: 360, margin: "60px auto", padding: 24, border: "1px solid #eee", borderRadius: 12 }}>
      <Text variant="title">로그인</Text>

      <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <label>
          <Text>이메일</Text>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
            autoComplete="email"
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
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
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
        </label>

        {error && <Text color="#c00" style={{ marginTop: 4 }}>{error}</Text>}

        <Button type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? "로그인 중..." : "로그인"}
        </Button>
      </form>
    </div>
  );
}