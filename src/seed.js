const { db } = require('./db');

const INITIAL_SERVICES = [
  {
    title: 'كهرباء',
    category: 'كهرباء',
    description: 'إصلاح الأعطال الكهربائية، تركيب الإضاءة، اللوحات الكهربائية وسخانات المياه.',
    icon_class: 'fa-solid fa-bolt',
    base_price: 200,
    sort_order: 1
  },
  {
    title: 'سباكة',
    category: 'سباكة',
    description: 'تسريب المياه، تركيب الخلاطات، إصلاح المواسير وتأسيس الصرف الصحي.',
    icon_class: 'fa-solid fa-faucet-drip',
    base_price: 220,
    sort_order: 2
  },
  {
    title: 'تكييف وتبريد',
    category: 'تكييف',
    description: 'تركيب وصيانة وغسيل وشحن فريون لجميع أنواع التكييفات السبلت والمركزية.',
    icon_class: 'fa-solid fa-snowflake',
    base_price: 350,
    sort_order: 3
  },
  {
    title: 'نجارة وأثاث',
    category: 'تشطيبات',
    description: 'فك وتركيب الأثاث، المطابخ، تصليح غرف النوم والأبواب والشبابيك الخشبية.',
    icon_class: 'fa-solid fa-hammer',
    base_price: 250,
    sort_order: 4
  },
  {
    title: 'دهانات وديكور',
    category: 'تشطيبات',
    description: 'دهانات داخلية وخارجية، تركيب ورق حائط، وتشطيبات ديكورية احترافية.',
    icon_class: 'fa-solid fa-paint-roller',
    base_price: 400,
    sort_order: 5
  },
  {
    title: 'تنظيف المنازل',
    category: 'تنظيف',
    description: 'تنظيف شامل للمنازل، الشقق، الفلل، المكاتب وتنظيف السجاد والإنتريهات بالبخار.',
    icon_class: 'fa-solid fa-house',
    base_price: 350,
    sort_order: 6
  },
  {
    title: 'ألوميتال وزجاج',
    category: 'تشطيبات',
    description: 'تركيب وصيانة أبواب وشبابيك الألوميتال وشبكات السلك والمطابخ الحديثة.',
    icon_class: 'fa-solid fa-door-open',
    base_price: 250,
    sort_order: 7
  },
  {
    title: 'كاميرات مراقبة',
    category: 'تنظيف',
    description: 'تركيب وبرمجة كاميرات المراقبة وأنظمة الحماية وأجهزة الإنذار للمنازل والمحلات.',
    icon_class: 'fa-solid fa-video',
    base_price: 300,
    sort_order: 8
  },
  {
    title: 'شبكات وإنترنت',
    category: 'تنظيف',
    description: 'تمديد شبكات الداخلي، إعداد أجهزة الراوتر وتقوية إشارة الواي فاي للمنازل.',
    icon_class: 'fa-solid fa-wifi',
    base_price: 250,
    sort_order: 9
  },
  {
    title: 'مفاتيح وأقفال طوارئ',
    category: 'سباكة',
    description: 'فتح الأبواب المغلقة، تغيير الأقفال وتأمين الأبواب على مدار 24 ساعة طوال الأسبوع.',
    icon_class: 'fa-solid fa-key',
    base_price: 300,
    sort_order: 10
  },
  {
    title: 'مكافحة الحشرات',
    category: 'تنظيف',
    description: 'إبادة الحشرات والقوارض باستخدام مواد آمنة ومعتمدة مع تقديم ضمان رسمي.',
    icon_class: 'fa-solid fa-broom',
    base_price: 450,
    sort_order: 11
  },
  {
    title: 'صيانة منزلية شاملة',
    category: 'كهرباء',
    description: 'جميع أعمال الصيانة وتركيبات الأجهزة والتسريبات في زيارة فحص واحدة متكاملة.',
    icon_class: 'fa-solid fa-screwdriver-wrench',
    base_price: 250,
    sort_order: 12
  }
];

const INITIAL_PROVIDERS = [
  {
    fullname: 'محمد أحمد',
    job_title: 'كهربائي منازل ومصانع',
    city: 'القاهرة',
    location_text: 'القاهرة — المعادي ومدينة نصر',
    avatar: 'images/provider-1.webp',
    experience: '8 سنوات',
    price: 200,
    rating: 4.9,
    reviews_count: 327,
    is_available: 1,
    bio: 'فني كهرباء معتمد خبرة أكثر من 8 سنوات في كافة أعمال تأسيس وتصليح الأعطال المنزلية والشركات والتمديدات المعقدة مع ضمان كامل على الصيانة.',
    skills: ['إصلاح شورت الكهرباء', 'تركيب لوحات التوزيع', 'تركيب السبوت لايت والليد', 'صيانة مفاتيح وطوارئ 24س'],
    sort_order: 1
  },
  {
    fullname: 'أحمد علي',
    job_title: 'سباك صحي وخلاطات',
    city: 'الجيزة',
    location_text: 'الجيزة — الدقي والمهندسين',
    avatar: 'images/provider-2.webp',
    experience: '10 سنوات',
    price: 220,
    rating: 4.8,
    reviews_count: 291,
    is_available: 0,
    bio: 'فني سباكة معتمد متخصص في كشف تسربات المياه بدون تكسير، تركيب الخلاطات والأطقم الصحية، وتأسيس شبكات الصرف والتغذية.',
    skills: ['كشف تسربات المياه', 'تركيب خلاطات وسخانات', 'تسليك الصرف الصحي', 'صيانة مواتير المياه'],
    sort_order: 2
  },
  {
    fullname: 'محمود حسن',
    job_title: 'نجار تركيب وصيانة أثاث',
    city: 'الإسكندرية',
    location_text: 'الإسكندرية — سموحة والمنتزه',
    avatar: 'images/provider-3.webp',
    experience: '12 سنة',
    price: 250,
    rating: 5.0,
    reviews_count: 410,
    is_available: 1,
    bio: 'نجار محترف خبرة 12 عاماً في فك وتركيب أثاث ايكيا والغرف والمطابخ، وإصلاح الأبواب والشبابيك الخشبية بدقة عالية دون خدوش.',
    skills: ['فك وتركيب غرف النوم', 'تركيب مطابخ خشب', 'تصليح أبواب وشبابيك', 'تركيب كوالين ومفصلات'],
    sort_order: 3
  },
  {
    fullname: 'كريم إبراهيم',
    job_title: 'مهندس تكييفات وشحن فريون',
    city: 'القاهرة',
    location_text: 'القاهرة — التجمع الخامس',
    avatar: 'images/provider-4.webp',
    experience: '9 سنوات',
    price: 350,
    rating: 4.9,
    reviews_count: 380,
    is_available: 1,
    bio: 'مهندس تبريد وتكييف متخصص في صيانة وغسيل وشحن فريون أجهزة السبليت والمركزي والإنفرتر بأحدث أجهزة القياس.',
    skills: ['شحن فريون أصلي', 'غسيل تكييف بالضغط', 'فك ونقل تكييف', 'إصلاح أعطال الكارتة'],
    sort_order: 4
  },
  {
    fullname: 'مصطفى الشريف',
    job_title: 'مهندس دهانات وتشطيبات',
    city: 'الجيزة',
    location_text: 'الجيزة — 6 أكتوبر والشيخ زايد',
    avatar: 'images/provider-5.webp',
    experience: '11 سنة',
    price: 400,
    rating: 4.8,
    reviews_count: 215,
    is_available: 1,
    bio: 'متخصص في الدهانات الحديثة وورق الحائط ومعالجة الرطوبة والشروخ بأفضل الخامات مع تسليم المكان نظيفاً تماماً.',
    skills: ['دهانات جوتن وسايبس', 'تركيب ورق حائط', 'معالجة رطوبة الحوائط', 'ديكورات قطيفة وبديل رخام'],
    sort_order: 5
  },
  {
    fullname: 'سامح فاروق',
    job_title: 'فني صيانة أجهزة منزلية',
    city: 'الإسكندرية',
    location_text: 'الإسكندرية — ميامي ومحرم بك',
    avatar: 'images/provider-6.webp',
    experience: '7 سنوات',
    price: 250,
    rating: 4.7,
    reviews_count: 189,
    is_available: 0,
    bio: 'فني صيانة معتمد للغسالات الأوتوماتيك والثلاجات والبوتاجازات في المنزل بقطع غيار أصلية وضمان معتمد.',
    skills: ['صيانة غسالات أوتوماتيك', 'صيانة ثلاجات نوفروست', 'إصلاح بوتاجازات وأفران', 'فحص منزلي شامل'],
    sort_order: 6
  },
  {
    fullname: 'طارق سعيد',
    job_title: 'مهندس كاميرات مراقبة وأنظمة أمنية',
    city: 'طنطا',
    location_text: 'طنطا — شارع البحر والجيلاني',
    avatar: 'images/provider-7.webp',
    experience: '8 سنوات',
    price: 300,
    rating: 4.9,
    reviews_count: 165,
    is_available: 1,
    bio: 'مهندس أنظمة أمنية وكاميرات مراقبة للمنازل والمحلات مع برمجة المتابعة المباشرة من الهاتف وتمديد شبكات الإنترنت.',
    skills: ['تركيب كاميرات Hikvision', 'ربط الكاميرات بالموبايل', 'تمديد شبكات Wi-Fi', 'أنظمة إنذار وإنتركم'],
    sort_order: 7
  },
  {
    fullname: 'حسن رضوان',
    job_title: 'فني أقفال وطوارئ 24س',
    city: 'المنصورة',
    location_text: 'المنصورة — المشاية والجامعة',
    avatar: 'images/provider-8.webp',
    experience: '10 سنوات',
    price: 300,
    rating: 5.0,
    reviews_count: 240,
    is_available: 1,
    bio: 'فني متخصص في فتح الأبواب المغلقة بدون تلف، تغيير الكوالين والأقفال الذكية، وخدمات الطوارئ السريعة على مدار الساعة.',
    skills: ['فتح أبواب مصفحة بدون كسر', 'تركيب أقفال ذكية', 'تغيير قلب كالون', 'نسخ وبرمجة مفاتيح'],
    sort_order: 8
  }
];

const INITIAL_REVIEWS = [
  {
    author_name: 'سارة محمد',
    city: 'المعادي، القاهرة',
    rating: 5.0,
    comment: 'طلبنا كهربائي صيانة طوارئ والباشمهندس محمد أحمد وصل في أقل من 20 دقيقة، غيّر اللوحة وفحص شورت التوزيع باحترافية وأسلوب راقي جداً.',
    tag: 'كهرباء',
    display_date: 'منذ يومين'
  },
  {
    author_name: 'عمر خالد',
    city: 'الدقي، الجيزة',
    rating: 5.0,
    comment: 'أفضل منصة استخدمتها للسباكة. الفني أحمد علي كان أمين ومحترف جداً والأسعار شفافة بدون أي زيادة والتقرير الفني وصلني على الموبايل.',
    tag: 'سباكة',
    display_date: 'منذ 3 أيام'
  },
  {
    author_name: 'منى أحمد',
    city: 'سموحة، الإسكندرية',
    rating: 5.0,
    comment: 'النجار محمود حسن فك وركب غرفتين نوم ومطبخ بكل دقة وبدون أي خدش. التزام تام بالمواعيد وسرعة في الإنجاز. تجربة ممتازة 100%.',
    tag: 'نجارة وأثاث',
    display_date: 'منذ أسبوع'
  },
  {
    author_name: 'م. هاني سعيد',
    city: 'التجمع الخامس، القاهرة',
    rating: 5.0,
    comment: 'فني التكييف كريم إبراهيم قام بعمل غسيل شامل وشحن فريون للتكييفات والنتيجة ممتازة، التبريد رجع زي الجديد بالضبط والأسعار مناسبة جداً.',
    tag: 'تكييف',
    display_date: 'منذ 4 أيام'
  },
  {
    author_name: 'د. رانيا يوسف',
    city: '6 أكتوبر، الجيزة',
    rating: 5.0,
    comment: 'مصطفى الشريف وفريقه أنجزوا دهان الشقة في وقت قياسي وبخامات ممتازة ونظافة تامة بعد انتهاء الشغل. شكراً لمنصة Fixora على الجودة.',
    tag: 'دهانات',
    display_date: 'منذ 5 أيام'
  },
  {
    author_name: 'أحمد عبد الفتاح',
    city: 'شارع البحر، طنطا',
    rating: 5.0,
    comment: 'تركيب أنظمة كاميرات المراقبة للمحل تم باحترافية عالية جداً مع ربطها بالموبايل وشرح التطبيق ببساطة. الفني طارق سعيد قمة في الأخلاق.',
    tag: 'كاميرات',
    display_date: 'منذ 6 أيام'
  },
  {
    author_name: 'ياسمين حسن',
    city: 'المشاية، المنصورة',
    rating: 5.0,
    comment: 'انقفل الباب عليا والأقفال اتعطلت بالليل، الفني حسن رضوان وصل بسرعة وفتح الباب بدون كسر أو تلف للقفل، خدمة طوارئ ممتازة 10/10.',
    tag: 'أقفال وطوارئ',
    display_date: 'منذ يوم واحد'
  },
  {
    author_name: 'خالد إبراهيم',
    city: 'ميامي، الإسكندرية',
    rating: 5.0,
    comment: 'صيانة الغسالة والأجهزة المنزلية تمت في المنزل بقطع غيار أصلية مع تقديم شهادة ضمان معتمدة لمدة شهرين. منصة موثوقة وننصح بها.',
    tag: 'صيانة أجهزة',
    display_date: 'منذ 3 أيام'
  },
  {
    author_name: 'نورهان الشريف',
    city: 'مدينة نصر، القاهرة',
    rating: 5.0,
    comment: 'فريق التنظيف بالبخار وصل في الموعد والنتيجة كانت مذهلة، السجاد والإنتريه رجعوا كأنهم جداد تماماً وبدون أي مواد كيميائية ضارة.',
    tag: 'تنظيف منازل',
    display_date: 'منذ يومين'
  },
  {
    author_name: 'م. طارق عبد المجيد',
    city: 'المهندسين، الجيزة',
    rating: 5.0,
    comment: 'صيانة وشبكات السلك الألوميتال للشبابيك اتعملت بدقة متناهية وبأسعار معقولة جداً والتزام كامل بالمواعيد المتفق عليها.',
    tag: 'ألوميتال وزجاج',
    display_date: 'منذ 4 أيام'
  },
  {
    author_name: 'إيمان الفاروق',
    city: 'المنتزه، الإسكندرية',
    rating: 5.0,
    comment: 'فني الشبكات جهز شبكة الواي فاي وقواها في كل أدوار البيت والسرعة بقت ممتازة وتمديدات الأسلاك مخفية ومظهرها مرتب.',
    tag: 'شبكات وإنترنت',
    display_date: 'منذ 5 أيام'
  },
  {
    author_name: 'إسلام عادل',
    city: 'الشروق، القاهرة',
    rating: 5.0,
    comment: 'خدمة إبادة الحشرات كانت آمنة جداً بدون رائحة ومع تقديم شهادة ضمان رسمي لمدة 6 شهور، تجربة مريحة جداً شكراً فكسورا.',
    tag: 'مكافحة حشرات',
    display_date: 'منذ أسبوع'
  },
  {
    author_name: 'شيماء رضوان',
    city: 'الجيلاني، طنطا',
    rating: 5.0,
    comment: 'طلبنا فحص شامل للكهرباء والسباكة قبل الانتقال للشقة الجديدة والفحص كان دقيق وفادنا جداً في صيانة كل الأعطال المخفية.',
    tag: 'صيانة شاملة',
    display_date: 'منذ 3 أيام'
  },
  {
    author_name: 'م. حسن توفيق',
    city: 'الجامعة، المنصورة',
    rating: 5.0,
    comment: 'خدمة ممتازة وفنيين محترفين ومعتمدين، التعامل راقي جداً والتطبيق بيوفر وقت وجهد كبير، ننصح بها بكل قوة لجميع الخدمات.',
    tag: 'صيانة تكييفات',
    display_date: 'منذ يومين'
  }
];

function seed(database = db) {
  const serviceCount = database.prepare('SELECT COUNT(*) AS cnt FROM services').get().cnt;
  if (serviceCount === 0) {
    const stmt = database.prepare(
      'INSERT INTO services (title, category, description, icon_class, base_price, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const s of INITIAL_SERVICES) {
      stmt.run(s.title, s.category, s.description, s.icon_class, s.base_price, s.sort_order);
    }
  } else {
    const updateServicePrice = database.prepare('UPDATE services SET base_price = ? WHERE title = ?');
    for (const s of INITIAL_SERVICES) {
      updateServicePrice.run(s.base_price, s.title);
    }
  }

  const providerCount = database.prepare('SELECT COUNT(*) AS cnt FROM providers').get().cnt;
  if (providerCount === 0) {
    const stmt = database.prepare(
      'INSERT INTO providers (fullname, job_title, city, location_text, avatar, experience, price, rating, reviews_count, is_available, bio, skills_json, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const p of INITIAL_PROVIDERS) {
      stmt.run(
        p.fullname,
        p.job_title,
        p.city,
        p.location_text,
        p.avatar,
        p.experience,
        p.price,
        p.rating,
        p.reviews_count,
        p.is_available,
        p.bio,
        JSON.stringify(p.skills),
        p.sort_order
      );
    }
  } else {
    const updateProviderPrice = database.prepare('UPDATE providers SET price = ? WHERE fullname = ? AND user_id IS NULL');
    for (const p of INITIAL_PROVIDERS) {
      updateProviderPrice.run(p.price, p.fullname);
    }
  }

  const reviewCount = database.prepare('SELECT COUNT(*) AS cnt FROM reviews').get().cnt;
  if (reviewCount === 0) {
    const stmt = database.prepare(
      'INSERT INTO reviews (author_name, city, rating, comment, tag, display_date) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const r of INITIAL_REVIEWS) {
      stmt.run(r.author_name, r.city, r.rating, r.comment, r.tag, r.display_date);
    }
  }

  const { hashPassword } = require('./utils');
  const demoPassHash = hashPassword('123456');

  let demoClient = database.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get('client@fixora.eg');
  if (!demoClient) {
    const clientRes = database
      .prepare(
        'INSERT INTO users (fullname, email, phone, password_hash, role, city, address, bio, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .run(
        'سارة أحمد',
        'client@fixora.eg',
        '01011112222',
        demoPassHash,
        'CLIENT',
        'القاهرة',
        'المعادي، شارع 9، عمارة 14',
        'يفضل التواصل صباحاً قبل موعد الزيارة',
        'ACTIVE'
      );
    demoClient = { id: Number(clientRes.lastInsertRowid) };
  }

  let demoProvider = database.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get('pro@fixora.eg');
  if (!demoProvider) {
    const providerRes = database
      .prepare(
        'INSERT INTO users (fullname, email, phone, password_hash, role, city, job_title, address, bio, is_available, service_price, experience, skills_json, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .run(
        'محمد أحمد',
        'pro@fixora.eg',
        '01033334444',
        demoPassHash,
        'PROVIDER',
        'القاهرة',
        'كهربائي منازل ومصانع',
        'مدينة نصر، القاهرة',
        'فني كهرباء معتمد خبرة أكثر من 8 سنوات في كافة أعمال تأسيس وتصليح الأعطال المنزلية.',
        1,
        200,
        '8 سنوات',
        JSON.stringify(['إصلاح شورت الكهرباء', 'تركيب لوحات التوزيع', 'تركيب السبوت لايت والليد']),
        'ACTIVE'
      );
    demoProvider = { id: Number(providerRes.lastInsertRowid) };
  }

  database
    .prepare('UPDATE providers SET user_id = ? WHERE fullname = ? AND user_id IS NULL')
    .run(demoProvider.id, 'محمد أحمد');

  const reqCount = database.prepare('SELECT COUNT(*) AS cnt FROM service_requests').get().cnt;
  if (reqCount === 0) {
    const insertReq = database.prepare(
      'INSERT INTO service_requests (user_id, provider_user_id, client_name, client_phone, client_email, service_title, provider_name, city, address, scheduled_at, notes, estimated_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    insertReq.run(
      demoClient.id,
      null,
      'سارة أحمد',
      '01011112222',
      'client@fixora.eg',
      'كهرباء',
      null,
      'القاهرة',
      'المعادي، شارع 9، عمارة 14',
      '2026-11-16T11:00',
      'فحص مفتاح التكييف ولوحة التوزيع الرئيسية',
      200,
      'NEW'
    );
    insertReq.run(
      demoClient.id,
      demoProvider.id,
      'سارة أحمد',
      '01011112222',
      'client@fixora.eg',
      'سباكة',
      'محمد أحمد',
      'الجيزة',
      'الدقي، شارع التحرير، عمارة 7',
      '2026-11-17T14:00',
      'تركيب خلاط مطبخ وفحص وصلات السخان',
      231,
      'PENDING'
    );
    insertReq.run(
      null,
      null,
      'خالد محمود',
      '01099887766',
      null,
      'تكييف وتبريد',
      null,
      'طنطا',
      'شارع البحر، أمام جامعة طنطا',
      '2026-11-18T12:30',
      'تنظيف تكييف سبليت وشحن فريون',
      280,
      'NEW'
    );
  }
}

if (require.main === module) {
  seed();
  console.log('[Fixora] Database seeded successfully.');
}

module.exports = seed;
module.exports.INITIAL_SERVICES = INITIAL_SERVICES;
module.exports.INITIAL_PROVIDERS = INITIAL_PROVIDERS;
module.exports.INITIAL_REVIEWS = INITIAL_REVIEWS;
