<template>
    <div class="flex flex-col md:flex-row gap-8">
        <!-- 左侧导航栏 -->
        <nav class="w-full md:w-1/4 bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">导航</h3>
            <ul>
                <li class="sidebar-nav-item" :class="{ active: activeSection === 'statisticsSection' }" @click="showSection('statisticsSection')">审核概览</li>
                <li class="sidebar-nav-item" :class="{ active: activeSection === 'questionsSection' }" @click="showSection('questionsSection')">题目列表</li>
                <li class="sidebar-nav-item" :class="{ active: activeSection === 'ipBlacklistSection' }" @click="showSection('ipBlacklistSection')">IP 黑名单管理</li>
                <li class="sidebar-nav-item" :class="{ active: activeSection === 'changePasswordSection' }" @click="showSection('changePasswordSection')">修改管理员密码</li>
                <li class="sidebar-nav-item" :class="{ active: activeSection === 'batchAddQuestionsSection' }" @click="showSection('batchAddQuestionsSection')">批量增加题目</li>
                <li class="sidebar-nav-item" :class="{ active: activeSection === 'addAdminSection', hidden: !canAddAdmin }" @click="showSection('addAdminSection')">新增管理员</li>
            </ul>
        </nav>

        <!-- 右侧内容区域 -->
        <div class="w-full md:w-3/4 bg-white p-0 rounded-lg shadow-none">
            <!-- Statistics Section -->
            <div v-show="activeSection === 'statisticsSection'" class="section mb-8 p-6 border border-gray-200 rounded-lg shadow-sm">
                <h2 class="text-2xl font-semibold text-center mb-6 text-gray-700">审核概览</h2>
                <div id="statisticsPanel" class="bg-blue-50 p-6 rounded-lg">
                    <div class="flex justify-around text-center mb-8">
                        <div>
                            <p class="text-gray-600">待审核题目</p>
                            <p id="pendingCount" class="text-2xl font-bold text-blue-700">{{ pendingCount }}</p>
                        </div>
                        <div class="relative w-32 h-32">
                            <canvas ref="rejectedRatioChartCanvas"></canvas>
                            <div id="rejectedRatioText" class="absolute inset-0 flex items-center justify-center text-2xl font-bold text-red-700">
                                {{ rejectedRatio }}%
                            </div>
                        </div>
                    </div>
                    <h4 class="text-xl font-semibold text-center mb-4 text-gray-800">近几日提交趋势</h4>
                    <div class="relative h-64">
                        <canvas ref="submissionTrendChartCanvas"></canvas>
                    </div>

                    <!-- Suspicious IP Alerts Section -->
                    <div v-if="suspiciousIps.length > 0 || noSuspiciousIpsMessage" class="mt-8 p-4 bg-red-100 border border-red-300 rounded-lg">
                        <h4 class="text-xl font-semibold text-red-800 mb-4">可疑 IP 提交告警</h4>
                        <ul id="suspiciousIpList" class="divide-y divide-red-200">
                            <li v-for="item in suspiciousIps" :key="item.ip" class="py-2 flex justify-between items-center">
                                <span>IP: <strong>{{ item.ip }}</strong> (提交次数: {{ item.count }})</span>
                                <button class="ml-4 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                                        @click="addIpToBlacklistFromAlert(item.ip)">
                                    加入黑名单
                                </button>
                            </li>
                        </ul>
                        <p v-if="noSuspiciousIpsMessage" class="text-red-700 text-center mt-4">{{ noSuspiciousIpsMessage }}</p>
                    </div>
                </div>
            </div>

            <!-- 题目列表部分 -->
            <div v-show="activeSection === 'questionsSection'" class="section mb-8 p-6 border border-gray-200 rounded-lg shadow-sm">
                <h2 class="text-2xl font-semibold text-center mb-6 text-gray-700">题目列表</h2>
                <div class="flex justify-center mb-4 space-x-4">
                    <select id="statusFilter" v-model="statusFilter" @change="loadQuestions"
                            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        <option value="pending">待审核</option>
                        <option value="approved">已通过</option>
                        <option value="rejected">已拒绝</option>
                        <option value="deleted">已删除</option>
                        <option value="all">所有题目</option>
                    </select>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead>
                            <tr>
                                <th class="px-4 py-2 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">题目ID</th>
                                <th class="px-4 py-2 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">题目标题</th>
                                <th class="px-4 py-2 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody id="questionsTable" class="divide-y divide-gray-200">
                            <tr v-if="questions.length === 0">
                                <td colspan="3" class="px-4 py-4 text-center text-gray-500">太棒了！所有待审核题目已处理完毕。感谢您的辛勤工作！</td>
                            </tr>
                            <tr v-for="question in questions" :key="question._id" class="hover:bg-gray-50">
                                <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{{ question._id }}</td>
                                <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{{ question.questionTitle }}</td>
                                <td class="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                    <button @click="showQuestionDetails(question)"
                                            class="inline-flex items-center px-3 py-1.5 border border-transparent
                                                   text-xs font-medium rounded-md shadow-sm text-white bg-blue-600
                                                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                                                   focus:ring-blue-500 transition duration-150 ease-in-out mr-2 mb-1">
                                        查看题目详情
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 题目详情部分 -->
            <div v-show="activeSection === 'questionDetailsSection'" class="section mb-8 p-6 border border-gray-200 rounded-lg shadow-sm">
                <h2 class="text-2xl font-semibold text-center mb-6 text-gray-700">题目详情</h2>
                <div id="questionDetailsContent" class="text-gray-700">
                    <p><strong>题目ID:</strong> {{ currentQuestion._id }}</p>
                    <p><strong>OJ昵称:</strong> {{ currentQuestion.ojName || 'N/A' }}</p>
                    <p><strong>UID:</strong> {{ currentQuestion.uid || 'N/A' }}</p>
                    <p><strong>邮箱:</strong> {{ currentQuestion.email || 'N/A' }}</p>
                    <p><strong>获奖经历:</strong> {{ currentQuestion.awards || '无' }}</p>
                    <p><strong>题目标题:</strong> {{ currentQuestion.questionTitle || 'N/A' }}</p>
                    <p><strong>出题人:</strong> {{ currentQuestion.questionAuthor || 'N/A' }}</p>
                    <p><strong>难度:</strong> {{ getChineseDifficulty(currentQuestion.questionDifficulty) }}</p>
                    <p><strong>状态:</strong> {{ getChineseStatus(currentQuestion.status) }}</p>
                    <p><strong>审核意见:</strong> {{ currentQuestion.comment || '无' }}</p>
                    <p><strong>提交时间:</strong> {{ formatSubmissionDate(currentQuestion.submissionDate) }}</p>
                    <p><strong>提交者IP:</strong> {{ currentQuestion.submitterIp || '未知' }}</p>
                    <h3 class="text-xl font-semibold mt-4 mb-2">题目描述:</h3>
                    <div class="border p-4 rounded-md bg-gray-50 overflow-auto max-h-96">
                        <pre class="whitespace-pre-wrap">{{ currentQuestion.questionDescription || '无描述' }}</pre>
                    </div>
                </div>
                <div class="mt-6 flex justify-center space-x-4">
                    <button @click="showSection('questionsSection')"
                            class="px-6 py-2 bg-gray-600 text-white font-semibold rounded-md shadow-md
                                   hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                                   transition duration-150 ease-in-out">
                        返回题目列表
                    </button>
                    <button v-if="currentQuestion.status === 'pending'" @click="handleApproveQuestion"
                            class="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md
                                   hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                                   transition duration-150 ease-in-out">
                        通过 (快捷键: 1)
                    </button>
                    <button v-if="currentQuestion.status === 'pending'" @click="handleRejectQuestion"
                            class="px-6 py-2 bg-red-600 text-white font-semibold rounded-md shadow-md
                                   hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                                   transition duration-150 ease-in-out">
                        拒绝 (快捷键: 2)
                    </button>
                    <button v-if="currentQuestion.status === 'rejected'" @click="deleteQuestion(currentQuestion._id)"
                            class="px-6 py-2 bg-gray-800 text-white font-semibold rounded-md shadow-md
                                   hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2
                                   transition duration-150 ease-in-out">
                        删除 (仅限已拒绝题目)
                    </button>
                    <button @click="downloadDescription(currentQuestion._id, currentQuestion.questionTitle)"
                            class="px-6 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-md
                                   hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                                   transition duration-150 ease-in-out">
                        下载描述
                    </button>
                    <button @click="downloadDataPackage(currentQuestion._id, currentQuestion.questionTitle)"
                            class="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md
                                   hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                                   transition duration-150 ease-in-out">
                        下载数据包
                    </button>
                </div>
            </div>

            <!-- IP 黑名单管理部分 -->
            <div v-show="activeSection === 'ipBlacklistSection'" class="section p-6 border border-gray-200 rounded-lg shadow-sm">
                <h2 class="text-2xl font-semibold text-center mb-6 text-gray-700">IP 黑名单管理</h2>
                <div class="flex flex-col gap-4 max-w-md mx-auto mb-8">
                    <div>
                        <label for="ipInput" class="block text-sm font-medium text-gray-700 mb-1">IP 地址</label>
                        <input type="text" id="ipInput" v-model="ipInput" placeholder="例如: 192.168.1.1"
                               class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    </div>
                    <div class="flex justify-center space-x-4">
                        <button type="button" @click="addIpToBlacklist()"
                                class="px-6 py-2 bg-red-600 text-white font-semibold rounded-md shadow-md
                                       hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                                       transition duration-150 ease-in-out">
                            加入黑名单
                        </button>
                        <button type="button" @click="removeIpFromBlacklist()"
                                class="px-6 py-2 bg-gray-600 text-white font-semibold rounded-md shadow-md
                                       hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                                       transition duration-150 ease-in-out">
                            从黑名单移除
                        </button>
                    </div>
                </div>
                <h4 class="text-lg font-semibold text-gray-700 mb-2">当前黑名单IP</h4>
                <div class="overflow-x-auto mb-8">
                    <ul id="blacklistedIpsList" class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 max-w-md mx-auto divide-y divide-gray-100">
                        <li v-if="blacklistedIps.length === 0" class="py-2 text-center text-gray-500">暂无黑名单IP。</li>
                        <li v-for="ip in blacklistedIps" :key="ip" class="py-2 px-4 flex justify-between items-center">
                            {{ ip }}
                            <button class="ml-4 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
                                    @click="removeIpFromBlacklist(ip)">
                                移除
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- 修改管理员密码部分 -->
            <div v-show="activeSection === 'changePasswordSection'" class="section p-6 border border-gray-200 rounded-lg shadow-sm">
                <h2 class="text-2xl font-semibold text-center mb-6 text-gray-700">修改管理员密码</h2>
                <div class="flex flex-col gap-4 max-w-md mx-auto">
                    <div>
                        <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
                        <input type="password" id="currentPassword" v-model="changePasswordForm.currentPassword" required
                               class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                        <input type="password" id="newPassword" v-model="changePasswordForm.newPassword" required
                               class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
                        <input type="password" id="confirmNewPassword" v-model="changePasswordForm.confirmNewPassword" required
                               class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    </div>
                    <div class="flex justify-center">
                        <button type="button" @click="changeAdminPassword()"
                                class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md
                                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                       transition duration-150 ease-in-out">
                            修改密码
                        </button>
                    </div>
                </div>
            </div>

            <!-- 批量增加题目部分 -->
            <div v-show="activeSection === 'batchAddQuestionsSection'" class="section p-6 border border-gray-200 rounded-lg shadow-sm">
                <h2 class="text-2xl font-semibold text-center mb-6 text-gray-700">批量增加题目</h2>
                <div class="flex flex-col gap-4 max-w-md mx-auto">
                    <div>
                        <label for="numQuestions" class="block text-sm font-medium text-gray-700 mb-1">要增加的题目数量</label>
                        <input type="number" id="numQuestions" v-model="numQuestionsToAdd" min="1" max="100" required
                               class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    </div>
                    <div class="flex justify-center">
                        <button type="button" @click="batchAddQuestions()"
                                class="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md
                                       hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                                       transition duration-150 ease-in-out">
                            批量增加
                        </button>
                    </div>
                    <div v-if="batchAddResult" class="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                        <div v-html="batchAddResult"></div>
                    </div>
                </div>
            </div>

            <!-- 新增管理员部分 -->
            <div v-show="activeSection === 'addAdminSection'" class="section p-6 border border-gray-200 rounded-lg shadow-sm">
                <h2 class="text-2xl font-semibold text-center mb-6 text-gray-700">新增管理员</h2>
                <div class="flex flex-col gap-4 max-w-md mx-auto">
                    <div>
                        <label for="newAdminEmail" class="block text-sm font-medium text-gray-700 mb-1">管理员邮箱</label>
                        <input type="email" id="newAdminEmail" v-model="newAdminForm.email" required
                               class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    </div>
                    <div>
                        <label for="newAdminPassword" class="block text-sm font-medium text-gray-700 mb-1">管理员密码</label>
                        <input type="password" id="newAdminPassword" v-model="newAdminForm.password" required
                               class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    </div>
                    <div class="flex justify-center">
                        <button type="button" @click="addAdmin()"
                                class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md
                                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                       transition duration-150 ease-in-out">
                            添加管理员
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <MessageBox ref="messageBoxRef" />
    <CommentInputModal ref="commentInputModalRef" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import MessageBox from './MessageBox.vue';
import CommentInputModal from './CommentInputModal.vue'; // Assuming you create this component

const WORKER_BASE_URL = "https://codingapi.mr-onion-blog.fun"; // <<< 请在此处替换为您的 Cloudflare Worker URL

const messageBoxRef = ref(null);
const commentInputModalRef = ref(null);

const activeSection = ref('statisticsSection');
const canAddAdmin = ref(false);

// Statistics data
const pendingCount = ref(0);
const rejectedRatio = ref('0.00');
const rejectedRatioChartCanvas = ref(null);
const submissionTrendChartCanvas = ref(null);
let rejectedRatioChartInstance = null;
let submissionTrendChartInstance = null;
const suspiciousIps = ref([]);
const noSuspiciousIpsMessage = ref('');

// Questions data
const statusFilter = ref('pending');
const questions = ref([]);
const currentQuestion = ref({});

// IP Blacklist data
const ipInput = ref('');
const blacklistedIps = ref([]);

// Change Password data
const changePasswordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
});

// Batch Add Questions data
const numQuestionsToAdd = ref(10);
const batchAddResult = ref('');

// Add Admin data
const newAdminForm = ref({
    email: '',
    password: '',
});

/**
 * Calculates the SHA-256 hash of a given string.
 * @param {string} message - The string to hash.
 * @returns {Promise<string>} A promise that resolves with the SHA-256 hash in hexadecimal format.
 */
async function sha256(message) {
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const byteArray = Array.from(new Uint8Array(hashBuffer));
    const hexHash = byteArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hexHash;
}

/**
 * Parses a JWT token and returns its payload.
 * @param {string} token - The JWT token string.
 * @returns {object|null} The decoded payload object, or null if parsing fails.
 */
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error parsing JWT:", e);
        return null;
    }
}

/**
 * Maps English status values to Chinese equivalents.
 * @param {string} status - The English status string.
 * @returns {string} The corresponding Chinese status string.
 */
function getChineseStatus(status) {
    switch (status) {
        case 'pending': return '待审核';
        case 'approved': return '已通过';
        case 'rejected': return '已拒绝';
        case 'deleted': return '已删除';
        default: return '未知状态';
    }
}

/**
 * Maps English difficulty values to Chinese equivalents.
 * @param {string} difficulty - The English difficulty string.
 * @returns {string} The corresponding Chinese difficulty string.
 */
function getChineseDifficulty(difficulty) {
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
}

const formatSubmissionDate = (dateString) => {
    if (!dateString) return '未知';
    return new Date(dateString).toLocaleString();
};

/**
 * Fetches all questions and updates the statistics panel.
 */
async function fetchQuestionCounts() {
    if (WORKER_BASE_URL === "YOUR_CLOUDFLARE_WORKER_URL_HERE" || !WORKER_BASE_URL) {
        messageBoxRef.value.show('错误：请在代码中设置 WORKER_BASE_URL。');
        console.error('WORKER_BASE_URL is not set for statistics functions.');
        return;
    }

    pendingCount.value = '加载中...';
    rejectedRatio.value = '加载中...';

    const fetchURL = `${WORKER_BASE_URL}/admin/questions?status=all`;
    console.log('Fetching all questions for statistics from:', fetchURL);

    try {
        const response = await fetch(fetchURL, {
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.warn('Not authorized to load question counts. Session might have expired.');
                pendingCount.value = '未授权';
                rejectedRatio.value = '未授权';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const allQuestions = data.questions || [];

        let pCount = 0;
        let rCount = 0;
        let totalCount = allQuestions.length;

        allQuestions.forEach(q => {
            if (q.status === 'pending') {
                pCount++;
            } else if (q.status === 'rejected') {
                rCount++;
            }
        });

        const approvedOrPendingCount = totalCount - rCount;

        pendingCount.value = pCount;
        rejectedRatio.value = totalCount > 0 ? (rCount / totalCount * 100).toFixed(2) : '0.00';

        // Chart.js Donut Chart
        if (rejectedRatioChartInstance) {
            rejectedRatioChartInstance.destroy();
        }
        await nextTick(); // Ensure canvas is rendered
        if (rejectedRatioChartCanvas.value) {
            const ctxRejected = rejectedRatioChartCanvas.value.getContext('2d');
            rejectedRatioChartInstance = new Chart(ctxRejected, {
                type: 'doughnut',
                data: {
                    labels: ['已打回', '其他'],
                    datasets: [{
                        data: [rCount, approvedOrPendingCount],
                        backgroundColor: ['#EF4444', '#3B82F6'],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '80%',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : '0.00';
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Submission Trend Line Chart
        const submissionCounts = {};
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        allQuestions.forEach(q => {
            if (q.submissionDate) {
                const submissionDate = new Date(q.submissionDate);
                if (submissionDate >= sevenDaysAgo) {
                    const dateString = submissionDate.toISOString().split('T')[0];
                    submissionCounts[dateString] = (submissionCounts[dateString] || 0) + 1;
                }
            }
        });

        const labels = [];
        const dataPoints = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateString = date.toISOString().split('T')[0];
            labels.push(date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }));
            dataPoints.push(submissionCounts[dateString] || 0);
        }

        if (submissionTrendChartInstance) {
            submissionTrendChartInstance.destroy();
        }
        await nextTick(); // Ensure canvas is rendered
        if (submissionTrendChartCanvas.value) {
            const ctxTrend = submissionTrendChartCanvas.value.getContext('2d');
            submissionTrendChartInstance = new Chart(ctxTrend, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '每日提交数量',
                        data: dataPoints,
                        borderColor: '#4F46E5',
                        backgroundColor: 'rgba(79, 70, 229, 0.2)',
                        fill: true,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { precision: 0 } }
                    }
                }
            });
        }

    } catch (error) {
        console.error('Error fetching question counts:', error);
        pendingCount.value = '加载失败';
        rejectedRatio.value = '加载失败';
        if (rejectedRatioChartInstance) { rejectedRatioChartInstance.destroy(); rejectedRatioChartInstance = null; }
        if (submissionTrendChartInstance) { submissionTrendChartInstance.destroy(); submissionTrendChartInstance = null; }
    }
}

/**
 * Fetches suspicious IP addresses (those with high submission counts) and displays them.
 */
async function fetchSuspiciousIps() {
    if (!WORKER_BASE_URL) {
        messageBoxRef.value.show('错误：请在代码中设置 WORKER_BASE_URL。');
        console.error('WORKER_BASE_URL is not set for suspicious IP functions.');
        return;
    }

    suspiciousIps.value = [];
    noSuspiciousIpsMessage.value = '';

    const fetchURL = `${WORKER_BASE_URL}/admin/suspicious-ips`;
    console.log('Fetching suspicious IPs from:', fetchURL);

    try {
        const response = await fetch(fetchURL, {
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.warn('Not authorized to load suspicious IPs. Session might have expired.');
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        suspiciousIps.value = data.ips || [];

        if (suspiciousIps.value.length === 0) {
            noSuspiciousIpsMessage.value = '暂无可疑 IP。';
        }

    } catch (error) {
        console.error('Error fetching suspicious IPs:', error);
        noSuspiciousIpsMessage.value = `加载可疑 IP 失败: ${error.message}`;
    }
}

/**
 * Helper function to add an IP to blacklist directly from the alert.
 * @param {string} ip - The IP address to blacklist.
 */
async function addIpToBlacklistFromAlert(ip) {
    ipInput.value = ip;
    await addIpToBlacklist();
    fetchSuspiciousIps();
}

/**
 * Shows a specific content section and hides others.
 * Also updates the active state of sidebar navigation items.
 * @param {string} sectionId - The ID of the section to show (e.g., 'questionsSection', 'adminToolsSection').
 */
function showSection(sectionId) {
    activeSection.value = sectionId;
    if (sectionId === 'statisticsSection') {
        fetchQuestionCounts();
        fetchSuspiciousIps();
    } else if (sectionId === 'questionsSection') {
        loadQuestions();
    } else if (sectionId === 'ipBlacklistSection') {
        loadBlacklistedIps();
    }
}

/**
 * Loads questions from the backend based on the selected status filter and populates the table.
 * Calls the Cloudflare Worker to get questions.
 */
async function loadQuestions() {
    if (WORKER_BASE_URL === "YOUR_CLOUDFLARE_WORKER_URL_HERE" || !WORKER_BASE_URL) {
        messageBoxRef.value.show('错误：请在代码中设置 WORKER_BASE_URL。');
        console.error('WORKER_BASE_URL is not set. Please configure your Cloudflare Worker URL.');
        return;
    }

    const fetchURL = `${WORKER_BASE_URL}/admin/questions?status=${statusFilter.value}`;
    console.log('Fetching questions from:', fetchURL);

    try {
        const response = await fetch(fetchURL, {
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401) {
                messageBoxRef.value.show('会话已过期或未登录。请重新登录。');
                // Optionally emit an event to parent to handle re-login
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        questions.value = data.questions || [];

    } catch (error) {
        console.error('Error loading questions:', error);
        messageBoxRef.value.show('加载题目列表失败。错误详情: ' + error.message);
    }
}

/**
 * Displays the full details of a selected question and its actions.
 * @param {object} question - The full question object.
 */
function showQuestionDetails(question) {
    currentQuestion.value = question;
    showSection('questionDetailsSection');
}

/**
 * Downloads the question description as a markdown file.
 */
async function downloadDescription(questionId, title) {
    if (WORKER_BASE_URL === "YOUR_CLOUDFLARE_WORKER_URL_HERE" || !WORKER_BASE_URL) {
        messageBoxRef.value.show('错误：请在代码中设置 WORKER_BASE_URL。');
        console.error('WORKER_BASE_URL is not set. Please configure your Cloudflare Worker URL.');
        return;
    }
    const fetchURL = `${WORKER_BASE_URL}/admin/download/description/${questionId}`;
    console.log('Downloading description from:', fetchURL);

    try {
        const response = await fetch(fetchURL, { credentials: 'include' });
        if (!response.ok) {
            if (response.status === 401) {
                messageBoxRef.value.show('会话已过期或未登录。请重新登录。');
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const markdownContent = await response.text();
        const blob = new Blob([markdownContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        messageBoxRef.value.show('题目描述下载成功！');
    } catch (error) {
        console.error('Error downloading description:', error);
        messageBoxRef.value.show('下载题目描述失败。错误详情: ' + error.message);
    }
}

/**
 * Downloads the data package as a zip file.
 */
async function downloadDataPackage(questionId, title) {
    if (WORKER_BASE_URL === "YOUR_CLOUDFLARE_WORKER_URL_HERE" || !WORKER_BASE_URL) {
        messageBoxRef.value.show('错误：请在代码中设置 WORKER_BASE_URL。');
        console.error('WORKER_BASE_URL is not set. Please configure your Cloudflare Worker URL.');
        return;
    }
    const fetchURL = `${WORKER_BASE_URL}/admin/download/data/${questionId}`;
    console.log('Downloading data package from:', fetchURL);

    try {
        const response = await fetch(fetchURL, { credentials: 'include' });
        if (!response.ok) {
            if (response.status === 401) {
                messageBoxRef.value.show('会话已过期或未登录。请重新登录。');
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}_data.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        messageBoxRef.value.show('数据包下载成功！');
    } catch (error) {
        console.error('Error downloading data package:', error);
        messageBoxRef.value.show('下载数据包失败。错误详情: ' + error.message);
    }
}

/**
 * Handles approving a question, showing a comment modal first.
 */
async function handleApproveQuestion() {
    try {
        const comment = await commentInputModalRef.value.show('请输入通过意见');
        approveQuestion(currentQuestion.value._id, comment);
    } catch (error) {
        console.log(error.message);
    }
}

/**
 * Handles rejecting a question, showing a comment modal first.
 */
async function handleRejectQuestion() {
    try {
        const comment = await commentInputModalRef.value.show('请输入拒绝意见');
        rejectQuestion(currentQuestion.value._id, comment);
    } catch (error) {
        console.log(error.message);
    }
}

/**
 * Approves a question by sending a POST request to the backend.
 */
async function approveQuestion(questionId, comment) {
    if (WORKER_BASE_URL === "YOUR_CLOUDFLARE_WORKER_URL_HERE" || !WORKER_BASE_URL) {
        messageBoxRef.value.show('错误：请在代码中设置 WORKER_BASE_URL。');
        console.error('WORKER_BASE_URL is not set. Please configure your Cloudflare Worker URL.');
        return;
    }
    const fetchURL = `${WORKER_BASE_URL}/admin/approve/${questionId}`;
    console.log('Approving question at:', fetchURL, 'with comment:', comment);
    try {
        const response = await fetch(fetchURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment: comment }),
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401) {
                messageBoxRef.value.show('会话已过期或未登录。请重新登录。');
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        messageBoxRef.value.show(data.message);
        loadQuestions();
        fetchQuestionCounts();
        showSection('questionsSection'); // Go back to list after action
    } catch (error) {
        console.error('Error approving question:', error);
        messageBoxRef.value.show('通过审核失败。错误详情: ' + error.message);
    }
}

/**
 * Rejects a question by sending a POST request to the backend.
 */
async function rejectQuestion(questionId, comment) {
    if (WORKER_BASE_URL === "YOUR_CLOUDFLARE_WORKER_URL_HERE" || !WORKER_BASE_URL) {
        messageBoxRef.value.show('错误：请在代码中设置 WORKER_BASE_URL。');
        console.error('WORKER_BASE_URL is not set. Please configure your Cloudflare Worker URL.');
        return;
    }
    const fetchURL = `${WORKER_BASE_URL}/admin/reject/${questionId}`;
    console.log('Rejecting question at:', fetchURL, 'with comment:', comment);
    try {
        const response = await fetch(fetchURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment: comment }),
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401) {
                messageBoxRef.value.show('会话已过期或未登录。请重新登录。');
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        messageBoxRef.value.show(data.message);
        loadQuestions();
        fetchQuestionCounts();
        showSection('questionsSection'); // Go back to list after action
    } catch (error) {
        console.error('Error rejecting question:', error);
        messageBoxRef.value.show('拒绝审核失败。错误详情: ' + error.message);
    }
}

/**
 * Soft-deletes a question by sending a POST request to the backend.
 */
async function deleteQuestion(questionId) {
    if (!WORKER_BASE_URL) {
        messageBoxRef.value.show('错误：WORKER_BASE_URL 未设置。请在代码中设置您的 Cloudflare Worker URL。');
        console.error('WORKER_BASE_URL is not set. Please configure your Cloudflare Worker URL.');
        return;
    }

    const confirmDelete = await messageBoxRef.value.show('确定要删除此题目吗？删除后题目内容将被清空，仅保留ID和状态。此操作不可逆！');
    if (!confirmDelete) {
        return;
    }

    const fetchURL = `${WORKER_BASE_URL}/admin/soft-delete/${questionId}`;
    console.log('Soft-deleting question at:', fetchURL);

    try {
        const response = await fetch(fetchURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            messageBoxRef.value.show(data.message);
            loadQuestions();
            fetchQuestionCounts();
            showSection('questionsSection');
        } else {
            messageBoxRef.value.show(data.message || '删除题目失败。');
        }
    } catch (error) {
        console.error('Error deleting question:', error);
        messageBoxRef.value.show('删除题目过程中发生错误。错误详情: ' + error.message);
    }
}

/**
 * Handles changing the admin password.
 */
async function changeAdminPassword() {
    if (WORKER_BASE_URL === "YOUR_CLOUDFLARE_WORKER_URL_HERE" || !WORKER_BASE_URL) {
        messageBoxRef.value.show('错误：请在代码中设置 WORKER_BASE_URL。');
        console.error('WORKER_BASE_URL is not set. Please configure your Cloudflare Worker URL.');
        return;
    }

    const { currentPassword, newPassword, confirmNewPassword } = changePasswordForm.value;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        messageBoxRef.value.show('所有密码字段都不能为空。');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        messageBoxRef.value.show('新密码和确认密码不匹配。');
        return;
    }

    if (newPassword.length < 6) {
        messageBoxRef.value.show('新密码长度不能少于6位。');
        return;
    }

    const hashedCurrentPassword = await sha256(currentPassword);
    const hashedNewPassword = await sha256(newPassword);

    const fetchURL = `${WORKER_BASE_URL}/admin/change-password`;
    console.log('Attempting to change password at:', fetchURL);

    try {
        const response = await fetch(fetchURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentPassword: hashedCurrentPassword,
                newPassword: hashedNewPassword
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok && data.success) {
            messageBoxRef.value.show(data.message);
            changePasswordForm.value = { currentPassword: '', newPassword: '', confirmNewPassword: '' };
        } else {
            messageBoxRef.value.show(data.message || '修改密码失败。');
        }
    } catch (error) {
        console.error('Change password error:', error);
        messageBoxRef.value.show('修改密码过程中发生错误。错误详情: ' + error.message);
    }
}

/**
 * Handles batch adding of questions for testing purposes.
 */
async function batchAddQuestions() {
    if (!WORKER_BASE_URL) {
        messageBoxRef.value.show('错误：WORKER_BASE_URL 未设置。请在代码中设置您的 Cloudflare Worker URL。');
        console.error('WORKER_BASE_URL is not set. Please configure your Cloudflare Worker URL.');
        return;
    }

    const num = parseInt(numQuestionsToAdd.value, 10);

    if (isNaN(num) || num < 1 || num > 100) {
        messageBoxRef.value.show('请输入一个介于 1 到 100 之间的有效题目数量。');
        return;
    }

    batchAddResult.value = '正在生成题目，请稍候...';

    const fetchURL = `${WORKER_BASE_URL}/admin/batch-add-questions`;
    console.log(`Attempting to batch add ${num} questions to:`, fetchURL);

    try {
        const response = await fetch(fetchURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count: num }),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            let resultHtml = `<p class="text-green-700">成功生成 ${data.generatedIds.length} 个题目！</p>`;
            if (data.generatedIds && data.generatedIds.length > 0) {
                resultHtml += '<p>生成的题目 ID:</p><ul>';
                data.generatedIds.forEach(id => {
                    resultHtml += `<li>${id}</li>`;
                });
                resultHtml += '</ul>';
            }
            batchAddResult.value = resultHtml;
            messageBoxRef.value.show(data.message || `成功生成 ${data.generatedIds.length} 个题目！`);
            loadQuestions();
            fetchQuestionCounts();
        } else {
            batchAddResult.value = `<p class="text-red-700">生成题目失败: ${data.message || '未知错误'}</p>`;
            messageBoxRef.value.show(data.message || '生成题目失败。');
        }
    } catch (error) {
        console.error('Error batch adding questions:', error);
        batchAddResult.value = `<p class="text-red-700">生成题目过程中发生错误: ${error.message}</p>`;
        messageBoxRef.value.show('生成题目过程中发生错误。错误详情: ' + error.message);
    }
}

/**
 * Handles adding a new admin.
 */
async function addAdmin() {
    if (!WORKER_BASE_URL) {
        messageBoxRef.value.show('错误：WORKER_BASE_URL 未设置。请在代码中设置您的 Cloudflare Worker URL。');
        console.error('WORKER_BASE_URL is not set. Please configure your Cloudflare Worker URL.');
        return;
    }

    const { email, password } = newAdminForm.value;

    if (!email || !password) {
        messageBoxRef.value.show('管理员邮箱和密码都不能为空。');
        return;
    }

    if (password.length < 6) {
        messageBoxRef.value.show('管理员密码长度不能少于6位。');
        return;
    }

    const hashedNewAdminPassword = await sha256(password);

    const fetchURL = `${WORKER_BASE_URL}/admin/add-admin`;
    console.log('Attempting to add new admin at:', fetchURL);

    try {
        const response = await fetch(fetchURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: hashedNewAdminPassword
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok && data.success) {
            messageBoxRef.value.show(data.message);
            newAdminForm.value = { email: '', password: '' };
        } else {
            messageBoxRef.value.show(data.message || '添加管理员失败。');
        }
    } catch (error) {
        console.error('Add admin error:', error);
        messageBoxRef.value.show('添加管理员过程中发生错误。错误详情: ' + error.message);
    }
}

/**
 * Adds an IP address to the blacklist.
 */
async function addIpToBlacklist() {
    const ip = ipInput.value.trim();
    if (!ip) {
        messageBoxRef.value.show('请输入要加入黑名单的IP地址。');
        return;
    }

    const fetchURL = `${WORKER_BASE_URL}/admin/blacklist-ip`;
    try {
        const response = await fetch(fetchURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip: ip }),
            credentials: 'include'
        });
        const data = await response.json();
        if (response.ok) {
            messageBoxRef.value.show(data.message);
            ipInput.value = '';
            loadBlacklistedIps();
        } else {
            messageBoxRef.value.show(data.message || '加入黑名单失败。');
        }
    } catch (error) {
        console.error('Error adding IP to blacklist:', error);
        messageBoxRef.value.show('加入黑名单失败。错误详情: ' + error.message);
    }
}

/**
 * Removes an IP address from the blacklist.
 */
async function removeIpFromBlacklist(ipToRemove = null) {
    const ip = ipToRemove || ipInput.value.trim();
    if (!ip) {
        messageBoxRef.value.show('请输入要从黑名单移除的IP地址。');
        return;
    }

    const fetchURL = `${WORKER_BASE_URL}/admin/unblacklist-ip`;
    try {
        const response = await fetch(fetchURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip: ip }),
            credentials: 'include'
        });
        const data = await response.json();
        if (response.ok) {
            messageBoxRef.value.show(data.message);
            ipInput.value = '';
            loadBlacklistedIps();
        } else {
            messageBoxRef.value.show(data.message || '从黑名单移除失败。');
        }
    } catch (error) {
        console.error('Error removing IP from blacklist:', error);
        messageBoxRef.value.show('从黑名单移除失败。错误详情: ' + error.message);
    }
}

/**
 * Loads the list of blacklisted IPs from the backend and displays them.
 */
async function loadBlacklistedIps() {
    if (WORKER_BASE_URL === "YOUR_CLOUDFLARE_WORKER_URL_HERE" || !WORKER_BASE_URL) {
        console.error('WORKER_BASE_URL is not set for blacklist functions.');
        return;
    }

    const fetchURL = `${WORKER_BASE_URL}/admin/blacklist-ips`;
    try {
        const response = await fetch(fetchURL, { credentials: 'include' });
        if (!response.ok) {
            if (response.status === 401) {
                console.warn('Not authorized to load blacklisted IPs. Session might have expired.');
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        blacklistedIps.value = data.ips || [];
    } catch (error) {
        console.error('Error loading blacklisted IPs:', error);
        messageBoxRef.value.show('加载黑名单IP失败。错误详情: ' + error.message);
    }
}

onMounted(() => {
    // Check admin permissions from JWT in cookie
    const jwtToken = document.cookie.split('; ').find(row => row.startsWith('jwt_token='))?.split('=')[1];
    if (jwtToken) {
        const payload = parseJwt(jwtToken);
        if (payload && payload.canAddAdmin) {
            canAddAdmin.value = true;
        }
    }

    showSection('statisticsSection'); // Default view

    // Keyboard shortcuts for review actions
    window.addEventListener('keydown', (event) => {
        if (activeSection.value === 'questionDetailsSection') {
            if (event.key === '1') {
                event.preventDefault();
                handleApproveQuestion();
            } else if (event.key === '2') {
                event.preventDefault();
                handleRejectQuestion();
            }
        }
    });
});

onUnmounted(() => {
    if (rejectedRatioChartInstance) { rejectedRatioChartInstance.destroy(); }
    if (submissionTrendChartInstance) { submissionTrendChartInstance.destroy(); }
    window.removeEventListener('keydown', () => {}); // Clean up event listener
});
</script>

<style scoped>
/* Sidebar navigation styles */
.sidebar-nav-item {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    border-radius: 0.375rem; /* rounded-md */
}
.sidebar-nav-item:hover {
    background-color: #e5e7eb; /* gray-200 */
}
.sidebar-nav-item.active {
    background-color: #d1d5db; /* gray-300 */
    font-weight: 600;
    color: #1f2937; /* gray-900 */
}
</style>
