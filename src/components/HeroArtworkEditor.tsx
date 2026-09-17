import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2, Upload } from 'lucide-react';
import { api, type Content } from '../lib/content';
import KineticSculpture from './KineticSculpture';

type Artwork = Content['heroArtwork'];

const isLogoSlide = (text: string) => {
  const s = text.trim().toLowerCase();
  return s === '[logo]' || s === '__logo__' || s === 'logo';
};

export default function HeroArtworkEditor({
  value,
  onChange,
  csrf,
  initials,
  owner,
  accent,
}: {
  value: Artwork;
  onChange: (next: Artwork) => void;
  csrf: string;
  initials: string;
  owner: string;
  accent: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const latest = useRef({ value, onChange });
  const mounted = useRef(true);

  useEffect(() => {
    latest.current = { value, onChange };
  }, [value, onChange]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const update = (patch: Partial<Artwork>) => onChange({ ...value, ...patch });

  const moveSlide = (index: number, delta: number) => {
    const next = [...value.phrases];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    update({ phrases: next });
  };

  const removeSlide = (index: number) => {
    if (value.phrases.length <= 1) return;
    update({ phrases: value.phrases.filter((_, i) => i !== index) });
  };

  const updateSlide = (index: number, text: string) => {
    update({ phrases: value.phrases.map((item, i) => (i === index ? text : item)) });
  };

  const upload = async (file: File) => {
    setError('');
    if (file.size > 3 * 1024 * 1024) {
      setError('Choose a logo under 3 MB.');
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Use PNG, JPEG or WebP.');
      return;
    }
    setUploading(true);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(new Error('Could not read the logo.'));
        reader.readAsDataURL(file);
      });
      const result = await api<{ url: string }>('/api/uploads', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrf },
        body: JSON.stringify({ data, kind: 'logo' }),
      });
      if (mounted.current) latest.current.onChange({ ...latest.current.value, logo: result.url });
    } catch (e) {
      if (mounted.current) setError((e as Error).message);
    } finally {
      if (mounted.current) setUploading(false);
    }
  };

  const logoSection = (
    <div
      className="hero-logo-controls"
      tabIndex={0}
      aria-label="Logo upload. Paste an image here or use Upload logo."
      onPaste={event => {
        const file = Array.from(event.clipboardData.items)
          .find(item => item.type.startsWith('image/'))
          ?.getAsFile();
        if (file) {
          event.preventDefault();
          void upload(file);
        }
      }}
      style={{
        padding: '14px 16px',
        border: '1px solid var(--line, #ddd)',
        borderRadius: '8px',
        background: 'var(--card, #fff)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <strong style={{ fontSize: '13px' }}>Logo & Brand Mark Asset</strong>
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
          {value.logo ? 'Custom logo active' : 'Using default ' + initials + ' ✳ brand mark'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="upload-button" style={{ padding: '7px 12px', fontSize: '12px' }}>
          <Upload size={14} />
          {uploading ? 'Uploading…' : 'Upload custom logo'}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={uploading}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = '';
            }}
          />
        </label>
        {value.logo && (
          <button type="button" className="text-link" style={{ fontSize: '11px' }} onClick={() => update({ logo: '' })}>
            Reset to brand mark
          </button>
        )}
      </div>
      <small className="field-hint" style={{ marginTop: '8px', display: 'block' }}>
        Upload or paste a PNG, JPEG or WebP (under 3 MB). Transparent background works best.
      </small>
    </div>
  );

  return (
    <div className="hero-artwork-editor">
      <div className="admin-panel hero-artwork-controls">
        <label>
          Display mode in hero
          <select value={value.mode} onChange={e => update({ mode: e.target.value as 'logo' | 'text' })}>
            <option value="logo">Only show logo / brand mark</option>
            <option value="text">Text & logo slide sequence</option>
          </select>
        </label>

        {value.mode === 'logo' ? (
          <div>
            <p className="field-hint" style={{ marginBottom: '12px' }}>
              The hero will persistently display your brand mark or uploaded logo in the dot particle sculpture.
            </p>
            {logoSection}
          </div>
        ) : (
          <div className="hero-slide-editor" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Transition Timer Control */}
            <div
              className="hero-timer-controls"
              style={{
                padding: '14px 16px',
                border: '1px solid var(--line, #ddd)',
                borderRadius: '8px',
                background: 'var(--card, #fff)',
              }}
            >
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <strong style={{ fontSize: '13px' }}>Slide Transition Timer</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    step={1}
                    value={value.interval ?? 4}
                    onChange={e =>
                      update({ interval: Math.max(1, Math.min(30, Number(e.target.value) || 4)) })
                    }
                    style={{ width: '80px', padding: '6px 10px' }}
                    aria-label="Slide transition time in seconds"
                  />
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>seconds per slide</span>
                  <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
                    {[2, 3, 4, 5, 8, 10].map(s => (
                      <button
                        key={s}
                        type="button"
                        className="button outline"
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          minHeight: 'auto',
                          background: (value.interval ?? 4) === s ? 'var(--accent)' : undefined,
                          color: (value.interval ?? 4) === s ? '#fff' : undefined,
                          borderColor: (value.interval ?? 4) === s ? 'var(--accent)' : undefined,
                        }}
                        onClick={() => update({ interval: s })}
                      >
                        {s}s
                      </button>
                    ))}
                  </div>
                </div>
              </label>
              <small className="field-hint" style={{ marginTop: '6px', display: 'block' }}>
                Time each slide stays visible before morphing to the next.
              </small>
            </div>

            {/* Logo asset configuration in text mode */}
            {logoSection}

            {/* Slide Arrangement & Content */}
            <div>
              <strong style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                Slide Sequence & Arrangement ({value.phrases.length} / 12)
              </strong>
              <p className="field-hint" style={{ lineHeight: 1.6, marginBottom: '14px' }}>
                Reorder slides using ↑ / ↓ to place your logo anywhere between your text slides. Visitors click or tap to advance manually as well.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {value.phrases.map((text, index) => {
                  const isLogo = isLogoSlide(text);
                  return isLogo ? (
                    <div
                      className="hero-slide hero-slide-logo"
                      key={index}
                      style={{
                        padding: '12px 14px',
                        border: '1px solid var(--line, #ddd)',
                        borderRadius: '8px',
                        background: 'rgba(255, 114, 20, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--accent)' }}>✳</span> Slide {index + 1} — Brand Logo
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="icon-button"
                            aria-label={`Move slide ${index + 1} up`}
                            disabled={index === 0}
                            onClick={() => moveSlide(index, -1)}
                          >
                            <ArrowUp size={15} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            aria-label={`Move slide ${index + 1} down`}
                            disabled={index === value.phrases.length - 1}
                            onClick={() => moveSlide(index, 1)}
                          >
                            <ArrowDown size={15} />
                          </button>
                          <button
                            type="button"
                            className="icon-button danger"
                            aria-label={`Remove slide ${index + 1}`}
                            disabled={value.phrases.length === 1}
                            onClick={() => removeSlide(index)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <small style={{ color: 'var(--muted)', fontSize: '11px' }}>
                          Displays {value.logo ? 'your uploaded logo' : `${initials} ✳ brand mark`} in dots at this step.
                        </small>
                        <button
                          type="button"
                          className="text-link"
                          style={{ fontSize: '11px' }}
                          onClick={() => updateSlide(index, 'New idea')}
                        >
                          Convert to text
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="hero-slide hero-slide-text"
                      key={index}
                      style={{
                        padding: '12px 14px',
                        border: '1px solid var(--line, #ddd)',
                        borderRadius: '8px',
                        background: 'var(--card, #fff)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>Slide {index + 1} — Text</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="icon-button"
                            aria-label={`Move slide ${index + 1} up`}
                            disabled={index === 0}
                            onClick={() => moveSlide(index, -1)}
                          >
                            <ArrowUp size={15} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            aria-label={`Move slide ${index + 1} down`}
                            disabled={index === value.phrases.length - 1}
                            onClick={() => moveSlide(index, 1)}
                          >
                            <ArrowDown size={15} />
                          </button>
                          <button
                            type="button"
                            className="icon-button danger"
                            aria-label={`Remove slide ${index + 1}`}
                            disabled={value.phrases.length === 1}
                            onClick={() => removeSlide(index)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <textarea
                        aria-label={`Slide ${index + 1}`}
                        rows={3}
                        maxLength={60}
                        value={text}
                        onChange={e => updateSlide(index, e.target.value)}
                        placeholder="Enter text (up to 3 lines)..."
                      />
                      <div className="hero-slide-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <small style={{ fontSize: '10px', color: 'var(--muted)' }}>{text.length} / 60 characters</small>
                        <button
                          type="button"
                          className="text-link"
                          style={{ fontSize: '11px' }}
                          onClick={() => updateSlide(index, '[logo]')}
                        >
                          Convert to logo
                        </button>
                      </div>
                      {(!text.trim() || text.split('\n').length > 3) && (
                        <p className="error" role="alert" style={{ fontSize: '11px' }}>
                          Enter some text using no more than 3 lines.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                <button
                  type="button"
                  className="button outline"
                  disabled={value.phrases.length >= 12}
                  onClick={() => update({ phrases: [...value.phrases, 'New idea'] })}
                >
                  <Plus size={16} />
                  Add text slide
                </button>
                <button
                  type="button"
                  className="button outline"
                  disabled={value.phrases.length >= 12}
                  onClick={() => update({ phrases: [...value.phrases, '[logo]'] })}
                >
                  <Plus size={16} />
                  Add logo slide
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="hero-caption-controls" style={{ borderTop: '1px solid var(--line, #ddd)', paddingTop: '20px', marginTop: '10px' }}>
          <label className="toggle-field">
            <input type="checkbox" checked={value.showCaption} onChange={e => update({ showCaption: e.target.checked })} />
            <span>Show caption below artwork</span>
          </label>
          {value.showCaption && (
            <label>
              Caption
              <input
                aria-label="Caption"
                maxLength={40}
                value={value.caption}
                onChange={e => update({ caption: e.target.value })}
              />
              <small className="field-hint">
                {value.caption.length} / 40 characters. For example: Play with it.
              </small>
            </label>
          )}
          <label className="toggle-field">
            <input type="checkbox" checked={value.showEyebrow} onChange={e => update({ showEyebrow: e.target.checked })} />
            <span>Show text above artwork</span>
          </label>
          {value.showEyebrow && (
            <label>
              Text above artwork
              <input maxLength={80} value={value.eyebrow} onChange={e => update({ eyebrow: e.target.value })} />
            </label>
          )}
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
      </div>

      <div className="hero-artwork-preview">
        <p className="eyebrow">LIVE PREVIEW</p>
        <KineticSculpture artwork={value} initials={initials} owner={owner} accent={accent} />
        <p className="field-hint">Your changes go live when you publish.</p>
      </div>
    </div>
  );
}
