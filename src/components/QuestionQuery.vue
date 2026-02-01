<template>
    <div class="section mb-8 p-6 border border-gray-200 rounded-lg shadow-sm">
        <h2 class="text-2xl font-semibold text-center mb-6 text-gray-700">查询题目审核状态</h2>
        <form @submit.prevent="submitQuery" class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <label for="queryQuestionId" class="text-sm font-medium text-gray-700">请输入题目ID</label>
            <input type="text" id="queryQuestionId" v-model="queryId" required
                   class="flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <button type="submit"
                    class="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md
                           hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                           transition duration-150 ease-in-out">
                查询状态
            </button>
        </form>
        <div id="queryResult" :class="queryResultClass">
            <div v-if="queryResult.question">
                <table>
                    <thead>
                        <tr>
                            <th>题目标题</th>
                            <th>出题人</th>
                            <th>难度</th>
                            <th>状态</th>
                            <th>审核意见</th>
                            <th>提交时间</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{{ queryResult.question.questionTitle || 'N/A' }}</td>
                            <td>{{ queryResult.question.questionAuthor || 'N/A' }}</td>
                            <td>{{ getChineseDifficulty(queryResult.question.questionDifficulty) }}</td>
                            <td>{{ getChineseStatus(queryResult.question.status) }}</td>
                            <td>{{ queryResult.question.comment || '无' }}</td>
                            <td>{{ formatSubmissionDate(queryResult.question.submissionDate) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else-if="queryResult.message">
                {{ queryResult.message }}
            </div>
            <div v-else-if="queryError">
                {{ queryError }}
            </div>
        </div>
    </div>

    <MessageBox ref="messageBoxRef" />
</template>

<script setup>
import { ref, computed } from 'vue';
import MessageBox from './MessageBox.vue';

const WORKER_BASE_URL = "https://codingapi.yaoonion.fun"; // <<< 请在此处替换为您的 Cloudflare Worker URL

const messageBoxRef = ref(null);
const queryId = ref('');
const queryResult = ref({});
const queryError = ref('');

const queryResultClass = computed(() => {
    return {
        'mt-6': true,
        'p-4': !queryResult.value.question,
        'bg-blue-50': !queryResult.value.question,
        'border': !queryResult.value.question,
        'border-blue-200': !queryResult.value.question,
        'text-blue-800': !queryResult.value.question,
        'rounded-md': true,
        'text-center': !queryResult.value.question,
        'hidden': !queryResult.value.question && !queryError.value,
        'p-0': queryResult.value.question, // No padding for table container
        'border-0': queryResult.value.question, // No border for table container
        'shadow-none': queryResult.value.question, // No shadow for table container
    };
});

const getChineseStatus = (status) => {
    switch (status) {
        case 'pending': return '待审核';
        case 'approved': return '已通过';
        case 'rejected': return '已拒绝';
        case 'deleted': return '已删除';
        default: return '未知状态';
    }
};

const getChineseDifficulty = (difficulty) => {
    switch (difficulty) {
        case 'easy': return '入门';
        case 'medium': return '普及-';
        case 'hard': return '普及/提高-';
        case 'qwe': return '普及+/提高';
        case 'df': return '提高+/省选-';
        case 'noi': return '省选/NOI-';
        case 'ctsc': return 'NOI/NOI+CTSC';
        default: return '未知难度';
    }
};

const formatSubmissionDate = (dateString) => {
    if (!dateString) return '未知';
    return new Date(dateString).toLocaleString();
};

const submitQuery = async () => {
    if (WORKER_BASE_URL === "YOUR_CLOUDFLARE_WORKER_URL_HERE" || !WORKER_BASE_URL) {
        messageBoxRef.value.show('错误：请在代码中设置 WORKER_BASE_URL。');
        console.error('WORKER_BASE_URL is not set. Please configure your Cloudflare Worker URL.');
        return;
    }

    queryResult.value = {};
    queryError.value = '';

    if (!queryId.value) {
        messageBoxRef.value.show('请输入题目ID进行查询。');
        return;
    }

    const fetchURL = `${WORKER_BASE_URL}/query?id=${encodeURIComponent(queryId.value)}`;
    console.log('Querying status from:', fetchURL);

    try {
        const response = await fetch(fetchURL);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        queryResult.value = data;

        if (!data.question && !data.message) {
            queryError.value = '查询失败或无结果。';
        }

    } catch (error) {
        console.error('Error:', error);
        queryError.value = '查询过程中发生错误。错误详情: ' + error.message;
    }
};
</script>

<style scoped>
/* Custom table styles for query results */
#queryResult table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border-radius: 0.5rem;
    overflow: hidden; /* Ensures rounded corners apply to table content */
}
#queryResult th, #queryResult td {
    padding: 0.75rem 1rem; /* px-4 py-2 equivalent */
    border: 1px solid #e5e7eb; /* border-gray-300 equivalent */
    text-align: left;
}
#queryResult th {
    background-color: #f9fafb; /* bg-gray-50 equivalent */
    font-weight: 600;
    color: #4b5563; /* text-gray-600 equivalent */
    text-transform: uppercase;
    font-size: 0.75rem; /* text-xs equivalent */
    letter-spacing: 0.05em; /* tracking-wider equivalent */
}
#queryResult tbody tr:nth-child(even) {
    background-color: #f3f4f6; /* bg-gray-100 equivalent for alternating rows */
}
#queryResult tbody tr:hover {
    background-color: #e5eeef; /* hover:bg-gray-100 equivalent */
}
#queryResult td {
    color: #374151; /* text-gray-700 equivalent */
    font-size: 0.875rem; /* text-sm equivalent */
}
</style>
