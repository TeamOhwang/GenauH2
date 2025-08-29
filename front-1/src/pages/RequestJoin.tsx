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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">가입 요청</h1>
            <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors'>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">회사명</th>
                            <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">대표자명</th>
                            <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">연락처</th>
                            <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">사업자등록번호</th>
                            <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">가입 요청일</th>
                            <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">승인/거절</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100">회사명</td>
                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100">대표자명</td>
                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100">연락처</td>
                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100">사업자등록번호</td>
                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100">가입 요청일</td>
                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100">승인/거절</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default RequestJoin