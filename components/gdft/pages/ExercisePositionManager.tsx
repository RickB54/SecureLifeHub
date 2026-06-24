import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronDown, ChevronUp, Save, Check, AlertCircle, ExternalLink, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/gdft/components/ui/button';

interface ExerciseRow {
  id: string;
  name: string;
  category: string;
  start_position_url: string | null;
  end_position_url: string | null;
  // local edit state
  _startDraft?: string;
  _endDraft?: string;
  _saved?: boolean;
  _error?: string;
  _saving?: boolean;
}

const CATEGORIES = ['Weights', 'No Equipment'];

const ExercisePositionManager: React.FC = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('Weights');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [globalSaving, setGlobalSaving] = useState(false);

  // Load exercises from Supabase
  const loadExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('exercises')
      .select('id, name, category, start_position_url, end_position_url')
      .in('category', CATEGORIES)
      .order('category')
      .order('name');

    if (err) {
      setError(err.message);
    } else {
      setExercises((data || []).map(ex => ({
        ...ex,
        _startDraft: ex.start_position_url ?? '',
        _endDraft: ex.end_position_url ?? '',
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadExercises(); }, [loadExercises]);

  const updateDraft = (id: string, field: '_startDraft' | '_endDraft', value: string) => {
    setExercises(prev => prev.map(ex =>
      ex.id === id ? { ...ex, [field]: value, _saved: false, _error: undefined } : ex
    ));
  };

  const saveOne = async (ex: ExerciseRow) => {
    setExercises(prev => prev.map(e => e.id === ex.id ? { ...e, _saving: true, _error: undefined } : e));

    const { error: err } = await supabase.rpc('update_exercise_position_images', {
      p_exercise_id: ex.id,
      p_start_url: ex._startDraft || null,
      p_end_url: ex._endDraft || null,
    });

    if (err) {
      // Fallback: try direct update (works if user owns the exercise)
      const { error: err2 } = await supabase
        .from('exercises')
        .update({
          start_position_url: ex._startDraft || null,
          end_position_url: ex._endDraft || null,
        })
        .eq('id', ex.id);

      setExercises(prev => prev.map(e =>
        e.id === ex.id ? {
          ...e,
          _saving: false,
          _saved: !err2,
          _error: err2 ? `${err.message} | ${err2.message}` : undefined,
          start_position_url: err2 ? e.start_position_url : (ex._startDraft || null),
          end_position_url: err2 ? e.end_position_url : (ex._endDraft || null),
        } : e
      ));
    } else {
      setExercises(prev => prev.map(e =>
        e.id === ex.id ? {
          ...e,
          _saving: false,
          _saved: true,
          start_position_url: ex._startDraft || null,
          end_position_url: ex._endDraft || null,
        } : e
      ));
    }
  };

  const saveAll = async () => {
    setGlobalSaving(true);
    const dirty = exercises.filter(ex =>
      (ex._startDraft !== (ex.start_position_url ?? '')) ||
      (ex._endDraft !== (ex.end_position_url ?? ''))
    );
    for (const ex of dirty) {
      await saveOne(ex);
    }
    setGlobalSaving(false);
  };

  const visible = exercises.filter(ex => {
    const catMatch = filter === 'All' || ex.category === filter;
    const searchMatch = !search || ex.name.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const hasChanges = exercises.some(ex =>
    (ex._startDraft !== (ex.start_position_url ?? '')) ||
    (ex._endDraft !== (ex.end_position_url ?? ''))
  );

  const withImages = exercises.filter(ex => ex.start_position_url || ex.end_position_url).length;
  const total = exercises.length;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 pb-24">
      {/* Header */}
      <div className="mb-6 flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-white/5 mt-1">
          <ArrowLeft className="h-6 w-6 text-white" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Exercise Position Images</h1>
          <p className="text-gray-400 text-sm">
          Add start &amp; end position image URLs for each exercise. These display during live workouts.
        </p>
        <div className="mt-3 flex gap-4 text-xs text-gray-400">
          <span className="text-sky-400 font-semibold">{withImages}/{total}</span> exercises have images
        </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['All', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === cat
                ? 'bg-sky-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-32 bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 border border-gray-700 focus:border-sky-500 outline-none"
        />
      </div>

      {/* Save All button */}
      {hasChanges && (
        <button
          onClick={saveAll}
          disabled={globalSaving}
          className="w-full mb-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold transition-all disabled:opacity-60"
        >
          {globalSaving ? 'Saving all changes...' : `Save All Changes`}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-500 rounded-lg text-red-300 text-xs flex gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading exercises...</div>
      ) : (
        <div className="space-y-2">
          {visible.length === 0 && (
            <div className="text-center text-gray-500 py-8">No exercises found</div>
          )}
          {visible.map(ex => {
            const isExpanded = expanded === ex.id;
            const hasStart = !!(ex._startDraft || ex.start_position_url);
            const hasEnd = !!(ex._endDraft || ex.end_position_url);
            const isDirty =
              (ex._startDraft !== (ex.start_position_url ?? '')) ||
              (ex._endDraft !== (ex.end_position_url ?? ''));

            return (
              <div
                key={ex.id}
                className={`rounded-xl border transition-all ${
                  isExpanded
                    ? 'border-sky-600 bg-gray-800'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                }`}
              >
                {/* Row header */}
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  onClick={() => setExpanded(isExpanded ? null : ex.id)}
                >
                  {/* Image status dots */}
                  <div className="flex gap-1 flex-shrink-0">
                    <span
                      title="Start image"
                      className={`w-2 h-2 rounded-full ${hasStart ? 'bg-green-400' : 'bg-gray-700'}`}
                    />
                    <span
                      title="End image"
                      className={`w-2 h-2 rounded-full ${hasEnd ? 'bg-green-400' : 'bg-gray-700'}`}
                    />
                  </div>
                  <span className="flex-1 text-sm font-medium text-white">{ex.name}</span>
                  <span className="text-xs text-gray-500 mr-2">{ex.category}</span>
                  {ex._saved && <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />}
                  {isDirty && !ex._saved && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {/* Expanded editor */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4">
                    {/* Start position */}
                    <div>
                      <label className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 block">
                        Start Position (extended / lowered)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://..."
                          value={ex._startDraft ?? ''}
                          onChange={e => updateDraft(ex.id, '_startDraft', e.target.value)}
                          className="flex-1 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 border border-gray-700 focus:border-sky-500 outline-none"
                        />
                        {ex._startDraft && (
                          <a
                            href={ex._startDraft}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-400 hover:text-white"
                          >
                            <ExternalLink className="w-4 h-4 mt-2" />
                          </a>
                        )}
                      </div>
                      {ex._startDraft && (
                        <div className="mt-2 rounded-lg overflow-hidden bg-gray-900 h-32 flex items-center justify-center">
                          <img
                            src={ex._startDraft}
                            alt="Start"
                            className="h-full w-full object-contain"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>

                    {/* End position */}
                    <div>
                      <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 block">
                        End Position (contracted / raised)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://..."
                          value={ex._endDraft ?? ''}
                          onChange={e => updateDraft(ex.id, '_endDraft', e.target.value)}
                          className="flex-1 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 border border-gray-700 focus:border-sky-500 outline-none"
                        />
                        {ex._endDraft && (
                          <a
                            href={ex._endDraft}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-400 hover:text-white"
                          >
                            <ExternalLink className="w-4 h-4 mt-2" />
                          </a>
                        )}
                      </div>
                      {ex._endDraft && (
                        <div className="mt-2 rounded-lg overflow-hidden bg-gray-900 h-32 flex items-center justify-center">
                          <img
                            src={ex._endDraft}
                            alt="End"
                            className="h-full w-full object-contain"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Error for this exercise */}
                    {ex._error && (
                      <p className="text-red-400 text-xs">{ex._error}</p>
                    )}

                    {/* Save this exercise */}
                    <button
                      onClick={() => saveOne(ex)}
                      disabled={ex._saving}
                      className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        ex._saved
                          ? 'bg-green-700 text-white'
                          : 'bg-sky-600 hover:bg-sky-500 text-white'
                      } disabled:opacity-60`}
                    >
                      {ex._saving ? (
                        'Saving...'
                      ) : ex._saved ? (
                        <><Check className="w-3.5 h-3.5" /> Saved</>
                      ) : (
                        <><Save className="w-3.5 h-3.5" /> Save {ex.name}</>
                      )}
                    </button>

                    {/* Quick links for free images */}
                    <div className="border-t border-gray-700 pt-3">
                      <p className="text-xs text-gray-500 mb-2">Find free images:</p>
                      <div className="flex flex-wrap gap-2">
                        {['Pixabay', 'Pexels', 'Unsplash', 'Wikimedia'].map(source => {
                          const urls: Record<string, string> = {
                            Pixabay: `https://pixabay.com/images/search/${encodeURIComponent(ex.name + ' exercise')}`,
                            Pexels: `https://www.pexels.com/search/${encodeURIComponent(ex.name + ' exercise')}`,
                            Unsplash: `https://unsplash.com/s/photos/${encodeURIComponent(ex.name + '-exercise')}`,
                            Wikimedia: `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(ex.name)}`,
                          };
                          return (
                            <a
                              key={source}
                              href={urls[source]}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-sky-400 hover:text-sky-300 underline"
                            >
                              {source} ↗
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExercisePositionManager;
