function buildQuery(params) {
  const usp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') usp.append(k, v);
  });
  return usp.toString();
}

async function apiGet(params) {
  if (!API_URL || API_URL.includes('PASTE_YOUR')) {
    throw new Error('ยังไม่ได้ตั้งค่า API_URL ใน js/config.js');
  }
  const url = `${API_URL}?${buildQuery(params)}`;
  if (typeof beginOperationStatus === 'function') beginOperationStatus('กำลังโหลดข้อมูล...');
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || 'โหลดข้อมูลไม่สำเร็จ');
    return data;
  } finally {
    if (typeof endOperationStatus === 'function') endOperationStatus();
  }
}

async function apiPost(payload) {
  if (!API_URL || API_URL.includes('PASTE_YOUR')) {
    throw new Error('ยังไม่ได้ตั้งค่า API_URL ใน js/config.js');
  }
  if (typeof beginOperationStatus === 'function') beginOperationStatus('กำลังบันทึกข้อมูล...');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload || {})
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || 'บันทึกข้อมูลไม่สำเร็จ');
    return data;
  } finally {
    if (typeof endOperationStatus === 'function') endOperationStatus();
  }
}

function fileToPayload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, mimeType: file.type || 'application/octet-stream', base64: reader.result });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
