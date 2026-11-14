/* ==========================================================================
   FIXORA — BILINGUAL TRANSLATION ENGINE (ARABIC / ENGLISH)
   ========================================================================== */
(function (global) {
    'use strict';

    const UI_STRINGS = {
        ar: {
            'meta.title': 'Fixora | سوق الخدمات المنزلية الاحترافية الموثوقة',
            'meta.description': 'Fixora - المنصة الأولى الموثوقة لخدمات الصيانة المنزلية في مصر. اعثر على أفضل كهربائي، سباك، نجار، وفني تكييف بالقرب منك بضمان الجودة.',

            'announcement.text_html': '🎉 خصم 20% حصري على أول طلب صيانة! استخدم الكود <strong class="promo-code">FIX20</strong>',
            'announcement.btn': 'احصل على الخصم',
            'announcement.close_aria': 'إغلاق التنبيه',

            'nav.home': 'الرئيسية',
            'nav.services': 'الخدمات',
            'nav.calculator': 'حاسبة الأسعار',
            'nav.providers': 'الفنيون',
            'nav.how_it_works': 'كيف يعمل',
            'nav.faq': 'الأسئلة الشائعة',
            'nav.reviews': 'آراء العملاء',
            'nav.login': 'تسجيل الدخول',
            'nav.register': 'كن مقدم خدمة',
            'nav.my_profile': 'ملفي الشخصي',
            'nav.logout': 'تسجيل الخروج',
            'nav.lang_btn': 'EN',
            'nav.lang_title': 'Switch to English',
            'nav.theme_title_dark': 'الوضع النهاري',
            'nav.theme_title_light': 'الوضع الليلي',

            'hero.badge': 'المنصة الأولى المعتمدة لخدمات المنازل في مصر',
            'hero.title_html': 'كل خدمة تحتاجها...<br><span class="gradient-text">في مكان واحد.</span>',
            'hero.subtitle': 'ابحث عن أفضل كهربائي أو سباك أو نجار أو فني تكييف بالقرب منك. جميع الفنيين موثقون بالهوية الوطنية ويتم تقييمهم باستمرار لضمان الأمان والجودة.',
            'hero.search_placeholder': 'ابحث عن خدمة (كهرباء، سباكة، تكييف...)',
            'hero.all_cities': 'جميع المحافظات',
            'hero.search_btn': 'ابحث الآن',
            'hero.request_btn': 'اطلب خدمة الآن',
            'hero.join_btn': 'سجل كمقدم خدمة',
            'hero.stat_clients': 'عميل سعيد',
            'hero.stat_pros': 'فني محترف',
            'hero.stat_rating': 'تقييم عام',
            'hero.stat_orders': 'طلب مكتمل',

            'trust.t1_title': 'ضمان صيانة 30 يوماً',
            'trust.t1_desc': 'إعادة المعاينة والإصلاح مجاناً عند حدوث المشكلة',
            'trust.t2_title': 'فحص جنائي موثق',
            'trust.t2_desc': 'فحص سجلات الهوية الوطنية والجنائية لكل فني',
            'trust.t3_title': 'أسعار شفافة ومعلنة',
            'trust.t3_desc': 'تكلفة زيارة محددة مسبقاً بدون أي رسوم خفية',
            'trust.t4_title': 'دعم طوارئ 24/7',
            'trust.t4_desc': 'فريق دعم فني متوافر لحل أي استفسار فوراً',

            'services.badge': 'الخدمات المتاحة',
            'services.title': 'الخدمات الأكثر طلباً',
            'services.subtitle': 'اختر الخدمة التي تحتاجها وسنوصلك بأفضل مقدم خدمة معتمد في منطقتك.',
            'services.filter_all': 'الكل',
            'services.filter_elec': 'كهرباء',
            'services.filter_plumb': 'سباكة',
            'services.filter_ac': 'تكييف',
            'services.filter_finish': 'تشطيبات ونجارة',
            'services.filter_clean': 'تنظيف وأجهزة',
            'services.request_now': 'اطلب الخدمة الآن',
            'services.no_results': 'لم نجد خدمات تطابق بحثك حالياً. يمكنك طلب خدمة مخصصة بالضغط على "اطلب خدمة".',

            'calc.badge': 'حاسبة التكلفة الفورية',
            'calc.title': 'احسب تكلفة خدمتك التقديرية',
            'calc.subtitle': 'حدد نوع الخدمة وحجم الأعطال لمعرفة متوسط سعر المعاينة والكشف فوراً بدون أي مفاجآت.',
            'calc.label_service': 'اختر نوع الخدمة المطلوبة',
            'calc.label_scope': 'حجم العمل أو درجة العطل',
            'calc.scope_1': 'عطل أو صيانة بسيطة (كشف سريع)',
            'calc.scope_2': 'صيانة متوسطة (تركيبات وتأسيس فرعي)',
            'calc.scope_3': 'عمل كامل أو تأسيس متكامل',
            'calc.label_urgency': 'سرعة الاستجابة المطلوبة',
            'calc.urgency_0': 'حجز عادي (في الموعد المفضل)',
            'calc.urgency_100': 'طوارئ فورية (وصول خلال 30 دقيقة +100ج)',
            'calc.result_badge': 'السعر التقديري الشامل',
            'calc.currency': 'جنيه مصري',
            'calc.note': 'يشمل الفحص الأولي وضمان 30 يوماً على الخدمة',
            'calc.book_btn': 'طلب الخدمة بهذا السعر الآن',

            'why.badge': 'لماذا نحن؟',
            'why.title': 'لماذا يختارنا آلاف العملاء؟',
            'why.c1_title': 'فنيون موثقون رسمياً',
            'why.c1_desc': 'جميع مقدمي الخدمات يتم التحقق من صحيفتهم الجنائية وبيانات الهوية الوطنية قبل تفعيل حسابهم.',
            'why.c2_title': 'تقييمات شفافة وحقيقية',
            'why.c2_desc': 'كل عملية خدمة يتم تقييمها مباشرة من العملاء الحقيقيين لضمان استمرارية أداء الجودة.',
            'why.c3_title': 'وصول في الوقت المحدد',
            'why.c3_desc': 'اعثر على أقرب مقدم خدمة موثق خلال دقائق مع التزام كامل بالمواعيد المحددة بكفاءة.',
            'why.c4_title': 'ضمان الجودة وحماية العميل',
            'why.c4_desc': 'ضمان شامل على جميع الأعمال المنفذة ونتابع جودة الخدمة حتى وصولك للرضا التام.',

            'stats.clients': 'عميل سعيد',
            'stats.pros': 'مقدم خدمة موثق',
            'stats.orders': 'طلب صيانة مكتمل',
            'stats.satisfaction': 'نسبة رضا العملاء',

            'providers.badge': 'أفضل الفنيين المعتمدين',
            'providers.title': 'مقدمو الخدمة الأعلى تقييماً',
            'providers.subtitle': 'اختر الفني المناسب لك حسب التخصص والتقييمات السابقة والمحافظة التي تتواجد بها. يمكنك التمرير أفقياً لرؤية جميع الفنيين.',
            'providers.filter_all': 'جميع الفنيين',
            'providers.filter_online': 'المتاحين الآن 🟢',
            'providers.status_online': 'متاح الآن 🟢',
            'providers.status_busy': 'مشغول حالياً 🔴',
            'providers.price_unit': 'جنيه/زيارة',
            'providers.reviews_word': 'تقييم',
            'providers.view_profile': 'عرض الملف كامل',
            'providers.book_now': 'احجز الآن',
            'providers.view_more_title': 'عرض المزيد من الفنيين',
            'providers.view_more_desc': 'تصفح أكثر من 650+ فني موثق في جميع المحافظات والتخصصات',
            'providers.view_more_btn': 'طلب فني مخصص',

            'how.badge': 'كيف تعمل المنصة؟',
            'how.title': 'احصل على الخدمة في أربع خطوات',
            'how.s1_title': 'اختر الخدمة',
            'how.s1_desc': 'حدد نوع الخدمة المطلوبة من القائمة أو عبر محرك البحث السريع.',
            'how.s2_title': 'اختر الفني الموثق',
            'how.s2_desc': 'قارن بين الفنيين حسب التقييمات وخبرتهم وأسعارهم الشفافة.',
            'how.s3_title': 'حدد الموعد والعنوان',
            'how.s3_desc': 'اختر الوقت المناسب لك وسيصلك الفني المعتمد في الموعد تماماً.',
            'how.s4_title': 'استمتع بالخدمة والضمان',
            'how.s4_desc': 'يتم تنفيذ الخدمة بدقة عالية مع الحصول على فاتورة وضمان معتمد.',

            'faq.badge': 'الأسئلة الشائعة',
            'faq.title': 'كل ما تحتاج معرفته عن منصة Fixora',
            'faq.subtitle': 'إجابات شفافة ومباشرة على أكثر الاستفسارات شيوعاً بين عملائنا.',
            'faq.q1': 'كيف تضمن منصة Fixora جودة وأمان الفنيين؟',
            'faq.a1': 'جميع مقدمي الخدمات يخضعون لفحص دقيق للصحيفة الجنائية (الفيش والتشبيه) والتحقق من الهوية الوطنية والمستندات الرسمية، بالإضافة لتقييم المهارات واختبارات الأداء الفعلي قبل الانضمام للمنصة.',
            'faq.q2': 'ما هي سياسة الضمان عند حدوث مشكلة بعد الخدمة؟',
            'faq.a2': 'تقدم Fixora ضماناً شاملاً مجانياً لمدة 30 يوماً على جميع أعمال الصيانة والتركيبات. في حال تكرار المشكلة أو عدم جودة التنفيذ، نرسل فني معاينة مجانية لإصلاح العطل دون تكلفة إضافية.',
            'faq.q3': 'كيف يتم تحديد تكلفة الزيارة ودفع الفاتورة؟',
            'faq.a3': 'سعر الكشف والزيارة محدد مسبقاً ومعلن بوضوح في بطاقات الفنيين وحاسبة الأسعار التقديرية. يقوم الفني بفحص العطل وإعطائك الفاتورة التفصيلية لقطع الغيار والمصنعية قبل البدء، والدفع يكون بعد إتمام الخدمة فقط.',
            'faq.q4': 'هل توجد خدمة طوارئ سريعة للمشاكل المفاجئة؟',
            'faq.a4': 'نعم، توفر المنصة خدمة "الفني الفوري" للأعطال الكهربائية الخطيرة وإصلاح تسريبات المياه وفتح الأقفال على مدار 24 ساعة، حيث يصلك الفني المتاح في منطقتك خلال 15 إلى 30 دقيقة.',

            'reviews.badge': 'آراء العملاء الحقيقية',
            'reviews.title': 'ماذا يقول عملاؤنا عن Fixora؟',
            'reviews.subtitle': 'أكثر من 15,000+ عميل يثقون بمنصتنا لخدمات الصيانة والتركيبات الموثوقة. يمكنك التمرير التلقائي لقراءة كافة الآراء.',
            'reviews.add_btn': 'أضف تقييمك الآن',
            'reviews.client_label': 'عميل',

            'cta.title': 'هل أنت مقدم خدمة محترف؟',
            'cta.subtitle': 'انضم لآلاف الفنيين المحترفين على منصة Fixora وابدأ في استقبال طلبات العملاء وزيادة دخلك اليوم بسهولة.',
            'cta.btn': 'سجل الآن كمقدم خدمة مجاناً',

            'footer.desc': 'منصة تربط العملاء بأفضل مقدمي الخدمات المنزلية المعتمدين في مصر. تجربة آمنة وسهلة بضمان كامل وشامل.',
            'footer.quick_links': 'روابط سريعة',
            'footer.all_services': 'جميع الخدمات',
            'footer.providers_list': 'قائمة الفنيين',
            'footer.top_services': 'أهم الخدمات',
            'footer.elec_maint': 'صيانة الكهرباء',
            'footer.plumb_work': 'أعمال السباكة',
            'footer.ac_maint': 'صيانة التكييفات',
            'footer.carp_finish': 'نجارة وتشطيبات',
            'footer.contact': 'تواصل مع الدعم',
            'footer.hotline': '19870 (الرقم المختصر)',
            'footer.hq': 'القاهرة - التجمع الخامس، مصر',
            'footer.copyright': '© 2026 Fixora. جميع الحقوق محفوظة — المنصة الأولى للخدمات المنزلية.',

            'booking.title': 'طلب خدمة منزلية جديدة',
            'booking.title_provider': 'حجز موعد مع الفني:',
            'booking.subtitle': 'أدخل بياناتك وسيتم توجيه طلبك للفني المعتمد فوراً',
            'booking.service_label': 'الخدمة المطلوبة',
            'booking.price_title': 'سعر الخدمة التقديري (المعاينة والزيارة)',
            'booking.price_currency': 'جنيه مصري',
            'booking.price_note': 'يشمل المعاينة والفحص الأولي وضمان 30 يوماً — الدفع بعد إتمام الخدمة',
            'booking.promo_label': 'كود الخصم (اختياري)',
            'booking.promo_placeholder': 'أدخل FIX20 لخصم 20%',
            'booking.promo_applied': 'تم تطبيق خصم 20% (كود FIX20)',
            'booking.name_label': 'الاسم بالكامل',
            'booking.name_placeholder': 'أدخل اسمك الكريم',
            'booking.phone_label': 'رقم الهاتف',
            'booking.email_label': 'البريد الإلكتروني (اختياري)',
            'booking.city_label': 'المحافظة/المنطقة',
            'booking.datetime_label': 'الموعد المفضل',
            'booking.address_label': 'العنوان بالتفصيل (اختياري)',
            'booking.address_placeholder': 'مثال: شارع التحرير، عمارة 5، الدور الثالث',
            'booking.notes_label': 'تفاصيل العطل أو الملاحظات',
            'booking.notes_placeholder': 'اكتب وصفاً مختصراً للمشكلة أو الخدمة المطلوبة...',
            'booking.submit': 'تأكيد الطلب واستلام العروض',
            'booking.submitting': 'جارٍ إرسال الطلب...',

            'auth.tab_login': 'تسجيل الدخول',
            'auth.tab_register': 'حساب جديد / تقديم خدمة',
            'auth.login_title': 'مرحباً بك مجدداً في Fixora',
            'auth.login_subtitle': 'سجل دخولك لمتابعة طلبات الصيانة والفواتير',
            'auth.login_id_label': 'البريد أو رقم الهاتف',
            'auth.login_id_placeholder': 'example@mail.com أو 010xxxxxxx',
            'auth.password_label': 'كلمة المرور',
            'auth.remember_me': 'تذكرني',
            'auth.forgot_pw': 'نسيت كلمة المرور؟',
            'auth.login_btn': 'دخول',
            'auth.logging_in': 'جارٍ الدخول...',
            'auth.reg_title': 'انضم إلى منصة Fixora',
            'auth.reg_subtitle': 'سجل كعميل جديد أو كمقدم خدمة محترف لزيادة دخلك',
            'auth.reg_type_label': 'نوع الحساب',
            'auth.reg_type_client': 'عميل (أبحث عن خدمات صيانة)',
            'auth.reg_type_provider': 'مقدم خدمة (فني / مهندس صيانة)',
            'auth.reg_name_label': 'الاسم بالكامل',
            'auth.reg_name_placeholder': 'الاسم ثلاثي',
            'auth.reg_phone_label': 'رقم الهاتف',
            'auth.reg_email_label': 'البريد الإلكتروني',
            'auth.reg_city_label': 'المحافظة',
            'auth.reg_pw_placeholder': '6 أرقام وحروف على الأقل',
            'auth.reg_btn': 'إنشاء الحساب وتفعيله',
            'auth.registering': 'جارٍ إنشاء الحساب...',

            'prof.reviews_prefix': 'من 5 (',
            'prof.reviews_suffix': 'تقييم)',
            'prof.exp_caption': 'خبرة موثقة',
            'prof.price_caption': 'سعر الكشف/الزيارة',
            'prof.bio_heading': 'نبذة عن الفني وتخصصاته',
            'prof.skills_heading': 'المهارات والخدمات المتاحة',
            'prof.book_btn': 'حجز موعد مع هذا الفني فوراً',

            'userprof.title': 'الملف الشخصي',
            'userprof.tab_info': 'بياناتي الشخصية',
            'userprof.tab_requests': 'طلباتي وحجوزاتي',
            'userprof.stat_total': 'إجمالي الطلبات',
            'userprof.stat_active': 'طلبات جارية',
            'userprof.stat_role': 'نوع الحساب',
            'userprof.role_client': 'عميل موثق',
            'userprof.role_provider': 'مقدم خدمة',
            'userprof.status_active': 'حساب نشط ✓',
            'userprof.status_pending': 'قيد المراجعة',
            'userprof.member_since': 'عضو منذ',
            'userprof.email_label': 'البريد الإلكتروني',
            'userprof.address_label': 'العنوان الافتراضي',
            'userprof.address_placeholder': 'أدخل عنوانك الافتراضي لتسهيل الحجوزات القادمة',
            'userprof.job_label': 'التخصص المهني',
            'userprof.job_placeholder': 'مثال: كهربائي منازل معتمد',
            'userprof.bio_label': 'نبذة شخصية',
            'userprof.bio_placeholder': 'اكتب نبذة مختصرة عنك أو تفضيلات المواعيد...',
            'userprof.save_btn': 'حفظ التعديلات',
            'userprof.saving': 'جارٍ الحفظ...',
            'userprof.saved_title': 'تم تحديث ملفك الشخصي ✅',
            'userprof.saved_msg': 'تم حفظ بياناتك بنجاح.',
            'userprof.empty_requests': 'لا توجد طلبات صيانة مسجلة بعد. يمكنك طلب أول خدمة الآن!',
            'userprof.new_request_btn': 'طلب خدمة جديدة الآن',
            'userprof.cancel_btn': 'إلغاء الطلب',
            'userprof.cancelled_toast': 'تم إلغاء الطلب بنجاح.',
            'userprof.req_provider': 'الفني:',
            'userprof.req_date': 'الموعد:',
            'userprof.req_status_NEW': 'جديد',
            'userprof.req_status_PENDING': 'قيد التنفيذ',
            'userprof.req_status_COMPLETED': 'مكتمل',
            'userprof.req_status_CANCELLED': 'ملغي',

            'rev.title': 'إضافة تقييم جديد',
            'rev.subtitle': 'شاركنا تجربتك لمساعدة بقية العملاء في اختيار الفني الأفضل',
            'rev.stars_label': 'تقييمك بالنجوم',
            'rev.name_label': 'اسمك الكريم',
            'rev.name_placeholder': 'مثال: أحمد محمود',
            'rev.city_label': 'المدينة',
            'rev.city_placeholder': 'مثال: القاهرة',
            'rev.comment_label': 'تعليقك وتجربتك',
            'rev.comment_placeholder': 'اكتب رأيك وتجربتك مع الفني والخدمة بكل أمانة...',
            'rev.submit': 'نشر التقييم فوراً',
            'rev.submitting': 'جارٍ النشر...',

            'toast.theme_dark_title': 'تم تفعيل الوضع الليلي 🌙',
            'toast.theme_dark_msg': 'استمتع بتجربة مريحة للعينين مجهزة للوضع الليلي.',
            'toast.theme_light_title': 'تم تفعيل الوضع النهاري ☀️',
            'toast.theme_light_msg': 'تم العودة للمظهر الفاتح القياسي.',
            'toast.lang_title': 'تم تغيير اللغة إلى العربية 🇪🇬',
            'toast.lang_msg': 'واجهة المنصة الآن باللغة العربية.',
            'toast.booking_ok_title': 'تم تسجيل طلبك بنجاح! 🎉',
            'toast.booking_err_title': 'تعذر إرسال الطلب',
            'toast.promo_title': 'تم تفعيل الخصم 🎁',
            'toast.promo_msg': 'تم تطبيق كود FIX20 بنجاح خصم 20% على طلبك.',
            'toast.logout_title': 'تم تسجيل الخروج',
            'toast.logout_msg': 'نراك قريباً في Fixora.',

            'nav.client_workspace': 'واجهة العميل (لوحتي)',
            'nav.provider_workspace': 'واجهة مقدم الخدمة',
            'nav.browse_site': 'تصفح المنصة الرئيسية',

            'calc.label_city': 'المحافظة (تحدد تسعيرة الزيارة)',
            'calc.gov_base_note': 'تسعيرة المحافظة:',

            'booking.gov_rate_label': 'تسعيرة المحافظة:',
            'booking.gov_base': 'السعر الأساسي',

            'auth.demo_hint': 'دخول سريع لتجربة الواجهتين:',
            'auth.demo_client': 'تجربة واجهة العميل',
            'auth.demo_provider': 'تجربة واجهة مقدم الخدمة',

            'ws.client_badge': 'حساب العميل',
            'ws.client_subtitle': 'تابع طلباتك الحالية، قارن أسعار المحافظات، واطلب خدمتك في ثوانٍ.',
            'ws.client_cta': 'طلب خدمة جديدة',
            'ws.client_kpi_total': 'إجمالي طلباتي',
            'ws.client_kpi_active': 'طلبات جارية',
            'ws.client_kpi_done': 'طلبات مكتملة',
            'ws.client_kpi_spend': 'التكلفة التقديرية',
            'ws.client_tab_orders': 'طلباتي وحجوزاتي',
            'ws.client_tab_explore': 'أسعار الخدمات بالمحافظات',
            'ws.client_tab_profile': 'بياناتي وعنواني',
            'ws.client_filter_all': 'الكل',
            'ws.client_filter_active': 'الجارية',
            'ws.client_filter_done': 'المكتملة',
            'ws.client_filter_cancelled': 'الملغية',
            'ws.client_explore_title': 'قارن أسعار الخدمات حسب المحافظة',
            'ws.client_explore_desc': 'اختر المحافظة لمعرفة السعر الفوري لكل خدمة قبل إرسال الطلب.',
            'ws.client_rebook': 'إعادة الطلب',
            'ws.client_rate': 'تقييم الخدمة',

            'ws.pro_badge': 'واجهة مقدم الخدمة',
            'ws.pro_subtitle': 'استقبل طلبات الصيانة في محافظتك، أدر أعمالك الجارية، واضبط أسعار زيارتك.',
            'ws.pro_avail_on': 'متاح للطلبات الآن 🟢',
            'ws.pro_avail_off': 'مشغول حالياً 🔴',
            'ws.pro_kpi_open': 'طلبات متاحة لك',
            'ws.pro_kpi_active': 'أعمال قيد التنفيذ',
            'ws.pro_kpi_done': 'أعمال مكتملة',
            'ws.pro_kpi_earnings': 'الأرباح التقديرية',
            'ws.pro_tab_feed': 'الطلبات المتاحة',
            'ws.pro_tab_jobs': 'أعمالي الجارية والمكتملة',
            'ws.pro_tab_settings': 'إعدادات الفني والتسعير',
            'ws.pro_filter_city': 'في محافظتي فقط',
            'ws.pro_filter_all': 'كل المحافظات',
            'ws.pro_accept_btn': 'قبول الطلب',
            'ws.pro_complete_btn': 'تحديد كمكتمل',
            'ws.pro_empty_feed': 'لا توجد طلبات جديدة متاحة حالياً في هذا النطاق.',
            'ws.pro_empty_jobs': 'لم تقبل أي طلبات صيانة بعد. ابدأ بقبول طلب من قائمة الطلبات المتاحة!',
            'ws.pro_client_label': 'العميل:',
            'ws.pro_phone_label': 'الهاتف:',
            'ws.pro_address_label': 'العنوان:',
            'ws.pro_price_label': 'السعر الأساسي للزيارة (جنيه مصري)',
            'ws.pro_exp_label': 'سنوات الخبرة',
            'ws.pro_skills_label': 'المهارات والتخصصات (افصل بفاصلة)',
            'ws.pro_avail_label': 'حالة التوفر لاستقبال طلبات جديدة',
            'ws.pro_gov_preview': 'معاينة سعرك تلقائياً حسب المحافظة:',
            'ws.pro_accepted_ok': 'تم قبول الطلب بنجاح! انتقل إلى "أعمالي الجارية" للتنفيذ.',
            'ws.pro_completed_ok': 'تم تحديد العمل كمكتمل بنجاح! 🎉',

            'banner.return_client': 'أنت تتصفح المنصة العامة — العودة إلى واجهة العميل',
            'banner.return_provider': 'أنت تتصفح المنصة العامة — العودة إلى واجهة مقدم الخدمة',
            'banner.return_btn': 'فتح واجهتي الخاصة',

            'services.view_pros': 'فنيو التخصص',
            'providers.specialty_label': 'تصفية حسب التخصص:',
            'providers.specialty_all': 'جميع التخصصات',
            'providers.empty_specialty': 'لا يوجد فنيون مسجلون حالياً في هذا التخصص والمحافظة المحددة.',
            'providers.reset_filters': 'عرض جميع الفنيين',
            'booking.provider_label': 'الفني المختص لهذا التخصص (اختياري)',
            'booking.provider_auto': 'توجيه تلقائي لأقرب فني متاح في هذا التخصص',
            'booking.provider_none': 'سيتم التوجيه تلقائياً لأقرب فني معتمد',
            'auth.reg_specialty_label': 'التخصص المهني (تُعرض لك طلبات تخصصك فقط)',
            'auth.reg_job_label': 'المسمى الوظيفي (اختياري)',
            'auth.reg_job_placeholder': 'مثال: فني صيانة منزلية شاملة',
            'ws.pro_specialty_label': 'التخصص الرئيسي (يحدد الطلبات المعروضة لك)',
            'ws.pro_specialty_badge_prefix': 'طلبات تخصصك فقط:'
        },
        en: {
            'meta.title': 'Fixora | Trusted Home Services Marketplace in Egypt',
            'meta.description': 'Fixora - Egypt’s #1 trusted home maintenance marketplace. Find background-checked electricians, plumbers, carpenters, and AC technicians near you.',

            'announcement.text_html': '🎉 Exclusive 20% OFF your first maintenance order! Use code <strong class="promo-code">FIX20</strong>',
            'announcement.btn': 'Claim Discount',
            'announcement.close_aria': 'Close announcement',

            'nav.home': 'Home',
            'nav.services': 'Services',
            'nav.calculator': 'Price Calculator',
            'nav.providers': 'Technicians',
            'nav.how_it_works': 'How It Works',
            'nav.faq': 'FAQ',
            'nav.reviews': 'Reviews',
            'nav.login': 'Sign In',
            'nav.register': 'Become a Pro',
            'nav.my_profile': 'My Profile',
            'nav.logout': 'Sign Out',
            'nav.lang_btn': 'عربي',
            'nav.lang_title': 'التبديل إلى اللغة العربية',
            'nav.theme_title_dark': 'Light Mode',
            'nav.theme_title_light': 'Dark Mode',

            'hero.badge': 'Egypt’s #1 Certified Home Services Marketplace',
            'hero.title_html': 'Every Home Service You Need...<br><span class="gradient-text">In One Place.</span>',
            'hero.subtitle': 'Book top-rated electricians, plumbers, carpenters, or AC technicians near you. Every pro is national-ID verified and continuously reviewed for safety and quality.',
            'hero.search_placeholder': 'Search a service (Electricity, Plumbing, AC...)',
            'hero.all_cities': 'All Governorates',
            'hero.search_btn': 'Search Now',
            'hero.request_btn': 'Request a Service',
            'hero.join_btn': 'Join as a Pro',
            'hero.stat_clients': 'Happy Clients',
            'hero.stat_pros': 'Verified Pros',
            'hero.stat_rating': 'Overall Rating',
            'hero.stat_orders': 'Completed Jobs',

            'trust.t1_title': '30-Day Service Warranty',
            'trust.t1_desc': 'Free follow-up inspection & repair if the issue returns',
            'trust.t2_title': 'Verified Background Check',
            'trust.t2_desc': 'National ID & criminal record verification for every pro',
            'trust.t3_title': 'Upfront Transparent Pricing',
            'trust.t3_desc': 'Clear inspection fees declared before dispatch, no hidden costs',
            'trust.t4_title': '24/7 Emergency Support',
            'trust.t4_desc': 'Dedicated support team ready to assist you anytime',

            'services.badge': 'Available Services',
            'services.title': 'Most Requested Services',
            'services.subtitle': 'Choose the service you need and we will connect you with a certified technician in your area.',
            'services.filter_all': 'All',
            'services.filter_elec': 'Electrical',
            'services.filter_plumb': 'Plumbing',
            'services.filter_ac': 'AC & Cooling',
            'services.filter_finish': 'Carpentry & Finishing',
            'services.filter_clean': 'Cleaning & Appliances',
            'services.request_now': 'Request Now',
            'services.no_results': 'No matching services found. You can place a custom request by clicking "Request a Service".',

            'calc.badge': 'Instant Cost Estimator',
            'calc.title': 'Estimate Your Service Cost',
            'calc.subtitle': 'Select service type and job scope to see the upfront inspection & visit estimate immediately.',
            'calc.label_service': 'Select Service Type',
            'calc.label_scope': 'Job Scope / Issue Level',
            'calc.scope_1': 'Minor repair or quick checkup',
            'calc.scope_2': 'Medium maintenance & installations',
            'calc.scope_3': 'Full overhaul or complete setup',
            'calc.label_urgency': 'Response Speed',
            'calc.urgency_0': 'Standard booking (preferred time)',
            'calc.urgency_100': 'Instant emergency (within 30 mins +100 EGP)',
            'calc.result_badge': 'Total Estimated Cost',
            'calc.currency': 'EGP',
            'calc.note': 'Includes initial inspection & 30-day service warranty',
            'calc.book_btn': 'Book Service at This Price',

            'why.badge': 'Why Fixora?',
            'why.title': 'Why Thousands of Homeowners Trust Us',
            'why.c1_title': 'Officially Verified Pros',
            'why.c1_desc': 'Every technician passes criminal record verification and national ID checks before activation.',
            'why.c2_title': 'Authentic Client Reviews',
            'why.c2_desc': 'Every completed job is rated directly by real homeowners to keep quality consistently high.',
            'why.c3_title': 'On-Time Arrival',
            'why.c3_desc': 'Match with the nearest certified technician in minutes with guaranteed punctuality.',
            'why.c4_title': 'Quality Warranty & Protection',
            'why.c4_desc': 'Comprehensive 30-day warranty on workmanship with active quality follow-up.',

            'stats.clients': 'Happy Clients',
            'stats.pros': 'Verified Pros',
            'stats.orders': 'Completed Orders',
            'stats.satisfaction': 'Client Satisfaction',

            'providers.badge': 'Top Certified Technicians',
            'providers.title': 'Highest Rated Service Pros',
            'providers.subtitle': 'Pick the ideal technician by specialty, rating, and governorate. Scroll horizontally to browse all pros.',
            'providers.filter_all': 'All Pros',
            'providers.filter_online': 'Available Now 🟢',
            'providers.status_online': 'Available Now 🟢',
            'providers.status_busy': 'Busy Now 🔴',
            'providers.price_unit': 'EGP/visit',
            'providers.reviews_word': 'reviews',
            'providers.view_profile': 'View Profile',
            'providers.book_now': 'Book Now',
            'providers.view_more_title': 'Browse More Technicians',
            'providers.view_more_desc': 'Explore 650+ verified technicians across all governorates and trades',
            'providers.view_more_btn': 'Request Custom Pro',

            'how.badge': 'How It Works',
            'how.title': 'Get Your Fix Done in 4 Easy Steps',
            'how.s1_title': 'Choose a Service',
            'how.s1_desc': 'Select your required home service from our list or instant search.',
            'how.s2_title': 'Pick a Verified Pro',
            'how.s2_desc': 'Compare technicians by ratings, years of experience, and upfront prices.',
            'how.s3_title': 'Set Time & Location',
            'how.s3_desc': 'Pick a convenient slot and our certified pro arrives right on schedule.',
            'how.s4_title': 'Enjoy Service & Warranty',
            'how.s4_desc': 'High-precision execution backed by an official invoice and 30-day warranty.',

            'faq.badge': 'Frequently Asked Questions',
            'faq.title': 'Everything You Need to Know About Fixora',
            'faq.subtitle': 'Clear answers to the most common questions from our customers.',
            'faq.q1': 'How does Fixora verify technician safety and quality?',
            'faq.a1': 'All service providers undergo strict criminal record checks, national ID verification, and hands-on technical skill assessments before joining the platform.',
            'faq.q2': 'What is the warranty policy if an issue recurs?',
            'faq.a2': 'Fixora provides a free 30-day comprehensive warranty on all maintenance and installation jobs. If the issue returns, we dispatch a technician for free re-inspection and repair.',
            'faq.q3': 'How are visit fees and final bills determined?',
            'faq.a3': 'Inspection fees are transparently listed upfront on technician cards and in our price calculator. Your pro provides a detailed quote for parts and labor before starting, and you pay only after completion.',
            'faq.q4': 'Do you offer 24/7 emergency dispatch?',
            'faq.a4': 'Yes, our Instant Pro service covers urgent electrical faults, water leaks, and emergency lockouts 24/7, arriving within 15 to 30 minutes in your area.',

            'reviews.badge': 'Real Customer Reviews',
            'reviews.title': 'What Our Customers Say About Fixora',
            'reviews.subtitle': 'Over 15,000+ homeowners trust our platform for reliable repairs and installations.',
            'reviews.add_btn': 'Add Your Review',
            'reviews.client_label': 'Client',

            'cta.title': 'Are You a Skilled Technician?',
            'cta.subtitle': 'Join thousands of certified professionals on Fixora, receive customer requests daily, and grow your income effortlessly.',
            'cta.btn': 'Register Free as a Pro',

            'footer.desc': 'Connecting homeowners with Egypt’s top certified maintenance professionals. Safe, fast, and backed by a full 30-day warranty.',
            'footer.quick_links': 'Quick Links',
            'footer.all_services': 'All Services',
            'footer.providers_list': 'Technicians',
            'footer.top_services': 'Top Services',
            'footer.elec_maint': 'Electrical Repair',
            'footer.plumb_work': 'Plumbing Works',
            'footer.ac_maint': 'AC Maintenance',
            'footer.carp_finish': 'Carpentry & Finishing',
            'footer.contact': 'Contact Support',
            'footer.hotline': '19870 (Hotline)',
            'footer.hq': 'Cairo - Fifth Settlement, Egypt',
            'footer.copyright': '© 2026 Fixora. All rights reserved — Egypt’s #1 Home Services Platform.',

            'booking.title': 'Request a New Home Service',
            'booking.title_provider': 'Book Technician:',
            'booking.subtitle': 'Enter your details and your request will be routed to a certified pro immediately',
            'booking.service_label': 'Required Service',
            'booking.price_title': 'Estimated Service Price (Visit & Inspection)',
            'booking.price_currency': 'EGP',
            'booking.price_note': 'Includes initial inspection & 30-day warranty — Pay only after completion',
            'booking.promo_label': 'Promo Code (Optional)',
            'booking.promo_placeholder': 'Enter FIX20 for 20% off',
            'booking.promo_applied': '20% discount applied (Code FIX20)',
            'booking.name_label': 'Full Name',
            'booking.name_placeholder': 'Enter your full name',
            'booking.phone_label': 'Phone Number',
            'booking.email_label': 'Email Address (Optional)',
            'booking.city_label': 'Governorate / Area',
            'booking.datetime_label': 'Preferred Date & Time',
            'booking.address_label': 'Detailed Address (Optional)',
            'booking.address_placeholder': 'e.g., 5 Tahrir St., 3rd Floor',
            'booking.notes_label': 'Issue Details / Notes',
            'booking.notes_placeholder': 'Briefly describe the issue or work needed...',
            'booking.submit': 'Confirm Request & Match Pro',
            'booking.submitting': 'Submitting request...',

            'auth.tab_login': 'Sign In',
            'auth.tab_register': 'New Account / Join as Pro',
            'auth.login_title': 'Welcome Back to Fixora',
            'auth.login_subtitle': 'Sign in to manage your profile and track maintenance orders',
            'auth.login_id_label': 'Email or Phone Number',
            'auth.login_id_placeholder': 'example@mail.com or 010xxxxxxx',
            'auth.password_label': 'Password',
            'auth.remember_me': 'Remember me',
            'auth.forgot_pw': 'Forgot password?',
            'auth.login_btn': 'Sign In',
            'auth.logging_in': 'Signing in...',
            'auth.reg_title': 'Join Fixora Platform',
            'auth.reg_subtitle': 'Sign up as a homeowner or a certified technician to grow your income',
            'auth.reg_type_label': 'Account Type',
            'auth.reg_type_client': 'Client (Looking for home services)',
            'auth.reg_type_provider': 'Service Provider (Technician / Engineer)',
            'auth.reg_name_label': 'Full Name',
            'auth.reg_name_placeholder': 'Full name',
            'auth.reg_phone_label': 'Phone Number',
            'auth.reg_email_label': 'Email Address',
            'auth.reg_city_label': 'Governorate',
            'auth.reg_pw_placeholder': 'At least 6 characters',
            'auth.reg_btn': 'Create & Activate Account',
            'auth.registering': 'Creating account...',

            'prof.reviews_prefix': 'of 5 (',
            'prof.reviews_suffix': 'reviews)',
            'prof.exp_caption': 'Verified Experience',
            'prof.price_caption': 'Visit / Inspection Fee',
            'prof.bio_heading': 'About the Technician',
            'prof.skills_heading': 'Skills & Available Services',
            'prof.book_btn': 'Book This Technician Now',

            'userprof.title': 'My Profile',
            'userprof.tab_info': 'Personal Details',
            'userprof.tab_requests': 'My Service Requests',
            'userprof.stat_total': 'Total Requests',
            'userprof.stat_active': 'Active Orders',
            'userprof.stat_role': 'Account Role',
            'userprof.role_client': 'Verified Client',
            'userprof.role_provider': 'Service Provider',
            'userprof.status_active': 'Active Account ✓',
            'userprof.status_pending': 'Pending Review',
            'userprof.member_since': 'Member since',
            'userprof.email_label': 'Email Address',
            'userprof.address_label': 'Default Address',
            'userprof.address_placeholder': 'Save your default address for faster future bookings',
            'userprof.job_label': 'Trade / Specialty',
            'userprof.job_placeholder': 'e.g., Certified Home Electrician',
            'userprof.bio_label': 'Bio / Preferences',
            'userprof.bio_placeholder': 'Add a short bio or preferred visit times...',
            'userprof.save_btn': 'Save Profile Changes',
            'userprof.saving': 'Saving...',
            'userprof.saved_title': 'Profile Updated ✅',
            'userprof.saved_msg': 'Your profile details have been saved.',
            'userprof.empty_requests': 'No service requests recorded yet. Place your first request now!',
            'userprof.new_request_btn': 'Request a Service Now',
            'userprof.cancel_btn': 'Cancel Request',
            'userprof.cancelled_toast': 'Service request cancelled.',
            'userprof.req_provider': 'Technician:',
            'userprof.req_date': 'Scheduled:',
            'userprof.req_status_NEW': 'New',
            'userprof.req_status_PENDING': 'In Progress',
            'userprof.req_status_COMPLETED': 'Completed',
            'userprof.req_status_CANCELLED': 'Cancelled',

            'rev.title': 'Add a New Review',
            'rev.subtitle': 'Share your experience to help other homeowners pick the best pro',
            'rev.stars_label': 'Your Star Rating',
            'rev.name_label': 'Your Name',
            'rev.name_placeholder': 'e.g., Ahmed Mahmoud',
            'rev.city_label': 'City',
            'rev.city_placeholder': 'e.g., Cairo',
            'rev.comment_label': 'Your Review',
            'rev.comment_placeholder': 'Write your honest feedback about the technician and service...',
            'rev.submit': 'Publish Review Now',
            'rev.submitting': 'Publishing...',

            'toast.theme_dark_title': 'Dark Mode Enabled 🌙',
            'toast.theme_dark_msg': 'Enjoy a comfortable eye-friendly dark appearance.',
            'toast.theme_light_title': 'Light Mode Enabled ☀️',
            'toast.theme_light_msg': 'Switched back to the crisp standard light theme.',
            'toast.lang_title': 'Language Switched to English 🇬🇧',
            'toast.lang_msg': 'Fixora interface is now displayed in English.',
            'toast.booking_ok_title': 'Request Submitted! 🎉',
            'toast.booking_err_title': 'Could Not Submit Request',
            'toast.promo_title': 'Discount Activated 🎁',
            'toast.promo_msg': 'Promo code FIX20 applied for 20% off your order.',
            'toast.logout_title': 'Signed Out',
            'toast.logout_msg': 'See you soon on Fixora.',

            'nav.client_workspace': 'Customer Workspace',
            'nav.provider_workspace': 'Provider Workspace',
            'nav.browse_site': 'Browse Public Site',

            'calc.label_city': 'Governorate (Sets Regional Rate)',
            'calc.gov_base_note': 'Governorate rate:',

            'booking.gov_rate_label': 'Governorate rate:',
            'booking.gov_base': 'Base Rate',

            'auth.demo_hint': 'Quick demo login to preview both interfaces:',
            'auth.demo_client': 'Try Customer UI',
            'auth.demo_provider': 'Try Provider UI',

            'ws.client_badge': 'Customer Portal',
            'ws.client_subtitle': 'Track your active orders, compare governorate rates, and book in seconds.',
            'ws.client_cta': 'New Service Request',
            'ws.client_kpi_total': 'Total Requests',
            'ws.client_kpi_active': 'Active Orders',
            'ws.client_kpi_done': 'Completed',
            'ws.client_kpi_spend': 'Estimated Spend',
            'ws.client_tab_orders': 'My Orders & Tracking',
            'ws.client_tab_explore': 'Governorate Pricing',
            'ws.client_tab_profile': 'Profile & Address',
            'ws.client_filter_all': 'All',
            'ws.client_filter_active': 'Active',
            'ws.client_filter_done': 'Completed',
            'ws.client_filter_cancelled': 'Cancelled',
            'ws.client_explore_title': 'Compare Service Prices by Governorate',
            'ws.client_explore_desc': 'Select any governorate to view exact inspection prices before requesting.',
            'ws.client_rebook': 'Book Again',
            'ws.client_rate': 'Leave Review',

            'ws.pro_badge': 'Provider Portal',
            'ws.pro_subtitle': 'Claim customer requests in your governorate, manage active jobs, and set your rates.',
            'ws.pro_avail_on': 'Available for Jobs 🟢',
            'ws.pro_avail_off': 'Currently Busy 🔴',
            'ws.pro_kpi_open': 'Open Requests',
            'ws.pro_kpi_active': 'Active Jobs',
            'ws.pro_kpi_done': 'Completed Jobs',
            'ws.pro_kpi_earnings': 'Estimated Earnings',
            'ws.pro_tab_feed': 'Available Requests',
            'ws.pro_tab_jobs': 'My Active & Done Jobs',
            'ws.pro_tab_settings': 'Technician & Pricing Settings',
            'ws.pro_filter_city': 'My Governorate Only',
            'ws.pro_filter_all': 'All Governorates',
            'ws.pro_accept_btn': 'Accept Request',
            'ws.pro_complete_btn': 'Mark Completed',
            'ws.pro_empty_feed': 'No open customer requests match this filter right now.',
            'ws.pro_empty_jobs': 'You have not accepted any jobs yet. Accept a request from the Available tab!',
            'ws.pro_client_label': 'Client:',
            'ws.pro_phone_label': 'Phone:',
            'ws.pro_address_label': 'Address:',
            'ws.pro_price_label': 'Base Visit Rate (EGP)',
            'ws.pro_exp_label': 'Years of Experience',
            'ws.pro_skills_label': 'Skills & Specialties (comma-separated)',
            'ws.pro_avail_label': 'Availability for new customer requests',
            'ws.pro_gov_preview': 'Auto-calculated rate per governorate:',
            'ws.pro_accepted_ok': 'Request accepted! Switched to your Active Jobs list.',
            'ws.pro_completed_ok': 'Job marked as completed! 🎉',

            'banner.return_client': 'Viewing Public Marketplace — Return to Customer Workspace',
            'banner.return_provider': 'Viewing Public Marketplace — Return to Provider Workspace',
            'banner.return_btn': 'Open My Workspace',

            'services.view_pros': 'Specialists',
            'providers.specialty_label': 'Filter by specialty:',
            'providers.specialty_all': 'All Specialties',
            'providers.empty_specialty': 'No technicians currently match this specialty and governorate filter.',
            'providers.reset_filters': 'Show All Technicians',
            'booking.provider_label': 'Specialist for This Service (Optional)',
            'booking.provider_auto': 'Auto-assign nearest available specialist',
            'booking.provider_none': 'Auto-dispatch to nearest certified pro',
            'auth.reg_specialty_label': 'Primary Specialty (Only matching requests appear)',
            'auth.reg_job_label': 'Job Title (Optional)',
            'auth.reg_job_placeholder': 'e.g., Home Maintenance Technician',
            'ws.pro_specialty_label': 'Primary Specialty (Filters your request feed)',
            'ws.pro_specialty_badge_prefix': 'Your specialty only:'
        }
    };

    const SPECIALTIES = [
        { key: 'كهرباء', nameAr: 'كهرباء', nameEn: 'Electrical', keywords: ['كهرباء', 'كهربائي', 'كهربا', 'electric'] },
        { key: 'سباكة', nameAr: 'سباكة', nameEn: 'Plumbing', keywords: ['سباكة', 'سباك', 'خلاطات', 'تسربات', 'plumb'] },
        { key: 'تكييف وتبريد', nameAr: 'تكييف وتبريد', nameEn: 'AC & Cooling', keywords: ['تكييف', 'تبريد', 'فريون', 'hvac', 'cooling'] },
        { key: 'نجارة وأثاث', nameAr: 'نجارة وأثاث', nameEn: 'Carpentry & Furniture', keywords: ['نجارة', 'نجار', 'أثاث', 'اثاث', 'خشب', 'carpent'] },
        { key: 'دهانات وديكور', nameAr: 'دهانات وديكور', nameEn: 'Painting & Decor', keywords: ['دهانات', 'دهان', 'نقاش', 'ديكور', 'تشطيبات', 'paint'] },
        { key: 'تنظيف المنازل', nameAr: 'تنظيف المنازل', nameEn: 'Home Cleaning', keywords: ['تنظيف', 'نظافة', 'بخار', 'clean'] },
        { key: 'ألوميتال وزجاج', nameAr: 'ألوميتال وزجاج', nameEn: 'Aluminum & Glass', keywords: ['ألوميتال', 'الوميتال', 'زجاج', 'alumin'] },
        { key: 'كاميرات مراقبة', nameAr: 'كاميرات مراقبة', nameEn: 'CCTV & Security', keywords: ['كاميرات', 'كاميرا', 'مراقبة', 'أنظمة أمنية', 'cctv'] },
        { key: 'شبكات وإنترنت', nameAr: 'شبكات وإنترنت', nameEn: 'Wi-Fi & Networking', keywords: ['شبكات', 'شبكة', 'إنترنت', 'انترنت', 'راوتر', 'واي فاي', 'wifi', 'network'] },
        { key: 'مفاتيح وأقفال طوارئ', nameAr: 'مفاتيح وأقفال طوارئ', nameEn: 'Emergency Locksmith', keywords: ['مفاتيح وأقفال', 'أقفال', 'اقفال', 'كالون', 'locksmith', 'lock'] },
        { key: 'مكافحة الحشرات', nameAr: 'مكافحة الحشرات', nameEn: 'Pest Control', keywords: ['مكافحة الحشرات', 'حشرات', 'إبادة', 'pest'] },
        { key: 'صيانة منزلية شاملة', nameAr: 'صيانة منزلية شاملة', nameEn: 'Home Maintenance & Appliances', keywords: ['صيانة منزلية', 'صيانة شاملة', 'صيانة عامة', 'أجهزة منزلية', 'فني صيانة', 'home maintenance', 'appliance', 'handyman'] }
    ];

    const GOVERNORATES = [
        { key: 'القاهرة', nameAr: 'القاهرة', nameEn: 'Cairo', multiplier: 1.0, deltaPercent: 0, badgeAr: 'السعر الأساسي', badgeEn: 'Base Rate' },
        { key: 'الجيزة', nameAr: 'الجيزة', nameEn: 'Giza', multiplier: 1.05, deltaPercent: 5, badgeAr: '+5% عن الأساسي', badgeEn: '+5% vs base' },
        { key: 'الإسكندرية', nameAr: 'الإسكندرية', nameEn: 'Alexandria', multiplier: 0.95, deltaPercent: -5, badgeAr: '-5% عن الأساسي', badgeEn: '-5% vs base' },
        { key: 'بورسعيد', nameAr: 'بورسعيد', nameEn: 'Port Said', multiplier: 0.90, deltaPercent: -10, badgeAr: '-10% عن الأساسي', badgeEn: '-10% vs base' },
        { key: 'المنصورة', nameAr: 'المنصورة', nameEn: 'Mansoura', multiplier: 0.85, deltaPercent: -15, badgeAr: '-15% عن الأساسي', badgeEn: '-15% vs base' },
        { key: 'الشرقية', nameAr: 'الشرقية', nameEn: 'Sharqia', multiplier: 0.85, deltaPercent: -15, badgeAr: '-15% عن الأساسي', badgeEn: '-15% vs base' },
        { key: 'طنطا', nameAr: 'طنطا', nameEn: 'Tanta', multiplier: 0.80, deltaPercent: -20, badgeAr: '-20% عن الأساسي', badgeEn: '-20% vs base' },
        { key: 'أسيوط', nameAr: 'أسيوط', nameEn: 'Assiut', multiplier: 0.75, deltaPercent: -25, badgeAr: '-25% عن الأساسي', badgeEn: '-25% vs base' }
    ];

    const CITY_EN = {
        'القاهرة': 'Cairo',
        'الجيزة': 'Giza',
        'الإسكندرية': 'Alexandria',
        'بورسعيد': 'Port Said',
        'طنطا': 'Tanta',
        'المنصورة': 'Mansoura',
        'الشرقية': 'Sharqia',
        'أسيوط': 'Assiut',
        'مصر': 'Egypt'
    };

    const SERVICE_EN = {
        'كهرباء': {
            title: 'Electrical',
            desc: 'Electrical fault repair, lighting installation, distribution panels, and water heaters.'
        },
        'سباكة': {
            title: 'Plumbing',
            desc: 'Leak detection, faucet installation, pipe repairs, and full drainage setup.'
        },
        'تكييف وتبريد': {
            title: 'AC & Cooling',
            desc: 'Installation, maintenance, deep cleaning, and Freon refill for split and central ACs.'
        },
        'نجارة وأثاث': {
            title: 'Carpentry & Furniture',
            desc: 'Furniture assembly/disassembly, kitchens, bedrooms, wooden doors, and windows.'
        },
        'دهانات وديكور': {
            title: 'Painting & Decor',
            desc: 'Interior & exterior painting, wallpaper installation, and decorative finishes.'
        },
        'تنظيف المنازل': {
            title: 'Home Cleaning',
            desc: 'Deep cleaning for apartments, villas, offices, and steam carpet/sofa cleaning.'
        },
        'ألوميتال وزجاج': {
            title: 'Aluminum & Glass',
            desc: 'Installation and repair of aluminum doors, windows, screens, and modern kitchens.'
        },
        'كاميرات مراقبة': {
            title: 'CCTV & Security',
            desc: 'Installation and setup of security cameras, alarm systems, and remote mobile viewing.'
        },
        'شبكات وإنترنت': {
            title: 'Wi-Fi & Networking',
            desc: 'Indoor cabling, router configuration, and Wi-Fi signal boosting for homes.'
        },
        'مفاتيح وأقفال طوارئ': {
            title: 'Emergency Locksmith',
            desc: '24/7 non-destructive door unlocking, lock replacement, and smart lock setup.'
        },
        'مكافحة الحشرات': {
            title: 'Pest Control',
            desc: 'Safe, odorless pest & rodent elimination with certified materials and official warranty.'
        },
        'صيانة منزلية شاملة': {
            title: 'Full Home Maintenance',
            desc: 'All general repairs, appliance checks, and minor fixes in one comprehensive visit.'
        }
    };

    const PROVIDER_EN = {
        'محمد أحمد': {
            name: 'Mohamed Ahmed',
            job: 'Residential & Industrial Electrician',
            location: 'Cairo — Maadi & Nasr City',
            exp: '8 years',
            bio: 'Certified electrician with 8+ years of experience in residential wiring, panel upgrades, and emergency fault repairs backed by a 30-day warranty.',
            skills: ['Short-circuit repair', 'Distribution panels', 'LED & spotlights', '24/7 emergency switches']
        },
        'أحمد علي': {
            name: 'Ahmed Ali',
            job: 'Sanitary & Fixtures Plumber',
            location: 'Giza — Dokki & Mohandessin',
            exp: '10 years',
            bio: 'Certified plumber specializing in non-destructive leak detection, mixer & heater installation, and drainage networks.',
            skills: ['Water leak detection', 'Mixers & heaters', 'Drain unblocking', 'Water pump repair']
        },
        'محمود حسن': {
            name: 'Mahmoud Hassan',
            job: 'Furniture & Woodwork Carpenter',
            location: 'Alexandria — Smouha & Montaza',
            exp: '12 years',
            bio: 'Master carpenter with 12 years of experience assembling IKEA & bedroom furniture, wooden kitchens, and precision door/window repairs.',
            skills: ['Bedroom assembly', 'Wooden kitchens', 'Door & window repair', 'Locks & hinges']
        },
        'كريم إبراهيم': {
            name: 'Karim Ibrahim',
            job: 'AC & Freon Specialist Engineer',
            location: 'Cairo — Fifth Settlement',
            exp: '9 years',
            bio: 'HVAC specialist in servicing, high-pressure washing, and genuine Freon refilling for split, central, and inverter ACs.',
            skills: ['Genuine Freon refill', 'High-pressure AC wash', 'AC relocation', 'Inverter PCB repair']
        },
        'مصطفى الشريف': {
            name: 'Mostafa El-Sherif',
            job: 'Painting & Finishing Engineer',
            location: 'Giza — 6th of October & Zayed',
            exp: '11 years',
            bio: 'Specialist in modern Jotun paints, wallpaper, damp treatment, and spotless post-work handover.',
            skills: ['Jotun & Sipes paints', 'Wallpaper hanging', 'Damp treatment', 'Decorative finishes']
        },
        'سامح فاروق': {
            name: 'Sameh Farouk',
            job: 'Home Appliance Technician',
            location: 'Alexandria — Miami & Moharam Bek',
            exp: '7 years',
            bio: 'Certified technician for automatic washers, no-frost refrigerators, and ovens using genuine spare parts.',
            skills: ['Automatic washers', 'No-frost fridges', 'Ovens & cookers', 'Full home checkup']
        },
        'طارق سعيد': {
            name: 'Tarek Said',
            job: 'CCTV & Security Systems Engineer',
            location: 'Tanta — El-Bahr St. & El-Geelany',
            exp: '8 years',
            bio: 'Security systems engineer installing Hikvision CCTV cameras, mobile monitoring setup, and structured Wi-Fi cabling.',
            skills: ['Hikvision CCTV', 'Mobile remote view', 'Wi-Fi cabling', 'Alarms & intercoms']
        },
        'حسن رضوان': {
            name: 'Hassan Radwan',
            job: '24/7 Emergency Locksmith',
            location: 'Mansoura — El-Mashaya & University',
            exp: '10 years',
            bio: 'Locksmith specializing in damage-free unlocking, smart lock installation, and 24-hour emergency callouts.',
            skills: ['Damage-free unlock', 'Smart locks', 'Cylinder replacement', 'Key programming']
        },
        'ياسر منصور': {
            name: 'Yasser Mansour',
            job: 'Steam & Deep Home Cleaning Specialist',
            location: 'Cairo — Heliopolis & Rehab',
            exp: '6 years',
            bio: 'Specialist in deep cleaning for apartments and villas, plus steam cleaning for carpets and upholstery.',
            skills: ['Deep apartment clean', 'Steam carpet wash', 'Kitchen & bath sanitize', 'Post-renovation clean']
        },
        'وليد عبد الرحمن': {
            name: 'Walid Abdelrahman',
            job: 'Aluminum & Glass Windows Technician',
            location: 'Giza — Haram & Faisal',
            exp: '9 years',
            bio: 'Technician specializing in aluminum windows, pleated screens, hinges, and tempered glass installation.',
            skills: ['Aluminum window repair', 'Pleated screens', 'Rollers & hinges', 'Tempered glass']
        },
        'باسم عادل': {
            name: 'Bassem Adel',
            job: 'Home Wi-Fi & Networking Engineer',
            location: 'Cairo — Maadi & Zamalek',
            exp: '7 years',
            bio: 'Networking engineer solving weak Wi-Fi coverage with Mesh systems, router tuning, and Cat6 cabling.',
            skills: ['Cat6 cabling', 'Wi-Fi Mesh setup', 'Router tuning', 'Villa & office coverage']
        },
        'عادل السعيد': {
            name: 'Adel El-Said',
            job: 'Safe Pest Control Specialist',
            location: 'Alexandria — Roshdy & Sidi Gaber',
            exp: '8 years',
            bio: 'Certified pest control expert using odorless Ministry-approved treatments with a 6-month warranty.',
            skills: ['Odorless treatment', 'Ant & roach control', 'Rodent proofing', '6-month warranty']
        }
    };

    const TICKERS_EN = {
        'hero-dynamic-badge': [
            { icon: 'fa-bolt', text: 'Electrician in 15 mins' },
            { icon: 'fa-faucet-drip', text: 'Emergency plumber in 20 mins' },
            { icon: 'fa-snowflake', text: 'AC service within 30 mins' },
            { icon: 'fa-hammer', text: 'Carpenter in 25 mins' },
            { icon: 'fa-key', text: 'Locksmith in 15 mins' },
            { icon: 'fa-paint-roller', text: 'Painter available today' },
            { icon: 'fa-video', text: 'CCTV installation today' }
        ],
        'hero-dynamic-rating': [
            { icon: 'fa-star', text: '4.9 / 5 Excellent Rating' },
            { icon: 'fa-trophy', text: '15,000+ Happy Clients' },
            { icon: 'fa-comments', text: '4,800+ Five-Star Reviews' },
            { icon: 'fa-award', text: 'Top Home Platform 2026' },
            { icon: 'fa-thumbs-up', text: '99% Client Satisfaction' }
        ],
        'hero-dynamic-trust': [
            { icon: 'fa-shield-halved', text: 'National-ID Verified Pro' },
            { icon: 'fa-certificate', text: 'Official 30-Day Warranty' },
            { icon: 'fa-credit-card', text: 'Pay Cash or Card Securely' },
            { icon: 'fa-user-shield', text: '100% Background Checked' },
            { icon: 'fa-tag', text: 'Transparent Fixed Pricing' }
        ]
    };

    const TICKERS_AR = {
        'hero-dynamic-badge': [
            { icon: 'fa-bolt', text: 'كهربائي خلال 15 دقيقة' },
            { icon: 'fa-faucet-drip', text: 'سباك طوارئ خلال 20 دقيقة' },
            { icon: 'fa-snowflake', text: 'صيانة تكييف خلال 30 دقيقة' },
            { icon: 'fa-hammer', text: 'نجار أثاث خلال 25 دقيقة' },
            { icon: 'fa-key', text: 'فتح أقفال خلال 15 دقيقة' },
            { icon: 'fa-paint-roller', text: 'فني دهانات وديكور اليوم' },
            { icon: 'fa-video', text: 'تركيب كاميرات مراقبة' }
        ],
        'hero-dynamic-rating': [
            { icon: 'fa-star', text: '4.9 من 5 تقييم ممتازة' },
            { icon: 'fa-trophy', text: '15,000+ عميل سعيد' },
            { icon: 'fa-comments', text: '+4,800 تقييم 5 نجوم' },
            { icon: 'fa-award', text: 'أفضل منصة صيانة 2026' },
            { icon: 'fa-thumbs-up', text: '99% نسبة رضا العملاء' }
        ],
        'hero-dynamic-trust': [
            { icon: 'fa-shield-halved', text: 'فني موثق بالهوية' },
            { icon: 'fa-certificate', text: 'ضمان رسمي 30 يوماً' },
            { icon: 'fa-credit-card', text: 'دفع آمن بالفيزا أو نقداً' },
            { icon: 'fa-user-shield', text: 'فحص جنائي معتمد 100%' },
            { icon: 'fa-tag', text: 'أسعار شفافة بدون زيادة' }
        ]
    };

    const TAG_EN = {
        'كهرباء': 'Electrical',
        'سباكة': 'Plumbing',
        'نجارة وأثاث': 'Carpentry',
        'تكييف': 'AC Service',
        'دهانات': 'Painting',
        'كاميرات': 'CCTV',
        'أقفال وطوارئ': 'Locksmith',
        'صيانة أجهزة': 'Appliances',
        'تنظيف منازل': 'Cleaning',
        'ألوميتال وزجاج': 'Aluminum',
        'شبكات وإنترنت': 'Networking',
        'مكافحة حشرات': 'Pest Control',
        'صيانة شاملة': 'Maintenance',
        'صيانة تكييفات': 'AC Care',
        'تجربة عميل': 'Client Review'
    };

    function getLang() {
        try {
            return localStorage.getItem('fixora_lang') === 'en' ? 'en' : 'ar';
        } catch {
            return 'ar';
        }
    }

    function t(key, lang = getLang()) {
        const dict = UI_STRINGS[lang] || UI_STRINGS.ar;
        return dict[key] !== undefined ? dict[key] : (UI_STRINGS.ar[key] || key);
    }

    function translateCity(city, lang = getLang()) {
        if (!city) return '';
        if (lang !== 'en') return city;
        return CITY_EN[city] || city;
    }

    function translateServiceTitle(title, lang = getLang()) {
        if (!title) return '';
        if (lang !== 'en') return title;
        return (SERVICE_EN[title] && SERVICE_EN[title].title) || title;
    }

    function translateServiceDesc(title, fallbackDesc, lang = getLang()) {
        if (lang !== 'en') return fallbackDesc;
        return (SERVICE_EN[title] && SERVICE_EN[title].desc) || fallbackDesc;
    }

    function translateProvider(provider, lang = getLang()) {
        if (lang !== 'en') {
            return {
                fullname: provider.fullname,
                jobTitle: provider.jobTitle || '',
                location: provider.location || provider.city || '',
                experience: provider.experience || '',
                bio: provider.bio || '',
                skills: Array.isArray(provider.skills) ? provider.skills : []
            };
        }
        const mapped = PROVIDER_EN[provider.fullname];
        if (!mapped) {
            return {
                fullname: provider.fullname,
                jobTitle: provider.jobTitle || '',
                location: translateCity(provider.city || '', 'en'),
                experience: provider.experience || '',
                bio: provider.bio || '',
                skills: Array.isArray(provider.skills) ? provider.skills : []
            };
        }
        return {
            fullname: mapped.name,
            jobTitle: mapped.job,
            location: mapped.location,
            experience: mapped.exp,
            bio: mapped.bio,
            skills: mapped.skills
        };
    }

    function translateReviewTag(tag, lang = getLang()) {
        if (lang !== 'en') return tag;
        return TAG_EN[tag] || tag;
    }

    function getGovernoratePricing(city, list = GOVERNORATES) {
        const clean = String(city || '').trim();
        const items = Array.isArray(list) && list.length ? list : GOVERNORATES;
        if (!clean) return items[0];
        const lower = clean.toLowerCase();
        return items.find(
            (g) => g.key === clean || g.nameAr === clean || (g.nameEn && g.nameEn.toLowerCase() === lower)
        ) || items[0];
    }

    function applyGovernoratePrice(basePrice, city, list = GOVERNORATES) {
        const numeric = Number(basePrice);
        const safeBase = Number.isFinite(numeric) && numeric > 0 ? numeric : 200;
        const gov = getGovernoratePricing(city, list);
        return Math.max(50, Math.round(safeBase * gov.multiplier));
    }

    function resolveSpecialty(input, fallbackSkills = []) {
        const raw = String(input || '').trim();
        if (raw) {
            const lower = raw.toLowerCase();
            const exact = SPECIALTIES.find(
                (s) => s.key === raw || s.nameAr === raw || s.nameEn.toLowerCase() === lower
            );
            if (exact) return exact.key;
            for (const s of SPECIALTIES) {
                if (s.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
                    return s.key;
                }
            }
        }
        if (Array.isArray(fallbackSkills)) {
            for (const skill of fallbackSkills) {
                const resolved = resolveSpecialty(skill, []);
                if (resolved) return resolved;
            }
        }
        return '';
    }

    function getProviderSpecialty(provider) {
        if (!provider) return '';
        const explicit = resolveSpecialty(provider.specialty || '');
        if (explicit) return explicit;
        const byJob = resolveSpecialty(provider.jobTitle || '');
        if (byJob) return byJob;
        return resolveSpecialty('', Array.isArray(provider.skills) ? provider.skills : []);
    }

    global.FixoraI18n = {
        UI_STRINGS,
        GOVERNORATES,
        SPECIALTIES,
        TICKERS_EN,
        TICKERS_AR,
        getLang,
        t,
        translateCity,
        translateServiceTitle,
        translateServiceDesc,
        translateProvider,
        translateReviewTag,
        getGovernoratePricing,
        applyGovernoratePrice,
        resolveSpecialty,
        getProviderSpecialty
    };
})(window);
