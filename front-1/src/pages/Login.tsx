import { useLogin } from "@/hooks/useLogin";
import LoginForm from "@/components/LoginForm";

export default function Login() {
  const { submit, loading, error } = useLogin();

  return (
    <LoginForm 
      loading={loading} 
      error={error} 
      onSubmit={submit} 
    />
  );
}