-- ============================================================================
-- إعداد قاعدة البيانات السحابية المؤمّنة (Supabase PostgreSQL)
-- للمحاكي الذكي للماجستير المهني للمعلمين (يدعم 1,000 إلى +50,000 متدرب)
-- ============================================================================

-- 1. جدول إعدادات النظام ومدير النظام (محمي بالكامل بـ RLS)
CREATE TABLE IF NOT EXISTS public.tm_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  admin_user text NOT NULL DEFAULT 'admin',
  admin_pass text NOT NULL DEFAULT 'admin123',
  show_demo_hint boolean NOT NULL DEFAULT false,
  questions jsonb DEFAULT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.tm_settings (id, admin_user, admin_pass, show_demo_hint)
VALUES (1, 'admin', 'admin123', false)
ON CONFLICT (id) DO NOTHING;

-- 2. جدول المتدربين (مفهرس للسرعة العالية مع آلاف المتدربين)
CREATE TABLE IF NOT EXISTS public.tm_trainees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  username text NOT NULL,
  username_lower text GENERATED ALWAYS AS (lower(btrim(username))) STORED UNIQUE,
  password text NOT NULL,
  cohort text NOT NULL DEFAULT 'الدفعة العامة',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tm_trainees_cohort ON public.tm_trainees (cohort);
CREATE INDEX IF NOT EXISTS idx_tm_trainees_created ON public.tm_trainees (created_at DESC);

-- إضافة حساب تجريبي أولي (يمكنك حذفه من لوحة المدير)
INSERT INTO public.tm_trainees (full_name, username, password, cohort, active)
VALUES ('أ. أحمد بن محمد الغامدي (حساب تجريبي)', 'teacher1', '123456', 'الدفعة التجريبية', true)
ON CONFLICT (username_lower) DO NOTHING;

-- 3. جدول نتائج وتقارير المتدربين
CREATE TABLE IF NOT EXISTS public.tm_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id uuid REFERENCES public.tm_trainees(id) ON DELETE SET NULL,
  trainee_name text NOT NULL,
  username text NOT NULL,
  cohort text NOT NULL DEFAULT 'عام',
  questions_answered int NOT NULL DEFAULT 0,
  total_questions int NOT NULL DEFAULT 5,
  overall_score int NOT NULL DEFAULT 0,
  admission_status text NOT NULL DEFAULT '',
  radar_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tm_results_completed ON public.tm_results (completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_tm_results_username ON public.tm_results (lower(username));

-- 4. تفعيل الحماية القصوى (Row Level Security): منع أي قراءة أو تعديل مباشر للجداول من المتصفح!
ALTER TABLE public.tm_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tm_trainees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tm_results ENABLE ROW LEVEL SECURITY;

-- لا نضع أي Policy عامة؛ الوصول يتم حصراً عبر الدوال المؤمّنة أدناه (SECURITY DEFINER)

-- ============================================================================
-- الدوال الآمنة (RPC Functions)
-- ============================================================================

-- أ) جلب الإعدادات العامة المسموحة للواجهة فقط (الأسئلة + إظهار التلميح، بدون أي كلمات مرور)
CREATE OR REPLACE FUNCTION public.tm_get_public_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.tm_settings%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.tm_settings WHERE id = 1;
  RETURN jsonb_build_object(
    'showDemoHint', COALESCE(v_row.show_demo_hint, false),
    'questions', v_row.questions
  );
END;
$$;

-- ب) التحقق من دخول المتدرب (يرجع بيانات هذا المتدرب فقط إن صحت كلمة المرور)
CREATE OR REPLACE FUNCTION public.tm_verify_trainee(p_username text, p_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tr public.tm_trainees%ROWTYPE;
BEGIN
  SELECT * INTO v_tr
  FROM public.tm_trainees
  WHERE username_lower = lower(btrim(p_username))
    AND password = btrim(p_password)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_credentials');
  END IF;

  IF v_tr.active IS FALSE THEN
    RETURN jsonb_build_object('ok', false, 'error', 'account_disabled');
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'trainee', jsonb_build_object(
      'id', v_tr.id,
      'fullName', v_tr.full_name,
      'username', v_tr.username,
      'cohort', v_tr.cohort,
      'active', v_tr.active
    )
  );
END;
$$;

-- ج) حفظ نتيجة اختبار المتدرب بعد التحقق من حسابه
CREATE OR REPLACE FUNCTION public.tm_submit_result(
  p_username text,
  p_password text,
  p_questions_answered int,
  p_total_questions int,
  p_overall_score int,
  p_admission_status text,
  p_radar_metrics jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tr public.tm_trainees%ROWTYPE;
BEGIN
  SELECT * INTO v_tr
  FROM public.tm_trainees
  WHERE username_lower = lower(btrim(p_username))
    AND password = btrim(p_password)
    AND active IS TRUE
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;

  INSERT INTO public.tm_results (
    trainee_id, trainee_name, username, cohort,
    questions_answered, total_questions, overall_score,
    admission_status, radar_metrics
  ) VALUES (
    v_tr.id, v_tr.full_name, v_tr.username, v_tr.cohort,
    p_questions_answered, p_total_questions, p_overall_score,
    p_admission_status, COALESCE(p_radar_metrics, '{}'::jsonb)
  );

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- د) دالة داخلية للتحقق من صلاحية مدير النظام
CREATE OR REPLACE FUNCTION public.tm_check_admin(p_admin_user text, p_admin_pass text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.tm_settings
    WHERE id = 1
      AND lower(btrim(admin_user)) = lower(btrim(p_admin_user))
      AND admin_pass = btrim(p_admin_pass)
  );
END;
$$;

-- هـ) جلب لوحة تحكم المدير بالكامل (تتحمل آلاف المتدربين والنتائج بكفاءة عالية)
CREATE OR REPLACE FUNCTION public.tm_admin_get_dashboard(p_admin_user text, p_admin_pass text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trainees jsonb;
  v_results jsonb;
  v_settings public.tm_settings%ROWTYPE;
BEGIN
  IF NOT public.tm_check_admin(p_admin_user, p_admin_pass) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized_admin');
  END IF;

  SELECT * INTO v_settings FROM public.tm_settings WHERE id = 1;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', t.id,
      'fullName', t.full_name,
      'username', t.username,
      'password', t.password,
      'cohort', t.cohort,
      'active', t.active,
      'createdAt', t.created_at
    ) ORDER BY t.created_at DESC
  ), '[]'::jsonb) INTO v_trainees
  FROM public.tm_trainees t;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', r.id,
      'traineeName', r.trainee_name,
      'username', r.username,
      'cohort', r.cohort,
      'questionsAnswered', r.questions_answered,
      'totalQuestions', r.total_questions,
      'overallScore', r.overall_score,
      'admissionStatus', r.admission_status,
      'radarMetrics', r.radar_metrics,
      'completedAt', r.completed_at
    ) ORDER BY r.completed_at DESC
  ), '[]'::jsonb) INTO v_results
  FROM (SELECT * FROM public.tm_results ORDER BY completed_at DESC LIMIT 5000) r;

  RETURN jsonb_build_object(
    'ok', true,
    'showDemoHint', v_settings.show_demo_hint,
    'questions', v_settings.questions,
    'trainees', v_trainees,
    'results', v_results
  );
END;
$$;

-- و) الرفع الجماعي السريع من ملف Excel (يدعم رفع 1,000+ متدرب في جزء من الثانية!)
CREATE OR REPLACE FUNCTION public.tm_admin_bulk_upsert(
  p_admin_user text,
  p_admin_pass text,
  p_trainees jsonb,
  p_replace boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int := 0;
BEGIN
  IF NOT public.tm_check_admin(p_admin_user, p_admin_pass) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized_admin');
  END IF;

  IF p_replace IS TRUE THEN
    DELETE FROM public.tm_trainees WHERE true;
  END IF;

  WITH incoming AS (
    SELECT DISTINCT ON (lower(btrim(x->>'username')))
      COALESCE(NULLIF(btrim(x->>'fullName'), ''), btrim(x->>'username')) AS full_name,
      btrim(x->>'username') AS username,
      COALESCE(NULLIF(btrim(x->>'password'), ''), '123456') AS password,
      COALESCE(NULLIF(btrim(x->>'cohort'), ''), 'الدفعة المضافة بالإكسل') AS cohort,
      COALESCE((x->>'active')::boolean, true) AS active
    FROM jsonb_array_elements(p_trainees) AS x
    WHERE btrim(COALESCE(x->>'username', '')) <> ''
  ),
  upserted AS (
    INSERT INTO public.tm_trainees (full_name, username, password, cohort, active)
    SELECT full_name, username, password, cohort, active FROM incoming
    ON CONFLICT (username_lower) DO UPDATE
      SET full_name = EXCLUDED.full_name,
          username  = EXCLUDED.username,
          password  = EXCLUDED.password,
          cohort    = EXCLUDED.cohort,
          active    = EXCLUDED.active
    RETURNING 1
  )
  SELECT count(*) INTO v_count FROM upserted;

  RETURN jsonb_build_object('ok', true, 'upsertedCount', v_count);
END;
$$;

-- ز) إدارة متدرب فردي (تفعيل/إيقاف/حذف) أو مسح النتائج
CREATE OR REPLACE FUNCTION public.tm_admin_action(
  p_admin_user text,
  p_admin_pass text,
  p_action text,
  p_username text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.tm_check_admin(p_admin_user, p_admin_pass) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized_admin');
  END IF;

  IF p_action = 'toggle_status' THEN
    UPDATE public.tm_trainees
    SET active = NOT active
    WHERE username_lower = lower(btrim(p_username));
  ELSIF p_action = 'delete_trainee' THEN
    DELETE FROM public.tm_trainees
    WHERE username_lower = lower(btrim(p_username));
  ELSIF p_action = 'clear_results' THEN
    DELETE FROM public.tm_results WHERE true;
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- ح) تحديث إعدادات الأمان (كلمة مرور المدير، إخفاء التلميح، تعديل الأسئلة)
CREATE OR REPLACE FUNCTION public.tm_admin_save_settings(
  p_admin_user text,
  p_admin_pass text,
  p_new_admin_user text,
  p_new_admin_pass text,
  p_show_demo_hint boolean,
  p_questions jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.tm_check_admin(p_admin_user, p_admin_pass) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized_admin');
  END IF;

  UPDATE public.tm_settings
  SET admin_user = COALESCE(NULLIF(btrim(p_new_admin_user), ''), admin_user),
      admin_pass = COALESCE(NULLIF(btrim(p_new_admin_pass), ''), admin_pass),
      show_demo_hint = COALESCE(p_show_demo_hint, show_demo_hint),
      questions = COALESCE(p_questions, questions),
      updated_at = now()
  WHERE id = 1;

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- منح صلاحية استدعاء الدوال فقط للواجهة الأمامية (بينما الجداول نفسها مقفلة تماماً!)
GRANT EXECUTE ON FUNCTION public.tm_get_public_config() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tm_verify_trainee(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tm_submit_result(text, text, int, int, int, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tm_admin_get_dashboard(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tm_admin_bulk_upsert(text, text, jsonb, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tm_admin_action(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tm_admin_save_settings(text, text, text, text, boolean, jsonb) TO anon, authenticated;
