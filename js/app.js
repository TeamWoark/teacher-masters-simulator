// المحاكي الذكي للمقابلة الشخصية بالذكاء الاصطناعي — إدارة المتدربين (Supabase + Excel) + قاعة المحاكاة الصوتية والقياس السيكومتري

const STORAGE_KEYS = {
  TRAINEES: 'tm_pro_trainees_v5',
  RESULTS: 'tm_pro_results_v5',
  QUESTIONS: 'tm_pro_questions_v7',
  CONFIG: 'tm_pro_config_v5',
  SESSION: 'tm_pro_active_session_v5'
};

const DEFAULT_SUPABASE_URL = 'https://yxzqadwsvjezqslhlrup.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4enFhZHdzdmplenFzbGhscnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyNTE1OTksImV4cCI6MjEwOTgyNzU5OX0.w1aDgbJ-KJ32TVpxFOvR_a8sa82vxxgcccB3YzfL8Cc';

function cleanCredential(val = '') {
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  let out = String(val || '');
  for (let i = 0; i < 10; i++) {
    out = out.replaceAll(arabicDigits[i], String(i)).replaceAll(persianDigits[i], String(i));
  }
  return out.replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF\u00A0]/g, '').trim();
}

window.togglePassField = function (inputId) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.type = el.type === 'password' ? 'text' : 'password';
};

const appState = {
  config: {
    adminUser: 'admin',
    adminPass: 'admin123',
    aiProvider: 'builtin',
    aiKey: '',
    supabaseUrl: DEFAULT_SUPABASE_URL,
    supabaseAnonKey: DEFAULT_SUPABASE_ANON_KEY
  },
  trainees: [],
  results: [],
  questions: [],
  pendingExcelRows: [],
  currentUser: null,
  tablePage: 1,
  pageSize: 50,

  exam: {
    currentIndex: 0,
    evaluations: []
  },

  micStream: null,
  audioCtx: null,
  analyser: null,
  waveFrameId: null,
  recording: {
    active: false,
    startTime: 0,
    firstSpeechTime: 0,
    silentFrames: 0,
    longPauseCount: 0,
    timerId: null,
    durationSec: 0,
    mediaRecorder: null,
    chunks: [],
    audioBlob: null,
    audioBlobUrl: null,
    audioBase64: null,
    mimeType: 'audio/webm',
    totalSamples: 0,
    speechSamples: 0,
    volumeSamples: [],
    pitchSamples: []
  },
  recognition: null,
  finalizedSpeech: ''
};

// ==================== مساعد الاتصال الآمن بـ Supabase RPC ====================
function isSupabaseConfigured() {
  return Boolean(
    appState.config.supabaseUrl &&
    appState.config.supabaseAnonKey &&
    appState.config.supabaseUrl.startsWith('https://')
  );
}

async function callSupabaseRpc(fnName, params = {}) {
  const baseUrl = appState.config.supabaseUrl.replace(/\/+$/, '');
  const key = appState.config.supabaseAnonKey.trim();
  const res = await fetch(`${baseUrl}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const errTxt = await res.text();
    throw new Error(`Supabase RPC (${fnName}) HTTP ${res.status}: ${errTxt.slice(0, 140)}`);
  }
  return res.json();
}

// ==================== التهيئة الأولية ====================
document.addEventListener('DOMContentLoaded', async () => {
  loadLocalConfigAndQuestions();
  await loadInitialSystemState();
  bindAuthEvents();
  bindAdminEvents();
  bindTraineeEvents();
  drawIdleWave();
  await restoreActiveSession();
});

function showToast(msg) {
  const el = document.getElementById('toastNotification');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => el.classList.add('hidden'), 3400);
}

function loadLocalConfigAndQuestions() {
  try {
    const savedCfg = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG) || 'null');
    if (savedCfg) {
      if (!savedCfg.supabaseUrl) delete savedCfg.supabaseUrl;
      if (!savedCfg.supabaseAnonKey) delete savedCfg.supabaseAnonKey;
      Object.assign(appState.config, savedCfg);
    }
  } catch (_) {}
  if (!appState.config.supabaseUrl) appState.config.supabaseUrl = DEFAULT_SUPABASE_URL;
  if (!appState.config.supabaseAnonKey) appState.config.supabaseAnonKey = DEFAULT_SUPABASE_ANON_KEY;

  try {
    const savedQ = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || 'null');
    appState.questions = Array.isArray(savedQ) && savedQ.length ? savedQ : JSON.parse(JSON.stringify(DEFAULT_QUESTIONS));
  } catch (_) {
    appState.questions = JSON.parse(JSON.stringify(DEFAULT_QUESTIONS));
  }
}

async function loadInitialSystemState() {
  try {
    const sbRes = await fetch(`./data/supabase-config.json?t=${Date.now()}`);
    if (sbRes.ok) {
      const sbJson = await sbRes.json();
      if (sbJson.supabaseUrl && sbJson.supabaseAnonKey) {
        appState.config.supabaseUrl = sbJson.supabaseUrl;
        appState.config.supabaseAnonKey = sbJson.supabaseAnonKey;
      }
    }
  } catch (_) {}

  if (isSupabaseConfigured()) {
    try {
      const pubCfg = await callSupabaseRpc('tm_get_public_config', {});
      if (pubCfg && Array.isArray(pubCfg.questions) && pubCfg.questions.length) {
        appState.questions = pubCfg.questions;
      }
    } catch (_) {}
    return;
  }

  try {
    appState.trainees = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRAINEES) || '[]');
    appState.results = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]');
  } catch (_) {}
}

async function persistResultRecord(reportRecord) {
  if (isSupabaseConfigured() && appState.currentUser?.role === 'trainee') {
    try {
      await callSupabaseRpc('tm_submit_result', {
        p_username: appState.currentUser.username,
        p_password: appState.currentUser.password,
        p_questions_answered: reportRecord.questionsAnswered,
        p_total_questions: reportRecord.totalQuestions,
        p_overall_score: reportRecord.overallScore,
        p_admission_status: reportRecord.admissionStatus,
        p_radar_metrics: reportRecord.radarMetrics || {}
      });
      return;
    } catch (err) {
      console.warn('Supabase result submit fallback:', err.message);
    }
  }

  appState.results.unshift(reportRecord);
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(appState.results.slice(0, 1000)));
}

// ==================== بوابة الدخول والخروج ====================
function bindAuthEvents() {
  const tabTrainee = document.getElementById('roleTabTrainee');
  const tabAdmin = document.getElementById('roleTabAdmin');
  const trForm = document.getElementById('traineeLoginForm');
  const admForm = document.getElementById('adminLoginForm');
  const errBox = document.getElementById('loginErrorBox');

  const switchLoginRole = (role) => {
    errBox.classList.add('hidden');
    tabTrainee.classList.toggle('active', role === 'trainee');
    tabAdmin.classList.toggle('active', role === 'admin');
    trForm.classList.toggle('hidden', role !== 'trainee');
    admForm.classList.toggle('hidden', role !== 'admin');
  };

  tabTrainee.addEventListener('click', () => switchLoginRole('trainee'));
  tabAdmin.addEventListener('click', () => switchLoginRole('admin'));

  // دخول المتدرب
  trForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errBox.classList.add('hidden');
    const u = cleanCredential(document.getElementById('trUsernameInput').value);
    const p = cleanCredential(document.getElementById('trPasswordInput').value);

    if (isSupabaseConfigured()) {
      try {
        const resp = await callSupabaseRpc('tm_verify_trainee', { p_username: u, p_password: p });
        if (!resp || !resp.ok) {
          const admCheck = await callSupabaseRpc('tm_admin_get_dashboard', { p_admin_user: u, p_admin_pass: p }).catch(() => null);
          if (admCheck && admCheck.ok) {
            appState.config.adminUser = u;
            appState.config.adminPass = p;
            appState.trainees = admCheck.trainees || [];
            appState.results = admCheck.results || [];
            await loginAsUser({ role: 'admin', fullName: 'مدير النظام العام', username: u, adminPass: p });
            return;
          }
          errBox.textContent = resp?.error === 'account_disabled'
            ? '⚠️ هذا الحساب موقوف حالياً. يرجى التواصل مع مدير التدريب.'
            : '❌ اسم المستخدم أو كلمة المرور غير صحيحة.';
          errBox.classList.remove('hidden');
          return;
        }
        await loginAsUser({ role: 'trainee', ...resp.trainee, password: p });
        return;
      } catch (err) {
        errBox.textContent = `⚠️ تعذر الاتصال بقاعدة البيانات السحابية: ${err.message}`;
        errBox.classList.remove('hidden');
        return;
      }
    }

    const matched = appState.trainees.find(
      (t) => cleanCredential(t.username).toLowerCase() === u.toLowerCase() && cleanCredential(t.password).toLowerCase() === p.toLowerCase()
    );
    if (!matched) {
      errBox.textContent = '❌ اسم المستخدم أو كلمة المرور غير صحيحة.';
      errBox.classList.remove('hidden');
      return;
    }
    if (matched.active === false) {
      errBox.textContent = '⚠️ هذا الحساب موقوف حالياً.';
      errBox.classList.remove('hidden');
      return;
    }
    await loginAsUser({ role: 'trainee', ...matched });
  });

  // دخول مدير النظام
  admForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errBox.classList.add('hidden');
    const u = cleanCredential(document.getElementById('admUsernameInput').value);
    const p = cleanCredential(document.getElementById('admPasswordInput').value);

    if (isSupabaseConfigured()) {
      try {
        const dash = await callSupabaseRpc('tm_admin_get_dashboard', { p_admin_user: u, p_admin_pass: p });
        if (!dash || !dash.ok) {
          const trCheck = await callSupabaseRpc('tm_verify_trainee', { p_username: u, p_password: p }).catch(() => null);
          if (trCheck && trCheck.ok) {
            switchLoginRole('trainee');
            await loginAsUser({ role: 'trainee', ...trCheck.trainee, password: p });
            showToast(`مرحباً بك ${trCheck.trainee.fullName} 👨‍🏫`);
            return;
          }
          errBox.textContent = '❌ بيانات مدير النظام غير صحيحة.';
          errBox.classList.remove('hidden');
          return;
        }
        appState.config.adminUser = u;
        appState.config.adminPass = p;
        appState.trainees = dash.trainees || [];
        appState.results = dash.results || [];
        if (Array.isArray(dash.questions) && dash.questions.length) appState.questions = dash.questions;
        await loginAsUser({ role: 'admin', fullName: 'مدير النظام العام', username: u, adminPass: p });
        return;
      } catch (err) {
        errBox.textContent = `⚠️ خطأ اتصال بـ Supabase: ${err.message}`;
        errBox.classList.remove('hidden');
        return;
      }
    }

    if (u.toLowerCase() === cleanCredential(appState.config.adminUser).toLowerCase() && p === cleanCredential(appState.config.adminPass)) {
      await loginAsUser({ role: 'admin', fullName: 'مدير النظام العام', username: u, adminPass: p });
    } else {
      errBox.textContent = '❌ بيانات مدير النظام غير صحيحة.';
      errBox.classList.remove('hidden');
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    stopAnyCommitteeAudio();
    stopExamRecording();
    appState.currentUser = null;
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    document.getElementById('trUsernameInput').value = '';
    document.getElementById('trPasswordInput').value = '';
    document.getElementById('admPasswordInput').value = '';
    switchLoginRole('trainee');
    document.getElementById('loggedUserRibbon').classList.add('hidden');
    document.getElementById('adminScreen').classList.add('hidden');
    document.getElementById('traineeScreen').classList.add('hidden');
    document.getElementById('authScreen').classList.remove('hidden');
  });
}

async function loginAsUser(userObj) {
  appState.currentUser = userObj;
  sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(userObj));

  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('loggedUserRibbon').classList.remove('hidden');

  if (userObj.role === 'admin') {
    document.getElementById('currentUserBadge').textContent = `🛡️ ${userObj.fullName}`;
    document.getElementById('traineeScreen').classList.add('hidden');
    document.getElementById('adminScreen').classList.remove('hidden');
    refreshAdminDashboard();
  } else {
    document.getElementById('currentUserBadge').textContent = `👨‍🏫 ${userObj.fullName} (${userObj.cohort || 'متدرب'})`;
    document.getElementById('adminScreen').classList.add('hidden');
    document.getElementById('traineeScreen').classList.remove('hidden');
    initTraineePortalView();
  }
}

async function restoreActiveSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.SESSION) || 'null');
    if (!saved || !saved.role) return;
    if (saved.role === 'admin' && isSupabaseConfigured() && saved.adminPass) {
      const dash = await callSupabaseRpc('tm_admin_get_dashboard', {
        p_admin_user: saved.username,
        p_admin_pass: saved.adminPass
      });
      if (dash && dash.ok) {
        appState.config.adminUser = saved.username;
        appState.config.adminPass = saved.adminPass;
        appState.trainees = dash.trainees || [];
        appState.results = dash.results || [];
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.SESSION);
        return;
      }
    }
    await loginAsUser(saved);
  } catch (_) {}
}

async function syncAdminFromSupabase() {
  if (!isSupabaseConfigured() || appState.currentUser?.role !== 'admin') return;
  const dash = await callSupabaseRpc('tm_admin_get_dashboard', {
    p_admin_user: appState.config.adminUser,
    p_admin_pass: appState.config.adminPass
  });
  if (dash && dash.ok) {
    appState.trainees = dash.trainees || [];
    appState.results = dash.results || [];
  }
}

// ==================== لوحة تحكم مدير النظام ====================
function bindAdminEvents() {
  document.querySelectorAll('.subnav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.admTab;
      document.querySelectorAll('.subnav-btn').forEach((b) => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.adm-panel').forEach((p) => p.classList.toggle('hidden', p.id !== `adm-tab-${target}`));
    });
  });

  document.getElementById('genRandomPassBtn').addEventListener('click', () => {
    document.getElementById('singlePassword').value = String(Math.floor(100000 + Math.random() * 900000));
  });

  document.getElementById('addSingleTraineeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('singleFullName').value.trim();
    const username = cleanCredential(document.getElementById('singleUsername').value);
    const password = cleanCredential(document.getElementById('singlePassword').value);
    const cohort = document.getElementById('singleCohort').value.trim() || 'الدفعة العامة';
    if (!fullName || !username || !password) return;

    const record = { fullName, username, password, cohort, active: true };

    if (isSupabaseConfigured()) {
      try {
        await callSupabaseRpc('tm_admin_bulk_upsert', {
          p_admin_user: appState.config.adminUser,
          p_admin_pass: appState.config.adminPass,
          p_trainees: [record],
          p_replace: false
        });
        await syncAdminFromSupabase();
        e.target.reset();
        refreshAdminDashboard();
        showToast(`تم حفظ المتدرب (${fullName}) في قاعدة البيانات السحابية ✅`);
        return;
      } catch (err) {
        alert(`تعذر الحفظ في Supabase: ${err.message}`);
        return;
      }
    }

    const existingIdx = appState.trainees.findIndex((t) => t.username.toLowerCase() === username.toLowerCase());
    if (existingIdx >= 0) appState.trainees[existingIdx] = { ...appState.trainees[existingIdx], ...record };
    else appState.trainees.unshift({ id: `tr_${Date.now()}`, ...record, createdAt: new Date().toISOString() });

    localStorage.setItem(STORAGE_KEYS.TRAINEES, JSON.stringify(appState.trainees));
    e.target.reset();
    refreshAdminDashboard();
    showToast(`تمت إضافة المتدرب (${fullName}) بنجاح ✅`);
  });

  document.getElementById('downloadTemplateBtn').addEventListener('click', downloadExcelTemplate);

  const fileInput = document.getElementById('excelFileInput');
  const dropzone = document.getElementById('excelDropzone');
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) parseUploadedExcelFile(e.target.files[0]);
  });
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.background = '#dcfce7'; });
  dropzone.addEventListener('dragleave', () => { dropzone.style.background = '#f0fdf4'; });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.background = '#f0fdf4';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) parseUploadedExcelFile(e.dataTransfer.files[0]);
  });

  document.getElementById('confirmExcelImportBtn').addEventListener('click', async () => {
    if (!appState.pendingExcelRows.length) return;
    const mode = document.getElementById('importModeSelect').value;
    const btn = document.getElementById('confirmExcelImportBtn');
    btn.disabled = true;
    btn.textContent = '⏳ جارٍ رفع وحفظ الدفعة...';

    try {
      if (isSupabaseConfigured()) {
        const resp = await callSupabaseRpc('tm_admin_bulk_upsert', {
          p_admin_user: appState.config.adminUser,
          p_admin_pass: appState.config.adminPass,
          p_trainees: appState.pendingExcelRows,
          p_replace: mode === 'replace'
        });
        await syncAdminFromSupabase();
        showToast(`تم حفظ ${resp.upsertedCount || appState.pendingExcelRows.length} متدرباً مباشرة في السحابة 🎉`);
      } else {
        if (mode === 'replace') {
          appState.trainees = [...appState.pendingExcelRows];
        } else {
          const byUser = new Map(appState.trainees.map((t) => [t.username.toLowerCase(), t]));
          appState.pendingExcelRows.forEach((row) => byUser.set(row.username.toLowerCase(), row));
          appState.trainees = Array.from(byUser.values());
        }
        localStorage.setItem(STORAGE_KEYS.TRAINEES, JSON.stringify(appState.trainees));
        showToast(`تم استيراد ${appState.pendingExcelRows.length} متدرباً بنجاح 🎉`);
      }

      appState.pendingExcelRows = [];
      appState.tablePage = 1;
      document.getElementById('excelPreviewBox').classList.add('hidden');
      document.getElementById('excelFileInput').value = '';
      refreshAdminDashboard();
    } catch (err) {
      alert(`حدث خطأ أثناء رفع الدفعة: ${err.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = '✅ اعتماد وإضافة جميع المتدربين';
    }
  });

  document.getElementById('searchTraineesInput').addEventListener('input', () => {
    appState.tablePage = 1;
    renderTraineesTable();
  });

  document.getElementById('exportTraineesExcelBtn').addEventListener('click', exportTraineesToExcel);
  document.getElementById('exportResultsExcelBtn').addEventListener('click', exportResultsToExcel);

  document.getElementById('clearResultsBtn').addEventListener('click', async () => {
    if (!confirm('هل أنت متأكد من مسح سجل نتائج المتدربين؟')) return;
    if (isSupabaseConfigured()) {
      await callSupabaseRpc('tm_admin_action', {
        p_admin_user: appState.config.adminUser,
        p_admin_pass: appState.config.adminPass,
        p_action: 'clear_results'
      });
      await syncAdminFromSupabase();
    } else {
      appState.results = [];
      localStorage.removeItem(STORAGE_KEYS.RESULTS);
    }
    refreshAdminDashboard();
  });

  document.getElementById('resetDefaultQuestionsBtn').addEventListener('click', async () => {
    if (!confirm('استعادة الأسئلة الخمسة المعتمدة بصوتها الأصلي؟')) return;
    appState.questions = JSON.parse(JSON.stringify(DEFAULT_QUESTIONS));
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
    if (isSupabaseConfigured()) {
      await callSupabaseRpc('tm_admin_save_settings', {
        p_admin_user: appState.config.adminUser,
        p_admin_pass: appState.config.adminPass,
        p_new_admin_user: appState.config.adminUser,
        p_new_admin_pass: appState.config.adminPass,
        p_show_demo_hint: false,
        p_questions: null
      }).catch(() => {});
    }
    renderAdminQuestionsList();
    showToast('تمت استعادة الأسئلة الخمسة المعتمدة ✅');
  });

  document.getElementById('saveSupabaseConfigBtn').addEventListener('click', async () => {
    const url = document.getElementById('sbUrlInput').value.trim();
    const key = document.getElementById('sbAnonKeyInput').value.trim();
    if (!url || !key) return;
    appState.config.supabaseUrl = url;
    appState.config.supabaseAnonKey = key;
    saveConfigToLocal();
    await syncAdminFromSupabase();
    refreshAdminDashboard();
    showToast('تم فحص وتحديث اتصال Supabase بنجاح ✅');
  });

  document.getElementById('downloadTraineesJsonBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ updatedAt: new Date().toISOString(), trainees: appState.trainees }, null, 2)], { type: 'application/json;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'trainees_backup.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  document.getElementById('saveSystemConfigBtn').addEventListener('click', async () => {
    const oldUser = appState.config.adminUser;
    const oldPass = appState.config.adminPass;
    const newAdmU = cleanCredential(document.getElementById('cfgAdminUser').value) || oldUser;
    const newAdmP = cleanCredential(document.getElementById('cfgAdminPass').value) || oldPass;

    if (isSupabaseConfigured()) {
      try {
        await callSupabaseRpc('tm_admin_save_settings', {
          p_admin_user: oldUser,
          p_admin_pass: oldPass,
          p_new_admin_user: newAdmU,
          p_new_admin_pass: newAdmP,
          p_show_demo_hint: false,
          p_questions: appState.questions
        });
      } catch (err) {
        alert(`تعذر تحديث إعدادات Supabase: ${err.message}`);
        return;
      }
    }

    appState.config.adminUser = newAdmU;
    appState.config.adminPass = newAdmP;
    appState.config.aiProvider = document.getElementById('cfgAiProvider').value;
    appState.config.aiKey = document.getElementById('cfgAiKey').value.trim();
    saveConfigToLocal();
    if (appState.currentUser?.role === 'admin') {
      appState.currentUser.username = newAdmU;
      appState.currentUser.adminPass = newAdmP;
      sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(appState.currentUser));
    }
    showToast('تم حفظ إعدادات الأمان والنظام بنجاح ✅');
  });
}

function saveConfigToLocal() {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(appState.config));
}

function refreshAdminDashboard() {
  const totalTr = appState.trainees.length;
  const activeTr = appState.trainees.filter((t) => t.active !== false).length;
  const totalAtt = appState.results.length;
  const avgSc = totalAtt
    ? `${Math.round(appState.results.reduce((a, b) => a + Number(b.overallScore || 0), 0) / totalAtt)}%`
    : '—';

  document.getElementById('kpiTotalTrainees').textContent = totalTr;
  document.getElementById('kpiActiveTrainees').textContent = activeTr;
  document.getElementById('kpiTotalAttempts').textContent = totalAtt;
  document.getElementById('kpiAvgScore').textContent = avgSc;

  const sbBadge = document.getElementById('supabaseStatusBadge');
  if (isSupabaseConfigured()) {
    sbBadge.textContent = 'متصل ومؤمّن بـ Supabase ✅';
    sbBadge.className = 'badge badge-success';
  } else {
    sbBadge.textContent = 'وضع محلي';
    sbBadge.className = 'badge badge-gold';
  }

  document.getElementById('sbUrlInput').value = appState.config.supabaseUrl || '';
  document.getElementById('sbAnonKeyInput').value = appState.config.supabaseAnonKey || '';
  document.getElementById('cfgAdminUser').value = appState.config.adminUser;
  document.getElementById('cfgAdminPass').value = appState.config.adminPass;
  document.getElementById('cfgAiProvider').value = appState.config.aiProvider;
  document.getElementById('cfgAiKey').value = appState.config.aiKey;

  renderTraineesTable();
  renderResultsTable();
  renderAdminQuestionsList();
}

function renderTraineesTable() {
  const q = (document.getElementById('searchTraineesInput').value || '').trim().toLowerCase();
  const tbody = document.getElementById('traineesTableBody');
  const pagBar = document.getElementById('traineesPaginationBar');

  const filtered = appState.trainees.filter(
    (t) =>
      !q ||
      (t.fullName || '').toLowerCase().includes(q) ||
      (t.username || '').toLowerCase().includes(q) ||
      (t.cohort || '').toLowerCase().includes(q)
  );

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;" class="muted-text">لا يوجد متدربون مطابقون للبحث.</td></tr>';
    pagBar.innerHTML = '';
    return;
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / appState.pageSize));
  appState.tablePage = Math.min(Math.max(1, appState.tablePage), totalPages);
  const start = (appState.tablePage - 1) * appState.pageSize;
  const pageItems = filtered.slice(start, start + appState.pageSize);

  tbody.innerHTML = pageItems
    .map(
      (t, idx) => `
      <tr>
        <td>${start + idx + 1}</td>
        <td><strong>${escapeHtml(t.fullName)}</strong></td>
        <td><span class="code-pill">${escapeHtml(t.username)}</span></td>
        <td><span class="code-pill">${escapeHtml(t.password)}</span></td>
        <td>${escapeHtml(t.cohort || 'عام')}</td>
        <td>
          <span class="badge ${t.active !== false ? 'badge-success' : 'badge-danger'}">
            ${t.active !== false ? 'نشط' : 'موقوف'}
          </span>
        </td>
        <td style="display:flex;gap:6px;flex-wrap:wrap;">
          <button type="button" class="btn btn-primary btn-sm" onclick="testLoginAsTrainee('${escapeAttr(t.username)}')" title="تجربة الدخول لحساب المتدرب مباشرة">🔑 تجربة</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="copyWhatsappInvite('${escapeAttr(t.username)}')">📲 نسخ الدعوة</button>
          <button type="button" class="btn btn-ghost btn-sm" onclick="toggleTraineeStatus('${escapeAttr(t.username)}')">${t.active !== false ? 'إيقاف' : 'تفعيل'}</button>
          <button type="button" class="btn btn-danger btn-sm" onclick="deleteTraineeByUser('${escapeAttr(t.username)}')">حذف</button>
        </td>
      </tr>
    `
    )
    .join('');

  pagBar.innerHTML = totalPages > 1
    ? `
      <span class="muted-text">عرض ${start + 1} – ${Math.min(filtered.length, start + appState.pageSize)} من إجمالي <strong>${filtered.length}</strong> متدرب</span>
      <div style="display:flex;gap:8px;align-items:center;">
        <button type="button" class="btn btn-secondary btn-sm" ${appState.tablePage <= 1 ? 'disabled' : ''} onclick="changeTraineePage(-1)">السابق</button>
        <span style="font-size:0.86rem;font-weight:700;">صفحة ${appState.tablePage} من ${totalPages}</span>
        <button type="button" class="btn btn-secondary btn-sm" ${appState.tablePage >= totalPages ? 'disabled' : ''} onclick="changeTraineePage(1)">التالي</button>
      </div>
    `
    : `<span class="muted-text">إجمالي المتدربين المسجلين: <strong>${filtered.length}</strong></span>`;
}

window.changeTraineePage = function (delta) {
  appState.tablePage += delta;
  renderTraineesTable();
};

window.testLoginAsTrainee = async function (username) {
  const t = appState.trainees.find((x) => x.username === username);
  if (!t) return;
  await loginAsUser({ role: 'trainee', ...t });
  showToast(`تم الدخول تجريبياً بحساب (${t.fullName}) 👨‍🏫`);
};

window.copyWhatsappInvite = function (username) {
  const t = appState.trainees.find((x) => x.username === username);
  if (!t) return;
  const url = window.location.origin + window.location.pathname;
  const msg = `مرحباً بك ${t.fullName} في المحاكي الذكي للمقابلة الشخصية بالذكاء الاصطناعي 🎓\n\n🔗 رابط الدخول للمحاكي:\n${url}\n\n👤 اسم المستخدم: ${t.username}\n🔑 كلمة المرور: ${t.password}\n\nمع تمنياتنا لك بالتوفيق والقبول!`;
  navigator.clipboard.writeText(msg).then(() => {
    showToast(`تم نسخ رسالة بيانات الدخول لـ (${t.fullName}) 📲`);
  });
};

window.toggleTraineeStatus = async function (username) {
  if (isSupabaseConfigured()) {
    await callSupabaseRpc('tm_admin_action', {
      p_admin_user: appState.config.adminUser,
      p_admin_pass: appState.config.adminPass,
      p_action: 'toggle_status',
      p_username: username
    });
    await syncAdminFromSupabase();
  } else {
    const t = appState.trainees.find((x) => x.username === username);
    if (t) t.active = t.active === false;
    localStorage.setItem(STORAGE_KEYS.TRAINEES, JSON.stringify(appState.trainees));
  }
  refreshAdminDashboard();
};

window.deleteTraineeByUser = async function (username) {
  if (!confirm(`حذف حساب المتدرب (${username})؟`)) return;
  if (isSupabaseConfigured()) {
    await callSupabaseRpc('tm_admin_action', {
      p_admin_user: appState.config.adminUser,
      p_admin_pass: appState.config.adminPass,
      p_action: 'delete_trainee',
      p_username: username
    });
    await syncAdminFromSupabase();
  } else {
    appState.trainees = appState.trainees.filter((x) => x.username !== username);
    localStorage.setItem(STORAGE_KEYS.TRAINEES, JSON.stringify(appState.trainees));
  }
  refreshAdminDashboard();
  showToast('تم حذف الحساب');
};

// ==================== استيراد وتصدير ملفات Excel ====================
function parseUploadedExcelFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

      if (!rows || rows.length === 0) {
        alert('الملف المرفوع فارغ!');
        return;
      }

      const headerRow = rows[0].map((c) => String(c || '').trim().toLowerCase());
      const findCol = (patterns, fallbackIdx) => {
        const idx = headerRow.findIndex((h) => patterns.some((p) => h.includes(p)));
        return idx >= 0 ? idx : fallbackIdx;
      };

      const hasHeader = headerRow.some((h) =>
        ['اسم', 'مستخدم', 'مرور', 'هوية', 'سري', 'name', 'user', 'pass'].some((k) => h.includes(k))
      );

      const nameCol = hasHeader ? findCol(['الاسم الكامل', 'اسم المتدرب', 'اسم المعلم', 'الاسم', 'name'], 0) : 0;
      const userCol = hasHeader ? findCol(['اسم المستخدم', 'مستخدم', 'هوية', 'سجل', 'جوال', 'user', 'id'], 1) : 1;
      const passCol = hasHeader ? findCol(['كلمة المرور', 'مرور', 'سر', 'رمز', 'pass'], 2) : 2;
      const cohortCol = hasHeader ? findCol(['تخصص', 'دفعة', 'مجموعة', 'مسار', 'cohort', 'group'], 3) : 3;

      const startIdx = hasHeader ? 1 : 0;
      const parsedTrainees = [];

      for (let i = startIdx; i < rows.length; i++) {
        const r = rows[i];
        if (!r || !r.length) continue;
        const fullName = String(r[nameCol] || '').trim();
        const username = cleanCredential(r[userCol]);
        if (!fullName && !username) continue;

        const finalUser = username || `user_${1000 + i}`;
        const rawPass = cleanCredential(r[passCol]);
        const finalPass = rawPass || String(Math.floor(100000 + Math.random() * 900000));
        const cohort = String(r[cohortCol] || '').trim() || 'الدفعة المضافة بالإكسل';

        parsedTrainees.push({
          id: `tr_${Date.now()}_${i}`,
          fullName: fullName || finalUser,
          username: finalUser,
          password: finalPass,
          cohort,
          active: true,
          createdAt: new Date().toISOString()
        });
      }

      if (!parsedTrainees.length) {
        alert('لم يتم العثور على صفوف بيانات صالحة في ملف الإكسل.');
        return;
      }

      appState.pendingExcelRows = parsedTrainees;
      document.getElementById('excelPreviewBox').classList.remove('hidden');
      document.getElementById('excelPreviewCountText').textContent = `جاهز للاستيراد: ${parsedTrainees.length} متدرب`;
      document.getElementById('excelPreviewMiniList').innerHTML = parsedTrainees
        .slice(0, 8)
        .map((p) => `• ${escapeHtml(p.fullName)} — مستخدم: <b>${escapeHtml(p.username)}</b> — مرور: <b>${escapeHtml(p.password)}</b>`)
        .join('<br/>') + (parsedTrainees.length > 8 ? `<br/>... وعدد ${parsedTrainees.length - 8} آخرين` : '');
    } catch (_) {
      alert('تعذر قراءة ملف الإكسل؛ يرجى التأكد من أن الصيغة .xlsx أو .csv سليمة.');
    }
  };
  reader.readAsArrayBuffer(file);
}

function downloadExcelTemplate() {
  const rows = [
    ['الاسم الكامل', 'اسم المستخدم', 'كلمة المرور', 'التخصص أو الدفعة'],
    ['أ. عبدالرحمن بن خالد السبيعي', '1098765431', '654321', 'الدفعة الأولى'],
    ['أ. سارة بنت محمد القحطاني', '1098765432', '654321', 'الدفعة الأولى'],
    ['أ. فهد بن عبدالله الحربي', '1098765433', '654321', 'الدفعة الأولى']
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 28 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'المتدربين');
  XLSX.writeFile(wb, 'قالب_إضافة_المتدربين.xlsx');
}

function exportTraineesToExcel() {
  if (!appState.trainees.length) {
    alert('لا يوجد متدربون لتصديرهم.');
    return;
  }
  const rows = [
    ['الاسم الكامل', 'اسم المستخدم', 'كلمة المرور', 'التخصص أو الدفعة', 'الحالة'],
    ...appState.trainees.map((t) => [t.fullName, t.username, t.password, t.cohort || 'عام', t.active !== false ? 'نشط' : 'موقوف'])
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 28 }, { wch: 12 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'بيانات_المتدربين');
  XLSX.writeFile(wb, 'قائمة_المتدربين_وكلمات_المرور.xlsx');
}

function renderResultsTable() {
  const tbody = document.getElementById('resultsTableBody');
  if (!appState.results.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;" class="muted-text">لا توجد نتائج مقابلات مسجلة حتى الآن.</td></tr>';
    return;
  }
  tbody.innerHTML = appState.results
    .slice(0, 300)
    .map((r) => {
      const dt = new Date(r.completedAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const conf = r.radarMetrics?.selfConfidence != null ? `${r.radarMetrics.selfConfidence}%` : '—';
      const stab = r.radarMetrics?.emotionalStability != null ? `${r.radarMetrics.emotionalStability}%` : '—';
      return `
        <tr>
          <td>${dt}</td>
          <td><strong>${escapeHtml(r.traineeName)}</strong></td>
          <td><span class="code-pill">${escapeHtml(r.username || '—')}</span></td>
          <td>${escapeHtml(r.cohort || 'عام')}</td>
          <td>${r.questionsAnswered}/${r.totalQuestions || 5}</td>
          <td><span class="badge badge-neutral">${conf}</span></td>
          <td><span class="badge badge-neutral">${stab}</span></td>
          <td><span class="badge ${r.overallScore >= 60 ? 'badge-success' : 'badge-danger'}">${r.overallScore} / 100</span></td>
          <td>${escapeHtml(r.admissionStatus)}</td>
        </tr>
      `;
    })
    .join('');
}

function exportResultsToExcel() {
  if (!appState.results.length) {
    alert('لا توجد نتائج لتصديرها.');
    return;
  }
  const rows = [
    ['التاريخ', 'اسم المختبر', 'اسم المستخدم', 'الدفعة', 'الأسئلة المجابة', 'الدرجة الكلية', 'الدرجة السيكومترية', 'الثقة بالنفس (%)', 'الثبات الانفعالي (%)', 'العمق التربوي (%)', 'التطبيق العملي (%)', 'التقدير'],
    ...appState.results.map((r) => [
      new Date(r.completedAt).toLocaleString('ar-SA'),
      r.traineeName,
      r.username || '',
      r.cohort || '',
      r.questionsAnswered,
      r.overallScore,
      r.radarMetrics?.psychometricOverall || '',
      r.radarMetrics?.selfConfidence || '',
      r.radarMetrics?.emotionalStability || '',
      r.radarMetrics?.pedagogicalDepth || '',
      r.radarMetrics?.classroomPractice || '',
      r.admissionStatus
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'نتائج_المختبرين');
  XLSX.writeFile(wb, 'تقرير_الدرجات_التربوية_والسيكومترية.xlsx');
}

// ==================== إدارة الأسئلة الخمسة والصوت الاستوديوي ====================
function renderAdminQuestionsList() {
  const box = document.getElementById('adminQuestionsList');
  box.innerHTML = appState.questions
    .map(
      (q, i) => `
      <div class="card" style="background:#f8fafc;padding:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap;">
          <div>
            <span class="badge badge-success">${escapeHtml(q.standardCode || `السؤال ${i + 1}`)}</span>
            <span class="badge badge-gold" style="margin-right:6px;">🧠 ${escapeHtml(q.psychometricFocus || 'الثقة والثبات الانفعالي')}</span>
          </div>
          <button type="button" class="btn btn-primary btn-sm" onclick="previewAdminQuestionVoice(${i})">🔊 اختبار النطق الصوتي الفصيح</button>
        </div>
        <div class="form-group" style="margin-bottom:8px;">
          <label>نص السؤال المعروض للمختبر:</label>
          <textarea rows="2" onchange="updateQuestionField(${i}, 'text', this.value)">${escapeHtml(q.text)}</textarea>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label>النص المشكول للنطق الدقيق:</label>
          <textarea rows="2" onchange="updateQuestionField(${i}, 'vocalizedText', this.value)">${escapeHtml(q.vocalizedText || q.text)}</textarea>
        </div>
      </div>
    `
    )
    .join('');
}

window.previewAdminQuestionVoice = function (idx) {
  const q = appState.questions[idx];
  if (!q) return;
  playSmartCommitteeAudio({ audioUrl: q.audioFile, text: q.text, vocalizedText: q.vocalizedText, toggleIfPlaying: true });
};

window.updateQuestionField = async function (idx, field, val) {
  const q = appState.questions[idx];
  if (!q) return;
  q[field] = val.trim();
  if (field === 'text') {
    q.audioFile = null;
    q.vocalizedText = autoVocalizeArabicText(val.trim());
  }
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(appState.questions));
  if (isSupabaseConfigured()) {
    await callSupabaseRpc('tm_admin_save_settings', {
      p_admin_user: appState.config.adminUser,
      p_admin_pass: appState.config.adminPass,
      p_new_admin_user: appState.config.adminUser,
      p_new_admin_pass: appState.config.adminPass,
      p_show_demo_hint: false,
      p_questions: appState.questions
    }).catch(() => {});
  }
  showToast('تم حفظ تعديل السؤال ✅');
};

// ==================== واجهة المتدرب (المحاكي التربوي والسيكومتري) ====================
function initTraineePortalView() {
  const u = appState.currentUser;
  document.getElementById('trWelcomeHeading').textContent = `أهلاً بك، ${u.fullName}`;

  const grid = document.getElementById('trStandardsGrid');
  grid.innerHTML = appState.questions
    .map(
      (q, idx) => `
      <div class="std-card">
        <span class="std-code">🧠 ${escapeHtml(q.psychometricFocus || `البعد ${idx + 1}`)}</span>
        <strong style="display:block;margin-bottom:5px;font-size:0.93rem;">${idx + 1}. ${escapeHtml(q.text)}</strong>
        <p class="muted-text" style="font-size:0.81rem;">${escapeHtml(q.guidance)}</p>
      </div>
    `
    )
    .join('');

  switchTraineeTab('home');
  renderExamQuestion(0, false);
}

function switchTraineeTab(tabName) {
  document.querySelectorAll('.t-tab').forEach((b) => b.classList.toggle('active', b.dataset.trTab === tabName));
  document.querySelectorAll('.tr-panel').forEach((p) => p.classList.toggle('hidden', p.id !== `tr-tab-${tabName}`));
}

function bindTraineeEvents() {
  document.querySelectorAll('.t-tab').forEach((btn) => {
    btn.addEventListener('click', () => switchTraineeTab(btn.dataset.trTab));
  });

  document.getElementById('playWelcomeVoiceBtn').addEventListener('click', () => {
    playSmartCommitteeAudio({
      audioUrl: WELCOME_AUDIO_PATH,
      vocalizedText: 'أَهْلاً وَمَرْحَباً بِكَ فِي الْمُحَاكِي الذَّكِيِّ لِلْمُقَابَلَةِ الشَّخْصِيَّةِ بِالذَّكَاءِ الاصْطِنَاعِيِّ.',
      toggleIfPlaying: true
    });
  });

  document.getElementById('trTestMicBtn').addEventListener('click', initTraineeMicrophone);

  document.getElementById('startExamNowBtn').addEventListener('click', async () => {
    appState.exam.evaluations = [];
    await initTraineeMicrophone();
    switchTraineeTab('exam');
    renderExamQuestion(0, true);
  });

  document.getElementById('speakQuestionBtn').addEventListener('click', () => {
    const q = appState.questions[appState.exam.currentIndex];
    if (q) speakCurrentExamQuestion(q, true);
  });

  document.getElementById('micOrbToggleBtn').addEventListener('click', toggleExamRecording);
  document.getElementById('recordMainBtn').addEventListener('click', toggleExamRecording);
  document.getElementById('analyzeMainBtn').addEventListener('click', submitTraineeAnswerForAnalysis);

  document.getElementById('fillSampleAnswerBtn').addEventListener('click', () => {
    const q = appState.questions[appState.exam.currentIndex];
    if (!q) return;
    document.getElementById('examTranscriptInput').value = q.sampleDemoAnswer || '';
    updateLiveExamWordStats();
  });

  document.getElementById('examTranscriptInput').addEventListener('input', updateLiveExamWordStats);

  document.getElementById('retrySameQBtn').addEventListener('click', () => {
    document.getElementById('examFeedbackCard').classList.add('hidden');
    resetExamAnswerConsole();
  });

  document.getElementById('goNextQBtn').addEventListener('click', () => {
    if (appState.exam.currentIndex < appState.questions.length - 1) {
      renderExamQuestion(appState.exam.currentIndex + 1, true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      finishTraineeExamAndShowReport();
    }
  });

  document.getElementById('trFinishEarlyBtn').addEventListener('click', finishTraineeExamAndShowReport);
  document.getElementById('gotoExamFromEmptyBtn').addEventListener('click', () => switchTraineeTab('exam'));
  document.getElementById('newAttemptBtn').addEventListener('click', () => {
    appState.exam.evaluations = [];
    switchTraineeTab('exam');
    renderExamQuestion(0, true);
  });
}

function speakCurrentExamQuestion(q, toggle = false) {
  const avatar = document.getElementById('committeeAvatarWrap');
  const speed = Number(document.getElementById('audioSpeedSelect').value || 1);

  playSmartCommitteeAudio({
    audioUrl: q.audioFile,
    text: q.text,
    vocalizedText: q.vocalizedText,
    toggleIfPlaying: toggle,
    onStart: () => {
      avatar.classList.add('speaking');
      if (activeAudioPlayer) activeAudioPlayer.playbackRate = speed;
    },
    onEnd: () => avatar.classList.remove('speaking')
  });
}

function renderExamQuestion(idx, autoSpeak = false) {
  stopExamRecording();
  stopAnyCommitteeAudio(() => document.getElementById('committeeAvatarWrap').classList.remove('speaking'));

  appState.exam.currentIndex = Math.max(0, Math.min(idx, appState.questions.length - 1));
  const q = appState.questions[appState.exam.currentIndex];

  document.getElementById('examStandardCodeBadge').textContent = q.standardCode || `السؤال ${appState.exam.currentIndex + 1}`;
  document.getElementById('examPsychoFocusBadge').textContent = `🧠 يقيس: ${q.psychometricFocus || 'الثقة بالنفس والثبات الانفعالي'}`;
  document.getElementById('examProgressText').textContent = `السؤال ${appState.exam.currentIndex + 1} من ${appState.questions.length}`;
  document.getElementById('examAxisSubtitle').textContent = q.axis;
  document.getElementById('examQuestionText').textContent = q.text;
  document.getElementById('examGuidanceText').textContent = q.guidance;

  renderExamStepperPills();
  resetExamAnswerConsole();

  const existing = appState.exam.evaluations.find((e) => e.question.id === q.id);
  if (existing) {
    document.getElementById('examTranscriptInput').value = existing.transcript;
    updateLiveExamWordStats();
    renderExamFeedbackUI(existing.analysis, null, false);
  } else {
    document.getElementById('examFeedbackCard').classList.add('hidden');
  }

  if (autoSpeak) speakCurrentExamQuestion(q, false);
}

function renderExamStepperPills() {
  const box = document.getElementById('examStepperPills');
  box.innerHTML = '';
  appState.questions.forEach((q, idx) => {
    const b = document.createElement('button');
    b.type = 'button';
    const done = appState.exam.evaluations.some((e) => e.question.id === q.id);
    b.className = `q-pill ${idx === appState.exam.currentIndex ? 'current' : ''} ${done && idx !== appState.exam.currentIndex ? 'done' : ''}`;
    b.textContent = done && idx !== appState.exam.currentIndex ? '✓' : String(idx + 1);
    b.addEventListener('click', () => renderExamQuestion(idx, false));
    box.appendChild(b);
  });
}

function resetExamAnswerConsole() {
  appState.finalizedSpeech = '';
  document.getElementById('examTranscriptInput').value = '';
  document.getElementById('examRecTimer').textContent = '00:00';
  appState.recording.durationSec = 0;
  if (appState.recording.audioBlobUrl) {
    URL.revokeObjectURL(appState.recording.audioBlobUrl);
    appState.recording.audioBlobUrl = null;
  }
  appState.recording.audioBlob = null;
  appState.recording.audioBase64 = null;
  updateLiveExamWordStats();
}

// ==================== الميكروفون وقياس البصمة الصوتية السيكومترية (بدون كاميرا) ====================
async function initTraineeMicrophone() {
  if (appState.micStream) return true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      video: false
    });
    appState.micStream = stream;
    startWaveVisualizer(stream);

    const b = document.getElementById('trMicStatusBadge');
    b.textContent = 'الميكروفون متصل ✅';
    b.className = 'badge badge-success';
    document.getElementById('statMicReady').textContent = 'متصل وجاهز 🎙️';
    return true;
  } catch (_) {
    const b = document.getElementById('trMicStatusBadge');
    b.textContent = 'المايك غير مفعل (وضع نصي)';
    b.className = 'badge badge-gold';
    document.getElementById('statMicReady').textContent = 'كتابة نصية';
    return false;
  }
}

function startWaveVisualizer(stream) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!appState.audioCtx) appState.audioCtx = new AudioCtx();
    if (appState.audioCtx.state === 'suspended') appState.audioCtx.resume();

    const src = appState.audioCtx.createMediaStreamSource(stream);
    appState.analyser = appState.audioCtx.createAnalyser();
    appState.analyser.fftSize = 128;
    src.connect(appState.analyser);

    const len = appState.analyser.frequencyBinCount;
    const data = new Uint8Array(len);
    const canvas = document.getElementById('examWaveCanvas');
    const ctx = canvas.getContext('2d');
    const homeBar = document.getElementById('trWelcomeMicBar');

    if (appState.waveFrameId) cancelAnimationFrame(appState.waveFrameId);

    const loop = () => {
      appState.waveFrameId = requestAnimationFrame(loop);
      appState.analyser.getByteFrequencyData(data);
      let sum = 0;
      let weightedFreqSum = 0;
      for (let i = 0; i < len; i++) {
        sum += data[i];
        weightedFreqSum += data[i] * (i + 1);
      }
      const avg = sum / len;
      if (homeBar) homeBar.style.width = `${Math.min(100, Math.round((avg / 90) * 100))}%`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 36;
      const step = Math.max(1, Math.floor(len / bars));
      const bw = (canvas.width / bars) - 3;
      for (let i = 0; i < bars; i++) {
        const v = data[i * step] / 255;
        const h = Math.max(4, v * (canvas.height - 6));
        ctx.fillStyle = appState.recording.active ? '#f87171' : '#34d399';
        ctx.fillRect(i * (bw + 3), (canvas.height - h) / 2, bw, h);
      }

      // التقاط المؤشرات الصوتية السيكومترية أثناء التسجيل
      if (appState.recording.active) {
        appState.recording.totalSamples++;
        if (avg > 13) {
          if (!appState.recording.firstSpeechTime) {
            appState.recording.firstSpeechTime = Date.now();
          }
          appState.recording.silentFrames = 0;
          appState.recording.speechSamples++;
          appState.recording.volumeSamples.push(avg);
          if (sum > 0) {
            appState.recording.pitchSamples.push(weightedFreqSum / sum);
          }
        } else if (appState.recording.firstSpeechTime) {
          appState.recording.silentFrames++;
          // إذا تجاوز الصمت المتصل ~1.8 ثانية أثناء الإجابة يُحسب كتوقف تردد واحد
          if (appState.recording.silentFrames === 108) {
            appState.recording.longPauseCount++;
          }
        }
      }
    };
    loop();
  } catch (_) {}
}

function drawIdleWave() {
  const canvas = document.getElementById('examWaveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const bars = 36;
  const bw = (canvas.width / bars) - 3;
  for (let i = 0; i < bars; i++) {
    const h = 6 + Math.sin(i * 0.45) * 3;
    ctx.fillStyle = 'rgba(52, 211, 153, 0.35)';
    ctx.fillRect(i * (bw + 3), (canvas.height - h) / 2, bw, h);
  }
}

function toggleExamRecording() {
  if (appState.recording.active) stopExamRecording();
  else startExamRecording();
}

async function startExamRecording() {
  stopAnyCommitteeAudio(() => document.getElementById('committeeAvatarWrap').classList.remove('speaking'));
  if (!appState.micStream) await initTraineeMicrophone();

  appState.recording.active = true;
  appState.recording.startTime = Date.now();
  appState.recording.firstSpeechTime = 0;
  appState.recording.silentFrames = 0;
  appState.recording.longPauseCount = 0;
  appState.recording.durationSec = 0;
  appState.recording.chunks = [];
  appState.recording.totalSamples = 0;
  appState.recording.speechSamples = 0;
  appState.recording.volumeSamples = [];
  appState.recording.pitchSamples = [];

  document.getElementById('micOrbToggleBtn').classList.add('recording');
  document.getElementById('micOrbEmoji').textContent = '⏹️';
  document.getElementById('micStateCaption').textContent = '🔴 جارٍ تسجيل وتحليل ثقة الصوت والاتزان الانفعالي... اضغط للإيقاف';
  const mainBtn = document.getElementById('recordMainBtn');
  mainBtn.classList.add('recording');
  mainBtn.textContent = '⏹️ إيقاف التسجيل';
  document.getElementById('statMicReady').textContent = 'يحلل الصوت 🔴';

  if (appState.recording.timerId) clearInterval(appState.recording.timerId);
  appState.recording.timerId = setInterval(() => {
    const sec = Math.floor((Date.now() - appState.recording.startTime) / 1000);
    appState.recording.durationSec = sec;
    document.getElementById('examRecTimer').textContent =
      `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    updateLiveExamWordStats();
  }, 500);

  if (appState.micStream && typeof MediaRecorder !== 'undefined') {
    try {
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      appState.recording.mimeType = mime;
      const mr = new MediaRecorder(appState.micStream, { mimeType: mime });
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) appState.recording.chunks.push(e.data); };
      mr.onstop = () => {
        if (appState.recording.chunks.length > 0) {
          const blob = new Blob(appState.recording.chunks, { type: mime });
          appState.recording.audioBlob = blob;
          if (appState.recording.audioBlobUrl) URL.revokeObjectURL(appState.recording.audioBlobUrl);
          appState.recording.audioBlobUrl = URL.createObjectURL(blob);
          if (blob.size < 4_000_000) {
            const reader = new FileReader();
            reader.onloadend = () => { appState.recording.audioBase64 = reader.result; };
            reader.readAsDataURL(blob);
          }
        }
      };
      mr.start(350);
      appState.recording.mediaRecorder = mr;
    } catch (_) {}
  }

  startExamSpeechRecognition();
}

function stopExamRecording() {
  if (!appState.recording.active) return;
  appState.recording.active = false;
  appState.recording.durationSec = Math.max(appState.recording.durationSec, Math.round((Date.now() - appState.recording.startTime) / 1000));
  if (appState.recording.timerId) {
    clearInterval(appState.recording.timerId);
    appState.recording.timerId = null;
  }

  document.getElementById('micOrbToggleBtn').classList.remove('recording');
  document.getElementById('micOrbEmoji').textContent = '🎙️';
  document.getElementById('micStateCaption').textContent = 'تم إيقاف التسجيل — اضغط (تحليل الإجابة والسمات السيكومترية)';
  const mainBtn = document.getElementById('recordMainBtn');
  mainBtn.classList.remove('recording');
  mainBtn.textContent = '🎙️ استئناف / إعادة التسجيل';
  document.getElementById('statMicReady').textContent = 'تم التسجيل ✅';

  if (appState.recording.mediaRecorder && appState.recording.mediaRecorder.state !== 'inactive') {
    try { appState.recording.mediaRecorder.stop(); } catch (_) {}
  }
  stopExamSpeechRecognition();
  updateLiveExamWordStats();
}

function startExamSpeechRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const badge = document.getElementById('sttBadge');
  const input = document.getElementById('examTranscriptInput');

  if (!SpeechRec) {
    badge.textContent = 'اكتب ملخص إجابتك أدناه';
    return;
  }

  try {
    appState.finalizedSpeech = input.value ? `${input.value.trim()} ` : '';
    const rec = new SpeechRec();
    rec.lang = 'ar-SA';
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => {
      badge.textContent = '🔴 يحوّل صوتك لنص مباشرة...';
      badge.className = 'badge badge-danger';
    };

    rec.onresult = (ev) => {
      let interim = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const txt = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) appState.finalizedSpeech += `${txt.trim()} `;
        else interim += txt;
      }
      input.value = `${appState.finalizedSpeech}${interim}`.trim();
      updateLiveExamWordStats();
    };

    rec.onerror = () => {
      badge.textContent = 'يمكنك التعديل أو الكتابة أدناه';
      badge.className = 'badge badge-neutral';
    };

    rec.onend = () => {
      if (appState.recording.active && window.location.protocol !== 'file:') {
        try { rec.start(); } catch (_) {}
      } else {
        badge.className = 'badge badge-neutral';
      }
    };

    rec.start();
    appState.recognition = rec;
  } catch (_) {}
}

function stopExamSpeechRecognition() {
  const badge = document.getElementById('sttBadge');
  badge.className = 'badge badge-neutral';
  badge.textContent = 'جاهز للاستماع بالعربية';
  if (appState.recognition) {
    try {
      appState.recognition.onend = null;
      appState.recognition.stop();
    } catch (_) {}
    appState.recognition = null;
  }
}

function updateLiveExamWordStats() {
  const txt = document.getElementById('examTranscriptInput').value.trim();
  const words = txt ? txt.split(/\s+/).filter(Boolean).length : 0;
  document.getElementById('statWordCount').textContent = `${words} كلمة`;
  const sec = appState.recording.durationSec;
  document.getElementById('statPaceWpm').textContent =
    sec >= 4 && words > 0 ? `${Math.round((words / sec) * 60)} كلمة/دقيقة` : (words > 0 ? 'مقروء نصياً' : '—');
}

// ==================== تحليل الإجابة التربوي والسيكومتري ====================
async function submitTraineeAnswerForAnalysis() {
  stopExamRecording();
  const q = appState.questions[appState.exam.currentIndex];
  const transcript = document.getElementById('examTranscriptInput').value.trim();
  const hasCloudAudio =
    (appState.config.aiProvider === 'gemini' || appState.config.aiProvider === 'groq') &&
    appState.config.aiKey &&
    (appState.recording.audioBase64 || appState.recording.audioBlob);

  if (!transcript && !hasCloudAudio) {
    alert('يرجى تسجيل إجابتك عبر الميكروفون (أو كتابتها / تجربة الإجابة التدريبية) قبل التحليل.');
    return;
  }

  document.getElementById('examAnalyzingCard').classList.remove('hidden');
  document.getElementById('examFeedbackCard').classList.add('hidden');
  document.getElementById('analyzeMainBtn').disabled = true;

  await new Promise((r) => setTimeout(r, 420));

  const words = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0;
  const usedMic = appState.recording.durationSec >= 2;
  const dur = usedMic ? appState.recording.durationSec : Math.round((words / 118) * 60);
  const wpm = dur >= 4 && words > 0 ? Math.round((words / dur) * 60) : 116;
  const speakingRatio = appState.recording.totalSamples > 10
    ? Math.round((appState.recording.speechSamples / appState.recording.totalSamples) * 100)
    : 80;

  let volumeConsistency = 85;
  if (appState.recording.volumeSamples.length > 5) {
    const avgV = appState.recording.volumeSamples.reduce((a, b) => a + b, 0) / appState.recording.volumeSamples.length;
    const diff = appState.recording.volumeSamples.reduce((a, b) => a + Math.abs(b - avgV), 0) / appState.recording.volumeSamples.length;
    volumeConsistency = Math.max(60, Math.min(96, Math.round(95 - diff * 0.68)));
  }

  let pitchStability = 86;
  if (appState.recording.pitchSamples.length > 5) {
    const avgP = appState.recording.pitchSamples.reduce((a, b) => a + b, 0) / appState.recording.pitchSamples.length;
    const pDiff = appState.recording.pitchSamples.reduce((a, b) => a + Math.abs(b - avgP), 0) / appState.recording.pitchSamples.length;
    pitchStability = Math.max(62, Math.min(96, Math.round(96 - pDiff * 1.4)));
  }

  const responseLatencyMs = appState.recording.firstSpeechTime && appState.recording.startTime
    ? Math.max(300, appState.recording.firstSpeechTime - appState.recording.startTime)
    : 1400;

  const audioMetrics = {
    usedMicrophone: usedMic,
    durationSec: dur,
    wordsPerMinute: wpm,
    speakingRatio,
    volumeConsistency,
    pitchStability,
    longPauseCount: appState.recording.longPauseCount || 0,
    responseLatencyMs
  };

  const localAnalysis = analyzeTeacherAnswerLocal({ question: q, transcript, audioMetrics });

  let finalAnalysis = localAnalysis;
  let cloudNotice = null;

  if (appState.config.aiProvider !== 'builtin' && appState.config.aiKey) {
    try {
      finalAnalysis = await analyzeViaCloudDirect({
        provider: appState.config.aiProvider,
        apiKey: appState.config.aiKey,
        question: q,
        transcript,
        audioMetrics,
        audioBlob: appState.recording.audioBlob,
        audioBase64: appState.recording.audioBase64,
        mimeType: appState.recording.mimeType,
        fallbackResult: localAnalysis
      });
    } catch (_) {
      cloudNotice = 'تم التقييم عبر المحرك التربوي والسيكومتري المدمج لتعذر الوصول للمحرك الخارجي.';
    }
  }

  const finalText = finalAnalysis.detectedTranscript || transcript;
  if (!transcript && finalAnalysis.detectedTranscript) {
    document.getElementById('examTranscriptInput').value = finalAnalysis.detectedTranscript;
  }

  const exIdx = appState.exam.evaluations.findIndex((e) => e.question.id === q.id);
  const rec = { question: q, transcript: finalText, analysis: finalAnalysis };
  if (exIdx >= 0) appState.exam.evaluations[exIdx] = rec;
  else appState.exam.evaluations.push(rec);

  document.getElementById('examAnalyzingCard').classList.add('hidden');
  document.getElementById('analyzeMainBtn').disabled = false;

  renderExamStepperPills();
  renderExamFeedbackUI(finalAnalysis, cloudNotice, true);
}

function renderExamFeedbackUI(analysis, cloudNotice, scroll = true) {
  const card = document.getElementById('examFeedbackCard');
  card.classList.remove('hidden');

  const noticeEl = document.getElementById('examCloudNotice');
  if (cloudNotice) {
    noticeEl.textContent = cloudNotice;
    noticeEl.classList.remove('hidden');
  } else {
    noticeEl.classList.add('hidden');
  }

  document.getElementById('fbScoreNum').textContent = analysis.overallScore;
  document.getElementById('fbVerdictTag').textContent = analysis.verdictLabel;
  document.getElementById('fbEngineLabel').textContent =
    analysis.engine === 'builtin-pedagogical-ai' ? 'التحليل التربوي والسيكومتري الذكي' : `التحليل عبر: ${analysis.engine}`;
  document.getElementById('fbSummaryText').textContent = analysis.summary;

  const replayWrap = document.getElementById('fbAudioReplayWrap');
  const audioEl = document.getElementById('fbRecordedAudio');
  if (appState.recording.audioBlobUrl) {
    audioEl.src = appState.recording.audioBlobUrl;
    replayWrap.classList.remove('hidden');
  } else {
    replayWrap.classList.add('hidden');
  }

  const setBar = (vId, bId, val) => {
    const elV = document.getElementById(vId);
    const elB = document.getElementById(bId);
    if (elV) elV.textContent = `${val}%`;
    if (elB) elB.style.width = `${val}%`;
  };

  // عرض الدرجات السيكومترية الأربعة والتشخيص
  const psy = analysis.psychometrics || {
    overall: 80,
    selfConfidence: 80,
    emotionalStability: 82,
    initiativeResilience: 80,
    vocalPresence: analysis.scores?.vocalDelivery || 80,
    diagnosis: ''
  };
  document.getElementById('fbPsychoOverallBadge').textContent = `الدرجة السيكومترية: ${psy.overall} / 100`;
  document.getElementById('fbPsychoDiagnosis').textContent = psy.diagnosis || '';
  setBar('psyValConf', 'psyBarConf', psy.selfConfidence);
  setBar('psyValStab', 'psyBarStab', psy.emotionalStability);
  setBar('psyValInit', 'psyBarInit', psy.initiativeResilience);
  setBar('psyValVoc', 'psyBarVoc', psy.vocalPresence);
  document.getElementById('psyLblConf').textContent = `المستوى: ${getPsychometricLevelLabel(psy.selfConfidence)}`;
  document.getElementById('psyLblStab').textContent = `المستوى: ${getPsychometricLevelLabel(psy.emotionalStability)}`;

  // عرض معايير المضمون التربوي
  setBar('pVal1', 'pBar1', analysis.scores.pedagogicalDepth);
  setBar('pVal2', 'pBar2', analysis.scores.classroomPractice);
  setBar('pVal4', 'pBar4', analysis.scores.professionalValues);

  document.getElementById('fbStrengthsUl').innerHTML = (analysis.strengths || []).map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  document.getElementById('fbRecsUl').innerHTML = (analysis.recommendations || []).map((r) => `<li>${escapeHtml(r)}</li>`).join('');

  const matched = analysis.keywords?.matched || [];
  const missing = analysis.keywords?.missing || [];
  document.getElementById('fbKwMatched').innerHTML = matched.length
    ? matched.map((k) => `<span class="chip chip-ok">✓ ${escapeHtml(k)}</span>`).join('')
    : '<span class="muted-text">لم تُذكر مصطلحات مباشرة كافية</span>';
  document.getElementById('fbKwMissing').innerHTML = missing.length
    ? missing.map((k) => `<span class="chip chip-miss">+ ${escapeHtml(k)}</span>`).join('')
    : '<span class="muted-text">تغطية ممتازة لعناصر السؤال!</span>';

  document.getElementById('fbModelText').textContent = analysis.modelAnswer || '';

  const isLast = appState.exam.currentIndex >= appState.questions.length - 1;
  document.getElementById('goNextQBtn').textContent = isLast
    ? '📊 إنهاء المقابلة وإصدار التقرير الشامل'
    : `السؤال التالي (${appState.exam.currentIndex + 2} من ${appState.questions.length}) ←`;

  if (scroll) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==================== التقرير الختامي الشامل (تربوي + سيكومتري) ====================
async function finishTraineeExamAndShowReport() {
  stopExamRecording();
  if (!appState.exam.evaluations.length) {
    alert('يرجى الإجابة عن سؤال واحد على الأقل قبل إصدار التقرير الختامي.');
    return;
  }

  const report = buildFinalTeacherReportLocal(
    appState.currentUser,
    appState.exam.evaluations,
    appState.questions.length
  );

  await persistResultRecord(report);

  document.getElementById('trReportEmpty').classList.add('hidden');
  document.getElementById('trReportContent').classList.remove('hidden');

  document.getElementById('repHeaderBadge').textContent = `${report.traineeName} • (${report.questionsAnswered}/${report.totalQuestions} أسئلة)`;
  document.getElementById('repVerdictTitle').textContent = report.admissionStatus;
  document.getElementById('repExecText').textContent = report.executiveSummary;
  document.getElementById('repBigScore').textContent = report.overallScore;
  document.getElementById('repPsychoBigScore').textContent = report.psychometricScore || report.radarMetrics.psychometricOverall || 82;

  const rm = report.radarMetrics || {};
  const setRepPsy = (vId, bId, val) => {
    document.getElementById(vId).textContent = `${val}%`;
    document.getElementById(bId).style.width = `${val}%`;
  };
  setRepPsy('repPsyConf', 'repPsyBarConf', rm.selfConfidence || 80);
  setRepPsy('repPsyStab', 'repPsyBarStab', rm.emotionalStability || 82);
  setRepPsy('repPsyInit', 'repPsyBarInit', rm.initiativeResilience || 80);
  setRepPsy('repPsyVoc', 'repPsyBarVoc', rm.vocalDelivery || 80);

  renderTraineeRadarSVG(rm);

  document.getElementById('trFinalRecsBox').innerHTML = (report.finalRecommendations || [])
    .map(
      (rec, i) => `
      <div class="rec-card-item">
        <strong style="display:block;color:#92400e;margin-bottom:3px;">توصية ${i + 1}: ${escapeHtml(rec.title)}</strong>
        <p style="font-size:0.87rem;color:#78350f;">${escapeHtml(rec.detail)}</p>
      </div>
    `
    )
    .join('');

  document.getElementById('trBreakdownBox').innerHTML = appState.exam.evaluations
    .map(
      (ev, i) => {
        const psy = ev.analysis.psychometrics || {};
        return `
        <div class="card" style="background:#fcfdfd;padding:15px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:8px;">
            <strong>السؤال ${i + 1}: ${escapeHtml(ev.question.text)}</strong>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <span class="badge badge-neutral">🦁 الثقة: ${psy.selfConfidence ?? 80}%</span>
              <span class="badge badge-neutral">⚖️ الثبات الانفعالي: ${psy.emotionalStability ?? 82}%</span>
              <span class="badge ${ev.analysis.overallScore >= 75 ? 'badge-success' : 'badge-gold'}">الكلية: ${ev.analysis.overallScore} / 100</span>
            </div>
          </div>
          <p class="muted-text" style="margin-bottom:5px;"><strong>إجابتك:</strong> "${escapeHtml(ev.transcript)}"</p>
          <p style="font-size:0.88rem;color:#92400e;"><strong>أهم توصية:</strong> ${escapeHtml((ev.analysis.recommendations && ev.analysis.recommendations[0]) || 'أداء متميز')}</p>
        </div>
      `;
      }
    )
    .join('');

  switchTraineeTab('report');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderTraineeRadarSVG(m) {
  const axes = [
    { label: 'العمق التربوي', value: m.pedagogicalDepth || 78 },
    { label: 'التطبيق العملي', value: m.classroomPractice || 78 },
    { label: 'الثقة بالنفس', value: m.selfConfidence || 82 },
    { label: 'الثبات الانفعالي', value: m.emotionalStability || 84 },
    { label: 'الحضور الصوتي', value: m.vocalDelivery || 80 }
  ];
  const size = 320, cx = 160, cy = 160, maxR = 94;
  const pt = (idx, r) => {
    const a = (Math.PI * 2 * idx) / axes.length - Math.PI / 2;
    return { x: cx + maxR * r * Math.cos(a), y: cy + maxR * r * Math.sin(a) };
  };
  let grids = '';
  [0.25, 0.5, 0.75, 1].forEach((lvl) => {
    grids += `<polygon points="${axes.map((_, i) => `${pt(i, lvl).x.toFixed(1)},${pt(i, lvl).y.toFixed(1)}`).join(' ')}" fill="none" stroke="#cbd5e1" stroke-width="1" />`;
  });
  let lines = '', labels = '';
  axes.forEach((ax, i) => {
    const e = pt(i, 1), lp = pt(i, 1.30);
    lines += `<line x1="${cx}" y1="${cy}" x2="${e.x.toFixed(1)}" y2="${e.y.toFixed(1)}" stroke="#cbd5e1" stroke-width="1" />`;
    labels += `<text x="${lp.x.toFixed(1)}" y="${lp.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="11.5" font-weight="700" fill="#0c192c">${ax.label} (${ax.value}%)</text>`;
  });
  const poly = axes.map((ax, i) => `${pt(i, Math.max(0.1, ax.value / 100)).x.toFixed(1)},${pt(i, Math.max(0.1, ax.value / 100)).y.toFixed(1)}`).join(' ');
  const dots = axes.map((ax, i) => `<circle cx="${pt(i, Math.max(0.1, ax.value / 100)).x.toFixed(1)}" cy="${pt(i, Math.max(0.1, ax.value / 100)).y.toFixed(1)}" r="4.5" fill="#0b6e4f" stroke="#fff" stroke-width="1.5" />`).join('');

  document.getElementById('trRadarBox').innerHTML = `
    <svg width="100%" height="305" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      ${grids}${lines}
      <polygon points="${poly}" fill="rgba(11, 110, 79, 0.22)" stroke="#0b6e4f" stroke-width="2.5" />
      ${dots}${labels}
    </svg>
  `;
}

function escapeHtml(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str = '') {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
