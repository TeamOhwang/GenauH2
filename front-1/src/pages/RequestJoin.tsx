import { getPendingsApi } from '@/api/adminApi';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { updateUserStatus } from '@/api/adminService';

interface PendingUser {
    orgId: string;
    orgName: string;
    name: string;
    email: string;
    phoneNum: string;
    bizRegNo: string;
    createdAt: string;
    status: 'INVITED';
}

const RequestJoin = () => {
    const [pendings, setPendings] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPendings = async () => {
            try {
                setLoading(true);
                const response = await getPendingsApi();
                console.log('API 응답:', response);

                // 응답 데이터 구조 확인 및 안전한 처리
                let pendingUsers: PendingUser[] = [];

                if (Array.isArray(response)) {
                    pendingUsers = response;
                } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
                    pendingUsers = response.data;
                } else if (response && typeof response === 'object' && 'content' in response && Array.isArray(response.content)) {
                    pendingUsers = response.content;
                } else {
                    console.warn('예상하지 못한 API 응답 구조:', response);
                    pendingUsers = [];
                }

                setPendings(pendingUsers);
            } catch (err) {
                setError('가입 요청 목록을 불러오는데 실패했습니다.');
                console.error('Error fetching pendings:', err);
                setPendings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPendings();
    }, []);

    const handleApprove = async (orgId: string) => {
        try {
            const result = await updateUserStatus(orgId, "ACTIVE")
            if (result) {
                alert("승인 처리가 완료되었습니다. ordId : " + orgId);
            } else {
                alert("승인 처리 중 오류가 발생했습니다." + error);
            }
        } catch (err) {
            alert('승인 처리 중 오류가 발생했습니다.');
        }
    };

    // const handleReject = async (orgId: string) => {
    //     try {
    //         // TODO: 거절 API 호출
    //         alert('거절 기능은 추후 구현 예정입니다.');
    //         console.log('거절:', orgId);
    //     } catch (err) {
    //         alert('거절 처리 중 오류가 발생했습니다.');
    //     }
    // };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch {
            return 'N/A';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">가입 요청 목록을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors p-6">
                <div className="text-center py-8">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">가입 요청 관리</h1>

            {/* 요약 통계 */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-6 text-center">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{pendings.length}</p>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">대기 중인 요청</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-6 text-center">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">0</p>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">오늘 승인된 요청</p>
                    </CardContent>
                </Card> */}
                {/* <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-6 text-center">
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">0</p>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">오늘 거절된 요청</p>
                    </CardContent>
                </Card> */}
            {/* </div> */}

            {/* 가입 요청 테이블 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">가입 요청 목록</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        총 {pendings.length}개의 가입 요청이 대기 중입니다.
                    </p>
                </div>

                {pendings.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">대기 중인 가입 요청이 없습니다.</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                            새로운 회원가입 요청이 들어오면 여기에 표시됩니다.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">회사명</th>
                                    <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">대표자명</th>
                                    <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">이메일</th>
                                    <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">연락처</th>
                                    <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">사업자등록번호</th>
                                    <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">가입 요청일</th>
                                    <th className="text-center py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold">작업</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {pendings.map((user) => (
                                    // hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                                    <tr key={user.orgId} className=""> 
                                        <td className="py-4 px-6 text-gray-900 dark:text-gray-100 font-medium">
                                            {user.orgName || 'N/A'}
                                        </td>
                                        <td className="py-4 px-6 text-gray-900 dark:text-gray-100">
                                            {user.name || 'N/A'}
                                        </td>
                                        <td className="py-4 px-6 text-gray-900 dark:text-gray-100">
                                            {user.email || 'N/A'}
                                        </td>
                                        <td className="py-4 px-6 text-gray-900 dark:text-gray-100">
                                            {user.phoneNum || 'N/A'}
                                        </td>
                                        <td className="py-4 px-6 text-gray-900 dark:text-gray-100 font-mono">
                                            {user.bizRegNo || 'N/A'}
                                        </td>
                                        <td className="py-4 px-6 text-gray-900 dark:text-gray-100">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleApprove(user.orgId)}
                                                    className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                                >
                                                    승인
                                                </button>
                                                {/* <button
                                                    onClick={() => handleReject(user.orgId)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                                                >
                                                    거절
                                                </button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestJoin;