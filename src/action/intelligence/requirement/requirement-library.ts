import { getActionType } from "../../domain/action.js";
import type {
  LocalizedText,
  RequirementMissingQuestion,
  RequirementProfile,
} from "./types.js";

function text(en: string, ar: string): LocalizedText {
  return { en, ar };
}

function question(
  en: string,
  ar: string,
  absentSignals: { en: string[]; ar: string[] }
): RequirementMissingQuestion {
  return { text: text(en, ar), absentSignals };
}

export const REQUIREMENT_PROFILE_LIBRARY: RequirementProfile[] = [
  {
    id: "accountant",
    professionHintAliases: ["accountant", "bookkeeper", "محاسب", "محاسبة"],
    keywords: {
      en: [
        "accountant",
        "accounting",
        "bookkeeping",
        "audit",
        "financial report",
        "tax",
        "invoices",
        "ledger",
        "reconcile",
      ],
      ar: ["محاسب", "محاسبة", "حسابات", "مراجعة", "تقرير", "ميزانية", "ضرائب", "فواتير", "دفاتر"],
    },
    suggestedActions: [
      {
        actionCode: "C.1.2",
        reason: text(
          "Financial records review and operational reporting fit operations advisory.",
          "مراجعة السجلات المالية وإعداد التقارير ضمن الاستشارات التشغيلية."
        ),
      },
    ],
    deliverables: [
      {
        title: text("Financial review report", "تقرير مراجعة مالية"),
        description: text(
          "Summary of findings, reconciliations, and recommended adjustments.",
          "ملخص النتائج والتسويات والتعديلات الموصى بها."
        ),
      },
      {
        title: text("Reconciliation worksheet", "جدول تسوية"),
        description: text(
          "Line-by-line reconciliation of accounts or invoice batches.",
          "تسوية تفصيلية للحسابات أو دفعات الفواتير."
        ),
      },
    ],
    milestones: [
      {
        title: text("Scope confirmation", "تأكيد النطاق"),
        acceptanceCriteria: [
          text("Financial period and file count agreed", "تحديد الفترة المالية وعدد الملفات"),
          text("Access to source records confirmed", "تأكيد توفر السجلات المصدرية"),
        ],
      },
      {
        title: text("Review completion", "إكمال المراجعة"),
        acceptanceCriteria: [
          text("Review report delivered", "تسليم تقرير المراجعة"),
          text("Open items list documented", "توثيق قائمة البنود المفتوحة"),
        ],
      },
    ],
    missingQuestions: [
      question(
        "How many invoices or files need to be reviewed?",
        "كم عدد الفواتير أو الملفات المطلوب مراجعتها؟",
        {
          en: ["invoice", "invoices", "file", "files", "document", "records"],
          ar: ["فاتورة", "فواتير", "ملف", "ملفات", "سجل", "سجلات"],
        }
      ),
      question(
        "What financial period is required?",
        "ما الفترة المالية المطلوبة؟",
        {
          en: ["q1", "q2", "q3", "q4", "quarter", "fiscal", "year", "month", "2024", "2025", "2026"],
          ar: ["سنة", "شهر", "ربع", "فترة", "2024", "2025", "2026"],
        }
      ),
    ],
  },
  {
    id: "lawyer",
    professionHintAliases: ["lawyer", "attorney", "legal counsel", "محامي", "محام"],
    keywords: {
      en: [
        "lawyer",
        "attorney",
        "legal",
        "contract review",
        "litigation",
        "counsel",
        "agreement",
        "compliance",
      ],
      ar: ["محامي", "قانوني", "عقد", "اتفاق", "استشارة قانونية", "مراجعة", "دعوى", "امتثال"],
    },
    suggestedActions: [
      {
        actionCode: "C.1.1",
        reason: text(
          "Legal analysis and contract guidance align with strategy consulting engagements.",
          "التحليل القانوني وتوجيه العقود ضمن الاستشارات الاستراتيجية."
        ),
      },
    ],
    deliverables: [
      {
        title: text("Legal review memo", "مذكرة مراجعة قانونية"),
        description: text(
          "Risk summary, clause notes, and recommended revisions.",
          "ملخص المخاطر وملاحظات البنود والتعديلات الموصى بها."
        ),
      },
      {
        title: text("Redlined agreement", "اتفاقية مع تعديلات"),
        description: text(
          "Marked-up contract reflecting negotiated or suggested changes.",
          "نسخة العقد مع التعديلات المقترحة أو المتفق عليها."
        ),
      },
    ],
    milestones: [
      {
        title: text("Document intake", "استلام المستندات"),
        acceptanceCriteria: [
          text("Governing jurisdiction identified", "تحديد الاختصاص القانوني"),
          text("Source documents received", "استلام المستندات المصدرية"),
        ],
      },
      {
        title: text("Advisory delivery", "تسليم الاستشارة"),
        acceptanceCriteria: [
          text("Legal memo delivered", "تسليم المذكرة القانونية"),
          text("Critical risks highlighted", "إبراز المخاطر الجوهرية"),
        ],
      },
    ],
    missingQuestions: [
      question(
        "Which jurisdiction or governing law applies?",
        "ما الاختصاص أو النظام القانوني المعتمد؟",
        {
          en: ["jurisdiction", "governing law", "uae", "saudi", "ksa", "gcc"],
          ar: ["اختصاص", "نظام", "قانون", "الإمارات", "السعودية", "الخليج"],
        }
      ),
      question(
        "What is the document type and deadline?",
        "ما نوع المستند والموعد النهائي؟",
        {
          en: ["deadline", "due date", "by ", "before ", "contract", "agreement", "nda"],
          ar: ["موعد", "deadline", "عقد", "اتفاق", "nda", "سرية"],
        }
      ),
    ],
  },
  {
    id: "software_developer",
    professionHintAliases: ["software developer", "developer", "engineer", "مطور", "مبرمج"],
    keywords: {
      en: [
        "software",
        "developer",
        "application",
        "website",
        "api",
        "backend",
        "mobile app",
        "integration",
        "bug fix",
      ],
      ar: ["مطور", "برمجيات", "تطبيق", "موقع", "واجهة", "api", "backend", "mobile", "تكامل"],
    },
    suggestedActions: [
      {
        actionCode: "E.3.1",
        reason: text(
          "Custom build or feature delivery maps to software development.",
          "بناء مخصص أو تسليم ميزة يندرج تحت تطوير البرمجيات."
        ),
      },
      {
        actionCode: "B.3.3",
        reason: text(
          "Diagnostics or defect resolution maps to technical troubleshooting.",
          "التشخيص أو إصلاح العيوب يندرج تحت استكشاف الأعطال التقنية."
        ),
      },
    ],
    deliverables: [
      {
        title: text("Working feature or module", "ميزة أو وحدة عاملة"),
        description: text(
          "Deployed or demo-ready implementation matching agreed scope.",
          "تنفيذ جاهز للعرض أو النشر وفق النطاق المتفق عليه."
        ),
      },
      {
        title: text("Technical handover notes", "ملاحظات تسليم تقنية"),
        description: text(
          "Setup steps, dependencies, and known limitations documented.",
          "توثيق خطوات الإعداد والاعتماديات والقيود المعروفة."
        ),
      },
    ],
    milestones: [
      {
        title: text("Requirements lock", "تثبيت المتطلبات"),
        acceptanceCriteria: [
          text("Scope and acceptance tests agreed", "الاتفاق على النطاق واختبارات القبول"),
          text("Environment access confirmed", "تأكيد الوصول للبيئة"),
        ],
      },
      {
        title: text("Delivery and verification", "التسليم والتحقق"),
        acceptanceCriteria: [
          text("Feature passes agreed tests", "اجتياز الميزة للاختبارات المتفق عليها"),
          text("Handover documentation provided", "توفير وثائق التسليم"),
        ],
      },
    ],
    missingQuestions: [
      question(
        "What platform or stack should be used?",
        "ما المنصة أو التقنية المطلوبة؟",
        {
          en: ["react", "node", "typescript", "python", "ios", "android", "web", "mobile"],
          ar: ["react", "node", "typescript", "python", "ios", "android", "ويب", "موبايل"],
        }
      ),
      question(
        "What is the target delivery date?",
        "ما موعد التسليم المستهدف؟",
        {
          en: ["deadline", "due", "by ", "week", "month", "sprint"],
          ar: ["موعد", "deadline", "أسبوع", "شهر", "sprint"],
        }
      ),
    ],
  },
  {
    id: "graphic_designer",
    professionHintAliases: ["graphic designer", "designer", "مصمم"],
    keywords: {
      en: ["design", "designer", "logo", "brand", "visual", "illustration", "brochure", "identity"],
      ar: ["تصميم", "مصمم", "شعار", "هوية", "جرافيك", "بروشور", "مرئيات"],
    },
    suggestedActions: [
      {
        actionCode: "E.1.1",
        reason: text(
          "Brand and visual asset creation maps to graphic design.",
          "إنشاء الهوية والأصول المرئية يندرج تحت التصميم الجرافيكي."
        ),
      },
    ],
    deliverables: [
      {
        title: text("Design source files", "ملفات التصميم المصدرية"),
        description: text(
          "Editable assets in agreed formats (e.g. SVG, PDF, Figma).",
          "أصول قابلة للتعديل بالصيغ المتفق عليها."
        ),
      },
      {
        title: text("Brand asset package", "حزمة أصول الهوية"),
        description: text(
          "Logo variants, color palette, and usage guidelines.",
          "نسخ الشعار ولوحة الألوان وإرشادات الاستخدام."
        ),
      },
    ],
    milestones: [
      {
        title: text("Concept approval", "اعتماد المفهوم"),
        acceptanceCriteria: [
          text("Mood board or draft concepts approved", "اعتماد لوحة المزاج أو المسودات"),
          text("Brand direction confirmed", "تأكيد اتجاه الهوية"),
        ],
      },
      {
        title: text("Final delivery", "التسليم النهائي"),
        acceptanceCriteria: [
          text("Final files exported in agreed formats", "تصدير الملفات النهائية بالصيغ المتفق عليها"),
          text("Revision round completed", "إكمال جولة التعديلات"),
        ],
      },
    ],
    missingQuestions: [
      question(
        "What deliverable formats are required?",
        "ما صيغ الملفات المطلوبة؟",
        {
          en: ["svg", "pdf", "png", "figma", "ai", "indesign"],
          ar: ["svg", "pdf", "png", "figma", "ai"],
        }
      ),
      question(
        "How many design concepts or revision rounds are included?",
        "كم عدد المفاهيم أو جولات التعديل المتضمنة؟",
        {
          en: ["concept", "concepts", "revision", "revisions", "round", "rounds"],
          ar: ["مفهوم", "مفاهيم", "تعديل", "تعديلات", "جولة"],
        }
      ),
    ],
  },
  {
    id: "plumber",
    professionHintAliases: ["plumber", "plumbing", "سباك"],
    keywords: {
      en: ["plumber", "plumbing", "pipe", "leak", "drain", "fixture", "water heater", "clog"],
      ar: ["سباك", "سباكة", "تسريب", "أنابيب", "صرف", "مواسير", "سخان"],
    },
    suggestedActions: [
      {
        actionCode: "B.1.2",
        reason: text(
          "Pipe, fixture, and leak work maps to plumbing service.",
          "أعمال الأنابيب والتركيبات والتسريبات ضمن خدمة السباكة."
        ),
      },
    ],
    deliverables: [
      {
        title: text("Repaired plumbing fixture or line", "تركيب أو خط سباكة مُصلَح"),
        description: text(
          "Verified repair or installation with no active leak.",
          "إصلاح أو تركيب مُختبر بدون تسريب نشط."
        ),
      },
      {
        title: text("Service completion checklist", "قائمة إنجاز الخدمة"),
        description: text(
          "Work performed, parts replaced, and pressure test notes.",
          "الأعمال المنفذة والقطع المستبدلة ونتائج اختبار الضغط."
        ),
      },
    ],
    milestones: [
      {
        title: text("On-site diagnosis", "تشخيص ميداني"),
        acceptanceCriteria: [
          text("Issue location identified", "تحديد موقع العطل"),
          text("Parts or access requirements confirmed", "تأكيد القطع أو متطلبات الوصول"),
        ],
      },
      {
        title: text("Repair completion", "إكمال الإصلاح"),
        acceptanceCriteria: [
          text("Leak or blockage resolved", "حل التسريب أو الانسداد"),
          text("Area left clean and functional", "ترك المنطقة نظيفة وعاملة"),
        ],
      },
    ],
    missingQuestions: [
      question(
        "What is the property address and access window?",
        "ما عنوان العقار ووقت الوصول؟",
        {
          en: ["address", "location", "access", "available", "between", "am", "pm"],
          ar: ["عنوان", "موقع", "وصول", "متاح", "صباح", "مساء"],
        }
      ),
      question(
        "Is this an emergency or scheduled visit?",
        "هل الزيارة طارئة أم مجدولة؟",
        {
          en: ["emergency", "urgent", "asap", "scheduled", "appointment"],
          ar: ["طارئ", "عاجل", "فوري", "مجدول", "موعد"],
        }
      ),
    ],
  },
  {
    id: "electrician",
    professionHintAliases: ["electrician", "electrical", "كهربائي"],
    keywords: {
      en: ["electrician", "electrical", "wiring", "outlet", "panel", "lighting", "circuit", "breaker"],
      ar: ["كهربائي", "كهرباء", "أسلاك", "مخرج", "لوحة", "إضاءة", "دائرة", "قاطع"],
    },
    suggestedActions: [
      {
        actionCode: "B.2.1",
        reason: text(
          "Wiring and installation work maps to electrical installation.",
          "أعمال التمديد والتركيب ضمن التركيبات الكهربائية."
        ),
      },
    ],
    deliverables: [
      {
        title: text("Installed or repaired electrical component", "مكوّن كهربائي مُركّب أو مُصلَح"),
        description: text(
          "Verified installation meeting basic safety checks.",
          "تركيب مُختبر يلبي فحوصات السلامة الأساسية."
        ),
      },
      {
        title: text("Safety inspection notes", "ملاحظات فحص السلامة"),
        description: text(
          "Load, grounding, and test results documented.",
          "توثيق الحمل والتأريض ونتائج الاختبار."
        ),
      },
    ],
    milestones: [
      {
        title: text("Site assessment", "تقييم الموقع"),
        acceptanceCriteria: [
          text("Circuit or load requirements identified", "تحديد متطلبات الدائرة أو الحمل"),
          text("Permit needs confirmed if applicable", "تأكيد متطلبات التصريح إن وجدت"),
        ],
      },
      {
        title: text("Installation sign-off", "اعتماد التركيب"),
        acceptanceCriteria: [
          text("Power test passed", "اجتياز اختبار التشغيل"),
          text("Work area safe and tidy", "منطقة العمل آمنة ومرتبة"),
        ],
      },
    ],
    missingQuestions: [
      question(
        "What is the scope: new install, repair, or upgrade?",
        "ما نطاق العمل: تركيب جديد أم إصلاح أم ترقية؟",
        {
          en: ["install", "repair", "upgrade", "replace", "new", "fix"],
          ar: ["تركيب", "إصلاح", "ترقية", "استبدال", "جديد"],
        }
      ),
      question(
        "Are permits or building access required?",
        "هل يلزم تصاريح أو تنسيق دخول للمبنى؟",
        {
          en: ["permit", "landlord", "building", "access card", "security"],
          ar: ["تصريح", "مبنى", "أمن", "دخول", "إدارة"],
        }
      ),
    ],
  },
  {
    id: "cleaner",
    professionHintAliases: ["cleaner", "cleaning", "janitor", "housekeeping", "منظف", "تنظيف"],
    keywords: {
      en: [
        "cleaner",
        "cleaning",
        "sanitize",
        "sanitization",
        "janitor",
        "housekeeping",
        "disinfection",
        "deep clean",
      ],
      ar: ["تنظيف", "منظف", "تعقيم", "مطهر", "نظافة", "تدبير منزلي", "تطهير"],
    },
    suggestedActions: [
      {
        actionCode: "A.4.2",
        reason: text(
          "Space cleaning and sanitization maps to cleaning & sanitization.",
          "تنظيف وتعقيم المساحات يندرج تحت التنظيف والتعقيم."
        ),
      },
    ],
    deliverables: [
      {
        title: text("Sanitized space", "مساحة معقمة"),
        description: text(
          "Agreed rooms or zones cleaned to checklist standard.",
          "الغرف أو المناطق المتفق عليها وفق قائمة التنظيف."
        ),
      },
      {
        title: text("Cleaning completion checklist", "قائمة إنجاز التنظيف"),
        description: text(
          "Areas serviced, products used, and exceptions noted.",
          "المناطق المنجزة والمواد المستخدمة والاستثناءات."
        ),
      },
    ],
    milestones: [
      {
        title: text("Scope walkthrough", "جولة تحديد النطاق"),
        acceptanceCriteria: [
          text("Rooms and surfaces list confirmed", "تأكيد قائمة الغرف والأسطح"),
          text("Product or allergy constraints noted", "توثيق قيود المواد أو الحساسية"),
        ],
      },
      {
        title: text("Final sanitization", "التعقيم النهائي"),
        acceptanceCriteria: [
          text("Checklist items completed", "إنجاز بنود القائمة"),
          text("Waste removed and area reset", "إزالة النفايات وإعادة ترتيب المنطقة"),
        ],
      },
    ],
    missingQuestions: [
      question(
        "What is the property size or number of rooms?",
        "ما مساحة العقار أو عدد الغرف؟",
        {
          en: ["sqm", "sqft", "room", "rooms", "bedroom", "bathroom", "office"],
          ar: ["متر", "غرفة", "غرف", "مكتب", "حمام"],
        }
      ),
      question(
        "How often is service needed (one-time or recurring)?",
        "ما تكرار الخدمة (مرة واحدة أم دوري)؟",
        {
          en: ["daily", "weekly", "monthly", "one-time", "recurring", "regular"],
          ar: ["يومي", "أسبوعي", "شهري", "مرة", "دوري", "منتظم"],
        }
      ),
    ],
  },
  {
    id: "tutor",
    professionHintAliases: ["tutor", "teacher", "مدرس", "معلم"],
    keywords: {
      en: ["tutor", "tutoring", "lesson", "student", "exam prep", "curriculum", "homework"],
      ar: ["مدرس", "تدريس", "دروس", "طالب", "طلاب", "امتحان", "مناهج", "واجبات"],
    },
    suggestedActions: [
      {
        actionCode: "G.1.1",
        reason: text(
          "One-to-one instruction maps to tutoring.",
          "التعليم الفردي يندرج تحت الدروس الخصوصية."
        ),
      },
    ],
    deliverables: [
      {
        title: text("Lesson plan", "خطة درس"),
        description: text(
          "Session objectives, materials, and practice exercises.",
          "أهداف الجلسة والمواد والتمارين."
        ),
      },
      {
        title: text("Progress report", "تقرير تقدم"),
        description: text(
          "Student performance summary and next steps.",
          "ملخص أداء الطالب والخطوات التالية."
        ),
      },
    ],
    milestones: [
      {
        title: text("Learning goals set", "تحديد أهداف التعلم"),
        acceptanceCriteria: [
          text("Subject and level confirmed", "تأكيد المادة والمستوى"),
          text("Session schedule agreed", "الاتفاق على جدول الجلسات"),
        ],
      },
      {
        title: text("Session cycle complete", "إكمال دورة الجلسات"),
        acceptanceCriteria: [
          text("Planned sessions delivered", "تنفيذ الجلسات المخططة"),
          text("Progress report shared", "مشاركة تقرير التقدم"),
        ],
      },
    ],
    missingQuestions: [
      question(
        "Which subject and grade level?",
        "ما المادة والمرحلة الدراسية؟",
        {
          en: ["math", "science", "english", "grade", "level", "subject", "gcse", "sat"],
          ar: ["رياضيات", "علوم", "إنجليزي", "صف", "مرحلة", "مادة"],
        }
      ),
      question(
        "How many sessions per week are needed?",
        "كم عدد الجلسات الأسبوعية المطلوبة؟",
        {
          en: ["session", "sessions", "per week", "weekly", "hours"],
          ar: ["جلسة", "جلسات", "أسبوع", "أسبوعيا", "ساعات"],
        }
      ),
    ],
  },
  {
    id: "consultant",
    professionHintAliases: ["consultant", "consulting", "advisor", "استشاري"],
    keywords: {
      en: ["consultant", "consulting", "strategy", "operations", "advisory", "roadmap", "assessment"],
      ar: ["استشاري", "استشارة", "استراتيجية", "عمليات", "خطة", "تقييم", "تحسين"],
    },
    suggestedActions: [
      {
        actionCode: "C.1.1",
        reason: text(
          "Strategic planning and analysis maps to strategy consulting.",
          "التخطيط والتحليل الاستراتيجي يندرج تحت الاستشارات الاستراتيجية."
        ),
      },
      {
        actionCode: "C.1.2",
        reason: text(
          "Process and operations improvement maps to operations advisory.",
          "تحسين العمليات يندرج تحت الاستشارات التشغيلية."
        ),
      },
    ],
    deliverables: [
      {
        title: text("Strategy or operations brief", "موجز استراتيجي أو تشغيلي"),
        description: text(
          "Findings, options, and prioritized recommendations.",
          "النتائج والخيارات والتوصيات حسب الأولوية."
        ),
      },
      {
        title: text("Implementation roadmap", "خارطة تنفيذ"),
        description: text(
          "Phased actions, owners, and success metrics.",
          "إجراءات مرحلية ومسؤوليات ومؤشرات نجاح."
        ),
      },
    ],
    milestones: [
      {
        title: text("Discovery complete", "إكمال الاكتشاف"),
        acceptanceCriteria: [
          text("Stakeholder interviews or data intake done", "إجراء مقابلات أو جمع البيانات"),
          text("Problem statement agreed", "الاتفاق على صياغة المشكلة"),
        ],
      },
      {
        title: text("Recommendations delivered", "تسليم التوصيات"),
        acceptanceCriteria: [
          text("Final brief presented", "عرض الموجز النهائي"),
          text("Next-step owners identified", "تحديد مسؤولي الخطوات التالية"),
        ],
      },
    ],
    missingQuestions: [
      question(
        "What business outcome should this engagement achieve?",
        "ما النتيجة التجارية المستهدفة من الاستشارة؟",
        {
          en: ["revenue", "cost", "efficiency", "growth", "kpi", "roi", "reduce", "increase"],
          ar: ["إيراد", "تكلفة", "كفاءة", "نمو", "kpi", "roi", "تقليل", "زيادة"],
        }
      ),
      question(
        "What is the decision deadline?",
        "ما الموعد النهائي لاتخاذ القرار؟",
        {
          en: ["deadline", "by ", "before ", "week", "month", "quarter"],
          ar: ["موعد", "deadline", "أسبوع", "شهر", "ربع"],
        }
      ),
    ],
  },
  {
    id: "event_coordinator",
    professionHintAliases: ["event coordinator", "event planner", "منسق فعاليات"],
    keywords: {
      en: ["event", "coordinator", "planning", "venue", "logistics", "wedding", "conference", "schedule"],
      ar: ["فعالية", "فعاليات", "منسق", "تنظيم", "حفل", "مؤتمر", "مكان", "لوجستيات"],
    },
    suggestedActions: [
      {
        actionCode: "F.1.2",
        reason: text(
          "End-to-end event planning maps to event coordination.",
          "تخطيط الفعالية الشامل يندرج تحت تنسيق الفعاليات."
        ),
      },
    ],
    deliverables: [
      {
        title: text("Event run-of-show", "جدول سير الفعالية"),
        description: text(
          "Timeline, roles, and vendor touchpoints.",
          "الجدول الزمني والأدوار ونقاط تنسيق الموردين."
        ),
      },
      {
        title: text("Vendor and logistics checklist", "قائمة الموردين واللوجستيات"),
        description: text(
          "Confirmed vendors, deliveries, and contingency notes.",
          "الموردون المعتمدون والتسليمات وخطط الطوارئ."
        ),
      },
    ],
    milestones: [
      {
        title: text("Planning kickoff", "انطلاق التخطيط"),
        acceptanceCriteria: [
          text("Date, venue, and guest count confirmed", "تأكيد التاريخ والمكان وعدد الضيوف"),
          text("Budget range agreed", "الاتفاق على نطاق الميزانية"),
        ],
      },
      {
        title: text("Event execution", "تنفيذ الفعالية"),
        acceptanceCriteria: [
          text("Run-of-show followed on event day", "اتباع جدول السير يوم الفعالية"),
          text("Post-event summary delivered", "تسليم ملخص ما بعد الفعالية"),
        ],
      },
    ],
    missingQuestions: [
      question(
        "What is the event date and expected guest count?",
        "ما تاريخ الفعالية وعدد الضيوف المتوقع؟",
        {
          en: ["guest", "guests", "attendee", "attendees", "headcount", "people"],
          ar: ["ضيف", "ضيوف", "حضور", "عدد"],
        }
      ),
      question(
        "What is the venue status (booked or TBD)?",
        "ما حالة الم venue (محجوز أم غير محدد)؟",
        {
          en: ["venue booked", "booked", "location confirmed", "tbd", "venue:"],
          ar: ["محجوز", "مكان", "venue", "محدد"],
        }
      ),
    ],
  },
];

export function resolveActionLabel(actionCode: string): string | null {
  return getActionType(actionCode)?.actionName ?? null;
}

export function localizeText(item: LocalizedText, language: "en" | "ar"): string {
  return language === "ar" ? item.ar : item.en;
}
