import { useAdmin } from "@/hooks/useAdmin";
import { useState } from "react";

type RegiFromProps = { onSuccess?: () => void };

export default function RegiFrom({ onSuccess }: RegiFromProps) {
    const [form, setFrom] = useState({
        orgName: "", // 회사 이름
        ownerName: "", // 대표 이름
        bizRegNo: "", // 사업자 번호
        email: "", // 아이디
        password: "0000", // 비밀번호
        phoneNum: "", // 전화번호
    })

    const { addUser, loading, error} = useAdmin();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFrom({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = await addUser(form);
        if (user) {
            alert("회원 등록 성공");
            onSuccess?.();
        } else {
            alert(error ?? "회원 등록 실패");
        }

    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="text"
                name="email"
                placeholder="이메일"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
            />
            <input
                type="text"
                name="orgName"
                placeholder="회사명"
                value={form.orgName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
            />
            <input
                type="text"
                name="ownerName"
                placeholder="대표자명"
                value={form.ownerName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
            />
            <input
                type="text"
                name="bizRegNo"
                placeholder="사업자번호"
                value={form.bizRegNo}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
            />
            <input
                type="text"
                name="phoneNum"
                placeholder="전화번호"
                value={form.phoneNum}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
            />
            <button 
                type="submit"
                className="w-full bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600"
                disabled={loading}
            > {loading ? "등록 중..." : "회원 등록"} </button>
        </form>
    )
}