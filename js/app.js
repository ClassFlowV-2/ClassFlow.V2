const $ = id => document.getElementById(id);
function configured(value) { return value && !value.includes('PASTE_YOUR'); }
function openStatus() {
  if (!configured(STATUS_URL)) {
    $('message').textContent = 'กรุณาตั้งค่า STATUS_URL ใน js/config.js';
    return;
  }
  location.href = STATUS_URL;
}
async function centralLogin() {
  const userId = $('userId').value.trim(), password = $('password').value.trim();
  if (!userId || !password) { $('message').textContent = 'กรุณากรอกรหัสผู้ใช้และรหัสผ่าน'; return; }
  if (!configured(API_URL) || !configured(TEACHER_URL) || !configured(STUDENT_URL)) {
    $('message').textContent = 'กรุณาตั้งค่า URL ทั้งสามรายการใน js/config.js'; return;
  }
  const button = $('loginButton');
  button.disabled = true; $('message').textContent = 'กำลังตรวจสอบบัญชี...';
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'centralLogin', userId, password })
    });
    const text = await response.text();
    let data; try { data = JSON.parse(text); } catch (e) { throw new Error('Apps Script ตอบกลับไม่สมบูรณ์ กรุณาตรวจ deployment'); }
    if (!data.ok) throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
    const destination = data.portal === 'teacher' ? TEACHER_URL : STUDENT_URL;
    const url = new URL(destination, location.href);
    url.searchParams.set('loginToken', data.token);
    $('message').textContent = data.portal === 'teacher' ? 'กำลังเปิดเว็บครู...' : 'กำลังเปิดเว็บนักเรียน...';
    location.replace(url.toString());
  } catch (err) {
    $('message').textContent = err.message;
    button.disabled = false;
  }
}
window.addEventListener('load', () => {
  $('password').addEventListener('keydown', e => { if (e.key === 'Enter') centralLogin(); });
});
