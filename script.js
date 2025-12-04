// =======================================================
// script.js - Davomat Jurnali Mantiqi (Notification bilan)
// =======================================================

// ---------------------------
// 1. CONFIGURATION & MA'LUMOTLAR - **USHBU QISMLARNI TEKSHIRING!**
// ---------------------------

// Telegram Bot Konfiguratsiyasi (Konfiguratsiyani o'zgartiring)
// **MUHIM:** Bu yerga o'zingizning haqiqiy BOT TOKENINGIZNI KIRITING
const BOT_TOKEN = "8444731509:AAExJdlcYKS4u4lgZUpxyMFDrNjjMp-ZlbA";
// **MUHIM:** Bu yerga o'zingizning haqiqiy CHAT ID'SINI KIRITING
const CHAT_ID = "-1003377614514";
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
const UNAVAILABLE_REASON = "Sababsiz (Habarimiz yo'q)";

// Dars jadvallari (Bugungi darslarni o'zgartirishingiz mumkin)
const SCHEDULE = {
    "Monday": ["Information Technology Systems (Lecture)", "Website Development", "Website Development"],
    "Tuesday": ["Study Skills", "Falsafa L3", "Information Technology Systems (Practice)"],
    "Wednesday": ["Study Skills", "Programming (Practice) L3", "Programming (Lecture) L3"],
    "Thursday": ["Enterprise in IT", "Programming (Practice) L3"],
    "Friday": ["English L3"]
}


// O'quvchilarning yangilangan ro'yxati
const INITIAL_STUDENTS = [
    { id: 1, name: "Abdulazizbek Orifjonov", status: "Nomalum", reason: "" },
    { id: 2, name: "Abdulloh Nozimov", status: "Nomalum", reason: "" },
    { id: 3, name: "Azizbek Tulegenov", status: "Nomalum", reason: "" },
    { id: 4, name: "Behruz Bozorov", status: "Nomalum", reason: "" },
    { id: 5, name: "Behruz Ilhomov", status: "Nomalum", reason: "" },
    { id: 6, name: "Behruz Kurbonov", status: "Nomalum", reason: "" },
    { id: 7, name: "Bobur Ikromjonov", status: "Nomalum", reason: "" },
    { id: 8, name: "Darmanbek Shamuratov", status: "Nomalum", reason: "" },
    { id: 9, name: "Foziljon Mo'minov", status: "Nomalum", reason: "" },
    { id: 10, name: "Farrux G'aniboyev", status: "Nomalum", reason: "" },
    { id: 11, name: "Jamoliddin Murodullayev", status: "Nomalum", reason: "" },
    { id: 12, name: "Muhammadbobur Mansurov", status: "Nomalum", reason: "" },
    { id: 13, name: "Muhammadali Xoshimov", status: "Nomalum", reason: "" },
    { id: 14, name: "Muhammadmuso Qodirov", status: "Nomalum", reason: "" },
    { id: 15, name: "Madinaxon Maxmudova", status: "Nomalum", reason: "" },
    { id: 16, name: "Madinabonu Axmadjonova", status: "Nomalum", reason: "" },
    { id: 17, name: "Mohinur Nosirjonova", status: "Nomalum", reason: "" },
    { id: 18, name: "Og'abek Hasanov", status: "Nomalum", reason: "" },
    { id: 19, name: "Rano Yo'ldasheva", status: "Nomalum", reason: "" },
    { id: 20, name: "Umidjon Murotov", status: "Nomalum", reason: "" },
    { id: 21, name: "Xusan Sunnatov", status: "Nomalum", reason: "" },
    { id: 22, name: "Yahyo Ikromov", status: "Nomalum", reason: "" },
    { id: 23, name: "Zamir Tuygunov", status: "Nomalum", reason: "" },
    { id: 24, name: "Shamsiddin Xusanov", status: "Nomalum", reason: "" },
    { id: 25, name: "Shohjahon Soatov", status: "Nomalum", reason: "" },
    { id: 26, name: "Sherxon Sunnatov", status: "Nomalum", reason: "" },
];

let students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
let currentSubject = "";
let currentDayName = "";
let currentStudentId = null;
let currentStatus = null;

const DAY_NAMES_UZ = {
    "Monday": "Dushanba", "Tuesday": "Seshanba", "Wednesday": "Chorshanba",
    "Thursday": "Payshanba", "Friday": "Juma", "Saturday": "Shanba", "Sunday": "Yakshanba"
};


// ---------------------------
// 2. YORDAMCHI FUNKSIYALAR
// ---------------------------
function getCurrentDayName() {
    const date = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
}

function getFormattedTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day}/${hour}:${minute}`;
}

/**
 * Bildirishnoma (Notification Toast) ko'rsatadi
 * @param {string} message - Ko'rsatiladigan matn
 * @param {('success'|'error'|'info')} type - Bildirishnoma turi (rangi uchun)
 */
function showNotification(message, type = 'info') {
    const toast = document.getElementById('notification-toast');
    if (!toast) return;

    // Tozalash
    toast.className = 'notification';

    // Yangi matn va tur
    toast.textContent = message;
    toast.classList.add(type);

    // Ko'rsatish
    toast.classList.add('show');

    // 4 soniyadan keyin yashirish
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}


// ---------------------------
// 3. RENDER VA INITIALIZE
// ---------------------------
function initializePage() {
    currentDayName = getCurrentDayName();
    const uzDayName = DAY_NAMES_UZ[currentDayName];
    const lessons = SCHEDULE[currentDayName] || [];

    document.getElementById('current-day-info').textContent = `Bugungi kun: ${uzDayName}`;

    const selectionContainer = document.getElementById('lesson-selection');
    selectionContainer.innerHTML = '';

    if (lessons.length === 0 || (lessons.length === 1 && lessons[0] === "Dam olish kuni")) {
        selectionContainer.innerHTML = `<p>Bugun dars yo'q (${uzDayName}). Yaxshi dam oling!</p>`;
        selectionContainer.style.backgroundColor = '#fae1e1';
        return;
    }

    selectionContainer.innerHTML = `<p id="lesson-prompt">Darsni tanlang (${uzDayName}):</p>`;

    lessons.forEach(lesson => {
        const button = document.createElement('button');
        button.textContent = lesson;
        button.onclick = () => selectLesson(lesson);
        selectionContainer.appendChild(button);
    });
}

function selectLesson(lessonName) {
    currentSubject = lessonName;

    document.getElementById('lesson-selection').style.display = 'none';
    document.getElementById('attendance-section').style.display = 'block';
    document.getElementById('current-lesson-title').textContent = `Davomat: ${currentSubject}`;

    document.getElementById('validation-error').style.display = 'none';

    renderStudents();
}

/**
 * Dars tanlash sahifasiga qaytaradi (Notification ishlatildi)
 */
function goBackToLessonSelection() {
    students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
    currentSubject = "";

    document.getElementById('attendance-section').style.display = 'none';
    document.getElementById('lesson-selection').style.display = 'block';
    document.getElementById('current-lesson-title').textContent = '';
    document.getElementById('validation-error').style.display = 'none';

    initializePage();
    // Notification bilan ogohlantirish
    showNotification("⬅️ Dars tanlash sahifasiga qaytildi. Oldingi davomat ma'lumotlari bekor qilindi.", 'info');
}

/**
 * Barcha o'quvchilarni "Keldi" deb belgilaydi (Notification ishlatildi)
 */
function markAllPresent() {
    students.forEach(student => {
        student.status = "Keldi";
        student.reason = "";
    });
    renderStudents();
    // Notification bilan xabar berish
    showNotification("✅ Barcha o'quvchilar Keldi deb belgilandi.", 'success');
}


function renderStudents() {
    const listContainer = document.getElementById('attendance-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    students.forEach(student => {
        const row = document.createElement('div');
        row.className = 'student-row';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'student-name';
        nameDiv.textContent = student.name;
        row.appendChild(nameDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';
        actionsDiv.innerHTML = `
            <button class="present" onclick="markAttendance(${student.id}, 'present')">✅ Keldi</button>
            <button class="late" onclick="markAttendance(${student.id}, 'late')">⏰ Kech qoldi</button>
            <button class="absent" onclick="markAttendance(${student.id}, 'absent')">❌ Kelmadi</button>
        `;
        row.appendChild(actionsDiv);

        const extraInputDiv = document.createElement('div');
        extraInputDiv.className = 'extra-input';
        extraInputDiv.id = `extra-${student.id}`;
        extraInputDiv.style.display = 'none';
        row.appendChild(extraInputDiv);

        const statusBadge = document.createElement('span');
        const statusClass = student.status.toLowerCase().replace(/\s/g, '');
        statusBadge.className = `status-badge ${statusClass}`;

        let badgeText = student.status;
        if (student.reason) {
            badgeText = `${student.status} (${student.reason.length > 20 ? student.reason.substring(0, 20) + '...' : student.reason})`;
        } else if (student.status === 'Nomalum') {
            badgeText = 'Belgilanmagan';
        }

        statusBadge.textContent = badgeText;
        row.appendChild(statusBadge);

        listContainer.appendChild(row);
    });
}


// ---------------------------
// 4. DAVOMATNI BELGILASH MANTIQI
// ---------------------------

function markAttendance(studentId, status) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    if (status === 'present') {
        student.status = "Keldi";
        student.reason = "";
        renderStudents();
        showNotification(`✅ ${student.name} Keldi deb belgilandi.`, 'success');
    } else if (status === 'late' || status === 'absent') {
        // Modal ochiladi
        openReasonModal(studentId, status);
    }
}

// ---------------------------
// 5. MODAL MANTIQI
// ---------------------------

function openReasonModal(studentId, status) {
    const student = students.find(s => s.id === studentId);

    if (!student) return;

    currentStudentId = studentId;
    currentStatus = status;

    const modal = document.getElementById('reasonModal');
    const reasonInput = document.getElementById('reasonInput');
    const modalHeaderText = document.getElementById('modal-header-text');
    const modalStatusInfo = document.getElementById('modal-status-info');

    const isLate = status === 'late';
    const newStatusText = isLate ? "KECH QOLDI" : "KELMADI";
    const newStatusColor = isLate ? "#cc9900" : "#dc3545";

    const initialReason = student.reason && !student.reason.includes(UNAVAILABLE_REASON) ? student.reason : '';

    // Modal sarlavhalarini yangilash
    modalHeaderText.textContent = `Sabab kiritish: ${student.name}`;
    modalStatusInfo.innerHTML = `Holat: <span style="color: ${newStatusColor}; font-weight: bold;">${newStatusText}</span> deb belgilanmoqda. Sababni kiriting:`;

    // Inputga qiymat kiritish va modalni ochish
    reasonInput.value = initialReason;
    modal.style.display = 'block';

    // Avtomatik fokus (kursor)
    setTimeout(() => {
        reasonInput.focus();
    }, 100);

    // Enter bosilganda saqlash funksiyasini ulash
    reasonInput.onkeydown = function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            saveReasonFromModal();
        }
    };
}

function closeModal() {
    document.getElementById('reasonModal').style.display = 'none';
    document.getElementById('reasonInput').onkeydown = null;
    currentStudentId = null;
    currentStatus = null;
}

function saveReasonFromModal() {
    if (currentStudentId === null || currentStatus === null) return;

    const student = students.find(s => s.id === currentStudentId);
    const inputElement = document.getElementById('reasonInput');

    if (!student || !inputElement) return;

    let reason = inputElement.value.trim();

    if (!reason) {
        reason = UNAVAILABLE_REASON;
    }

    // Holatni yangilash va Notification
    if (currentStatus === 'late') {
        student.status = "Kech qoldi";
        showNotification(`⏰ ${student.name} Kech qoldi deb belgilandi.`, 'info');
    } else if (currentStatus === 'absent') {
        student.status = "Kelmadi";
        showNotification(`❌ ${student.name} Kelmadi deb belgilandi.`, 'error');
    }
    student.reason = reason;

    closeModal();
    renderStudents();
}

// Modal foniga bosilganda yopish
window.onclick = function (event) {
    if (event.target == document.getElementById('reasonModal')) {
        saveReasonFromModal();
    }
}

// Escape bosilganda yopish
document.addEventListener('keydown', function (event) {
    if (event.key === "Escape" && document.getElementById('reasonModal').style.display === 'block') {
        saveReasonFromModal();
    }
});


// ---------------------------
// 6. TELEGRAM REPORT FUNKSIYASI **(TO'G'RILANDI)**
// ---------------------------

async function sendAttendanceReportToTelegram(finalData) {

    // **Bu yerda avvalgi keraksiz "if" sharti olib tashlandi.**
    // Endi token haqiqiy bo'lmasa, API avtomatik xato beradi.
    const report = finalData.attendance;
    const date = finalData.timestamp.split('/').slice(0, 3).join('.');
    const subject = finalData.subject;
    const uzDayName = DAY_NAMES_UZ[finalData.day] || finalData.day;

    const hasRealReason = (s) => s.reason && !s.reason.includes(UNAVAILABLE_REASON);

    const present = report.filter(s => s.status === 'Keldi');
    const late = report.filter(s => s.status === 'Kech qoldi');
    const absent = report.filter(s => s.status === 'Kelmadi');

    // Ro'yxatlarni tartib raqami bilan tuzish
    const presentList = present.length > 0
        ? present.map((s, index) => `${index + 1}. ${s.name}`).join('\n')
        : "— Hech kim";

    const lateList = late.map((s, index) => {
        const reasonDisplay = hasRealReason(s) ? `(${s.reason})` : `(${UNAVAILABLE_REASON})`;
        return `${index + 1}. ${s.name} ${reasonDisplay}`;
    }).join('\n');

    const absentList = absent.map((s, index) => {
        const reasonDisplay = hasRealReason(s) ? `(${s.reason})` : `(${UNAVAILABLE_REASON})`;
        return `${index + 1}. ${s.name} ${reasonDisplay}`;
    }).join('\n');

    let messageText = `
<b>📘 Davomat yakunlandi</b>
<b>📚 Fan:</b> ${subject}
<b>📅 Sana:</b> ${date} (${uzDayName})

<b>✅ Darsda bo'lganlar (${present.length}):</b>
${presentList}

<b>⏰ Kech qolganlar (${late.length}):</b>
${lateList || "— Hech kim"}

<b>❌ Darsda bo'lmaganlar (${absent.length}):</b>
${absentList || "— Hech kim"}

`;

    const params = { chat_id: CHAT_ID, text: messageText.trim(), parse_mode: 'HTML' };

    try {
        const response = await fetch(TELEGRAM_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        const data = await response.json();
        
        // API tomonidan qaytarilgan xatoni console'ga chiqarish
        if (!data.ok) {
            console.error("Telegram API xatosi:", data.description);
        }
        
        return data.ok; // data.ok = true bo'lsa, muvaffaqiyatli
    } catch (error) {
        console.error("Fetch xatosi (Tarmoq yoki CORS muammosi):", error);
        return false;
    }
}

// ---------------------------
// 7. YAKUNLASH VA ISHGA TUSHIRISH
// ---------------------------

async function saveFinalAttendance() {
    const errorElement = document.getElementById('validation-error');
    const unmarkedStudents = students.filter(s => s.status === 'Nomalum');

    if (unmarkedStudents.length > 0) {
        errorElement.style.display = 'block';
        // Xato haqida Notification
        showNotification(`❌ Iltimos, ${unmarkedStudents.length} ta o'quvchining davomatini belgilang.`, 'error');
        return;
    }
    errorElement.style.display = 'none';

    const timestamp = getFormattedTimestamp();
    const dateKey = timestamp.split('/').slice(0, 3).join('-');
    const safeSubject = currentSubject.replace(/[^a-zA-Z0-9]/g, '_');
    const localStorageKey = `DAVOMAT_${dateKey}_${safeSubject}`;

    const finalData = {
        timestamp: timestamp,
        subject: currentSubject,
        day: currentDayName,
        attendance: students
    };

    let telegramSuccess = false;
    try {
        localStorage.setItem(localStorageKey, JSON.stringify(finalData));
        telegramSuccess = await sendAttendanceReportToTelegram(finalData);

        // Jarayondan keyin ma'lumotlarni nolga qaytarish
        students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));

        document.getElementById('attendance-section').style.display = 'none';
        document.getElementById('lesson-selection').style.display = 'block';

        let message = `✅ Davomat muvaffaqiyatli saqlandi.`;
        if (telegramSuccess) {
            message += " 🚀 Hisobot Telegram kanaliga yuborildi.";
            showNotification(message, 'success');
        } else {
            // Notificationni to'g'rilandi: endi aniq "yuborish xatosi" deb yozadi
            message += " ❌ **Telegramga yuborishda xato** bo'ldi. Konfiguratsiyani (Token, Chat ID) tekshiring.";
            showNotification(message, 'error');
        }

        currentSubject = "";
        document.getElementById('current-lesson-title').textContent = '';
        initializePage();

    } catch (e) {
        // Umuniy xato haqida Notification
        showNotification("❌ Xatolik yuz berdi: Saqlash/Yuborish amalga oshmadi.", 'error');
        console.error("Umumiy xato:", e);
    }
}

document.addEventListener('DOMContentLoaded', initializePage);

// Global funksiyalarni browser'da ishlatish uchun e'lon qilish
window.markAttendance = markAttendance;
window.openReasonModal = openReasonModal;
window.closeModal = closeModal;
window.saveReasonFromModal = saveReasonFromModal;
window.saveFinalAttendance = saveFinalAttendance;
window.goBackToLessonSelection = goBackToLessonSelection;
window.markAllPresent = markAllPresent;
window.showNotification = showNotification;