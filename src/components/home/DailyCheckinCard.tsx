import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MoodFeeling, EnergyLevel } from '../../types';
import {
  Smile,
  Zap,
  CheckCircle2,
  Sparkles,
  Send,
  Edit2,
  Heart,
  Bot,
} from 'lucide-react';

export const DailyCheckinCard: React.FC = () => {
  const { todayCheckin, logDailyCheckin, user } = useApp();
  const [selectedMood, setSelectedMood] = useState<MoodFeeling | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel>('medium');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const moods: { key: MoodFeeling; label: string; emoji: string; desc: string }[] = [
    { key: 'great', label: 'Great', emoji: '😄', desc: 'High energy & ready' },
    { key: 'good', label: 'Good', emoji: '🙂', desc: 'Balanced & steady' },
    { key: 'okay', label: 'Okay', emoji: '😐', desc: 'Normal baseline' },
    { key: 'low', label: 'Low', emoji: '😕', desc: 'Low motivation' },
    { key: 'tired', label: 'Tired', emoji: '😴', desc: 'Need recovery' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;
    setIsSubmitting(true);
    try {
      await logDailyCheckin(selectedMood, selectedEnergy, note);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already checked in today and not editing
  if (todayCheckin && !isEditing) {
    const currentMoodObj = moods.find((m) => m.key === todayCheckin.mood);
    const isLowOrTired = todayCheckin.mood === 'tired' || todayCheckin.mood === 'low';

    return (
      <div
        id="daily-checkin-completed-card"
        className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-all"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                <Heart className="w-4 h-4 text-indigo-500 fill-indigo-500" />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Daily Check-in Logged
              </span>
            </div>
            <button
              id="edit-checkin-btn"
              onClick={() => {
                setSelectedMood(todayCheckin.mood);
                setSelectedEnergy(todayCheckin.energy || 'medium');
                setNote(todayCheckin.note || '');
                setIsEditing(true);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
            <span className="text-2xl">{currentMoodObj?.emoji || '🙂'}</span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Feeling {currentMoodObj?.label || todayCheckin.mood} • Energy: {todayCheckin.energy || 'medium'}
              </p>
              {todayCheckin.note && (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5 truncate">
                  "{todayCheckin.note}"
                </p>
              )}
            </div>
          </div>

          {/* Supportive AI acknowledgement */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-2.5">
            <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed font-medium">
              {isLowOrTired
                ? `Thanks for sharing, ${user.name.split(' ')[0] || 'friend'}. We'll keep today's guidance gentle and prioritize restful recovery.`
                : `Great to hear you're feeling ${todayCheckin.mood}! Your AI coach has tailored today's routine to match your energy.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="daily-checkin-input-card"
      className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60 shadow-xs transition-all space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            <Heart className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            AI Daily Check-in
          </span>
        </div>
        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
          How are you feeling today?
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Mood Selector Buttons */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {moods.map((m) => {
            const isSelected = selectedMood === m.key;
            return (
              <button
                key={m.key}
                type="button"
                id={`mood-btn-${m.key}`}
                onClick={() => setSelectedMood(m.key)}
                className={`p-2 sm:p-2.5 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-102'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-xl sm:text-2xl">{m.emoji}</span>
                <span className="text-[10px] sm:text-xs font-bold mt-1 truncate">
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Optional note input */}
        <div className="relative">
          <input
            type="text"
            id="checkin-note-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional: Anything you want your AI coach to know? (e.g. sore calves, busy morning)"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-slate-400">
            Helps FitFlow AI personalize your workouts & recovery
          </p>
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              id="submit-daily-checkin-btn"
              disabled={!selectedMood || isSubmitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Check-in</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
