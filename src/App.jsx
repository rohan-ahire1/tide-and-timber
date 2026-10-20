import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight } from '@phosphor-icons/react';
import { stories, storyOrder } from './stories.js';

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Hand-drawn marks ------------------------------------------------------- */

function Swash({ className = '', d = 'M6 34 C 70 12, 170 4, 262 14 S 372 34, 414 18' }) {
  return <svg className={`swash ${className}`} viewBox="0 0 420 44" preserveAspectRatio="none" aria-hidden="true"><path d={d} pathLength="1" /></svg>;
}

function Scribble({ className = '' }) {
  return <svg className={`scribble ${className}`} viewBox="0 0 120 14" aria-hidden="true"><path d="M3 9 C 30 4, 70 3, 117 6" pathLength="1" /></svg>;
}

function PaperClip({ className = '' }) {
  return <svg className={`clip ${className}`} viewBox="0 0 22 64" aria-hidden="true"><path d="M15 20 V48 a5 5 0 0 1 -10 0 V12 a8 8 0 0 1 16 0 V50 a10 10 0 0 1 -20 0 V22" /></svg>;
}

function Check({ i }) {
  return <svg className="check" viewBox="0 0 18 18" aria-hidden="true" style={{ '--i': i }}><rect x="2" y="2" width="14" height="14" rx="1.5" /><path d="M5 9.5 L8 12.5 L15 3" pathLength="1" /></svg>;
}

/* Photos ------------------------------------------------------------------ */

const PHOTOS = {
  coast: { w: 1586, h: 992 },
  cove: { w: 1122, h: 1402 },
  path: { w: 1122, h: 1402 },
  harbour: { w: 1536, h: 1024 },
  rockpool: { w: 1254, h: 1254 },
  pine: { w: 768, h: 2048 },
  terrace: { w: 1536, h: 1024 },
};

function Photo({ name, alt, className = '', eager = false, sizes = '100vw' }) {
  const info = PHOTOS[name];
  return <img
    className={className}
    src={`/assets/photos/${name}.webp`}
    srcSet={`/assets/photos/${name}-800.webp 800w, /assets/photos/${name}.webp ${info.w}w`}
    sizes={sizes}
    width={info.w}
    height={info.h}
    alt={alt}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    fetchPriority={eager ? 'high' : 'auto'}
  />;
}

/* Notebook icons ----------------------------------------------------------- */

const processIcons = {
  plan: <><circle cx="42" cy="40" r="26" /><path d="M42 14 v6 M42 60 v6 M16 40 h6 M62 40 h6" strokeWidth="3" /><path d="M42 26 L50 40 L42 54 L34 40 Z" fill="#ee6a22" stroke="none" /></>,
  pack: <><path d="M30 30 v-6 a12 12 0 0 1 24 0 v6" strokeWidth="4" /><rect x="18" y="30" width="48" height="42" rx="8" /><path d="M18 46 h48 M36 30 v8 M52 30 v8" /></>,
  walk: <><path d="M6 72 C 30 70, 22 44, 46 42 S 70 22, 90 12" strokeWidth="2" strokeDasharray="2 6" stroke="#ee6a22" /><g transform="rotate(-18 34 50)"><ellipse cx="28" cy="46" rx="7" ry="11" /><ellipse cx="28" cy="64" rx="5" ry="6" /></g><g transform="rotate(12 62 30)"><ellipse cx="62" cy="22" rx="7" ry="11" /><ellipse cx="62" cy="40" rx="5" ry="6" /></g></>,
  write: <><rect x="8" y="16" width="60" height="42" rx="3" /><path d="M8 26 h60 M16 46 h20 M16 52 h14" /><path d="M60 40 l16 -16 l8 8 l-16 16 l-10 2 z" strokeWidth="3" /></>,
};

const processSteps = [
  ['plan', 'Plan', ['Pick one stretch of coast', 'Book fewer places', 'Leave afternoons empty']],
  ['pack', 'Pack', ['Good walking shoes', 'A paper map', 'Something to write with']],
  ['walk', 'Walk', ['Start before the heat', 'Follow the shoreline', 'Stop for every swim']],
  ['write', 'Write', ['One page a day', 'What you ate', 'What you’ll remember']],
];

/* Story overlay ------------------------------------------------------------ */

function Story({ id, onClose, onNext, closeRef, fading }) {
  const story = stories[id];
  const idx = storyOrder.indexOf(id);
  const nextId = storyOrder[(idx + 1) % storyOrder.length];
  const nextStory = stories[nextId];
  const isFeatured = id === 'featured';

  return <div className="case-backdrop" onClick={(event) => event.target === event.currentTarget && onClose()}>
    <article className={`case paper ${fading ? 'is-fading' : ''}`} role="dialog" aria-modal="true" aria-labelledby="case-title" key={id}>
      <header className="case-bar"><span className="wordmark">Tide &amp; Timber</span><button className="text-button" onClick={onClose} ref={closeRef}><span>Back to the desk</span><ArrowDownLeft size={18} /></button></header>
      <div className="case-body">
        <div className="case-intro">
          <div>
            <p className="overline"><i />{story.kicker}</p>
            <h2 id="case-title">{story.title}</h2>
            <p className="case-lede">{story.lede}</p>
          </div>
        </div>
        <figure className="case-figure">
          <Photo name={story.image} alt={story.imageAlt} className="case-image" sizes="(max-width: 900px) 100vw, 1100px" />
          <figcaption>{story.imageCaption}</figcaption>
        </figure>
        <div className="case-grid">
          <div className="case-article">
            {story.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            {isFeatured && story.pullQuote && <p className="hand case-pullquote">&ldquo;{story.pullQuote}&rdquo;</p>}
            {isFeatured && story.inlineImage && <figure className="case-figure case-figure--inline">
              <Photo name={story.inlineImage} alt={story.inlineImageAlt} className="case-image" sizes="(max-width: 900px) 100vw, 700px" />
              <figcaption>{story.inlineImageCaption}</figcaption>
            </figure>}
          </div>
          <dl className="case-meta">
            {Object.entries(story.meta).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
        <footer className="case-footer">
          <button className="text-button case-next" onClick={() => onNext(nextId)}>Next story: {nextStory.title} <ArrowRight size={18} /></button>
          <button className="text-button" onClick={onClose}><ArrowLeft size={18} /> Return to the desk</button>
        </footer>
      </div>
    </article>
  </div>;
}

/* Page ------------------------------------------------------------------- */

export function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [storyId, setStoryId] = useState('featured');
  const [fading, setFading] = useState(false);
  const [lifting, setLifting] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [sent, setSent] = useState(false);
  const [demoNote, setDemoNote] = useState(false);
  const busy = useRef(false);
  const heroSheetRef = useRef(null);
  const heroPillRef = useRef(null);
  const journalCardRef = useRef(null);
  const mapRef = useRef(null);
  const pinRefs = useRef({});
  const sourceRef = useRef(null);
  const closeRef = useRef(null);
  // Map pins morph from the whole map, but focus should go back to the pin itself.
  const returnFocusRef = useRef(null);

  async function openStory(id, event) {
    if (busy.current || isOpen) return;
    busy.current = true;
    const fromCard = event?.currentTarget;
    sourceRef.current = fromCard || null;
    returnFocusRef.current = document.activeElement;
    const animate = document.startViewTransition && !reduced();
    if (animate && fromCard) {
      setLifting(fromCard.dataset.morph);
      await wait(240);
      fromCard.style.viewTransitionName = 'project-sheet';
    }
    const update = () => { if (fromCard) fromCard.style.viewTransitionName = ''; flushSync(() => { setLifting(null); setStoryId(id); setIsOpen(true); }); };
    if (animate) await document.startViewTransition(update).finished; else update();
    closeRef.current?.focus({ preventScroll: true });
    busy.current = false;
  }

  async function closeStory() {
    if (busy.current || !isOpen) return;
    busy.current = true;
    const target = sourceRef.current;
    const stillThere = target && document.body.contains(target) && target.getBoundingClientRect().top < window.innerHeight && target.getBoundingClientRect().bottom > 0;
    const update = () => { flushSync(() => setIsOpen(false)); if (target && stillThere) target.style.viewTransitionName = 'project-sheet'; };
    if (document.startViewTransition && !reduced() && stillThere) await document.startViewTransition(update).finished; else update();
    if (target) target.style.viewTransitionName = '';
    busy.current = false;
    const back = returnFocusRef.current;
    (back && document.body.contains(back) ? back : target)?.focus({ preventScroll: true });
  }

  function nextStory(id) {
    if (reduced()) { setStoryId(id); document.querySelector('.case')?.scrollTo(0, 0); return; }
    setFading(true);
    window.setTimeout(() => {
      setStoryId(id);
      document.querySelector('.case')?.scrollTo(0, 0);
      window.setTimeout(() => setFading(false), 20);
    }, 220);
  }

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeStory();
      if (event.key === 'Tab') {
        const focusables = [...document.querySelectorAll('.case button, .case a[href]')];
        if (event.shiftKey && document.activeElement === focusables[0]) { event.preventDefault(); focusables.at(-1).focus(); }
        if (!event.shiftKey && document.activeElement === focusables.at(-1)) { event.preventDefault(); focusables[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    document.documentElement.classList.toggle('case-is-open', isOpen);
  }, [isOpen]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const hero = document.querySelector('.hero');
      setPastHero(hero ? window.scrollY > hero.offsetHeight - 120 : window.scrollY > 400);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target); }
    }), { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    requestAnimationFrame(() => document.documentElement.classList.add('is-ready'));
    return () => { window.removeEventListener('scroll', onScroll); observer.disconnect(); };
  }, []);

  function submitLetter(event) {
    event.preventDefault();
    setSent(true);
  }

  function tryBooklet() {
    setDemoNote(true);
    window.setTimeout(() => setDemoNote(false), 2500);
  }

  const places = [
    { id: 'harbour', label: 'the harbour', image: 'harbour' },
    { id: 'rockpools', label: 'rock pools', image: 'rockpool' },
    { id: 'path', label: 'cliff path', image: 'path' },
  ];

  return <>
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="site-header-inner">
        <a className="wordmark" href="#top">Tide &amp; Timber</a>
        <nav aria-label="Primary"><a href="#journal">Journal</a><a href="#places">Places</a><a href="#guides">Field guides</a><a href="#letters">Letters</a></nav>
        <a className="header-cta" href="#letters">Get the letters <ArrowUpRight size={16} weight="bold" /></a>
      </div>
    </header>

    <main className="desk" id="top">
      {/* 01 — Hero */}
      <section className="hero" aria-label="Introduction">
        <img className="prop prop-plant" src="/assets/props/plant.webp" alt="" width="1254" height="1254" />
        <img className="prop prop-mug" src="/assets/props/mug.webp" alt="" width="1254" height="1254" />
        <img className="prop prop-camera" src="/assets/props/camera.webp" alt="" width="1254" height="1254" />
        <img className="prop prop-compass" src="/assets/props/compass.webp" alt="" width="1254" height="1254" />
        <img className="prop prop-pencil" src="/assets/props/pencil.webp" alt="" width="1254" height="1254" />
        <div className="hero-stage">
          <div className="hero-sheet paper settle" style={{ '--d': 0 }}>
            <p className="sheet-kicker">A slow-travel journal · Issue 12</p>
            <h1><span className="l1">Take</span><span className="l2">the long</span><span className="l3">way</span><span className="l4">round<span className="dot">.</span></span><Swash className="hero-swash" /></h1>
            <p className="hand hero-hand write" style={{ '--d': 5 }}>Field notes, places and long walks<br />along the western shore.</p>
            <button ref={heroPillRef} data-morph="hero" className="pill hero-cta" onClick={(e) => openStory('featured', e)}>Start reading <ArrowRight size={18} weight="bold" /></button>
            <p className="hand hero-aside write" style={{ '--d': 8 }}>a new letter<br />every full moon.</p>
          </div>
          <div className="tabs">
            {[['Journal', '#journal'], ['Places', '#places'], ['Field guides', '#guides']].map(([label, href], i) => <a key={label} href={href} className="tab paper settle" style={{ '--d': 1 + i * .5 }}>{label}</a>)}
          </div>
          <button ref={heroSheetRef} data-morph="hero" className={`project-sheet paper settle ${lifting === 'hero' ? 'is-lifting' : ''} ${isOpen && sourceRef.current === heroSheetRef.current ? 'is-away' : ''}`} style={{ '--d': 2.5 }} onClick={(e) => openStory('featured', e)} aria-label="Open the featured story">
            <PaperClip />
            <span className="sheet-row"><span className="wordmark">Tide &amp; Timber</span><span>Issue 12 · Essay</span></span>
            <span className="project-title">A slower way<br />to see the coast.</span>
            <span className="project-image"><Photo name="coast" alt="" eager sizes="420px" /></span>
            <span className="sheet-row sheet-row--foot"><span className="hand">an 8 minute read</span><span className="open-link">Open the story <ArrowUpRight size={13} /></span></span>
          </button>
          <div className="bookmark paper settle" style={{ '--d': 3.5 }} aria-hidden="true"><span>Walk<br />the<br />edges</span><Photo name="pine" alt="" sizes="150px" /></div>
          <div className="sticky settle" style={{ '--d': 4.5 }}><p className="hand">Pack light.<br />Walk early.<br />Swim before<br />breakfast.</p></div>
        </div>
        <a className="hand scroll-cue" href="#journal">there&rsquo;s more on the desk <ArrowDownLeft size={16} /></a>
      </section>

      {/* 02 — Three sheets */}
      <section className="services" aria-labelledby="services-title">
        <img className="prop prop-plant-right" src="/assets/props/plant.webp" alt="" width="1254" height="1254" />
        <div className="section-head" data-reveal>
          <h2 className="hand hand-title" id="services-title">On the desk<Scribble /></h2>
          <p className="hand margin-note">for slower<br />weekends</p>
        </div>
        <div className="service-grid">
          <article className="service paper" id="journal" data-reveal style={{ '--r': '-2deg', '--i': 0 }}>
            <h3>Journal<Swash className="mini-swash" d="M4 30 C 90 12, 220 8, 416 20" /></h3>
            <p className="service-sub">Long reads from the western shore.<br />Written slowly, on purpose.</p>
            <div className="sheet-stage prints">
              <span className="print print--b1" aria-hidden="true"><Photo name="harbour" alt="" sizes="200px" /></span>
              <span className="print print--b2" aria-hidden="true"><Photo name="rockpool" alt="" sizes="200px" /></span>
              <button ref={journalCardRef} className={`print print--front ${lifting === 'cove' ? 'is-lifting' : ''}`} data-morph="cove" onClick={(e) => openStory('cove', e)} aria-label="Open the story: The cove you can only reach on foot">
                <span className="tape" aria-hidden="true" />
                <span className="print-photo"><Photo name="cove" alt="" sizes="320px" /></span>
                <span className="print-caption hand">the cove you can only<br />reach on foot</span>
                <span className="print-meta">5 min read <ArrowUpRight size={11} weight="bold" /></span>
              </button>
            </div>
            <p className="hand service-note">new stories<br />each month</p>
          </article>
          <article className="service paper" id="places" data-reveal style={{ '--r': '1.2deg', '--i': 1 }}>
            <h3>Places<Swash className="mini-swash" d="M4 26 C 110 10, 250 10, 416 22" /></h3>
            <p className="service-sub">Coves, paths and harbours<br />worth the detour.</p>
            <div className="sheet-stage">
              <div ref={mapRef} className={`map ${lifting === 'map' ? 'is-lifting' : ''}`} data-morph="map">
                <span className="tape tape--tl" aria-hidden="true" /><span className="tape tape--br" aria-hidden="true" />
                <img src="/assets/props/map.webp" alt="Folded paper map of the western shore" className="map-image" width="890" height="800" loading="lazy" />
                <svg className="map-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <path className="route-line" d="M80 22 C 74 34, 62 30, 56 44 S 34 60, 24 76" />
                </svg>
                {places.map((place, i) => <button key={place.id} ref={(el) => (pinRefs.current[place.id] = el)} className={`map-pin map-pin-${i}`} style={{ '--p': i }} onClick={() => openStory(place.id, { currentTarget: mapRef.current })} aria-label={`Open the story about ${place.label}`}>
                  <span className="pin-head" aria-hidden="true">{i + 1}</span>
                  <span className="pin-tag hand">{place.label}</span>
                </button>)}
              </div>
            </div>
            <p className="hand service-note">marked<br />by hand</p>
          </article>
          <article className="service paper" id="guides" data-reveal style={{ '--r': '-1deg', '--i': 2 }}>
            <h3>Field guides<Swash className="mini-swash" d="M4 22 C 120 30, 260 8, 416 16" /></h3>
            <p className="service-sub">Small printed guides<br />for walking without a phone.</p>
            <div className="sheet-stage guides">
              <div className="guide guide--back" aria-hidden="true">
                <span className="guide-art"><Photo name="harbour" alt="" sizes="160px" /></span>
              </div>
              <div className="guide guide--front">
                <span className="guide-art"><Photo name="pine" alt="" sizes="180px" /></span>
                <span className="guide-no">No. 3</span>
                <span className="guide-title">The Western<br />Shore Path</span>
                <span className="guide-meta">48 pages · pocket size</span>
                <span className="guide-band" aria-hidden="true" />
              </div>
              <div className="guide-buy">
                <button className="guide-add" onClick={tryBooklet}>Add to bag <ArrowRight size={14} weight="bold" /></button>
                {demoNote && <p className="hand guide-demo" role="status">demo only, nothing to buy</p>}
              </div>
            </div>
            <p className="hand service-note">fits in a<br />back pocket</p>
          </article>
        </div>
      </section>

      {/* 03 — Notebook */}
      <section className="process" id="plan" aria-labelledby="process-title">
        <div className="notebook" data-reveal>
          <div className="spread">
            {[0, 1].map((page) => <div key={page} className={`page page--${page ? 'right' : 'left'}`}>
              {page === 0
                ? <h2 className="hand hand-title notebook-title" id="process-title">Plan a slow trip<Scribble /></h2>
                : <p className="hand page-head">September &middot; the western shore</p>}
              <ol className="steps" start={page * 2 + 1}>
                {processSteps.slice(page * 2, page * 2 + 2).map(([key, title, items], j) => {
                  const stepIndex = page * 2 + j;
                  return <li key={key} className="step" style={{ '--s': stepIndex }}>
                    <svg className="step-icon" viewBox="0 0 96 80" aria-hidden="true">{processIcons[key]}</svg>
                    <div>
                      <h3 className="hand">{stepIndex + 1}. {title}</h3>
                      <ul>{items.map((item, i) => <li key={item}><Check i={stepIndex * 3 + i} />{item}</li>)}</ul>
                    </div>
                  </li>;
                })}
              </ol>
              <span className="page-no hand" aria-hidden="true">{12 + page}</span>
            </div>)}
            <span className="ribbon" aria-hidden="true" />
          </div>
          <img className="prop prop-pencil-note" src="/assets/props/pencil.webp" alt="" width="1254" height="1254" />
          <img className="prop prop-pebbles" src="/assets/props/pebbles.webp" alt="" width="1254" height="1254" />
        </div>
        <p className="hand margin-note process-note">the best days<br />have no plan</p>
      </section>

      {/* 04 — Letters */}
      <section className="contact" id="letters" aria-labelledby="contact-title">
        <p className="hand margin-note contact-note-left">no spam,<br />just sea air</p>
        <div className="letter paper" data-reveal>
          <PaperClip className="letter-clip" />
          <img className="prop prop-postcards" src="/assets/props/postcards.webp" alt="" width="1254" height="1254" />
          <img className="prop prop-dish-letter" src="/assets/props/dish.webp" alt="" width="1254" height="1254" />
          <div className="letter-intro">
            <h2 id="contact-title">Letters from<br />the coast<span className="dot">.</span><Swash className="letter-swash" d="M6 30 C 100 10, 240 6, 414 22" /></h2>
            <p>One unhurried email a month: a new walk, a place worth the detour, and a photograph we couldn&rsquo;t stop looking at.</p>
          </div>
          {sent ? <div className="letter-sent" role="status"><p className="hand">Thank you!</p><p>This is a concept site, so no email was sent &mdash; but that&rsquo;s exactly what it would feel like.</p></div>
            : <form className="letter-form" onSubmit={submitLetter}>
              <label><span>Name</span><input id="field-name" name="name" autoComplete="name" required /></label>
              <label><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
              <div className="form-foot"><button className="pill" type="submit">Send me the letters <ArrowUpRight size={18} weight="bold" /></button></div>
            </form>}
        </div>
      </section>

      <footer className="site-footer">
        <span className="wordmark">Tide &amp; Timber</span>
        <span>A slow-travel journal from the western shore.</span>
        <span>Concept site · not a real business</span>
        <span>© 2026</span>
      </footer>
    </main>

    <span className={`concept-pill ${pastHero ? 'is-visible' : ''}`}>Concept site · not a real business</span>

    {isOpen && <Story id={storyId} onClose={closeStory} onNext={nextStory} closeRef={closeRef} fading={fading} />}
  </>;
}
