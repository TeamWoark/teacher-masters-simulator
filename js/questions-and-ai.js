// المحاكي الذكي للمقابلة الشخصية بالذكاء الاصطناعي — محرك الفهم الدلالي المرن للنصوص المنطوقة + المعجم التربوي والتخصصي الموسّع + القياس السيكومتري

const WELCOME_AUDIO_PATH = './audio/welcome.mp3?v=7';

const DEFAULT_QUESTIONS = [
  {
    id: 'ai_q1',
    number: 1,
    standardCode: 'السؤال الأول • المبادرة والبيئة الصفية',
    axis: 'المبادرة التربوية وتطوير البيئة الصفية والأنشطة',
    psychometricFocus: 'الثقة بالنفس وروح المبادرة المهنية',
    audioFile: './audio/q1.mp3?v=7',
    text: 'اذكر موقفاً بادرت فيه لتحسين البيئة الصفية أو تطوير أحد الأنشطة؟',
    vocalizedText: 'السُّؤَالُ الأَوَّلُ: اذْكُرْ مَوْقِفًا بَادَرْتَ فِيهِ لِتَحْسِينِ الْبِيئَةِ الصَّفِّيَّةِ، أَوْ تَطْوِيرِ أَحَدِ الأَنْشِطَةِ؟',
    guidance: 'تحدث بأسلوبك الطبيعي عن أي فكرة أو تعديل أو نشاط نفذته في فصلك أو مادتك وكيف انعكس إيجابياً على حماس الطلاب وتعلمهم.',
    // عناقيد دلالية مرنة واسعة تشمل الفصحى والدارجة المهنية ومختلف التخصصات
    semanticThemes: [
      {
        label: 'المبادرة والتطوير العملي',
        cues: ['بادر', 'مبادر', 'طور', 'تطوير', 'حسن', 'تحسين', 'غير', 'عدل', 'ابتكر', 'فكر', 'صمم', 'انشا', 'جهز', 'رتب', 'سويت', 'عملت', 'نفذ', 'اقترح', 'استحدث', 'اضفت', 'حولت']
      },
      {
        label: 'تهيئة البيئة الصفية أو النشاط التعليمي',
        cues: ['بيئه', 'فصل', 'صف', 'قاعه', 'مختبر', 'معمل', 'نشاط', 'انشطه', 'اركان', 'ركن', 'مجموعات', 'فرق', 'حلقات', 'طاولات', 'لوحه', 'وسيله', 'بطاقات', 'مسابق', 'تحدي', 'لعبه', 'ورشه', 'مشروع', 'تجرب', 'تمثيل ادوار', 'قالب', 'استراتيجي']
      },
      {
        label: 'إشراك الطلاب ومراعاة ميولهم',
        cues: ['طالب', 'طلاب', 'متعلم', 'تفاعل', 'مشارك', 'حماس', 'دافعي', 'تشجيع', 'تحفيز', 'جذب', 'ملل', 'رتاب', 'خجل', 'انطوا', 'تعاون', 'زملا', 'اقران', 'ادوار', 'ميول', 'مستويات', 'جميع']
      },
      {
        label: 'الأثر والنتيجة الإيجابية',
        cues: ['اثر', 'نتيج', 'اثمر', 'اسهم', 'زاد', 'ارتفع', 'تحسن', 'نجح', 'استمتع', 'فهم', 'استيعاب', 'انجاز', 'اقبال', 'حب', 'تغير', 'تطور', 'درجات', 'تحصيل', 'لاحظت فرق']
      }
    ],
    enrichmentIdeas: ['وصف حالة الصف قبل المبادرة', 'توضيح دور الطلاب داخل النشاط', 'ذكر الأثر الملموس على تفاعلهم أو تحصيلهم'],
    specificRecommendations: [
      'لجعل إجابتك أكثر إقناعاً، اربط مبادرتك دائماً بالأثر النهائي الذي لاحظته على حماس الطلاب أو تحصيلهم الدراسي.',
      'يمكنك ذكر مثال سريع من تخصصك الدراسي يوضح كيف حولت نشاطاً عادياً إلى تجربة تفاعلية جاذبة.'
    ],
    modelAnswer: 'لاحظت في بداية الفصل أن بعض الطلاب يشعرون بالرتابة أثناء الأنشطة التقليدية، فبادرت بإعادة تهيئة البيئة الصفية إلى مجموعات تعلم نشط وإنشاء ركن تحديات تفاعلي يتضمن أنشطة ومهمات مرتبطة بحياة الطالب وتخصص المادة. أسهمت هذه المبادرة في رفع مشاركة جميع الطلاب بشكل ملحوظ وتعزيز روح التعاون والتنافس الإيجابي داخل الحصة.',
    sampleDemoAnswer: 'لاحظت حاجة الطلاب إلى بيئة صفية أكثر تحفيزاً، فرتبت الفصل بنظام المجموعات التعاونية وصممت نشاط محطات تعليمية ومسابقات تفاعلية يشارك فيها كل طالب بدور محدد، فزاد حماسهم وارتفع مستوى فهمهم وتفاعلهم في الحصة.'
  },
  {
    id: 'ai_q2',
    number: 2,
    standardCode: 'السؤال الثاني • إدارة المواقف الصعبة',
    axis: 'التعامل التربوي مع المواقف الصعبة (ولي أمر أو طالب)',
    psychometricFocus: 'الثبات الانفعالي وضبط النفس تحت الضغط',
    audioFile: './audio/q2.mp3?v=7',
    text: 'كيف تتعامل إذا واجهت موقفاً صعباً مع ولي أمر أو طالب؟',
    vocalizedText: 'السُّؤَالُ الثَّانِي: كَيْفَ تَتَعَامَلُ إِذَا وَاجَهْتَ مَوْقِفًا صَعْبًا مَعَ وَلِيِّ أَمْرٍ أَوْ طَالِبٍ؟',
    guidance: 'عبّر بطريقتك عن هدوئك، استماعك للطرف الآخر دون انفعال أو إحراج، وحرصك على حل المشكلة تربوياً بما يخدم مصلحة الطالب.',
    semanticThemes: [
      {
        label: 'الهدوء وضبط النفس وعدم الانفعال',
        cues: ['هدو', 'بهدو', 'هادي', 'اتزان', 'ثبات', 'ضبط', 'صبر', 'تروي', 'حكمه', 'امسك اعصاب', 'ما انفعل', 'دون انفعال', 'لا اغضب', 'امتص', 'امتصاص', 'ابتسام', 'رحاب', 'صدر رحب', 'وقار']
      },
      {
        label: 'الإنصات الفعّال وتفهّم وجهة النظر',
        cues: ['استمع', 'اسمع', 'سمعت', 'انصت', 'انصات', 'تفهم', 'افهم', 'وجهة نظر', 'سبب', 'اسباب', 'دوافع', 'ظروف', 'احترم', 'احترام', 'تقدير', 'ترحيب', 'ارحب', 'دون مقاطع', 'اعطيه فرصه']
      },
      {
        label: 'الخصوصية والاحتواء التربوي بعيداً عن الإحراج',
        cues: ['احتوا', 'احتوي', 'خصوصي', 'انفراد', 'لحال', 'بيني وبينه', 'مكتب', 'غرفه', 'بعد الحصه', 'دون احراج', 'لا احرج', 'امام زملا', 'قدام الطلاب', 'حوار', 'نقاش', 'تحدثت معه', 'كلمته', 'جلست معه', 'قربت منه']
      },
      {
        label: 'الحل التشاركي والتنسيق المؤسسي',
        cues: ['حل', 'نعالج', 'معالج', 'خطة', 'اتفاق', 'مصلح', 'شواهد', 'درجات', 'ادله', 'موجه', 'مرشد', 'ادار', 'وكيل', 'توثيق', 'متابع', 'شراكه', 'اسره', 'ولي الامر', 'ابوه', 'والده', 'تعاون']
      }
    ],
    enrichmentIdeas: ['الإنصات الكامل لامتصاص التوتر', 'مراعاة الخصوصية وعدم الإحراج العلني', 'إشراك التوجيه الطلابي عند الحاجة والتركيز على مصلحة الطالب'],
    specificRecommendations: [
      'إبرازك للهدوء والاستماع وعدم الرد الانفعالي هو مفتاح الدرجة الكاملة في هذا السؤال.',
      'من المفيد الإشارة إلى التفرقة بين الاحتواء السريع داخل الحصة والحوار الفردي الهادئ بعدها، والتكامل مع الموجه الطلابي عند اللزوم.'
    ],
    modelAnswer: 'أتعامل مع أي موقف صعب مع طالب أو ولي أمر بهدوء وثبات انفعالي تام، فأحرص أولاً على الإنصات الجيد وتفهّم وجهة نظره دون مقاطعة أو جدال علني. مع الطالب أحتوي الموقف بهدوء دون إحراجه أمام زملائه ثم أحاوره على انفراد لمعرفة السبب، ومع ولي الأمر أرحب به وأعرض له الحقائق والشواهد باحترام، ونضع معاً حلولاً عملية تصب في مصلحة الطالب بالتنسيق مع الموجه الطلابي.',
    sampleDemoAnswer: 'أول شيء أحافظ على هدوئي التام وأستمع للطالب أو ولي الأمر باحترام كامل حتى أفهم سبب انزعاجه دون أي جدال أو إحراج أمام الآخرين، ثم أجلس معه على انفراد ونتحاور بهدوء حول مصلحة الطالب ونصل لحل مناسب بالتعاون مع الإرشاد الطلابي.'
  },
  {
    id: 'ai_q3',
    number: 3,
    standardCode: 'السؤال الثالث • تطوير التدريس وحل المشكلات',
    axis: 'تحسين طرائق التدريس ومعالجة المشكلات الطلابية',
    psychometricFocus: 'المرونة وحل المشكلات والثقة المهنية',
    audioFile: './audio/q3.mp3?v=7',
    text: 'اذكر موقفاً ساعدت فيه في تحسين طريقة تدريس أو مشكلة تتعلق بالطلاب؟',
    vocalizedText: 'السُّؤَالُ الثَّالِثُ: اذْكُرْ مَوْقِفًا سَاعَدْتَ فِيهِ فِي تَحْسِينِ طَرِيقَةِ تَدْرِيسٍ، أَوْ مُشْكِلَةٍ تَتَعَلَّقُ بِالطُّلَّابِ؟',
    guidance: 'تحدث بأسلوبك عن مشكلة دراسية أو سلوكية واجهت الطلاب (أو تطوير طريقة شرح درس في تخصصك) وكيف تدخلت لحلها وتحسّن مستواهم.',
    semanticThemes: [
      {
        label: 'رصد المشكلة أو الحاجة التطويرية',
        cues: ['لاحظ', 'رصد', 'شخص', 'تشخيص', 'وجدت', 'واجه', 'مشكل', 'ضعف', 'صعوب', 'تدني', 'تشتت', 'غياب', 'سرحان', 'عزوف', 'خوف', 'ملل', 'تعثر', 'خطا', 'اختبار', 'تقييم', 'مستوى']
      },
      {
        label: 'تنويع طريقة التدريس أو أسلوب الحل',
        cues: ['طريق', 'اسلوب', 'استراتيجي', 'شرح', 'بسط', 'تبسيط', 'تدرج', 'خرائط', 'محسوس', 'عملي', 'تطبيقي', 'تعاوني', 'مجموعات', 'اقران', 'وسائل', 'بصري', 'قصص', 'العاب', 'تجرب', 'امثله', 'ربط بالواقع', 'خطه', 'علاجي', 'اوراق عمل', 'تدريب']
      },
      {
        label: 'المساندة والتعاون المهني',
        cues: ['ساعد', 'مساعد', 'دعم', 'تعاون', 'زميل', 'زملا', 'معلم', 'تبادل', 'زيار', 'مجتمع تعلم', 'مشرف', 'مرشد', 'اسره', 'توجيه', 'شارك', 'قدم', 'مبادر', 'تابعت']
      },
      {
        label: 'قياس التحسن والأثر على الطلاب',
        cues: ['تحسن', 'تطور', 'ارتفع', 'زاد', 'اتقان', 'اتقن', 'فهم', 'استوعب', 'نجح', 'تغلب', 'حل', 'انحلت', 'اختفت', 'تفاعل', 'نتائج', 'درجات', 'ثقه', 'اثر', 'فرق']
      }
    ],
    enrichmentIdeas: ['توضيح كيف اكتشفت المشكلة لدى الطلاب', 'ذكر الطريقة البديلة أو المبسطة التي استخدمتها', 'بيان كيف لمست تحسّن مستوى الطلاب بعدها'],
    specificRecommendations: [
      'عرضك لتسلسل الفكرة (المشكلة التي لاحظتها ← التغيير الذي قمت به في الشرح أو التعامل ← تحسن الطلاب) يمنحك تميزاً عالياً أياً كانت الألفاظ التي اخترتها.',
      'يمكنك ذكر استراتيجية من صميم تخصصك الدراسي (كالمحسوسات، التجارب، الخرائط الذهنية، أو تعلم الأقران).'
    ],
    modelAnswer: 'لاحظت صعوبة لدى مجموعة من الطلاب في استيعاب أحد الدروس المجردة مما أثر على أدائهم، فبادرت بتغيير أسلوب الشرح التقليدي إلى التعلم التعاوني وتوظيف المحسوسات والأمثلة الواقعية مع تقسيم المهارة لخطوات متدرجة، وشاركت هذه التجربة مع زملائي في القسم. ظهر الأثر سريعاً بارتفاع نسبة إتقان الطلاب ومشاركتهم بثقة.',
    sampleDemoAnswer: 'واجه بعض الطلاب ضعفاً في فهم مهارة أساسية بالمادة، فشخصت نقاط الصعوبة وغيرت طريقة الشرح باستخدام الأمثلة المبسطة من واقعهم والتعلم بالأقران وأوراق العمل المتدرجة، ومع المتابعة والتشجيع تحسنت نتائجهم بشكل كبير.'
  },
  {
    id: 'ai_q4',
    number: 4,
    standardCode: 'السؤال الرابع • الوسائل التعليمية التقنية',
    axis: 'توظيف الوسائل التعليمية والتقنيات الرقمية في التعليم',
    psychometricFocus: 'الحضور الصوتي والوضوح التنظيمي',
    audioFile: './audio/q4.mp3?v=7',
    text: 'اذكر وسائل تعليمية تقنية؟',
    vocalizedText: 'السُّؤَالُ الرَّابِعُ: اذْكُرْ وَسَائِلَ تَعْلِيمِيَّةً تِقْنِيَّةً؟',
    guidance: 'اذكر أي وسائل أو أجهزة أو برامج أو منصات تقنية تستخدمها في التدريس، ووضّح باختصار كيف تفيد طلابك في الفهم والتفاعل.',
    semanticThemes: [
      {
        label: 'الأجهزة والشاشات التفاعلية داخل الفصل',
        cues: ['سبور', 'ذكيه', 'تفاعلي', 'شاشه', 'عرض', 'بروجكتر', 'داتا شو', 'حاسب', 'كمبيوتر', 'لابتوب', 'ايباد', 'لوحي', 'جوال', 'كاميرا وثائقي', 'سماعات', 'معمل']
      },
      {
        label: 'المنصات والبرامج التعليمية والعروض',
        cues: ['مدرستي', 'منص', 'تيمز', 'زوم', 'افتراض', 'بوربوينت', 'عروض', 'كانفا', 'وورد', 'فيديو', 'مقاطع', 'مرئي', 'يوتيوب', 'عين', 'بوابه', 'قنوات', 'انفوجرافيك', 'صور', 'رسوم', 'صوتيات']
      },
      {
        label: 'التطبيقات التفاعلية والتقويم والذكاء الاصطناعي',
        cues: ['كاهوت', 'وورد وول', 'نيربود', 'كويزز', 'بادلت', 'كلاس', 'فورمز', 'استبان', 'اختبار الكتروني', 'العاب', 'مسابقات', 'باركود', 'رموز', 'محاكا', 'مختبر افتراضي', 'واقع معزز', 'واقع افتراضي', 'ذكاء اصطناعي', 'شات', 'تطبيق', 'برامج', 'رقمي', 'جيوجبرا', 'ماينكرافت', 'روبوت']
      },
      {
        label: 'الهدف التربوي من توظيف التقنية',
        cues: ['فهم', 'تبسيط', 'تفاعل', 'تشويق', 'جذب', 'انتباه', 'تقويم', 'قياس', 'تغذي', 'وقت', 'جهد', 'بصري', 'سمعي', 'انماط', 'فروق', 'متعه', 'تثبيت المعلومه', 'ربط', 'واجب', 'متابع']
      }
    ],
    enrichmentIdeas: ['ذكر أمثلة لأدوات العرض أو المنصات (مثل السبورة التفاعلية، العروض، منصة مدرستي)', 'الإشارة لأدوات التفاعل أو المسابقات الرقمية', 'توضيح كيف تخدم هذه الوسائل فهم الطالب وتفاعله'],
    specificRecommendations: [
      'من الممتاز ربط الوسيلة التقنية التي تذكرها بفائدتها داخل الحصة (مثل: جذب الانتباه، تبسيط مفهوم صعب، أو قياس فهم الطلاب اللحظي).',
      'التنويع بين وسائل العرض والمنصات وأدوات التفاعل يعكس إلمامك الشامل بالتعليم الرقمي الحديث.'
    ],
    modelAnswer: 'أستخدم وسائل تعليمية تقنية متنوعة تخدم أهداف الدرس؛ مثل السبورة التفاعلية والعروض التقديمية ومقاطع الفيديو لشرح المفاهيم بصرياً، ومنصة مدرستي والتيمز للتكليفات والمتابعة، إلى جانب تطبيقات المسابقات والتقويم التفاعلي وأدوات المحاكاة والذكاء الاصطناعي التي تجعل الطالب مشاركاً فاعلاً وتراعي أنماط التعلم المختلفة.',
    sampleDemoAnswer: 'أوظف في حصتي السبورة الذكية وشاشة العرض مع عروض البوربوينت والفيديوهات التعليمية لتبسيط الدرس، وأستخدم منصة مدرستي والتطبيقات التفاعلية والمسابقات الإلكترونية والباركود لزيادة حماس الطلاب والتأكد من فهمهم بطريقة ممتعة.'
  },
  {
    id: 'ai_q5',
    number: 5,
    standardCode: 'السؤال الخامس • دعم ذوي صعوبات التعلم',
    axis: 'التعامل التربوي والعلمي مع الطلاب ذوي صعوبات التعلم',
    psychometricFocus: 'الاتزان الانفعالي والصبر والاحتواء التربوي',
    audioFile: './audio/q5.mp3?v=7',
    text: 'كيف تتعامل مع طالب عنده صعوبات تعلم؟',
    vocalizedText: 'السُّؤَالُ الْخَامِسُ: كَيْفَ تَتَعَامَلُ مَعَ طَالِبٍ عِنْدَهُ صُعُوبَاتُ تَعَلُّمٍ؟',
    guidance: 'اشرح بطريقتك كيف تدعمه نفسياً (بالصبر والتشجيع) وتعليمياً (بتبسيط الشرح والوسائل المتنوعة والتعاون مع المختصين وأسرته).',
    semanticThemes: [
      {
        label: 'الدعم النفسي والصبر وبناء الثقة',
        cues: ['صبر', 'هدو', 'احتوا', 'حنان', 'رفق', 'تشجيع', 'اشجع', 'تحفيز', 'احفز', 'تعزيز', 'مدح', 'ثقه', 'امان', 'نفسيا', 'لا احرج', 'دون مقارن', 'ما اقارن', 'تقبل', 'قريب مني', 'مقعد امامي', 'اهتمام', 'حب']
      },
      {
        label: 'تبسيط التدريس وتنويع الوسائل الحسية',
        cues: ['بسط', 'تبسيط', 'سهل', 'تجزئ', 'اجزئ', 'خطوه', 'تدرج', 'شوي شوي', 'تكرار', 'اعيد', 'وسائل', 'حسي', 'محسوس', 'بصري', 'سمعي', 'صور', 'مجسم', 'الوان', 'العاب', 'اوراق عمل', 'وقت اضافي', 'مهام قصيره', 'فروق فرديه', 'طريقته']
      },
      {
        label: 'التشخيص والخطة الفردية والمتابعة',
        cues: ['تشخيص', 'اشخص', 'اعرف مستواه', 'نقاط القوه', 'احتياج', 'خطه', 'فردي', 'علاجي', 'تقدم', 'تحسن', 'متابع', 'اتابع', 'تقويم مناسب', 'شفهي', 'مهاره اساسيه']
      },
      {
        label: 'التكامل مع معلم صعوبات التعلم والأسرة',
        cues: ['معلم صعوبات', 'مختص', 'تربيه خاصه', 'غرفه المصادر', 'مصادر', 'مرشد', 'موجه', 'ولي الامر', 'اسره', 'اهله', 'والده', 'البيت', 'تواصل', 'تعاون', 'تنسيق']
      }
    ],
    enrichmentIdeas: ['الاحتواء النفسي والصبر وعدم مقارنته بزملائه', 'تجزئة المهارة وتبسيط الشرح بالوسائل البصرية والمحسوسة', 'التنسيق مع معلم صعوبات التعلم (غرفة المصادر) وأسرة الطالب'],
    specificRecommendations: [
      'الجمع بين الجانب الإنساني (الصبر والتشجيع وبناء الثقة) والجانب العملي (تبسيط المعلومة وتجزئة المهام) يمنحك تقييماً متميزاً.',
      'الإشارة إلى التعاون مع معلم صعوبات التعلم (غرفة المصادر) وأسرة الطالب تُظهر وعيك المهني المتكامل.'
    ],
    modelAnswer: 'أتعامل مع الطالب الذي لديه صعوبات تعلم بصبر واحتواء نفسي كامل يعزز ثقته بنفسه ويحميه من المقارنة أو الإحراج. وتعليمياً أنسق مع معلم صعوبات التعلم لتشخيص احتياجه وبناء خطة مناسبة، فأجزئ المهارة إلى خطوات صغيرة ومبسطة، وأوظف الوسائل البصرية والمحسوسة مع منحه وقتاً كافياً وتشجيع أي تقدم يحرزه بالتواصل مع أسرته.',
    sampleDemoAnswer: 'أحتوي الطالب نفسياً بالصبر والتشجيع المستمر وأجلسه في مكان قريب لمتابعته بهدوء دون مقارنته بزملائه، وأبسط له الدرس بتجزئة المعلومة واستخدام الصور والمحسوسات وأوراق العمل الميسرة ومنحه وقتاً إضافياً، مع التنسيق المستمر مع معلم صعوبات التعلم وولي أمره.'
  }
];

// ==================== محرك النطق الصوتي الاحترافي عالي الدقة ====================
let activeAudioPlayer = null;

const PEDAGOGICAL_TASHKEEL_MAP = [
  ['البيئة الصفية', 'الْبِيئَةِ الصَّفِّيَّةِ'],
  ['موقفاً صعباً', 'مَوْقِفًا صَعْبًا'],
  ['ولي أمر', 'وَلِيِّ أَمْرٍ'],
  ['طريقة تدريس', 'طَرِيقَةِ تَدْرِيسٍ'],
  ['وسائل تعليمية تقنية', 'وَسَائِلَ تَعْلِيمِيَّةً تِقْنِيَّةً'],
  ['صعوبات تعلم', 'صُعُوبَاتُ تَعَلُّمٍ'],
  ['الثقة بالنفس', 'الثِّقَةِ بِالنَّفْسِ'],
  ['الثبات الانفعالي', 'الثَّبَاتِ الانْفِعَالِيِّ'],
  ['الذكاء الاصطناعي', 'الذَّكَاءِ الاصْطِنَاعِيِّ']
];

function autoVocalizeArabicText(rawText = '') {
  let out = rawText;
  for (const [plain, vocalized] of PEDAGOGICAL_TASHKEEL_MAP) {
    out = out.split(plain).join(vocalized);
  }
  return out;
}

function stopAnyCommitteeAudio(onEndCallback) {
  if (activeAudioPlayer) {
    try {
      activeAudioPlayer.pause();
      activeAudioPlayer.currentTime = 0;
    } catch (_) {}
    activeAudioPlayer = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (typeof onEndCallback === 'function') onEndCallback();
}

function isCommitteeSpeaking() {
  const mp3Playing = activeAudioPlayer && !activeAudioPlayer.paused;
  const ttsPlaying = ('speechSynthesis' in window) && window.speechSynthesis.speaking;
  return Boolean(mp3Playing || ttsPlaying);
}

function playSmartCommitteeAudio({ audioUrl, text, vocalizedText, toggleIfPlaying = false, onStart, onEnd }) {
  if (toggleIfPlaying && isCommitteeSpeaking()) {
    stopAnyCommitteeAudio(onEnd);
    return;
  }

  stopAnyCommitteeAudio();

  if (audioUrl) {
    const audio = new Audio(audioUrl);
    activeAudioPlayer = audio;
    audio.onplay = () => { if (onStart) onStart('studio'); };
    audio.onended = () => { activeAudioPlayer = null; if (onEnd) onEnd(); };
    audio.onerror = () => {
      activeAudioPlayer = null;
      speakFallbackNeuralTTS(vocalizedText || text, onStart, onEnd);
    };
    audio.play().catch(() => {
      activeAudioPlayer = null;
      speakFallbackNeuralTTS(vocalizedText || text, onStart, onEnd);
    });
    return;
  }

  speakFallbackNeuralTTS(vocalizedText || text, onStart, onEnd);
}

function speakFallbackNeuralTTS(rawText, onStart, onEnd) {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }
  const prepared = autoVocalizeArabicText(rawText || '');
  const utter = new SpeechSynthesisUtterance(prepared);
  utter.lang = 'ar-SA';
  utter.rate = 0.92;
  utter.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices() || [];
  const arVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('ar'));
  const bestVoice =
    arVoices.find((v) => /natural|neural|hamed|zariyah|salma|shakir/i.test(v.name)) ||
    arVoices.find((v) => v.lang.toLowerCase() === 'ar-sa') ||
    arVoices[0];

  if (bestVoice) utter.voice = bestVoice;

  utter.onstart = () => { if (onStart) onStart('neural-tts'); };
  utter.onend = () => { if (onEnd) onEnd(); };
  utter.onerror = () => { if (onEnd) onEnd(); };
  window.speechSynthesis.speak(utter);
}

// ==================== محرك المعالجة الصرفية والدلالية المرنة للعربية المنطوقة ====================
function normalizeArabic(text = '') {
  return String(text || '')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\u0600-\u06FFa-zA-Z0-9%\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// تجريد الزوائد العربية (الـ، والـ، بالـ، للـ، الضمائر المتصلة، علامات الجمع والمضارعة) للمطابقة الجذرية المرنة
function lightStemArabicWord(word) {
  let w = word;
  if (w.length <= 3) return w;
  const prefixes = ['وال', 'فال', 'بال', 'كال', 'لل', 'ال', 'و', 'ف', 'ب', 'ل', 'س'];
  for (const p of prefixes) {
    if (w.startsWith(p) && w.length - p.length >= 3) {
      w = w.slice(p.length);
      break;
    }
  }
  const suffixes = ['كما', 'هما', 'هم', 'هن', 'كم', 'نا', 'ها', 'ات', 'ون', 'ين', 'ان', 'يه', 'ه', 'ي', 'ك', 'ت'];
  for (const s of suffixes) {
    if (w.endsWith(s) && w.length - s.length >= 3) {
      w = w.slice(0, -s.length);
      break;
    }
  }
  // إزالة حرف المضارعة (يتفاعل -> تفاعل / نفعل -> فعل) إن بقي الجذر 3 أحرف فأكثر
  if (w.length >= 4 && /^[يتنأا]/.test(w)) {
    return [w, w.slice(1)];
  }
  return [w];
}

function buildStemIndex(normalizedText) {
  const words = normalizedText ? normalizedText.split(/\s+/).filter(Boolean) : [];
  const stems = new Set();
  for (const w of words) {
    stems.add(w);
    const extracted = lightStemArabicWord(w);
    if (Array.isArray(extracted)) extracted.forEach((s) => stems.add(s));
    else stems.add(extracted);
  }
  return { words, stems };
}

function flexibleCueMatch(cue, normalizedText, stemSet) {
  const normCue = normalizeArabic(cue);
  if (!normCue) return false;
  if (normalizedText.includes(normCue)) return true;

  const cueParts = normCue.split(/\s+/).filter(Boolean);
  if (cueParts.length === 1) {
    const cStems = lightStemArabicWord(cueParts[0]);
    const list = Array.isArray(cStems) ? cStems : [cStems];
    for (const cs of list) {
      if (cs.length >= 3) {
        if (stemSet.has(cs)) return true;
        for (const token of stemSet) {
          if (token.length >= 3 && (token.includes(cs) || cs.includes(token)) && Math.abs(token.length - cs.length) <= 2) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // عبارة مركبة: يكفي تطابق كلماتها الجذرية في النص
  return cueParts.every((part) => part.length < 3 || flexibleCueMatch(part, normalizedText, stemSet));
}

// معجم موسّع شامل للألفاظ التربوية والتخصصية (جميع التخصصات الدراسية + التعبيرات الميدانية المنطوقة)
const BROAD_EDUCATIONAL_DOMAIN_CUES = [
  // بيئة التعليم والصف والمدرسة
  'طالب', 'طلاب', 'تلميذ', 'متعلم', 'معلم', 'استاذ', 'مدرس', 'فصل', 'صف', 'حصه', 'درس', 'منهج', 'مقرر', 'ماده', 'مدرسه',
  'واجب', 'نشاط', 'تفاعل', 'مشارك', 'انتباه', 'تركيز', 'تحصيل', 'مستوى', 'مهاره', 'مفهوم', 'هدف', 'نواتج',
  // طرائق واستراتيجيات وأساليب شرح (فصحى ومنطوقة)
  'شرح', 'توضيح', 'تبسيط', 'تدرج', 'مجموعات', 'تعاوني', 'اقران', 'حوار', 'نقاش', 'عصف ذهني', 'استقصا', 'مشروع',
  'حل مشكلات', 'تمثيل ادوار', 'قصه', 'لعب', 'مسابق', 'تحدي', 'محطات', 'اركان', 'خرائط', 'بطاقات', 'اوراق عمل', 'تطبيق', 'تدريب',
  // ألفاظ تخصصية لمختلف المواد (رياضيات، علوم، عربي، إسلامية، إنجليزي، حاسب، بدنية، فنية، تربية خاصة)
  'تجرب', 'مختبر', 'معمل', 'مسائل', 'حساب', 'ارقام', 'هندس', 'محسوس', 'قراءه', 'املا', 'كتابه', 'نصوص', 'تلاوه', 'تجويد',
  'قيم', 'وسطيه', 'اعتدال', 'محادثه', 'استماع', 'مفردات', 'برمج', 'روبوت', 'تصميم', 'رسم', 'مهارات حركيه', 'غرفه مصادر',
  'تخاطب', 'توحد', 'فرط حركه', 'تشتت', 'صعوبات', 'موهوب', 'فروق فرديه', 'خطه فرديه', 'خطه علاجيه', 'اثرائي',
  // تقويم وتقنية وتوجيه وأسرة
  'تقويم', 'تقييم', 'اختبار', 'قياس', 'تغذيه راجعه', 'متابع', 'تشخيص', 'تعزيز', 'تحفيز', 'تشجيع', 'تكريم', 'مكافا',
  'ولي امر', 'اسره', 'اهل', 'والد', 'مرشد', 'موجه', 'اداره', 'زملا', 'مشرف',
  'تقني', 'رقمي', 'الكتروني', 'حاسب', 'شاشه', 'سبوره', 'عرض', 'فيديو', 'منصه', 'مدرستي', 'تطبيق', 'برنامج', 'ذكاء اصطناعي'
];

// روابط التفكير المنطقي والتعليل وعرض المواقف (ترفع قيمة الإجابة الشفهية المتماسكة)
const DISCOURSE_REASONING_CUES = [
  'لان', 'بسبب', 'بهدف', 'من اجل', 'حتى', 'لكي', 'عشان', 'بحيث', 'لذلك', 'وبالتالي',
  'فلاحظت', 'فقمت', 'فبادرت', 'فعملت', 'فسويت', 'ثم', 'بعد ذلك', 'بعدها', 'اولا', 'ثانيا', 'اخيرا',
  'على سبيل المثال', 'مثلا', 'موقف', 'نتج', 'ادى', 'اسهم', 'ساعد', 'تحسن', 'الحمد لله'
];

const ARABIC_FILLERS = ['يعني', 'بصراحه', 'والله', 'اممم', 'ااا', 'اههه', 'زي ما تقول', 'مش عارف', 'ما ادري'];

// مؤشرات الثقة بالنفس والمبادرة (فصحى + منطوقة طبيعية)
const CONFIDENCE_POSITIVE_CUES = [
  'بادر', 'قمت', 'صمم', 'طبق', 'نفذ', 'طور', 'حرص', 'استطع', 'نجح', 'وضع', 'اتخذ', 'ابتكر',
  'انشا', 'نظم', 'عالج', 'حللت', 'حليت', 'سويت', 'عملت', 'جهزت', 'رتبت', 'غيرت', 'عدلت',
  'ساعدت', 'شرحت', 'بسطت', 'شجعت', 'حفزت', 'تابعت', 'تواصلت', 'اثمر', 'اسهم', 'حقق', 'بثقه', 'اكيد'
];
const HESITATION_DOUBT_CUES = [
  'ربما', 'لا ادري', 'ما ادري', 'ما اعرف', 'لست متاكد', 'مش متاكد', 'مو متاكد', 'مدري', 'لا اعلم', 'ما عندي فكره'
];

// مؤشرات الثبات الانفعالي والاتزان (فصحى + منطوقة طبيعية)
const EMOTIONAL_STABILITY_CUES = [
  'هدو', 'هادي', 'اتزان', 'متزن', 'ضبط', 'ثبات', 'استمع', 'سمعت', 'اسمع', 'انصت', 'انصات', 'تفهم', 'فهمت',
  'احتوا', 'احتوي', 'حوار', 'تحاورت', 'صبر', 'صبور', 'خصوصي', 'انفراد', 'لحالنا', 'بيني وبينه',
  'احترم', 'احترام', 'تقدير', 'تقبل', 'تروي', 'حكمه', 'دون انفعال', 'ما انفعل', 'دون احراج', 'ما احرج',
  'مصلح', 'امان', 'تشجيع', 'تحفيز', 'تعاون', 'ايجابي', 'ودي', 'رحاب', 'ابتسام', 'رفق', 'لطف'
];
const EMOTIONAL_REACTIVE_CUES = [
  'غضبت', 'عصبت', 'انفعلت', 'اصرخ', 'صرخت', 'اطرد', 'طردته', 'اوبخ', 'وبخته', 'اعاقب فورا',
  'ضربت', 'اهنته', 'احرجه قدام', 'تجاهلته تماما', 'رفضت اسمعه', 'جادلته بحده'
];

function countFillerWords(normalizedText) {
  const found = [];
  let totalCount = 0;
  for (const filler of ARABIC_FILLERS) {
    const normFiller = normalizeArabic(filler);
    const regex = new RegExp(`(^|\\s)${normFiller}(\\s|$)`, 'g');
    const matches = normalizedText.match(regex);
    if (matches && matches.length > 1) {
      totalCount += matches.length - 1;
      found.push({ word: filler, count: matches.length });
    }
  }
  return { totalCount, found };
}

function getPsychometricLevelLabel(score) {
  if (score >= 85) return 'مرتفع ومتميز';
  if (score >= 72) return 'متزن وجيد جداً';
  if (score >= 60) return 'مقبول ومتوازن';
  return 'يحتاج لتدريب وتمكين';
}

// ==================== القياس السيكومتري الصوتي واللغوي المرن ====================
function evaluatePsychometrics({ normalized, stemSet, wordCount, fillers, audioMetrics = {} }) {
  if (wordCount === 0) {
    return {
      overall: 0,
      selfConfidence: 0,
      emotionalStability: 0,
      initiativeResilience: 0,
      vocalPresence: 0,
      diagnosis: 'لم يتم رصد إجابة لتحليل الجوانب السيكومترية.',
      psychometricTips: []
    };
  }

  const durationSec = Number(audioMetrics.durationSec || 0);
  const usedMic = Boolean(audioMetrics.usedMicrophone && durationSec >= 2);
  const wpm = durationSec >= 4 && wordCount > 0 ? Math.round((wordCount / durationSec) * 60) : Number(audioMetrics.wordsPerMinute || 115);
  const speakingRatio = audioMetrics.speakingRatio != null ? Number(audioMetrics.speakingRatio) : 80;
  const volumeConsistency = audioMetrics.volumeConsistency != null ? Number(audioMetrics.volumeConsistency) : 86;
  const pitchStability = audioMetrics.pitchStability != null ? Number(audioMetrics.pitchStability) : 86;
  const longPauses = Number(audioMetrics.longPauseCount || 0);
  const responseLatencyMs = Number(audioMetrics.responseLatencyMs || 1400);

  const confHits = CONFIDENCE_POSITIVE_CUES.filter((c) => flexibleCueMatch(c, normalized, stemSet)).length;
  const doubtHits = HESITATION_DOUBT_CUES.filter((c) => normalized.includes(normalizeArabic(c))).length;
  const calmHits = EMOTIONAL_STABILITY_CUES.filter((c) => flexibleCueMatch(c, normalized, stemSet)).length;
  const reactiveHits = EMOTIONAL_REACTIVE_CUES.filter((c) => normalized.includes(normalizeArabic(c))).length;
  const reasoningHits = DISCOURSE_REASONING_CUES.filter((c) => flexibleCueMatch(c, normalized, stemSet)).length;

  // 1) مؤشر الثقة بالنفس
  let acousticConfidence = 82;
  if (usedMic) {
    const latencyBonus = responseLatencyMs <= 2800 ? 7 : (responseLatencyMs > 5500 ? -6 : 0);
    const pausePenalty = Math.min(15, longPauses * 5);
    const flowScore = speakingRatio >= 58 ? 89 : (speakingRatio >= 42 ? 78 : 65);
    acousticConfidence = Math.max(50, Math.min(98, Math.round(volumeConsistency * 0.5 + flowScore * 0.5 + latencyBonus - pausePenalty)));
  }

  const elaborationScore = wordCount >= 32 ? 92 : (wordCount >= 16 ? 80 : 60);
  const linguisticConfidence = Math.max(
    45,
    Math.min(98, Math.round(elaborationScore * 0.45 + Math.min(54, 42 + confHits * 6 + reasoningHits * 4) - doubtHits * 14 - fillers.totalCount * 3))
  );

  let selfConfidence = Math.round(acousticConfidence * (usedMic ? 0.52 : 0.25) + linguisticConfidence * (usedMic ? 0.48 : 0.75));
  if (wordCount < 7) selfConfidence = Math.min(selfConfidence, 50);
  selfConfidence = Math.max(35, Math.min(98, selfConfidence));

  // 2) مؤشر الثبات الانفعالي
  let tempoComposure = 85;
  if (usedMic) {
    if (wpm >= 90 && wpm <= 150) tempoComposure = 93;
    else if (wpm > 172) tempoComposure = 66;
    else if (wpm < 68) tempoComposure = 70;
    else tempoComposure = 82;
  }

  const acousticComposure = usedMic
    ? Math.max(50, Math.min(98, Math.round(tempoComposure * 0.45 + pitchStability * 0.30 + volumeConsistency * 0.25 - Math.min(10, longPauses * 3.5))))
    : 82;

  const linguisticComposure = Math.max(
    35,
    Math.min(98, Math.round(74 + Math.min(24, calmHits * 5.5 + reasoningHits * 2) - reactiveHits * 26 - fillers.totalCount * 2.5))
  );

  let emotionalStability = Math.round(acousticComposure * (usedMic ? 0.50 : 0.25) + linguisticComposure * (usedMic ? 0.50 : 0.75));
  if (wordCount < 7) emotionalStability = Math.min(emotionalStability, 54);
  emotionalStability = Math.max(35, Math.min(98, emotionalStability));

  // 3) المبادرة والمرونة وحل المشكلات
  let initiativeResilience = Math.round(62 + Math.min(24, (confHits + reasoningHits) * 4.5) + (wordCount >= 22 ? 10 : 3) - doubtHits * 8);
  initiativeResilience = Math.max(38, Math.min(98, initiativeResilience));

  // 4) الحضور والطلاقة الصوتية
  let vocalPresence = Math.round(
    (usedMic ? tempoComposure : 80) * 0.45 +
    volumeConsistency * 0.30 +
    Math.min(96, speakingRatio + 15) * 0.25 -
    Math.min(18, fillers.totalCount * 4 + longPauses * 3.5)
  );
  if (wordCount < 7) vocalPresence = Math.min(vocalPresence, 50);
  vocalPresence = Math.max(35, Math.min(98, vocalPresence));

  const overall = Math.round(
    selfConfidence * 0.35 +
    emotionalStability * 0.35 +
    initiativeResilience * 0.15 +
    vocalPresence * 0.15
  );

  const psychometricTips = [];
  if (selfConfidence < 76) {
    psychometricTips.push('لتعزيز (الثقة بالنفس): ابدأ حديثك بنبرة صوتية واضحة ومباشرة واعرض تجربتك بثقة دون عبارات التردد.');
  }
  if (emotionalStability < 76) {
    if (reactiveHits > 0) {
      psychometricTips.push('لتعزيز (الثبات الانفعالي): ركّز على لغة الاحتواء والهدوء والإنصات وتجنب أي مفردات توحي بالانفعال أو العقاب.');
    } else if (usedMic && wpm > 168) {
      psychometricTips.push(`لتعزيز (الثبات الانفعالي): تمهّل قليلاً في سرعة إلقائك (${wpm} كلمة/دقيقة) ليظهر هدوؤك واتزانك بوضوح أكبر.`);
    } else {
      psychometricTips.push('لتعزيز (الثبات الانفعالي): أبرز هدوءك وتفهمك للطرف الآخر قبل الانتقال إلى خطوات الحل.');
    }
  }
  if (usedMic && longPauses >= 2) {
    psychometricTips.push('حاول تقليل فترات التوقف الطويلة أثناء الكلام عبر ترتيب فكرتك في نقاط متسلسلة وبسيطة.');
  }

  const diagnosis =
    `الثقة بالنفس: ${selfConfidence}% (${getPsychometricLevelLabel(selfConfidence)}) | ` +
    `الثبات الانفعالي: ${emotionalStability}% (${getPsychometricLevelLabel(emotionalStability)}). ` +
    (emotionalStability >= 78 && selfConfidence >= 78
      ? 'تُظهر إجابتك ونبرتك حضوراً مطمئناً واتزاناً انفعالياً ممتازاً.'
      : 'أداؤك السيكومتري قابل للارتفاع السريع بمزيد من الهدوء والاسترسال الواثق.');

  return {
    overall,
    selfConfidence,
    emotionalStability,
    initiativeResilience,
    vocalPresence,
    diagnosis,
    psychometricTips
  };
}

// ==================== المحلل الدلالي المرن للإجابات المنطوقة (يدعم كافة الصياغات والتخصصات) ====================
function analyzeTeacherAnswerLocal({ question, transcript = '', audioMetrics = {} }) {
  const cleanTranscript = (transcript || '').trim();
  const normalized = normalizeArabic(cleanTranscript);
  const { words, stems: stemSet } = buildStemIndex(normalized);
  const wordCount = words.length;

  // كشف ما إذا قام المختبر بتكرار نص السؤال فقط دون إجابة حقيقية
  const normQ = normalizeArabic(question.text || '');
  const isJustRepeatingQuestion = wordCount > 0 && wordCount <= 14 && normQ.includes(normalized);

  // 1) تقييم المحاور المعنوية المرنة للسؤال (Semantic Themes) + التقاط الألفاظ الفعلية التي نطقها المختبر!
  const themes = Array.isArray(question.semanticThemes) ? question.semanticThemes : [];
  const coveredThemes = [];
  const missingThemes = [];
  const recognizedSpokenTerms = new Set();

  themes.forEach((theme) => {
    const matchedCuesInTheme = (theme.cues || []).filter((cue) => flexibleCueMatch(cue, normalized, stemSet));
    if (matchedCuesInTheme.length > 0) {
      coveredThemes.push(theme.label);
      matchedCuesInTheme.slice(0, 2).forEach((c) => recognizedSpokenTerms.add(c));
    } else {
      missingThemes.push(theme.label);
    }
  });

  // 2) رصد الثراء التربوي والتخصصي العام من مختلف المواد الدراسية والأساليب الميدانية
  const domainMatches = BROAD_EDUCATIONAL_DOMAIN_CUES.filter((cue) => flexibleCueMatch(cue, normalized, stemSet));
  domainMatches.slice(0, 6).forEach((d) => recognizedSpokenTerms.add(d));

  // 3) رصد الترابط المنطقي والسببي وعرض التجربة (التعليل، الترتيب، الفعل، الأثر)
  const reasoningMatches = DISCOURSE_REASONING_CUES.filter((cue) => flexibleCueMatch(cue, normalized, stemSet));
  const actionMatches = CONFIDENCE_POSITIVE_CUES.filter((cue) => flexibleCueMatch(cue, normalized, stemSet));
  const reactiveHits = EMOTIONAL_REACTIVE_CUES.filter((c) => normalized.includes(normalizeArabic(c))).length;

  // في حال كان السؤال معدّلاً يدوياً من المدير بدون semanticThemes نستخدم keywords بمرونة جذرية
  if (themes.length === 0 && Array.isArray(question.keywords)) {
    question.keywords.forEach((kw) => {
      if (flexibleCueMatch(kw, normalized, stemSet)) {
        coveredThemes.push(kw);
        recognizedSpokenTerms.add(kw);
      } else {
        missingThemes.push(kw);
      }
    });
  }

  // حساب مرن وعادل لدرجة العمق التربوي والفهم الدلالي (لا يحصر المختبر في ألفاظ بعينها!)
  let pedagogicalScore = 0;
  let practiceScore = 0;

  if (wordCount === 0 || isJustRepeatingQuestion) {
    pedagogicalScore = isJustRepeatingQuestion ? 25 : 0;
    practiceScore = isJustRepeatingQuestion ? 25 : 0;
  } else {
    // كل محور معنوي يغطيه المختبر بأي صياغة أو لهجة مهنية يمنحه ثقلاً مجزياً، مع مكافأة المفردات التربوية/التخصصية العامة
    const themeRatio = themes.length > 0 ? Math.min(1, coveredThemes.length / Math.max(2, themes.length - 1)) : 0.75;
    const domainRichness = Math.min(1, (domainMatches.length + reasoningMatches.length) / 5);

    let lengthFactor = 0.55;
    if (wordCount >= 32) lengthFactor = 1.0;
    else if (wordCount >= 18) lengthFactor = 0.90;
    else if (wordCount >= 10) lengthFactor = 0.76;

    // إذا تحدث المختبر في صلب الموضوع التربوي/التخصصي بجمل مترابطة يحصل على تقييم منصف ومرتفع حتى لو عبر بألفاظه الخاصة
    const semanticCore = Math.max(themeRatio * 94, domainRichness * 88);
    pedagogicalScore = Math.round((56 + semanticCore * 0.42) * lengthFactor + Math.min(8, domainMatches.length * 1.5) - reactiveHits * 18);

    // التطبيق العملي يقيس وجود تجربة/إجراء/تفاعل مع الواقع المدرسي بأي لفظ فعلي أو سياقي
    const practicalSignals = actionMatches.length + reasoningMatches.length + Math.min(4, domainMatches.length);
    practiceScore = Math.round((58 + Math.min(38, practicalSignals * 5.2)) * lengthFactor - reactiveHits * 18);

    if (wordCount < 6) {
      pedagogicalScore = Math.min(pedagogicalScore, 42);
      practiceScore = Math.min(practiceScore, 42);
    }
  }

  pedagogicalScore = Math.max(0, Math.min(98, pedagogicalScore));
  practiceScore = Math.max(0, Math.min(98, practiceScore));

  const fillers = countFillerWords(normalized);
  const psychometrics = evaluatePsychometrics({ normalized, stemSet, wordCount, fillers, audioMetrics });

  const vocalScore = psychometrics.vocalPresence;
  const valuesScore = Math.round(psychometrics.emotionalStability * 0.55 + psychometrics.selfConfidence * 0.45);

  // الدرجة الكلية المتوازنة: 55% المضمون الدلالي والعملي المرن + 45% المؤشرات السيكومترية والصوتية
  const overallScore = wordCount === 0
    ? 0
    : Math.round(
        pedagogicalScore * 0.30 +
        practiceScore * 0.25 +
        psychometrics.selfConfidence * 0.18 +
        psychometrics.emotionalStability * 0.18 +
        vocalScore * 0.09
      );

  const strengths = [];
  if (coveredThemes.length >= 2) {
    strengths.push(`تغطية موفقة لمحاور الإجابة الأساسية بأسلوبك الخاص (${coveredThemes.slice(0, 3).join('، ')}).`);
  } else if (domainMatches.length >= 2) {
    strengths.push('حضور واضح للخبرة التربوية والميدانية المرتبطة بموضوع السؤال.');
  }
  if (psychometrics.selfConfidence >= 78) {
    strengths.push(`ثقة واضحة بالنفس (${psychometrics.selfConfidence}%) انعكست في أسلوب طرح الفكرة والمبادرة.`);
  }
  if (psychometrics.emotionalStability >= 78) {
    strengths.push(`ثبات انفعالي متميز (${psychometrics.emotionalStability}%) وهدوء مناسب لبيئة العمل التربوي.`);
  }
  if (actionMatches.length >= 2 || reasoningMatches.length >= 2) {
    strengths.push('تسلسل منطقي وعرض عملي يربط بين الإجراء المتخذ والفائدة المتحققة للطالب.');
  }
  if (strengths.length === 0 && wordCount > 0) {
    strengths.push('تفاعل مباشر مع فكرة السؤال يمثل أساساً جيداً يمكن البناء عليه بمثال تطبيقي.');
  }

  const recommendations = [...psychometrics.psychometricTips];
  if (wordCount < 18) {
    recommendations.push('تحدث باسترسال أكبر لمدة ٣٠–٦٠ ثانية واذكر مثالاً تطبيقياً من واقع فصلك أو تخصصك لإبراز خبرتك.');
  }
  if (missingThemes.length > 0 && pedagogicalScore < 85) {
    recommendations.push(`لإثراء إجابتك أكثر، يمكنك التطرق بأسلوبك إلى: (${missingThemes.slice(0, 2).join('، ')}).`);
  }
  if (Array.isArray(question.specificRecommendations) && overallScore < 86) {
    for (const tip of question.specificRecommendations) {
      if (recommendations.length < 4) recommendations.push(tip);
    }
  }
  if (fillers.totalCount > 1) {
    const fList = fillers.found.map((f) => `"${f.word}"`).join('، ');
    recommendations.push(`تقليل تكرار اللزمات العفوية (${fList}) يمنح حديثك سلاسة وثقة أعلى.`);
  }
  if (recommendations.length === 0 && wordCount > 0) {
    recommendations.push('إجابة متميزة ومتكاملة المعنى؛ استمر بنفس التلقائية والثقة والاتزان في بقية الأسئلة.');
  }

  let verdictLabel = 'غير مجتاز بعد — يحتاج لتوضيح الفكرة بمثال عملي';
  if (overallScore >= 85) verdictLabel = 'مجتاز بتميز — إجابة وافية وثبات انفعالي ممتاز';
  else if (overallScore >= 75) verdictLabel = 'مجتاز بجدارة — مضمون مقنع وحضور واثق';
  else if (overallScore >= 60) verdictLabel = 'مجتاز — إجابة مقبولة مع فرصة لإثراء التفاصيل';

  const summary = `${verdictLabel} (${overallScore}/100) — الثقة بالنفس: ${psychometrics.selfConfidence}% | الثبات الانفعالي: ${psychometrics.emotionalStability}%.`;

  // عرض المحاور التي غطاها فعلياً بدلاً من حصره في كلمات حرفية ضيقة
  const matchedDisplay = coveredThemes.length > 0
    ? coveredThemes
    : Array.from(recognizedSpokenTerms).slice(0, 5);
  const missingDisplay = missingThemes.length > 0
    ? missingThemes.slice(0, 3)
    : (overallScore < 85 ? (question.enrichmentIdeas || []).slice(0, 2) : []);

  return {
    engine: 'builtin-pedagogical-ai',
    overallScore,
    verdictLabel,
    summary,
    scores: {
      pedagogicalDepth: pedagogicalScore,
      classroomPractice: practiceScore,
      vocalDelivery: vocalScore,
      professionalValues: valuesScore
    },
    psychometrics,
    keywords: {
      matched: matchedDisplay,
      missing: missingDisplay
    },
    strengths: strengths.slice(0, 4),
    recommendations: recommendations.slice(0, 4),
    modelAnswer: question.modelAnswer || ''
  };
}

async function analyzeViaCloudDirect({ provider, apiKey, question, transcript, audioMetrics, audioBlob, audioBase64, mimeType, fallbackResult }) {
  let effectiveTranscript = transcript;

  if (provider === 'groq' && !effectiveTranscript && audioBlob) {
    const fd = new FormData();
    fd.append('file', audioBlob, 'answer.webm');
    fd.append('model', 'whisper-large-v3');
    fd.append('language', 'ar');
    const sttRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: fd
    });
    if (sttRes.ok) {
      const sttJson = await sttRes.json();
      effectiveTranscript = (sttJson.text || '').trim();
    }
  }

  const prompt = `أنت خبير تقييم المقابلات الشخصية بالذكاء الاصطناعي للمعلمين ومقيّم سيكومتري معتمد.
مهم جداً: قيّم الإجابة بمرونة دلالية واسعة بناءً على المعنى التربوي والفكرة والسياق والخبرات التخصصية بغض النظر عن اختلاف الألفاظ أو استخدام اللغة البيضاء المنطوقة العفوية، ولا تحصر التقييم في مصطلحات حرفية ضيقة.
السؤال: "${question.text}"
إجابة المختبر المنطوقة: "${effectiveTranscript || '(استخرجها من الملف الصوتي المرفق)'}"
مدة الحديث: ${Math.round(audioMetrics.durationSec || 0)} ثانية، سرعة الإلقاء: ${audioMetrics.wordsPerMinute || 115} كلمة/دقيقة.

أعد JSON فقط بهذا الشكل:
{
  "detectedTranscript": "النص المفرغ للإجابة",
  "overallScore": 86,
  "verdictLabel": "مجتاز بجدارة — حضور واثق وإجابة مقنعة",
  "summary": "ملخص تقييمي دقيق للجانب التربوي والسيكومتري",
  "scores": { "pedagogicalDepth": 86, "classroomPractice": 85, "vocalDelivery": 84, "professionalValues": 88 },
  "psychometrics": {
    "overall": 86,
    "selfConfidence": 87,
    "emotionalStability": 88,
    "initiativeResilience": 85,
    "vocalPresence": 84,
    "diagnosis": "تحليل موجز لمستوى الثقة بالنفس والثبات الانفعالي لدى المختبر"
  },
  "keywords": { "matched": ["محور معنوي غطاه المختبر"], "missing": ["فكرة إثرائية اختيارية"] },
  "strengths": ["نقطة قوة 1", "نقطة قوة 2"],
  "recommendations": ["توصية 1", "توصية 2"],
  "modelAnswer": "إجابة نموذجية استرشادية"
}`;

  const safeNum = (v, d) => (Number.isFinite(Number(v)) ? Math.max(0, Math.min(100, Math.round(Number(v)))) : d);

  const mergeParsed = (parsed, engineLabel) => {
    const fbPsy = fallbackResult.psychometrics;
    const selfConf = safeNum(parsed.psychometrics?.selfConfidence, fbPsy.selfConfidence);
    const emoStab = safeNum(parsed.psychometrics?.emotionalStability, fbPsy.emotionalStability);
    const initRes = safeNum(parsed.psychometrics?.initiativeResilience, fbPsy.initiativeResilience);
    const vocPres = safeNum(parsed.psychometrics?.vocalPresence, fbPsy.vocalPresence);
    return {
      engine: engineLabel,
      detectedTranscript: parsed.detectedTranscript || effectiveTranscript,
      overallScore: safeNum(parsed.overallScore, fallbackResult.overallScore),
      verdictLabel: parsed.verdictLabel || fallbackResult.verdictLabel,
      summary: parsed.summary || fallbackResult.summary,
      scores: {
        pedagogicalDepth: safeNum(parsed.scores?.pedagogicalDepth, fallbackResult.scores.pedagogicalDepth),
        classroomPractice: safeNum(parsed.scores?.classroomPractice, fallbackResult.scores.classroomPractice),
        vocalDelivery: safeNum(parsed.scores?.vocalDelivery, fallbackResult.scores.vocalDelivery),
        professionalValues: safeNum(parsed.scores?.professionalValues, fallbackResult.scores.professionalValues)
      },
      psychometrics: {
        overall: safeNum(parsed.psychometrics?.overall, Math.round((selfConf + emoStab) / 2)),
        selfConfidence: selfConf,
        emotionalStability: emoStab,
        initiativeResilience: initRes,
        vocalPresence: vocPres,
        diagnosis: parsed.psychometrics?.diagnosis || fbPsy.diagnosis
      },
      keywords: {
        matched: Array.isArray(parsed.keywords?.matched) ? parsed.keywords.matched : fallbackResult.keywords.matched,
        missing: Array.isArray(parsed.keywords?.missing) ? parsed.keywords.missing : fallbackResult.keywords.missing
      },
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length ? parsed.strengths : fallbackResult.strengths,
      recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length ? parsed.recommendations : fallbackResult.recommendations,
      modelAnswer: parsed.modelAnswer || fallbackResult.modelAnswer
    };
  };

  if (provider === 'gemini') {
    const parts = [{ text: prompt }];
    if (audioBase64 && audioBase64.length < 4_500_000) {
      const cleanB64 = audioBase64.includes('base64,') ? audioBase64.split('base64,')[1] : audioBase64;
      parts.push({ inline_data: { mime_type: (mimeType || 'audio/webm').split(';')[0], data: cleanB64 } });
    }
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.3, responseMimeType: 'application/json' }
      })
    });
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data = await res.json();
    const raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}').replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    return mergeParsed(JSON.parse(raw), 'Gemini 2.5 Flash');
  }

  const endpoint = provider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
  const model = provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!res.ok) throw new Error(`${provider} HTTP ${res.status}`);
  const data = await res.json();
  return mergeParsed(JSON.parse(data?.choices?.[0]?.message?.content || '{}'), `${provider.toUpperCase()} (${model})`);
}

function buildFinalTeacherReportLocal(trainee, evaluations, totalQ = 5) {
  const count = evaluations.length;
  const avg = (fn) => Math.round(evaluations.reduce((s, item) => s + fn(item), 0) / count);
  const overallScore = avg((e) => e.analysis.overallScore);
  const pedagogicalAvg = avg((e) => e.analysis.scores.pedagogicalDepth);
  const practiceAvg = avg((e) => e.analysis.scores.classroomPractice);
  const vocalAvg = avg((e) => e.analysis.scores.vocalDelivery);
  const selfConfidenceAvg = avg((e) => e.analysis.psychometrics?.selfConfidence ?? 80);
  const emotionalStabilityAvg = avg((e) => e.analysis.psychometrics?.emotionalStability ?? 82);
  const initiativeAvg = avg((e) => e.analysis.psychometrics?.initiativeResilience ?? 80);
  const psychometricOverall = Math.round(
    selfConfidenceAvg * 0.38 +
    emotionalStabilityAvg * 0.38 +
    initiativeAvg * 0.12 +
    vocalAvg * 0.12
  );

  let admissionStatus = 'غير مجتاز بعد — يوصى بتعزيز الإعداد التربوي والسيكومتري';
  if (overallScore >= 85) {
    admissionStatus = 'مجتاز بتميز — كفاية تربوية وثبات انفعالي عالٍ';
  } else if (overallScore >= 75) {
    admissionStatus = 'مجتاز بجدارة — جاهزية عالية للمقابلة الشخصية';
  } else if (overallScore >= 60) {
    admissionStatus = psychometricOverall >= 80
      ? 'مجتاز — جاهزية سيكومترية متميزة مع التوصية بإثراء الأمثلة التطبيقية'
      : 'مجتاز — أداء مقبول مع تطبيق التوصيات التطويرية';
  } else if (psychometricOverall >= 75) {
    admissionStatus = 'غير مجتاز في المضمون التربوي — ثقتك وثباتك ممتازان ويحتاج المحتوى لتفصيل أكبر';
  }

  const finalRecommendations = [];
  if (selfConfidenceAvg < 80) {
    finalRecommendations.push({
      title: `تعزيز مؤشر الثقة بالنفس (${selfConfidenceAvg}%)`,
      detail: 'ابدأ كل إجابة بنبرة صوت واضحة ومستقرة دون تردد، واعرض مواقفك بصيغة المبادرة الفعلية التي قمت بها مع طلابك.'
    });
  }
  if (emotionalStabilityAvg < 80) {
    finalRecommendations.push({
      title: `رفع مؤشر الثبات الانفعالي وضبط النفس (${emotionalStabilityAvg}%)`,
      detail: 'حافظ على إيقاع حديث هادئ ومتزن في أسئلة المواقف الضاغطة، وأبرز دائماً الإنصات والاحتواء التربوي.'
    });
  }
  if (practiceAvg < 82 || pedagogicalAvg < 82) {
    finalRecommendations.push({
      title: 'إثراء الإجابة بمثال واقعي من تخصصك الدراسي',
      detail: 'عبّر بأسلوبك الطبيعي والتلقائي عن موقف فعلي مررت به في مادتك، مع ذكر (ماذا لاحظت ← ماذا فعلت ← كيف استفاد الطلاب).'
    });
  }
  finalRecommendations.push({
    title: 'استثمار التلقائية والاتزان الصوتي',
    detail: 'التحدث بعفوية مهنية واضحة وسرعة معتدلة (105–135 كلمة/دقيقة) دون وقفات صمت طويلة يمنحك أعلى التقييمات التربوية والسيكومترية.'
  });

  return {
    id: `res_${Date.now()}`,
    traineeName: trainee?.fullName || 'مختبر',
    username: trainee?.username || 'guest',
    cohort: trainee?.cohort || 'عام',
    completedAt: new Date().toISOString(),
    questionsAnswered: count,
    totalQuestions: totalQ,
    overallScore,
    psychometricScore: psychometricOverall,
    admissionStatus,
    radarMetrics: {
      pedagogicalDepth: pedagogicalAvg,
      classroomPractice: practiceAvg,
      selfConfidence: selfConfidenceAvg,
      emotionalStability: emotionalStabilityAvg,
      vocalDelivery: vocalAvg,
      initiativeResilience: initiativeAvg,
      psychometricOverall
    },
    executiveSummary: `أتم المختبر (${trainee?.fullName || 'المعلم'}) ${count} من أصل ${totalQ} أسئلة بمتوسط عام (${overallScore}/100)، وبلغت درجة الجاهزية السيكومترية (${psychometricOverall}/100) [الثقة بالنفس: ${selfConfidenceAvg}% | الثبات الانفعالي: ${emotionalStabilityAvg}%].`,
    finalRecommendations: finalRecommendations.slice(0, 4)
  };
}
