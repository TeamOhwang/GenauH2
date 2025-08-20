import { useState } from "react";

export default function RegiFrom() {
    const [form, setFrom] = useState({
        email: "", // 아이디
        username: "", // 사업자 명
        orgId: "", // 사업자 아이디
        affiliation: "", // 소속, 회사
        phone: "", // 연락처
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFrom({ ...form, [e.target.name]: e.target.value })
    }
}