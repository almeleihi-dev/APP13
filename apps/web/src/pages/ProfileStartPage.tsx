import { useState, type ChangeEvent, type FormEvent } from "react";
import { PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { LaunchScene } from "../launch/LaunchScene.js";
import { readLaunchActDraft } from "../launch/navigation.js";
import { LanguageSelector } from "../components/i18n/LanguageSelector.js";
import { useLocale } from "../i18n/useLocale.js";
import { detectInputIntent } from "../lib/living-platform/intelligence/profession-intent-detection.js";
import {
  generatePersonalPassport,
  initialsFromName,
  readPersonalPassport,
  savePersonalPassport,
  updatePersonalPassport,
  type PersonalPassportInput,
} from "../passport/personal-passport-persistence.js";
import { defaultGeoLocationProfile } from "../passport/geo-location-utils.js";
import type { ServiceAvailability } from "../lib/living-platform/types.js";
import type { SupportedLocale } from "../i18n/locale-types.js";
import { supportedLanguageOptions } from "../passport/geo-location-utils.js";
import { toActivePersonalIdentity } from "../passport/personal-identity.js";
import { syncActionInventoryForIdentity } from "../lib/living-platform/intelligence/action-inventory-store.js";
import { transferGuestSessionToPlatform } from "../guest/guest-conversion.js";

export interface ProfileStartPageProps {
  onComplete: () => void;
  onCancel?: () => void;
}

const EMPTY_FORM: PersonalPassportInput = {
  fullName: "",
  professionalTitle: "",
  location: "",
  mainSkill: "",
  experienceSummary: "",
  geoProfile: defaultGeoLocationProfile(),
  languages: ["en"],
};

function buildInitialForm(): PersonalPassportInput {
  const existing = readPersonalPassport();
  if (existing) {
    return {
      fullName: existing.fullName,
      professionalTitle: existing.professionalTitle,
      location: existing.location,
      mainSkill: existing.mainSkill,
      experienceSummary: existing.experienceSummary,
      photoDataUrl: existing.photoDataUrl,
      geoProfile: existing.geoProfile,
      languages: existing.languages,
    };
  }
  const draft = readLaunchActDraft();
  const summary = draft?.summary?.trim() ?? "";
  const isProfession = draft?.inputIntent === "profession" || (summary ? detectInputIntent(summary) === "profession" : false);

  if (isProfession && summary) {
    return {
      ...EMPTY_FORM,
      professionalTitle: summary,
      mainSkill: summary,
      experienceSummary: `Professional capability: ${summary}`,
    };
  }

  return {
    ...EMPTY_FORM,
    experienceSummary: summary,
  };
}

export function ProfileStartPage({ onComplete, onCancel }: ProfileStartPageProps) {
  const { t } = useLocale();
  const initialForm = buildInitialForm();
  const isEditing = Boolean(readPersonalPassport());
  const [form, setForm] = useState<PersonalPassportInput>(initialForm);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(initialForm.photoDataUrl);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  function updateField<K extends keyof PersonalPassportInput>(key: K, value: PersonalPassportInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateGeoField<K extends keyof NonNullable<PersonalPassportInput["geoProfile"]>>(
    key: K,
    value: NonNullable<PersonalPassportInput["geoProfile"]>[K],
  ) {
    setForm((current) => ({
      ...current,
      geoProfile: { ...(current.geoProfile ?? defaultGeoLocationProfile()), [key]: value },
    }));
  }

  function toggleLanguage(code: SupportedLocale) {
    setForm((current) => {
      const languages = current.languages ?? ["en"];
      const next = languages.includes(code) ? languages.filter((item) => item !== code) : [...languages, code];
      return { ...current, languages: next.length ? next : ["en"] };
    });
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPhotoPreview(undefined);
      updateField("photoDataUrl", undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : undefined;
      setPhotoPreview(dataUrl);
      updateField("photoDataUrl", dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    if (!form.fullName.trim() || !form.professionalTitle.trim()) return;
    setSubmitting(true);
    const existing = readPersonalPassport();
    const passport = existing ? updatePersonalPassport(existing, form) : generatePersonalPassport(form);
    savePersonalPassport(passport);
    const identity = toActivePersonalIdentity(passport);
    transferGuestSessionToPlatform(identity);
    syncActionInventoryForIdentity(identity);
    setCompleted(true);
    window.setTimeout(onComplete, 560);
  }

  const canSubmit = form.fullName.trim().length > 1 && form.professionalTitle.trim().length > 1;

  return (
    <LaunchScene
      className={`an-act-passport-flow an-act-passport-flow--setup an-act-platform-continuity an-act-sig-passport-shell${completed ? " an-act-emotion-passport-created" : " an-act-emotion-profile"}`}
    >
      <div className="an-act-passport-flow__shell an-act-excellence-s1-page an-act-sig-enter">
        <LanguageSelector className="an-act-passport-flow__language" />
        <header className="an-act-passport-flow__header">
          <p className="an-act-passport-flow__eyebrow">{t("passport.eyebrow")}</p>
          <h1 className="an-act-passport-flow__title">
            {isEditing ? "Update your Professional Passport" : t("passport.createTitle")}
          </h1>
          {!isEditing ? (
            <p className="an-act-passport-flow__quick-note" role="note">
              Only your name and professional title are required to begin. You can add photo, location, and experience
              later from Personal Home.
            </p>
          ) : null}
          <p className="an-act-passport-flow__lead">
            {isEditing
              ? "Update your identity details. Changes sync across Personal Home and your Live Frame status."
              : "Your passport establishes your identity on AN ACT and unlocks Personal Home and the Action Marketplace."}
          </p>
        </header>

        <form
          className={`an-act-passport-form${submitting ? " an-act-passport-form--submitting" : ""}`}
          onSubmit={handleSubmit}
        >
          <div className="an-act-passport-form__grid">
            <PremiumCard className="an-act-passport-form__panel">
              <label className="an-act-passport-form__label" htmlFor="passport-full-name">
                Full name
              </label>
              <input
                id="passport-full-name"
                className="an-act-passport-form__input"
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                placeholder="Your full professional name"
                autoComplete="name"
                required
              />

              <label className="an-act-passport-form__label" htmlFor="passport-title">
                Professional title
              </label>
              <input
                id="passport-title"
                className="an-act-passport-form__input"
                value={form.professionalTitle}
                onChange={(event) => updateField("professionalTitle", event.target.value)}
                placeholder="Licensed Electrician, Product Designer, Consultant…"
                required
              />

              <label className="an-act-passport-form__label" htmlFor="passport-country">
                {t("passport.country")}
                <span className="an-act-passport-flow__optional-hint">Optional</span>
              </label>
              <input
                id="passport-country"
                className="an-act-passport-form__input"
                value={form.geoProfile?.country ?? ""}
                onChange={(event) => updateGeoField("country", event.target.value)}
                placeholder="Germany"
              />

              <label className="an-act-passport-form__label" htmlFor="passport-city">
                {t("passport.city")}
              </label>
              <input
                id="passport-city"
                className="an-act-passport-form__input"
                value={form.geoProfile?.city ?? ""}
                onChange={(event) => updateGeoField("city", event.target.value)}
                placeholder="Heidelberg"
              />

              <label className="an-act-passport-form__label" htmlFor="passport-region">
                {t("passport.region")}
              </label>
              <input
                id="passport-region"
                className="an-act-passport-form__input"
                value={form.geoProfile?.region ?? ""}
                onChange={(event) => updateGeoField("region", event.target.value)}
                placeholder="Baden-Württemberg"
              />

              <label className="an-act-passport-form__label" htmlFor="passport-timezone">
                {t("passport.timeZone")}
              </label>
              <input
                id="passport-timezone"
                className="an-act-passport-form__input"
                value={form.geoProfile?.timeZone ?? ""}
                onChange={(event) => updateGeoField("timeZone", event.target.value)}
                placeholder="Europe/Berlin"
              />

              <label className="an-act-passport-form__label" htmlFor="passport-radius">
                {t("passport.serviceRadius")} (km)
              </label>
              <input
                id="passport-radius"
                type="number"
                min={0}
                className="an-act-passport-form__input"
                value={form.geoProfile?.serviceRadiusKm ?? ""}
                onChange={(event) =>
                  updateGeoField("serviceRadiusKm", event.target.value ? Number(event.target.value) : null)
                }
                placeholder="50"
              />

              <label className="an-act-passport-form__label" htmlFor="passport-availability">
                {t("passport.availability")}
              </label>
              <select
                id="passport-availability"
                className="an-act-passport-form__input"
                value={form.geoProfile?.availability ?? "hybrid"}
                onChange={(event) => updateGeoField("availability", event.target.value as ServiceAvailability)}
              >
                <option value="remote">{t("passport.availability.remote")}</option>
                <option value="local">{t("passport.availability.local")}</option>
                <option value="hybrid">{t("passport.availability.hybrid")}</option>
              </select>

              <fieldset className="an-act-passport-form__languages">
                <legend className="an-act-passport-form__label">{t("passport.languages")}</legend>
                {supportedLanguageOptions().map((code) => (
                  <label key={code} className="an-act-passport-form__checkbox">
                    <input
                      type="checkbox"
                      checked={(form.languages ?? ["en"]).includes(code)}
                      onChange={() => toggleLanguage(code)}
                    />
                    <span>{code.toUpperCase()}</span>
                  </label>
                ))}
              </fieldset>

              <label className="an-act-passport-form__label" htmlFor="passport-location">
                Location summary
                <span className="an-act-passport-flow__optional-hint">Optional</span>
              </label>
              <input
                id="passport-location"
                className="an-act-passport-form__input"
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
                placeholder="Heidelberg, Germany 🇩🇪"
              />

              <label className="an-act-passport-form__label" htmlFor="passport-skill">
                Main skill or domain
                <span className="an-act-passport-flow__optional-hint">Optional</span>
              </label>
              <input
                id="passport-skill"
                className="an-act-passport-form__input"
                value={form.mainSkill}
                onChange={(event) => updateField("mainSkill", event.target.value)}
                placeholder="Electrical systems, UX design, advisory consulting…"
              />
            </PremiumCard>

            <PremiumCard className="an-act-passport-form__panel an-act-passport-form__panel--photo">
              <p className="an-act-passport-form__label">Profile photo</p>
              <div className="an-act-passport-form__photo-zone">
                <div className="an-act-passport-form__photo-preview" aria-hidden={!photoPreview}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="" className="an-act-passport-form__photo-image" />
                  ) : (
                    <span className="an-act-passport-form__photo-placeholder">
                      {initialsFromName(form.fullName || "AN ACT")}
                    </span>
                  )}
                </div>
                <label className="an-act-passport-form__upload">
                  <input
                    type="file"
                    accept="image/*"
                    className="an-act-passport-form__upload-input"
                    onChange={handlePhotoChange}
                  />
                  <span>Upload profile photo</span>
                </label>
              </div>

              <label className="an-act-passport-form__label" htmlFor="passport-summary">
                Short experience summary
                <span className="an-act-passport-flow__optional-hint">Optional</span>
              </label>
              <textarea
                id="passport-summary"
                className="an-act-passport-form__textarea"
                value={form.experienceSummary}
                onChange={(event) => updateField("experienceSummary", event.target.value)}
                placeholder="Briefly describe your professional experience and operating focus."
                rows={6}
              />
            </PremiumCard>
          </div>

          <div className="an-act-passport-form__actions an-act-passport-flow__actions-row">
            {isEditing && onCancel ? (
              <PremiumButton variant="secondary" type="button" onClick={onCancel}>
                Cancel
              </PremiumButton>
            ) : null}
            <PremiumButton
              variant="primary"
              size="lg"
              type="submit"
              disabled={!canSubmit || submitting}
              className="an-act-passport-form__submit"
            >
              {isEditing ? "Save Professional Passport" : "Create passport & continue"}
            </PremiumButton>
            {submitting && !completed ? (
              <p className="an-act-passport-form__submit-status" role="status">
                Setting up Personal Home…
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </LaunchScene>
  );
}
