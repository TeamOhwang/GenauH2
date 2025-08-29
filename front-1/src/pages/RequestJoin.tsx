import { getPendingsApi } from '@/api/adminApi';
import { useEffect, useState } from 'react';

const RequestJoin = () => {

    const [pendings, setPendings] = useState<any[]>([]);

    useEffect(() => {
        const fetchPendings = async () => {
            const pendings = await getPendingsApi();
            setPendings(pendings);
        };
        fetchPendings();
    }, []);


    return (
        <div>
            <h1>가입 요청</h1>
            <div className='w-full'>
                <table>
                    <thead>
                        <tr>
                            <th>회사명</th>
                            <th>대표자명</th>
                            <th>연락처</th>
                            <th>사업자등록번호</th>
                            <th>가입 요청일</th>
                            <th>승인/거절</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>회사명</td>
                            <td>대표자명</td>
                            <td>연락처</td>
                            <td>사업자등록번호</td>
                            <td>가입 요청일</td>
                            <td>승인/거절</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default RequestJoin