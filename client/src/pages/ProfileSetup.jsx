import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, UserRound, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProfileApi, saveProfileApi } from '../services/api';
import { FOOD_AVATARS, FoodAvatar } from '../components/FoodAvatar';
import khanaLensLogo from '../assets/images/KhanaLens.jpg';

const steps = ['Basic info', 'Body', 'Health', 'Goals'];
const defaultDraft = {
  name: '',
  age: '',
  gender: '',
  height: '',
  currentWeight: '',
  targetWeight: '',
  conditions: [],
  calorieGoal: 2000,
  proteinGoal: 120,
  carbsGoal: 250,
  fatGoal: 70,
  avatar: 'taco',
};
const healthOptions = [
  'Diabetes',
  'High blood pressure',
  'Heart disease',
  'Thyroid',
  'PCOS',
  'Asthma',
  'None of the above',
];

const requiredForStep = (step, draft) => {
  if (step === 0) return Boolean(draft.name.trim() && draft.age && draft.gender);
  if (step === 1) return Boolean(draft.height && draft.currentWeight);
  return true;
};

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({ ...defaultDraft, name: user?.name || '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    getProfileApi()
      .then((response) => {
        const profile = response.data.data;
        if (profile?.completed) {
          navigate('/home', { replace: true });
          return;
        }
        if (profile) {
          setDraft((current) => ({
            ...current,
            ...profile,
            name: profile.name || user.name || '',
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id, user?.name, navigate]);

  const progress = useMemo(() => `${((step + 1) / steps.length) * 100}%`, [step]);
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  const toggleCondition = (condition) => {
    if (condition === 'None of the above') {
      update('conditions', draft.conditions.includes(condition) ? [] : [condition]);
      return;
    }
    update(
      'conditions',
      draft.conditions.includes(condition)
        ? draft.conditions.filter((item) => item !== condition)
        : [...draft.conditions.filter((item) => item !== 'None of the above'), condition]
    );
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      update('avatar', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const next = () => {
    setError('');
    if (!requiredForStep(step, draft)) {
      setError(
        step === 0
          ? 'Please provide your name, age, and gender to proceed.'
          : 'Please enter your height and current weight to proceed.'
      );
      return;
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const finish = async (event) => {
    event.preventDefault();
    if (!requiredForStep(0, draft) || !requiredForStep(1, draft)) {
      setError('Please complete your basic info and body measurements.');
      setStep(!requiredForStep(0, draft) ? 0 : 1);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await saveProfileApi({ ...draft, email: user.email, completed: true });
      const profile = response.data.data || { ...draft, completed: true };
      navigate('/home', { replace: true });
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="setup-page">
        <style>{`
          .setup-page { min-height: 100dvh; background: linear-gradient(160deg, #dff7ed 0%, #f4fbf8 45%, #eaf6f2 100%); display: flex; align-items: center; justify-content: center; font-family: Inter, sans-serif; }
          .setup-loading { color: #167a5f; font-size: 14px; font-weight: 750; }
        `}</style>
        <div className="setup-loading">Loading your profile…</div>
      </div>
    );
  }

  return (
    <div className="setup-page">
      <style>{`
        .setup-page {
          min-height: 100dvh;
          background: linear-gradient(160deg, #dff7ed 0%, #f4fbf8 45%, #eaf6f2 100%);
          color: #173b32;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          box-sizing: border-box;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .setup-card {
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          border: 1px solid rgba(214, 238, 227, 0.95);
          border-radius: 26px;
          box-shadow: 0 20px 50px rgba(22, 70, 52, 0.12);
          padding: 24px 22px 28px;
          box-sizing: border-box;
          position: relative;
          animation: setup-fade-in 0.35s cubic-bezier(0.2, 0.8, 0.25, 1);
        }

        @keyframes setup-fade-in {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .setup-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .setup-back {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 1px solid #d5ebe1;
          background: #f3fcf8;
          color: #167a5f;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .setup-back:hover {
          background: #e5f8f0;
          transform: translateX(-2px);
        }

        .setup-brand {
          display: flex;
          align-items: center;
          gap: 9px;
        }
        .setup-brand img {
          width: 34px;
          height: 34px;
          border-radius: 11px;
          object-fit: cover;
          box-shadow: 0 4px 10px rgba(24, 138, 102, 0.2);
        }
        .setup-brand strong {
          display: block;
          color: #173f34;
          font-size: 16px;
          line-height: 1.1;
          letter-spacing: -0.4px;
        }
        .setup-brand strong span {
          color: #25a47f;
        }
        .setup-brand small {
          display: block;
          margin-top: 2px;
          color: #729688;
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.2px;
        }

        .setup-avatar-wrap {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid #e2f5ec;
          display: grid;
          place-items: center;
          box-shadow: 0 4px 10px rgba(24, 138, 102, 0.12);
        }

        .setup-title {
          margin-bottom: 16px;
        }
        .setup-title p {
          margin: 0;
          color: #1a9675;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.2px;
        }
        .setup-title h1 {
          margin: 6px 0 4px;
          color: #123d32;
          font-size: 21px;
          font-weight: 850;
          letter-spacing: -0.4px;
          line-height: 1.25;
        }
        .setup-title span {
          color: #688f80;
          font-size: 12px;
          line-height: 1.45;
        }

        .setup-progress {
          width: 100%;
          height: 6px;
          background: #eaf6f1;
          border-radius: 99px;
          margin: 16px 0 12px;
          overflow: hidden;
        }
        .setup-progress span {
          display: block;
          height: 100%;
          background: linear-gradient(90deg, #27b88b, #0c7c62);
          border-radius: 99px;
          transition: width 0.35s cubic-bezier(0.2, 0.8, 0.25, 1);
        }

        .setup-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 22px;
        }
        .setup-steps div {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 4px;
          color: #8ba99d;
          font-size: 10px;
          font-weight: 700;
        }
        .setup-steps div.active {
          color: #12795d;
        }
        .setup-steps b {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #ebf5f1;
          color: #729688;
          font-size: 10px;
          font-weight: 800;
          transition: all 0.25s ease;
        }
        .setup-steps div.active b {
          background: linear-gradient(135deg, #27b88b, #087b61);
          color: #fff;
          box-shadow: 0 4px 10px rgba(18, 140, 102, 0.28);
        }

        .setup-form label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
          color: #32584c;
          font-size: 11.5px;
          font-weight: 800;
        }
        .setup-form input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border: 1px solid #d4ebe0;
          border-radius: 13px;
          background: #f8fdfb;
          color: #164035;
          font: inherit;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .setup-form input:focus {
          border-color: #35c59a;
          box-shadow: 0 0 0 3.5px rgba(53, 197, 154, 0.18);
          background: #ffffff;
        }

        .setup-callout {
          padding: 12px 14px;
          margin-bottom: 16px;
          border: 1px solid #c7ecd9;
          border-radius: 14px;
          background: #edf9f3;
          color: #19785c;
          font-size: 11.5px;
          font-weight: 650;
          line-height: 1.45;
        }

        .setup-form fieldset {
          border: 0;
          padding: 0;
          margin: 0 0 16px;
        }
        .setup-form legend {
          color: #32584c;
          font-size: 11.5px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .setup-choice-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .setup-choice-row button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 11px 8px;
          border: 1px solid #d2eae0;
          border-radius: 12px;
          background: #f8fdfa;
          color: #436c5f;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .setup-choice-row button:hover {
          border-color: #83d4b1;
          background: #eefaf4;
          transform: translateY(-1px);
        }
        .setup-choice-row button.selected {
          border-color: #27b88b;
          background: linear-gradient(145deg, #e4f8ef, #d0f3e3);
          color: #0c7457;
          font-weight: 850;
          box-shadow: 0 4px 12px rgba(22, 137, 100, 0.16);
        }

        .setup-avatar-picker-block {
          padding: 12px 14px;
          margin-bottom: 16px;
          border: 1px solid #d5eee2;
          border-radius: 15px;
          background: #f5fcf8;
        }
        .setup-avatar-picker-block strong {
          display: block;
          color: #205646;
          font-size: 11.5px;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .setup-avatar-grid-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .setup-avatar-choice-btn {
          padding: 3px;
          border: 2px solid transparent;
          border-radius: 13px;
          background: #fff;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .setup-avatar-choice-btn:hover {
          transform: scale(1.05);
        }
        .setup-avatar-choice-btn.selected {
          border-color: #27b88b;
          box-shadow: 0 4px 10px rgba(24, 140, 102, 0.2);
        }
        .setup-avatar-choice-btn .food-avatar {
          width: 44px;
          height: 44px;
          display: block;
          border-radius: 10px;
          overflow: hidden;
        }
        .setup-avatar-upload-label {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-left: auto;
          padding: 7px 11px;
          border-radius: 10px;
          background: #e2f7ec;
          color: #167a5f;
          font-size: 11px;
          font-weight: 750;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .setup-avatar-upload-label:hover {
          background: #cff3e1;
        }
        .setup-avatar-upload-label input {
          display: none;
        }

        .setup-label {
          color: #32584c;
          font-size: 12px;
          font-weight: 800;
          margin: 0 0 10px;
        }
        .setup-condition-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 16px;
        }
        .setup-condition-grid button {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 6px;
          padding: 11px 12px;
          border: 1px solid #d2eae0;
          border-radius: 12px;
          background: #f8fdfa;
          color: #325b4e;
          font-size: 11.5px;
          font-weight: 750;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
        }
        .setup-condition-grid button:hover {
          border-color: #83d4b1;
          background: #eefaf4;
        }
        .setup-condition-grid button.selected {
          border-color: #27b88b;
          background: #e2f8ee;
          color: #0b7356;
          font-weight: 850;
          box-shadow: 0 4px 12px rgba(22, 137, 100, 0.14);
        }

        .setup-goal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 16px;
        }
        .setup-goal-grid button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 13px;
          border: 1px solid #d2eae0;
          border-radius: 13px;
          background: #f8fdfa;
          color: #2c584b;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .setup-goal-grid button:hover {
          border-color: #83d4b1;
          background: #eefaf4;
        }
        .setup-goal-grid button.selected {
          border-color: #27b88b;
          background: linear-gradient(145deg, #e3f8ee, #d3f4e5);
          color: #0b7356;
          font-weight: 850;
          box-shadow: 0 4px 14px rgba(22, 137, 100, 0.18);
        }

        .setup-macro-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }

        .setup-error {
          padding: 10px 14px;
          margin-bottom: 14px;
          border-radius: 12px;
          background: #fee2e2;
          border: 1px solid #fca5a5;
          color: #b91c1c;
          font-size: 11.5px;
          font-weight: 750;
          text-align: center;
        }

        .setup-submit {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 18px;
          border: 0;
          border-radius: 14px;
          background: linear-gradient(135deg, #27b88b, #087b61);
          color: #ffffff;
          font-size: 13.5px;
          font-weight: 850;
          cursor: pointer;
          box-shadow: 0 8px 22px rgba(18, 140, 102, 0.28);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .setup-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 26px rgba(18, 140, 102, 0.38);
        }
        .setup-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .setup-safe {
          margin: 14px 0 0;
          text-align: center;
          color: #729688;
          font-size: 10.5px;
          font-weight: 600;
          line-height: 1.4;
        }
      `}</style>

      <main className="setup-card">
        <header className="setup-header">
          <button
            type="button"
            className="setup-back"
            onClick={() => (step ? setStep(step - 1) : navigate('/home'))}
            aria-label="Go back"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="setup-brand">
            <img src={khanaLensLogo} alt="KhanaLens logo" />
            <span>
              <strong>
                Khana<span>Lens</span>
              </strong>
              <small>Complete your profile</small>
            </span>
          </div>
          <div className="setup-avatar-wrap">
            <FoodAvatar avatar={draft.avatar} alt="Selected food avatar" />
          </div>
        </header>

        <div className="setup-title">
          <p>
            STEP {step + 1} OF {steps.length}
          </p>
          <h1>
            {step === 0
              ? "Let's build your health profile"
              : step === 1
              ? 'Tell us about your body'
              : step === 2
              ? 'Help us personalize your plan'
              : 'What are your main goals?'}
          </h1>
          <span>
            {step === 0
              ? 'This helps calculate your daily nutritional targets.'
              : step === 1
              ? 'We use height and weight to estimate calorie needs accurately.'
              : step === 2
              ? 'Select any health conditions so guidance is tailored to you.'
              : 'Set your calorie and macronutrient targets.'}
          </span>
        </div>

        <div className="setup-progress">
          <span style={{ width: progress }} />
        </div>
        <div className="setup-steps">
          {steps.map((label, index) => (
            <div className={index <= step ? 'active' : ''} key={label}>
              <b>{index < step ? <Check size={12} /> : index + 1}</b>
              <small>{label}</small>
            </div>
          ))}
        </div>

        <form
          onSubmit={
            step === steps.length - 1
              ? finish
              : (event) => {
                  event.preventDefault();
                  next();
                }
          }
        >
          {step === 0 && (
            <section className="setup-form">
              <label>
                Full name
                <input
                  value={draft.name}
                  onChange={(event) => update('name', event.target.value)}
                  placeholder="e.g. Aashish Sharma"
                  autoFocus
                  required
                />
              </label>
              <label>
                Age
                <input
                  type="number"
                  min="7"
                  max="120"
                  value={draft.age}
                  onChange={(event) => update('age', event.target.value)}
                  placeholder="e.g. 24"
                  required
                />
              </label>
              <fieldset>
                <legend>Gender</legend>
                <div className="setup-choice-row">
                  {['Male', 'Female', 'Other'].map((value) => (
                    <button
                      type="button"
                      className={draft.gender === value ? 'selected' : ''}
                      key={value}
                      onClick={() => update('gender', value)}
                    >
                      <UserRound size={15} />
                      {value}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="setup-avatar-picker-block">
                <strong>Choose your avatar</strong>
                <div className="setup-avatar-grid-row">
                  {FOOD_AVATARS.map((option) => (
                    <button
                      type="button"
                      key={option.id}
                      className={`setup-avatar-choice-btn ${
                        draft.avatar === option.id ? 'selected' : ''
                      }`}
                      onClick={() => update('avatar', option.id)}
                    >
                      <FoodAvatar avatar={option.id} alt={option.label} />
                    </button>
                  ))}
                  <label className="setup-avatar-upload-label">
                    <Sparkles size={13} /> Upload Photo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="setup-form">
              <div className="setup-callout">
                Your body measurements calculate your Basal Metabolic Rate (BMR) and daily targets.
              </div>
              <label>
                Height (cm)
                <input
                  type="number"
                  min="100"
                  max="250"
                  step="0.1"
                  value={draft.height}
                  onChange={(event) => update('height', event.target.value)}
                  placeholder="e.g. 172"
                  required
                />
              </label>
              <label>
                Current weight (kg)
                <input
                  type="number"
                  min="25"
                  max="400"
                  step="0.1"
                  value={draft.currentWeight}
                  onChange={(event) => update('currentWeight', event.target.value)}
                  placeholder="e.g. 68"
                  required
                />
              </label>
              <label>
                Target weight (kg) <span style={{ fontWeight: 400, color: '#78958a' }}>(optional)</span>
                <input
                  type="number"
                  min="25"
                  max="400"
                  step="0.1"
                  value={draft.targetWeight}
                  onChange={(event) => update('targetWeight', event.target.value)}
                  placeholder="e.g. 65"
                />
              </label>
            </section>
          )}

          {step === 2 && (
            <section className="setup-form">
              <p className="setup-label">Health conditions (select all that apply)</p>
              <div className="setup-condition-grid">
                {healthOptions.map((condition) => (
                  <button
                    type="button"
                    className={draft.conditions.includes(condition) ? 'selected' : ''}
                    key={condition}
                    onClick={() => toggleCondition(condition)}
                  >
                    {draft.conditions.includes(condition) && <Check size={13} />}
                    {condition}
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="setup-form">
              <p className="setup-label">Choose your primary goal</p>
              <div className="setup-goal-grid">
                {[
                  ['Lose weight', 1800],
                  ['Maintain weight', 2000],
                  ['Gain weight', 2400],
                  ['Improve health', 2000],
                ].map(([label, calories]) => (
                  <button
                    type="button"
                    className={Number(draft.calorieGoal) === calories ? 'selected' : ''}
                    key={label}
                    onClick={() => update('calorieGoal', calories)}
                  >
                    <span>{label}</span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>

              <p className="setup-label" style={{ marginTop: 14 }}>
                Daily Macronutrient Targets
              </p>
              <div className="setup-macro-grid">
                <label>
                  Protein (g)
                  <input
                    type="number"
                    value={draft.proteinGoal}
                    onChange={(event) => update('proteinGoal', event.target.value)}
                  />
                </label>
                <label>
                  Carbs (g)
                  <input
                    type="number"
                    value={draft.carbsGoal}
                    onChange={(event) => update('carbsGoal', event.target.value)}
                  />
                </label>
                <label>
                  Fat (g)
                  <input
                    type="number"
                    value={draft.fatGoal}
                    onChange={(event) => update('fatGoal', event.target.value)}
                  />
                </label>
              </div>
            </section>
          )}

          {error && <p className="setup-error">{error}</p>}

          <button className="setup-submit" type="submit" disabled={saving}>
            {saving ? 'Saving…' : step === steps.length - 1 ? 'Complete profile' : 'Continue'}{' '}
            <ChevronRight size={17} />
          </button>
        </form>

        <p className="setup-safe">
          Your information is stored securely and can be edited anytime from your Profile.
        </p>
      </main>
    </div>
  );
}
