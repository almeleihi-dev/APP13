import { getActionType } from "../domain/action.js";
import type { LocalizedLabel, ProfessionMapping } from "./types.js";

function label(en: string, ar: string): LocalizedLabel {
  return { en, ar };
}

/** Deterministic profession → action/skill/deliverable mappings (EN + AR keywords). */
export const PROFESSION_ACTION_LIBRARY: ProfessionMapping[] = [
  {
    id: "plumber",
    profession: label("Plumber", "سباك"),
    keywords: {
      en: ["plumber", "plumbing", "pipe", "drain", "leak", "repair", "fixture", "water heater"],
      ar: ["سباك", "سباكة", "أنابيب", "تسريب", "صرف", "مواسير"],
    },
    actionCodes: ["B.1.2"],
    skills: [
      label("Pipe fitting", "تركيب الأنابيب"),
      label("Drain clearing", "تسليك المجاري"),
      label("Leak diagnosis", "تشخيص التسريبات"),
    ],
    deliverables: [
      label("Leak repair", "إصلاح التسريب"),
      label("Fixture installation", "تركيب التركيبات الصحية"),
      label("Drain unblocking", "فتح انسداد الصرف"),
    ],
  },
  {
    id: "electrician",
    profession: label("Electrician", "كهربائي"),
    keywords: {
      en: ["electrician", "electrical", "wiring", "circuit", "panel", "lighting", "voltage"],
      ar: ["كهربائي", "كهرباء", "أسلاك", "لوحة", "إضاءة", "توصيل"],
    },
    actionCodes: ["B.2.1"],
    skills: [
      label("Circuit wiring", "تمديد الدوائر"),
      label("Panel upgrades", "ترقية اللوحات"),
      label("Safety inspection", "فحص السلامة"),
    ],
    deliverables: [
      label("Outlet installation", "تركيب المنافذ"),
      label("Lighting setup", "تركيب الإضاءة"),
      label("Electrical troubleshooting", "إصلاح الأعطال الكهربائية"),
    ],
  },
  {
    id: "software_developer",
    profession: label("Software Developer", "مطور برمجيات"),
    keywords: {
      en: [
        "software",
        "developer",
        "engineer",
        "programming",
        "typescript",
        "javascript",
        "backend",
        "api",
        "database",
      ],
      ar: ["مطور", "برمجيات", "مهندس برمجيات", "برمجة", "واجهات", "قواعد بيانات"],
    },
    actionCodes: ["E.3.1", "B.3.3"],
    skills: [
      label("API design", "تصميم واجهات برمجية"),
      label("TypeScript development", "تطوير TypeScript"),
      label("System troubleshooting", "استكشاف أعطال الأنظمة"),
    ],
    deliverables: [
      label("Custom application module", "وحدة تطبيق مخصصة"),
      label("Integration service", "خدمة تكامل"),
      label("Technical diagnosis report", "تقرير تشخيص تقني"),
    ],
  },
  {
    id: "graphic_designer",
    profession: label("Graphic Designer", "مصمم جرافيك"),
    keywords: {
      en: ["graphic", "designer", "branding", "logo", "illustration", "layout", "visual"],
      ar: ["مصمم", "جرافيك", "شعار", "هوية", "تصميم", "مرئيات"],
    },
    actionCodes: ["E.1.1"],
    skills: [
      label("Brand identity design", "تصميم الهوية"),
      label("Layout composition", "تكوين التخطيط"),
      label("Visual storytelling", "سرد بصري"),
    ],
    deliverables: [
      label("Logo package", "حزمة الشعار"),
      label("Marketing collateral", "مواد تسويقية"),
      label("Design source files", "ملفات التصميم المصدرية"),
    ],
  },
  {
    id: "tutor",
    profession: label("Tutor", "مدرس"),
    keywords: {
      en: ["tutor", "tutoring", "teacher", "lesson", "curriculum", "student", "education"],
      ar: ["مدرس", "تدريس", "دروس", "طلاب", "تعليم", "معلم"],
    },
    actionCodes: ["G.1.1"],
    skills: [
      label("Lesson planning", "تخطيط الدروس"),
      label("Student assessment", "تقييم الطلاب"),
      label("Concept explanation", "شرح المفاهيم"),
    ],
    deliverables: [
      label("Lesson plan", "خطة درس"),
      label("Progress report", "تقرير تقدم"),
      label("Practice exercises", "تمارين تطبيقية"),
    ],
  },
  {
    id: "surface_repair",
    profession: label("Surface Repair Specialist", "فني ترميم أسطح"),
    keywords: {
      en: ["surface", "repair", "drywall", "patch", "paint prep", "wall", "finish"],
      ar: ["ترميم", "أسطح", "جدران", "دهان", "تشطيب", "إصلاح"],
    },
    actionCodes: ["A.2.1", "A.4.1"],
    skills: [
      label("Surface preparation", "تحضير الأسطح"),
      label("Patch repair", "إصلاح التشققات"),
      label("Finish smoothing", "تنعيم التشطيب"),
    ],
    deliverables: [
      label("Repaired surface area", "منطقة سطح مُرمّمة"),
      label("Prepped finish zone", "منطقة جاهزة للتشطيب"),
      label("Maintenance checklist", "قائمة صيانة"),
    ],
  },
  {
    id: "consultant",
    profession: label("Strategy Consultant", "استشاري استراتيجي"),
    keywords: {
      en: ["consultant", "consulting", "strategy", "operations", "advisory", "roadmap"],
      ar: ["استشاري", "استراتيجية", "عمليات", "خطة", "تحسين"],
    },
    actionCodes: ["C.1.1", "C.1.2"],
    skills: [
      label("Strategic analysis", "تحليل استراتيجي"),
      label("Process mapping", "رسم العمليات"),
      label("Stakeholder workshops", "ورش أصحاب المصلحة"),
    ],
    deliverables: [
      label("Strategy brief", "موجز استراتيجي"),
      label("Operations assessment", "تقييم العمليات"),
      label("Recommendation deck", "عرض توصيات"),
    ],
  },
  {
    id: "event_coordinator",
    profession: label("Event Coordinator", "منسق فعاليات"),
    keywords: {
      en: ["event", "coordinator", "planning", "venue", "logistics", "schedule"],
      ar: ["فعاليات", "منسق", "تنظيم", "حفل", "جدول", "لوجستيات"],
    },
    actionCodes: ["F.1.2"],
    skills: [
      label("Vendor coordination", "تنسيق الموردين"),
      label("Run-of-show planning", "تخطيط سير الفعالية"),
      label("Guest logistics", "لوجستيات الضيوف"),
    ],
    deliverables: [
      label("Event timeline", "جدول الفعالية"),
      label("Vendor checklist", "قائمة الموردين"),
      label("Post-event summary", "ملخص ما بعد الفعالية"),
    ],
  },
  {
    id: "personal_care",
    profession: label("Personal Care Assistant", "مساعد رعاية شخصية"),
    keywords: {
      en: ["care", "assistant", "personal care", "daily living", "mobility", "support"],
      ar: ["رعاية", "مساعد", "رعاية شخصية", "مساندة", "حياة يومية"],
    },
    actionCodes: ["D.1.1", "D.3.1"],
    skills: [
      label("Daily living support", "دعم الحياة اليومية"),
      label("Care planning", "تخطيط الرعاية"),
      label("Household coordination", "تنسيق المنزل"),
    ],
    deliverables: [
      label("Care visit log", "سجل زيارات الرعاية"),
      label("Support plan update", "تحديث خطة الدعم"),
      label("Household task completion", "إنجاز مهام المنزل"),
    ],
  },
  {
    id: "property_inspector",
    profession: label("Property Inspector", "مفتش عقارات"),
    keywords: {
      en: ["inspector", "inspection", "property", "assessment", "condition", "report"],
      ar: ["مفتش", "فحص", "عقار", "تقييم", "حالة", "تقرير"],
    },
    actionCodes: ["H.1.1"],
    skills: [
      label("Condition assessment", "تقييم الحالة"),
      label("Defect identification", "تحديد العيوب"),
      label("Report writing", "كتابة التقارير"),
    ],
    deliverables: [
      label("Inspection report", "تقرير فحص"),
      label("Condition summary", "ملخص الحالة"),
      label("Photo evidence set", "مجموعة أدلة مصورة"),
    ],
  },
];

export function resolveActionNames(actionCodes: string[]): Array<{ actionCode: string; actionName: string }> {
  return actionCodes
    .map((actionCode) => {
      const actionType = getActionType(actionCode);
      if (!actionType) return null;
      return { actionCode, actionName: actionType.actionName };
    })
    .filter((entry): entry is { actionCode: string; actionName: string } => entry !== null);
}

export function localizeLabels(labels: LocalizedLabel[], language: "en" | "ar"): string[] {
  return labels.map((item) => (language === "ar" ? item.ar : item.en));
}
