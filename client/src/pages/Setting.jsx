import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CircleUserRound,
  Globe2,
  Languages,
  HelpCircle,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Pencil,
  ScanLine,
  ShieldCheck,
  Target,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import khanaLensLogo from "../assets/images/KhanaLens.jpg";
import { getHistoryApi, getProfileApi, saveProfileApi } from "../services/api";
import { FOOD_AVATARS, FoodAvatar } from "../components/FoodAvatar";
import { useLanguage } from "../context/LanguageContext";

const defaults = {
  name: "",
  email: "",
  phone: "",
  timezone: "Asia/Kathmandu",
  avatar: "taco",
  age: "",
  gender: "",
  height: "",
  currentWeight: "",
  targetWeight: "",
  activity: "Moderate",
  conditions: [],
  units: "Metric (kg, cm)",
  calorieGoal: 2000,
  proteinGoal: 120,
  carbsGoal: 250,
  fatGoal: 70,
};

const groups = [
  {
    title: "YOUR PLAN",
    items: [
      {
        id: "personal",
        icon: UserRound,
        label: "Personal information",
        description: "Body details",
      },
      {
        id: "targetWeight",
        icon: Target,
        label: "Target weight",
        description: "Set your goal weight",
      },
      {
        id: "conditions",
        icon: UsersRound,
        label: "Health conditions",
        description: "Optional health details",
      },
    ],
  },
  {
    title: "PREFERENCES",
    items: [
      {
        id: "units",
        icon: Globe2,
        label: "Units",
        description: "Metric (kg, cm)",
      },
      {
        id: "language",
        icon: Languages,
        label: "Language",
        description: "Choose your app language",
      },
      {
        id: "privacy",
        icon: ShieldCheck,
        label: "Privacy policy",
        description: "How your data is used",
      },
      {
        id: "support",
        icon: HelpCircle,
        label: "Help & support",
        description: "Get answers",
      },
    ],
  },
];

const toImperialHeight = (cm) => Math.round(Number(cm || 0) * 0.393701 * 10) / 10;
const toImperialWeight = (kg) => Math.round(Number(kg || 0) * 2.20462 * 10) / 10;
const toMetricHeight = (inches) => Math.round(Number(inches || 0) / 0.393701 * 10) / 10;
const toMetricWeight = (pounds) => Math.round(Number(pounds || 0) / 2.20462 * 10) / 10;
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || min));

function AvatarChooser({ avatar, onChange }) {
  return (
    <div className="food-avatar-editor">
      <strong>Choose your food avatar</strong>
      <div className="food-avatar-grid">
        {FOOD_AVATARS.map((option) => (
          <button
            type="button"
            key={option.id}
            className={`food-avatar-choice ${avatar === option.id ? "selected" : ""}`}
            onClick={() => onChange(option.id)}
            aria-label={`Choose ${option.label} avatar`}
          >
            <FoodAvatar avatar={option.id} alt={option.label} />
          </button>
        ))}
      </div>
      <small>Select an avatar or upload your photo below.</small>
    </div>
  );
}

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [profile, setProfile] = useState(defaults);
  const [draft, setDraft] = useState(defaults);
  const [editing, setEditing] = useState(false);
  const [panel, setPanel] = useState(null);
  const [saved, setSaved] = useState(false);
  const [streak, setStreak] = useState(0);

  const letters = useMemo(
    () => (
      <FoodAvatar
        avatar={profile.avatar}
        alt={`${profile.name || "User"} food avatar`}
      />
    ),
    [profile.avatar, profile.name]
  );

  const item = groups
    .flatMap((group) => group.items)
    .find((entry) => entry.id === panel);

  const isImperial = draft.units === "Imperial (lb, in)";
  const displayedHeight = isImperial
    ? toImperialHeight(draft.height)
    : draft.height;
  const displayedWeight = isImperial
    ? toImperialWeight(draft.currentWeight)
    : draft.currentWeight;
  const displayedTargetWeight = isImperial
    ? toImperialWeight(draft.targetWeight)
    : draft.targetWeight;

  useEffect(() => {
    if (!user?.id) return;
    const storageKey = `nutrilens_profile:${user.id}`;
    let savedProfile = {};
    try {
      savedProfile = JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      savedProfile = {};
    }
    const localProfile = {
      ...defaults,
      ...savedProfile,
      name: user.name || savedProfile.name || "User",
      email: user.email || savedProfile.email || "",
    };
    setProfile(localProfile);
    setDraft(localProfile);
    getProfileApi()
      .then((response) => {
        if (!response.data.data) return;
        const nextProfile = { ...localProfile, ...response.data.data };
        setProfile(nextProfile);
        setDraft(nextProfile);
      })
      .catch(() => {});
    getHistoryApi()
      .then((response) => setStreak(Number(response.data.summary?.streak || 0)))
      .catch(() => setStreak(0));
  }, [user?.id, user?.name, user?.email]);

  const persistProfile = (nextProfile) => {
    if (!user?.id) return;
    const normalizedProfile = {
      ...nextProfile,
      avatar: nextProfile.avatar || "taco",
      completed: Boolean(
        nextProfile.name &&
          nextProfile.age &&
          nextProfile.gender &&
          nextProfile.height &&
          nextProfile.currentWeight
      ),
    };
    setProfile(normalizedProfile);
    setDraft(normalizedProfile);
    localStorage.setItem(
      `nutrilens_profile:${user.id}`,
      JSON.stringify(normalizedProfile)
    );
    saveProfileApi(normalizedProfile).catch(() => {});
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((current) => ({ ...current, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const close = () => {
    setEditing(false);
    setPanel(null);
  };

  const edit = () => {
    setDraft(profile);
    setEditing(true);
  };

  const open = (id) => {
    if (id === "language") return;
    setDraft(profile);
    setPanel(id);
  };

  const save = (event) => {
    event.preventDefault();
    const nextProfile = {
      ...draft,
      name: draft.name.trim().slice(0, 40),
      age: clamp(draft.age, 7, 120),
      height: clamp(draft.height, 100, 250),
      currentWeight: clamp(draft.currentWeight, 25, 400),
      targetWeight: clamp(draft.targetWeight, 25, 400),
      calorieGoal: clamp(draft.calorieGoal, 1000, 6000),
    };
    setProfile(nextProfile);
    persistProfile(nextProfile);
    close();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const savePersonal = (event) => {
    event.preventDefault();
    const nextProfile = {
      ...profile,
      name: draft.name.trim().slice(0, 40),
      age: clamp(draft.age, 7, 120),
      height: clamp(draft.height, 100, 250),
      currentWeight: clamp(draft.currentWeight, 25, 400),
      targetWeight: clamp(draft.targetWeight, 25, 400),
      gender: draft.gender,
    };
    setProfile(nextProfile);
    persistProfile(nextProfile);
    close();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const saveField = (event, field, value) => {
    event.preventDefault();
    const nextProfile = { ...profile, [field]: value };
    setProfile(nextProfile);
    persistProfile(nextProfile);
    close();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const signOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="profile-viewport">
      <style>{`
        .profile-viewport {
          min-height: 100dvh;
          background: linear-gradient(155deg, #dff7ed 0%, #f4fbf8 38%, #e9f6f1 100%);
          color: #173b32;
          display: flex;
          justify-content: center;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .profile-shell {
          width: min(100%, 440px);
          min-height: 100dvh;
          position: relative;
          padding: 20px 18px 150px;
          overflow-x: hidden;
        }
        .profile-shell:before,
        .profile-shell:after {
          content: "";
          position: absolute;
          border-radius: 999px;
          pointer-events: none;
          filter: blur(2px);
          opacity: 0.55;
        }
        .profile-shell:before {
          width: 220px;
          height: 220px;
          right: -100px;
          top: -90px;
          background: #b8edda;
        }
        .profile-shell:after {
          width: 180px;
          height: 180px;
          left: -110px;
          top: 310px;
          background: #d0f4e4;
        }
        .profile-content {
          position: relative;
          z-index: 1;
        }
        .profile-topbar {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
        }
        .profile-icon-button {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(35, 130, 100, 0.13);
          border-radius: 13px;
          color: #287b64;
          background: rgba(255, 255, 255, 0.78);
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(46, 130, 99, 0.08);
        }
        .profile-back-button {
          position: absolute;
          left: 0;
        }
        .profile-brand {
          display: flex;
          align-items: center;
          gap: 9px;
        }
        .profile-brand img {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          object-fit: cover;
          transform: scale(1.12);
          box-shadow: 0 5px 13px rgba(30, 145, 115, 0.2);
        }
        .profile-brand-copy strong {
          display: block;
          color: #173f34;
          font-size: 18px;
          line-height: 1;
          letter-spacing: -0.5px;
        }
        .profile-brand-copy strong span {
          color: #25a47f;
        }
        .profile-brand-copy small {
          display: block;
          margin-top: 4px;
          color: #6e9486;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.15px;
        }
        .profile-hero {
          padding: 20px 18px;
          border: 1px solid rgba(68, 174, 137, 0.2);
          border-radius: 25px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(232, 250, 242, 0.83));
          box-shadow: 0 14px 34px rgba(40, 122, 91, 0.12);
        }
        .profile-hero-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .profile-avatar {
          width: 72px;
          height: 72px;
          flex: 0 0 72px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border: 4px solid #fff;
          border-radius: 24px;
          color: #fff;
          background: linear-gradient(145deg, #37bd91, #147c65);
          box-shadow: 0 9px 18px rgba(27, 132, 96, 0.25);
          font-size: 23px;
          font-weight: 850;
        }
        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-hero-copy {
          min-width: 0;
          flex: 1;
        }
        .profile-hero-copy h2 {
          margin: 0;
          color: #163d33;
          font-size: 19px;
          letter-spacing: -0.35px;
        }
        .profile-hero-copy p {
          margin: 5px 0 0;
          overflow: hidden;
          color: #719086;
          font-size: 11px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .profile-edit-button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 0;
          border-radius: 11px;
          padding: 9px 12px;
          color: #167b60;
          background: #d9f5e9;
          font-size: 11.5px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .profile-edit-button:hover {
          background: #c7efdf;
          transform: translateY(-1px);
        }
        .profile-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 18px;
        }
        .profile-stat {
          padding: 11px 8px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.7);
          text-align: center;
        }
        .profile-stat strong {
          display: block;
          color: #1f6f5a;
          font-size: 15px;
        }
        .profile-stat span {
          display: block;
          margin-top: 3px;
          color: #779289;
          font-size: 9px;
          font-weight: 700;
        }
        .profile-section {
          margin-top: 24px;
        }
        .profile-section-label {
          display: inline-flex;
          align-items: center;
          margin: 0 0 9px 3px;
          padding: 6px 10px;
          border: 1px solid #bfe8d5;
          border-radius: 99px;
          color: #197a5e;
          background: #dff7eb;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.4px;
          box-shadow: 0 4px 10px rgba(40, 145, 105, 0.08);
        }
        .profile-menu {
          overflow: hidden;
          border: 1px solid #c9ebdc;
          border-radius: 19px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(239, 251, 245, 0.9));
          box-shadow: 0 10px 24px rgba(42, 116, 87, 0.1);
        }
        .profile-menu-row {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 15px 13px;
          border: 0;
          border-bottom: 1px solid #dcefe6;
          color: inherit;
          background: transparent;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .profile-menu-row:last-child {
          border-bottom: 0;
        }
        .profile-menu-row:hover {
          background: #e8faf1;
          transform: translateX(2px);
        }
        .profile-menu-icon {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          display: grid;
          place-items: center;
          border: 1px solid #c5ead8;
          border-radius: 11px;
          color: #147d60;
          background: linear-gradient(145deg, #e8faf1, #d2f2e2);
        }
        .profile-menu-copy {
          min-width: 0;
          flex: 1;
        }
        .profile-menu-copy strong {
          display: block;
          color: #174c3c;
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.05px;
        }
        .profile-menu-copy span {
          display: block;
          margin-top: 3px;
          color: #6f9184;
          font-size: 10px;
          font-weight: 600;
        }
        .profile-menu-value {
          color: #258b6d;
          font-size: 10px;
          font-weight: 850;
        }
        .profile-language-picker {
          display: inline-flex;
          align-items: center;
          padding: 3px;
          gap: 2px;
          border: 1px solid #bfe8d8;
          background: #effaf5;
          border-radius: 999px;
        }
        .profile-language-picker button {
          border: 0;
          background: transparent;
          color: #4b7769;
          padding: 6px 8px;
          font: inherit;
          font-size: 10px;
          font-weight: 800;
          line-height: 1;
          border-radius: 999px;
          cursor: pointer;
        }
        .profile-language-picker button.active {
          color: #fff;
          background: #159b78;
          box-shadow: 0 2px 5px rgba(14, 126, 95, .22);
        }
        .profile-chevron {
          color: #76aa97;
        }
        .profile-toggle {
          width: 36px;
          height: 21px;
          padding: 3px;
          border: 0;
          border-radius: 99px;
          background: #c6d8d1;
          cursor: pointer;
        }
        .profile-toggle.on {
          background: #26aa82;
        }
        .profile-toggle span {
          display: block;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #fff;
          transition: transform 0.2s ease;
        }
        .profile-toggle.on span {
          transform: translateX(15px);
        }
        .profile-logout {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
          padding: 14px;
          border: 1px solid #f2d8d4;
          border-radius: 17px;
          color: #c75d50;
          background: rgba(255, 255, 255, 0.85);
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .profile-logout:hover {
          background: #fff5f3;
          transform: translateY(-1px);
        }
        .profile-toast {
          position: fixed;
          z-index: 100010;
          top: 18px;
          left: 50%;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 16px;
          transform: translateX(-50%);
          border-radius: 99px;
          color: #146d54;
          background: #dff8ec;
          box-shadow: 0 8px 20px rgba(30, 117, 84, 0.2);
          font-size: 11.5px;
          font-weight: 800;
        }
        .profile-modal-backdrop {
          position: fixed !important;
          z-index: 100000 !important;
          inset: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 20px 16px calc(24px + env(safe-area-inset-bottom, 0px)) !important;
          background: rgba(10, 38, 30, 0.6) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
        }
        .profile-modal {
          position: relative !important;
          z-index: 100001 !important;
          width: min(100%, 420px) !important;
          max-height: min(85dvh, 700px) !important;
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
          padding: 24px 20px 30px !important;
          border: 1px solid rgba(204, 235, 221, 0.95) !important;
          border-radius: 24px !important;
          background: #fbfffd !important;
          box-shadow: 0 24px 60px rgba(18, 70, 52, 0.35) !important;
        }
        .profile-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .profile-modal-header h2 {
          margin: 0;
          color: #173f34;
          font-size: 18px;
        }
        .profile-modal-close {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border: 0;
          border-radius: 10px;
          color: #5b8174;
          background: #eaf7f1;
          cursor: pointer;
        }
        .profile-modal-close:hover {
          background: #dbf1e7;
          color: #1b4d3f;
        }
        .profile-form-label {
          display: block;
          margin: 14px 0 6px;
          color: #4a7366;
          font-size: 11px;
          font-weight: 800;
        }
        .profile-form-input,
        .profile-form-select {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 13px;
          border: 1px solid #d8ebe3;
          border-radius: 12px;
          outline: none;
          color: #254d41;
          background: #f7fcfa;
          font: inherit;
          font-size: 12.5px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .profile-form-input:focus,
        .profile-form-select:focus {
          border-color: #4dbd96;
          box-shadow: 0 0 0 3px rgba(77, 189, 150, 0.16);
        }
        .profile-save {
          width: 100%;
          margin-top: 22px;
          margin-bottom: 6px;
          padding: 13px 16px;
          border: 0;
          border-radius: 14px;
          color: #fff;
          background: linear-gradient(135deg, #27b88b, #087b61);
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(17, 137, 99, 0.28);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .profile-save:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(17, 137, 99, 0.38);
        }
        .profile-info-copy {
          color: #55796d;
          font-size: 12px;
          line-height: 1.6;
          margin-bottom: 14px;
        }
        @media (min-width: 480px) {
          .profile-shell {
            min-height: min(820px, calc(100dvh - 32px));
            margin: 16px 0;
            border-radius: 30px;
            box-shadow: 0 16px 40px rgba(26, 88, 66, 0.14);
          }
        }
        .profile-condition-option {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 9px;
          padding: 12px 13px;
          border: 1px solid #d5eee2;
          border-radius: 13px;
          color: #245b4a;
          background: #f3fcf7;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }
        .profile-condition-option:hover {
          border-color: #8bd3b2;
          background: #e9faf1;
          transform: translateX(2px);
        }
        .profile-condition-option input {
          width: 17px;
          height: 17px;
          accent-color: #159979;
          cursor: pointer;
        }
        .profile-condition-option input:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }
        .profile-policy {
          color: #5f8175;
          font-size: 11px;
          line-height: 1.55;
        }
        .profile-policy-intro {
          margin: 0 0 13px;
          color: #315f50;
          font-size: 12px;
          font-weight: 650;
        }
        .profile-policy-section {
          margin-top: 12px;
          padding: 11px 12px;
          border: 1px solid #d6eee3;
          border-radius: 13px;
          background: #f3fcf7;
        }
        .profile-policy-section h3 {
          margin: 0 0 5px;
          color: #17785c;
          font-size: 11px;
          font-weight: 850;
        }
        .profile-policy-section p {
          margin: 0;
        }
        .profile-policy-section ul {
          margin: 5px 0 0 16px;
          padding: 0;
        }
        .profile-policy-section li {
          margin: 3px 0;
        }
        .profile-policy-updated {
          display: block;
          margin-top: 14px;
          color: #86a49a;
          font-size: 10px;
          font-weight: 700;
        }
        .profile-picture-picker {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px;
          border: 1px solid #bfe8d5;
          border-radius: 16px;
          background: linear-gradient(135deg, #f3fcf7, #e4f8ed);
          box-shadow: 0 5px 14px rgba(32, 130, 93, 0.07);
          margin-bottom: 12px;
        }
        .profile-picture-preview {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          overflow: hidden;
          flex: 0 0 54px;
          border-radius: 16px;
          color: #fff;
          background: linear-gradient(145deg, #37bd91, #147c65);
          font-size: 18px;
          font-weight: 850;
        }
        .profile-picture-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-picture-copy {
          flex: 1;
          color: #66897c;
          font-size: 10px;
          line-height: 1.4;
        }
        .profile-picture-copy strong {
          display: block;
          margin-bottom: 3px;
          color: #215c49;
          font-size: 11px;
        }
        .profile-picture-input {
          width: 100%;
          margin-top: 7px;
          color: #258b6d;
          font-size: 10px;
          cursor: pointer;
        }
        .profile-picture-input::file-selector-button {
          margin-right: 7px;
          padding: 6px 10px;
          border: 0;
          border-radius: 8px;
          color: #fff;
          background: #159979;
          font: inherit;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .profile-picture-input::file-selector-button:hover {
          background: #087b61;
        }
        .profile-readonly-input {
          color: #769188 !important;
          background: #edf5f1 !important;
          cursor: not-allowed;
        }
        .profile-section:nth-of-type(2) .profile-section-label {
          color: #17785c;
          background: #dff7eb;
          border-color: #a9dfc4;
        }
        .profile-section:nth-of-type(2) .profile-menu {
          border-top: 3px solid #25b88b;
        }
        .profile-section:nth-of-type(3) .profile-section-label {
          color: #a26a18;
          background: #fff2d8;
          border-color: #f1d59c;
        }
        .profile-section:nth-of-type(3) .profile-menu {
          border-top: 3px solid #eab04f;
        }
        .profile-section:nth-of-type(3) .profile-menu-icon {
          color: #b07520;
          border-color: #f0d49d;
          background: linear-gradient(145deg, #fff8e8, #ffedc5);
        }
        .food-avatar-editor {
          margin-bottom: 16px;
          padding: 14px;
          border: 1px solid #d5ece1;
          border-radius: 16px;
          background: #f4fcf8;
        }
        .food-avatar-editor strong {
          display: block;
          font-size: 12px;
          color: #1b4b3e;
          margin-bottom: 10px;
        }
        .food-avatar-grid {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
        }
        .food-avatar-choice {
          padding: 4px;
          border: 2px solid transparent;
          border-radius: 16px;
          background: #fff;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .food-avatar-choice:hover {
          transform: scale(1.05);
        }
        .food-avatar-choice.selected {
          border-color: #20af84;
          box-shadow: 0 4px 12px rgba(32, 175, 132, 0.25);
        }
        .food-avatar-choice .food-avatar {
          width: 52px;
          height: 52px;
          display: block;
          border-radius: 12px;
          overflow: hidden;
        }
        .food-avatar-choice .food-avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .food-avatar-editor small {
          display: block;
          color: #6b8f82;
          font-size: 10.5px;
          line-height: 1.4;
        }
      `}</style>

      <main className="profile-shell">
        <div className="profile-content">
          <header className="profile-topbar">
            <button
              className="profile-icon-button profile-back-button"
              type="button"
              onClick={() => navigate("/home")}
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={19} />
            </button>
            <div className="profile-brand">
              <img src={khanaLensLogo} alt="KhanaLens logo" />
              <span className="profile-brand-copy">
                <strong>
                  Khana<span>Lens</span>
                </strong>
                <small>Scan. Analyze. Eat Smarter.</small>
              </span>
            </div>
          </header>

          <section className="profile-hero">
            <div className="profile-hero-row">
              <div
                className="profile-avatar"
                aria-label={`${profile.name || "User"} avatar`}
              >
                {letters}
              </div>
              <div className="profile-hero-copy">
                <h2>{profile.name || "Set up your profile"}</h2>
                <p>{profile.email}</p>
              </div>
              <button
                className="profile-edit-button"
                type="button"
                onClick={edit}
              >
                <Pencil size={13} /> {profile.completed ? "Edit" : "Set up"}
              </button>
            </div>
            <div className="profile-stat-grid">
              <div className="profile-stat">
                <strong>
                  {Number(profile.calorieGoal || 0).toLocaleString()}
                </strong>
                <span>DAILY KCAL</span>
              </div>
              <div className="profile-stat">
                <strong>{profile.activity || "Moderate"}</strong>
                <span>ACTIVITY</span>
              </div>
              <div className="profile-stat">
                <strong>{streak}</strong>
                <span>DAY STREAK</span>
              </div>
            </div>
          </section>

          {groups.map((group) => (
            <section className="profile-section" key={group.title}>
              <p className="profile-section-label">{group.title}</p>
              <div className="profile-menu">
                {group.items.map((entry) => {
                  const Icon = entry.icon;
                  const isLanguage = entry.id === "language";
                  const description =
                    entry.id === "activity"
                      ? profile.activity
                      : entry.id === "units"
                      ? profile.units
                      : entry.description;
                  return (
                    <div
                      className="profile-menu-row"
                      key={entry.id}
                      role={isLanguage ? "group" : "button"}
                      tabIndex={isLanguage ? -1 : 0}
                      onClick={() => open(entry.id)}
                      onKeyDown={(event) => {
                        if (!isLanguage && (event.key === "Enter" || event.key === " ")) open(entry.id);
                      }}
                    >
                      <span className="profile-menu-icon">
                        <Icon size={16} />
                      </span>
                      <span className="profile-menu-copy">
                        <strong>{entry.label}</strong>
                        <span>{description}</span>
                      </span>
                      {isLanguage ? (
                        <span className="profile-language-picker" aria-label="Select language" onClick={(event) => event.stopPropagation()}>
                          <button type="button" className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} aria-pressed={language === "en"}>English</button>
                          <button type="button" className={language === "ne" ? "active" : ""} onClick={() => setLanguage("ne")} aria-pressed={language === "ne"}>नेपाली</button>
                        </span>
                      ) : (
                        <>
                          <span className="profile-menu-value">
                            {entry.id === "targetWeight"
                              ? `${
                                  isImperial
                                    ? toImperialWeight(profile.targetWeight)
                                    : profile.targetWeight
                                } ${isImperial ? "lb" : "kg"}`
                              : ""}
                          </span>
                          <ChevronRight
                            className="profile-chevron"
                            size={16}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {!profile.completed && (
            <button
              className="profile-save"
              type="button"
              onClick={() => navigate("/profile/setup")}
            >
              Complete your profile
            </button>
          )}

          <button className="profile-logout" type="button" onClick={signOut}>
            <LogOut size={16} /> Log out
          </button>
        </div>

        <nav className="dashboard-nav" aria-label="Main navigation">
          <Link to="/home">
            <Home size={18} />
            <span>Home</span>
          </Link>
          <Link to="/progress">
            <LayoutDashboard size={18} />
            <span>Progress</span>
          </Link>
          <Link className="scan-nav" to="/scan">
            <span>
              <ScanLine size={24} />
              <b aria-hidden="true">✦</b>
            </span>
            <small>Scan</small>
          </Link>
          <Link to="/history">
            <History size={18} />
            <span>History</span>
          </Link>
          <Link className="active" to="/profile">
            <CircleUserRound size={19} />
            <span>Profile</span>
          </Link>
        </nav>
      </main>

      {saved && (
        <div className="profile-toast">
          <Check size={14} /> Profile updated
        </div>
      )}

      {(editing || panel) && (
        <div
          className="profile-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <section
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-label={editing ? "Edit profile" : item?.label}
          >
            <div className="profile-modal-header">
              <h2>{editing ? "Edit profile" : item?.label}</h2>
              <button
                className="profile-modal-close"
                type="button"
                onClick={close}
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            {editing && (
              <>
                <AvatarChooser
                  avatar={draft.avatar}
                  onChange={(avatar) => setDraft({ ...draft, avatar })}
                />
                <form onSubmit={save}>
                  <div className="profile-picture-picker">
                    <div className="profile-picture-preview">
                      <FoodAvatar avatar={draft.avatar} alt="Profile preview" />
                    </div>
                    <div className="profile-picture-copy">
                      <strong>Upload custom photo</strong>
                      JPG, PNG, or WebP · choose a clear image.
                      <input
                        className="profile-picture-input"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>

                  <label className="profile-form-label" htmlFor="profile-name">
                    Full name
                  </label>
                  <input
                    className="profile-form-input"
                    id="profile-name"
                    value={draft.name}
                    onChange={(event) =>
                      setDraft({ ...draft, name: event.target.value })
                    }
                    required
                  />

                  <label className="profile-form-label" htmlFor="profile-email">
                    Email address
                  </label>
                  <input
                    className="profile-form-input profile-readonly-input"
                    id="profile-email"
                    type="email"
                    value={draft.email}
                    readOnly
                    aria-readonly="true"
                    title="Email address cannot be changed here"
                  />
                  <small
                    style={{
                      display: "block",
                      marginTop: 4,
                      color: "#78958a",
                      fontSize: 10,
                    }}
                  >
                    Email is linked to your account and cannot be changed here.
                  </small>

                  <label
                    className="profile-form-label"
                    htmlFor="profile-activity"
                  >
                    Activity level
                  </label>
                  <select
                    className="profile-form-select"
                    id="profile-activity"
                    value={draft.activity}
                    onChange={(event) =>
                      setDraft({ ...draft, activity: event.target.value })
                    }
                  >
                    <option>Light</option>
                    <option>Moderate</option>
                    <option>Very active</option>
                  </select>

                  <label className="profile-form-label" htmlFor="profile-goal">
                    Daily calorie goal (kcal)
                  </label>
                  <input
                    className="profile-form-input"
                    id="profile-goal"
                    type="number"
                    min="1000"
                    max="6000"
                    step="50"
                    value={draft.calorieGoal}
                    onChange={(event) =>
                      setDraft({ ...draft, calorieGoal: event.target.value })
                    }
                  />

                  <button className="profile-save" type="submit">
                    Save changes
                  </button>
                </form>
              </>
            )}

            {!editing && panel === "targetWeight" && (
              <form
                onSubmit={(event) =>
                  saveField(
                    event,
                    "targetWeight",
                    isImperial
                      ? toMetricWeight(draft.targetWeight)
                      : Number(draft.targetWeight) || profile.targetWeight
                  )
                }
              >
                <p className="profile-info-copy">
                  Set the weight you want to work toward. Your current weight stays
                  separate so progress can be measured over time.
                </p>
                <label
                  className="profile-form-label"
                  htmlFor="target-weight-input"
                >
                  Target weight ({isImperial ? "lb" : "kg"})
                </label>
                <input
                  className="profile-form-input"
                  id="target-weight-input"
                  type="number"
                  min={isImperial ? "55" : "25"}
                  max={isImperial ? "882" : "400"}
                  step="0.1"
                  value={displayedTargetWeight}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      targetWeight: isImperial
                        ? toMetricWeight(event.target.value)
                        : event.target.value,
                    })
                  }
                  required
                />
                <button className="profile-save" type="submit">
                  Save target weight
                </button>
              </form>
            )}

            {!editing && panel === "conditions" && (
              <form
                onSubmit={(event) =>
                  saveField(event, "conditions", draft.conditions || [])
                }
              >
                <p className="profile-info-copy">
                  Tell us about any health conditions so future KhanaLens features
                  can personalize your nutrition guidance.
                </p>
                <label className="profile-condition-option">
                  <input
                    type="checkbox"
                    checked={(draft.conditions || []).includes("None")}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        conditions: event.target.checked ? ["None"] : [],
                      })
                    }
                  />{" "}
                  <span>No known conditions</span>
                </label>
                {[
                  "Diabetes",
                  "High blood pressure",
                  "High cholesterol",
                  "Food allergies",
                  "Other",
                ].map((condition) => (
                  <label className="profile-condition-option" key={condition}>
                    <input
                      type="checkbox"
                      disabled={(draft.conditions || []).includes("None")}
                      checked={(draft.conditions || []).includes(condition)}
                      onChange={(event) => {
                        const current = draft.conditions || [];
                        setDraft({
                          ...draft,
                          conditions: event.target.checked
                            ? [
                                ...current.filter((value) => value !== "None"),
                                condition,
                              ]
                            : current.filter((value) => value !== condition),
                        });
                      }}
                    />{" "}
                    <span>{condition}</span>
                  </label>
                ))}
                <button className="profile-save" type="submit">
                  Save health details
                </button>
              </form>
            )}

            {!editing && panel === "units" && (
              <form
                onSubmit={(event) => saveField(event, "units", draft.units)}
              >
                <p className="profile-info-copy">
                  Choose the measurements you prefer to see throughout the app.
                </p>
                <label
                  className="profile-form-label"
                  htmlFor="units-panel-select"
                >
                  Measurement system
                </label>
                <select
                  className="profile-form-select"
                  id="units-panel-select"
                  value={draft.units}
                  onChange={(event) =>
                    setDraft({ ...draft, units: event.target.value })
                  }
                >
                  <option>Metric (kg, cm)</option>
                  <option>Imperial (lb, in)</option>
                </select>
                <button className="profile-save" type="submit">
                  Save units
                </button>
              </form>
            )}

            {!editing && panel === "personal" && (
              <form onSubmit={savePersonal}>
                <p className="profile-info-copy">
                  These details help personalize your account and keep your
                  nutrition reminders relevant.
                </p>
                <label className="profile-form-label" htmlFor="personal-age">
                  Age
                </label>
                <input
                  className="profile-form-input"
                  id="personal-age"
                  type="number"
                  min="7"
                  max="120"
                  value={draft.age}
                  onChange={(event) =>
                    setDraft({ ...draft, age: event.target.value })
                  }
                  required
                />
                <small
                  style={{
                    display: "block",
                    marginTop: 4,
                    color: "#78958a",
                    fontSize: 10,
                    lineHeight: 1.4,
                  }}
                >
                  Affects how fast your body burns energy.
                </small>

                <label className="profile-form-label" htmlFor="personal-gender">
                  Gender
                </label>
                <select
                  className="profile-form-select"
                  id="personal-gender"
                  value={draft.gender}
                  onChange={(event) =>
                    setDraft({ ...draft, gender: event.target.value })
                  }
                  required
                >
                  <option value="">Select gender</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
                <small
                  style={{
                    display: "block",
                    marginTop: 4,
                    color: "#78958a",
                    fontSize: 10,
                    lineHeight: 1.4,
                  }}
                >
                  Changes the base calorie formula.
                </small>

                <label className="profile-form-label" htmlFor="personal-height">
                  Height ({isImperial ? "in" : "cm"})
                </label>
                <input
                  className="profile-form-input"
                  id="personal-height"
                  type="number"
                  min={isImperial ? "39" : "100"}
                  max={isImperial ? "98" : "250"}
                  step="0.1"
                  value={displayedHeight}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      height: isImperial
                        ? toMetricHeight(event.target.value)
                        : event.target.value,
                    })
                  }
                  required
                />
                <small
                  style={{
                    display: "block",
                    marginTop: 4,
                    color: "#78958a",
                    fontSize: 10,
                    lineHeight: 1.4,
                  }}
                >
                  Used to find your body size.
                </small>

                <label className="profile-form-label" htmlFor="personal-weight">
                  Current weight ({isImperial ? "lb" : "kg"})
                </label>
                <input
                  className="profile-form-input"
                  id="personal-weight"
                  type="number"
                  min={isImperial ? "55" : "25"}
                  max={isImperial ? "882" : "400"}
                  step="0.1"
                  value={displayedWeight}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      currentWeight: isImperial
                        ? toMetricWeight(event.target.value)
                        : event.target.value,
                    })
                  }
                  required
                />
                <small
                  style={{
                    display: "block",
                    marginTop: 4,
                    color: "#78958a",
                    fontSize: 10,
                    lineHeight: 1.4,
                  }}
                >
                  The starting point for your math.
                </small>

                <button className="profile-save" type="submit">
                  Save personal information
                </button>
              </form>
            )}

            {!editing && panel === "privacy" && (
              <div className="profile-policy">
                <p className="profile-policy-intro">
                  KhanaLens uses your information to provide food scanning,
                  nutrition tracking, and personalized goals.
                </p>
                <div className="profile-policy-section">
                  <h3>What we collect</h3>
                  <ul>
                    <li>Account details such as your name and email</li>
                    <li>Food images, meal history, and nutrition goals</li>
                    <li>
                      Optional profile details like age, height, weight, and health
                      conditions
                    </li>
                    <li>
                      Limited device and usage information to keep the app reliable
                    </li>
                  </ul>
                </div>
                <div className="profile-policy-section">
                  <h3>How we use it</h3>
                  <p>
                    We use this information to analyze meals, show nutrition
                    estimates, save your progress, improve the app, and protect
                    account security.
                  </p>
                </div>
                <div className="profile-policy-section">
                  <h3>AI and sharing</h3>
                  <p>
                    Food images may be processed by AI providers such as Google
                    Gemini. We do not sell your personal information; limited
                    service providers may process data only to operate KhanaLens.
                  </p>
                </div>
                <div className="profile-policy-section">
                  <h3>Your choices</h3>
                  <p>
                    You may request access, correction, or deletion of your
                    information. Avoid uploading faces, documents, addresses, or
                    other unnecessary sensitive content with food images.
                  </p>
                </div>
                <span className="profile-policy-updated">
                  Last updated: August 15, 2026 · AI nutrition estimates are not
                  medical advice.
                </span>
              </div>
            )}

            {!editing && panel === "support" && (
              <p className="profile-info-copy">
                Need a hand? Start by checking your nutrition history and daily
                goals. If something still looks wrong, contact the KhanaLens support
                team.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
