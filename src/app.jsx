/* Dutch Barn Vodka — CRO PDP prototype + case study
   One React app, two views. The case study renders the SAME <BuyBox/> used on the PDP.
   Fonts, colours and images were captured from the live page (dutchbarn.com, 16 Oct 2026). */
const { useState, useEffect, useRef, useMemo, useContext, createContext, useCallback } = React;
const A = window.__A || {};

/* ---------------------------------------------------------------
   DATA — verified on the live page, 16 Oct 2026
---------------------------------------------------------------- */
// 1/2/6 pricing and badges exist in the live theme (configured, currently hidden). See case study flags.
const TIERS = [
  { id: "1", qty: 1, price: 30, was: 30, badge: null, freeShip: false, img: "t1" },
  { id: "2", qty: 2, price: 56, was: 60, badge: "Most popular", badgeTone: "blue", freeShip: true, img: "t2" },
  { id: "6", qty: 6, price: 150, was: 180, badge: "Best value", badgeTone: "red", freeShip: true, img: "t6" },
];
const SUB_DISCOUNT = 0.10;          // toggle copy on live page: "Subscribe & Save – an extra 10% off"
const FREE_SHIP_THRESHOLD = 75;     // "FREE Shipping When You Spend £75"
const SHIPPING_FEE = 4.25;          // FAQ: £4.25 below £75
const RATING = { avg: 4.88, count: 845, dist: [797, 22, 10, 3, 13] }; // Judge.me widget

const FLAVOURS = [
  { id: "original", name: "Dutch Barn Vodka", price: 30, note: "The OG. Our exceptionally smooth vodka.", img: "fl_original", best: true },
  { id: "ginger", name: "Ginger Spiced Vodka", price: 32, note: "A rich fiery spirit, infused with real ginger, citrus, and spice.", img: "fl_ginger", best: true },
  { id: "cherry", name: "Black Cherry Vodka", price: 32, note: "Indulgent with hints of Black Forest Gateau and Cherry Bakewell Tart.", img: "fl_cherry", best: true },
  { id: "vanilla", name: "Balinese Vanilla Vodka", price: 32, note: "A velvety smooth infusion of exotic Balinese vanilla.", img: "fl_vanilla" },
  { id: "raspberry", name: "British Raspberry Vodka", price: 32, note: "Vibrant fresh bursts of natural British raspberry sweetness.", img: "fl_raspberry" },
  { id: "citrus", name: "Mediterranean Citrus Vodka", price: 32, note: "A zesty blend of fresh Mediterranean lemons, limes, oranges and pomelo.", img: "fl_citrus" },
];
// Live builder pricing, measured by selecting 1→6 bottles: £30 a bottle for the first 3, £25 after that
const mixPrice = (bottles) => {
  if (bottles.length === 0) return 0;
  if (bottles.length === 1) return bottles[0].price;
  return 30 * Math.min(bottles.length, 3) + 25 * Math.max(0, bottles.length - 3);
};

const money = (n) => "£" + n.toFixed(2);
const round2 = (n) => Math.round(n * 100) / 100;
const tierTotal = (t, mode) => (mode === "sub" ? round2(t.price * (1 - SUB_DISCOUNT)) : t.price);
const plural = (n) => (n === 1 ? "bottle" : "bottles");

/* ---------------------------------------------------------------
   CART (simulated)
---------------------------------------------------------------- */
const CartCtx = createContext(null);
function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const add = useCallback((item, opts = {}) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.key === item.key);
      if (i >= 0) { const c = [...prev]; c[i] = { ...c[i], count: c[i].count + 1 }; return c; }
      return [...prev, { ...item, count: 1 }];
    });
    if (opts.drawer) setOpen(true);
    setToast(item.toast || "Added to cart");
  }, []);
  const remove = (key) => setItems((p) => p.filter((x) => x.key !== key));
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t); }, [toast]);
  const bottles = items.reduce((s, i) => s + i.bottles * i.count, 0);
  const subtotal = round2(items.reduce((s, i) => s + i.price * i.count, 0));
  const freeShip = subtotal >= FREE_SHIP_THRESHOLD || items.some((i) => i.freeShip);
  return (
    <CartCtx.Provider value={{ items, add, remove, open, setOpen, bottles, subtotal, freeShip, toast }}>
      {children}
    </CartCtx.Provider>
  );
}
const useCart = () => useContext(CartCtx);

/* ---------------------------------------------------------------
   PRIMITIVES
---------------------------------------------------------------- */
const Img = ({ k, alt = "", className = "", style }) => <img src={A[k]} alt={alt} className={className} style={style} loading="lazy" decoding="async" />;

function Stars({ size = 17 }) {
  return <span className="stars" aria-hidden="true" style={{ fontSize: size }}>★★★★★</span>;
}

const Icon = {
  check: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevron: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bag: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2.2l2.3 11h11l2-8H6.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="19.5" r="1.4" fill="currentColor"/><circle cx="17" cy="19.5" r="1.4" fill="currentColor"/></svg>,
  search: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  user: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  repeat: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11V9a3 3 0 013-3h12l-3-3M20 13v2a3 3 0 01-3 3H5l3 3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  play: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>,
  arrowL: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-7 6 7 6z" fill="currentColor"/></svg>,
  arrowR: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l7 6-7 6z" fill="currentColor"/></svg>,
};

/* Annotation region — numbered marker + highlight when shown in the case study */
function Region({ n, anno, children, className = "", ...rest }) {
  const on = anno && anno.show;
  const active = on && anno.active === n;
  return (
    <div className={"region " + className + (on ? " is-annotated" : "") + (active ? " is-active" : "")} data-anno={on ? n : undefined} {...rest}>
      {on && <button type="button" className="anno-pin" aria-label={"Show annotation " + n} onClick={() => anno.onPick(n)}>{n}</button>}
      {children}
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false, className = "" }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={"acc " + className}>
      <button type="button" className="acc-btn" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{title}</span><span className={"chev" + (open ? " up" : "")}>{Icon.chevron}</span>
      </button>
      {open && <div className="acc-body">{children}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------
   REDESIGNED BUY BOX  (Variant B)
---------------------------------------------------------------- */
function BuyBox({ anno, context = "pdp" }) {
  const cart = useCart();
  const [tierId, setTierId] = useState("1"); // same default as today, so the test isolates the layout change
  const [mode, setMode] = useState("once");
  const [justAdded, setJustAdded] = useState(false);
  const tier = TIERS.find((t) => t.id === tierId);
  const total = tierTotal(tier, mode);
  const saving = round2(tier.was - total);
  const freeShip = tier.freeShip || total >= FREE_SHIP_THRESHOLD;
  const uid = useMemo(() => Math.random().toString(36).slice(2, 7), []);

  const radioKeys = (e, ids, current, set) => {
    const i = ids.indexOf(current);
    let n = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = ids[(i + 1) % ids.length];
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = ids[(i - 1 + ids.length) % ids.length];
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); set(current); return; }
    if (n) { e.preventDefault(); set(n); const el = e.currentTarget.parentElement.querySelector('[data-val="' + n + '"]'); el && el.focus(); }
  };

  const addToCart = () => {
    const sub = mode === "sub";
    cart.add({
      key: "db-original-" + tier.id + "-" + mode, name: "Dutch Barn Vodka",
      variant: tier.qty + " × 70cl" + (sub ? " · Subscribe & Save, every 3 months" : ""),
      bottles: tier.qty, price: total, freeShip: tier.freeShip, img: "fl_original",
      toast: (sub ? "Subscription added · " : "Added · ") + tier.qty + " " + plural(tier.qty) + " · " + money(total),
    }, { drawer: context === "pdp" });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const ctaLabel = mode === "sub"
    ? "Subscribe · " + tier.qty + " " + plural(tier.qty) + " · " + money(total)
    : "Add " + tier.qty + " " + plural(tier.qty) + " · " + money(total);

  return (
    <div className="buybox">
      <Region n={2} anno={anno} className="bb-head">
        <a className="bb-rating" href="#reviews" onClick={(e) => { if (context !== "pdp") e.preventDefault(); }}>
          <Stars /> <span>{RATING.count} reviews</span>
        </a>
        <h1 className="bb-title">Dutch Barn Vodka</h1>
        <div className="bb-price" aria-live="polite">
          <span className="now">{money(total)}</span>
          {saving > 0 && <span className="was">{money(tier.was)}</span>}
          {saving > 0 && <span className="save-pill">Save {money(saving)}</span>}
        </div>
        <p className="bb-meta">40% ABV | 70cl{tier.qty > 1 ? " · " + money(round2(total / tier.qty)) + " per bottle" : ""}</p>
        <p className="bb-desc">Clear, crisp and smooth vodka made from British apples, with a touch of potato spirit, distilled through 70 plates in North Yorkshire.</p>
      </Region>

      <Region n={1} anno={anno} className="bb-step">
        <div className="step-row"><span className="step-pill">Step 1</span><span className="step-h" id={"qty-" + uid}>How many bottles?</span></div>
        <div className="tiers" role="radiogroup" aria-labelledby={"qty-" + uid}>
          {TIERS.map((t) => {
            const sel = t.id === tierId;
            const tt = tierTotal(t, mode);
            const sv = round2(t.was - tt);
            return (
              <div key={t.id} role="radio" aria-checked={sel} tabIndex={sel ? 0 : -1} data-val={t.id}
                className={"tier" + (sel ? " is-sel" : "")} onClick={() => setTierId(t.id)}
                onKeyDown={(e) => radioKeys(e, TIERS.map((x) => x.id), t.id === tierId ? tierId : t.id, (v) => setTierId(v))}>
                {t.badge && <span className={"badge badge-" + t.badgeTone}>{t.badge}</span>}
                <span className="tier-radio" aria-hidden="true" />
                <Img k={t.img} className="tier-img" />
                <span className="tier-qty">{t.qty} {t.qty === 1 ? "Bottle" : "Bottles"}</span>
                <span className="tier-total">{money(tt)}</span>
                <span className="tier-per">{money(round2(tt / t.qty))} per bottle</span>
                <span className={"tier-save" + (sv > 0 ? "" : " none")}>{sv > 0 ? "Save " + money(sv) : "Full price"}</span>
                {t.freeShip && <span className="tier-ship">+ Free shipping</span>}
              </div>
            );
          })}
        </div>
      </Region>

      <Region n={4} anno={anno} className="bb-step">
        <div className="step-row"><span className="step-pill">Step 2</span><span className="step-h" id={"mode-" + uid}>How would you like it?</span></div>
        <div className="modes" role="radiogroup" aria-labelledby={"mode-" + uid}>
          {[["once", "One-time purchase", tier.price, null], ["sub", "Subscribe & Save, an extra 10% off", tierTotal(tier, "sub"), "Delivered every 3 months"]].map(([id, label, p, sub]) => {
            const sel = mode === id;
            return (
              <div key={id} role="radio" aria-checked={sel} tabIndex={sel ? 0 : -1} data-val={id}
                className={"mode" + (sel ? " is-sel" : "")} onClick={() => setMode(id)}
                onKeyDown={(e) => radioKeys(e, ["once", "sub"], id, setMode)}>
                <span className="tier-radio" aria-hidden="true" />
                <span className="mode-text"><span className="mode-label">{label}</span>{sub && <span className="mode-sub">{sub}</span>}</span>
                <span className="mode-price">{money(p)}</span>
              </div>
            );
          })}
        </div>
        {mode === "sub" && (
          <div className="sub-terms" role="note">
            <div className="sub-terms-title">{Icon.repeat} How subscriptions work</div>
            <ul>
              <li><strong>10% off every order</strong>, delivered every 3 months.</li>
              <li>Renews automatically. You can modify your subscription anytime.</li>
              <li><strong>60-day minimum term</strong> before you can cancel, by contacting the team.</li>
            </ul>
          </div>
        )}
      </Region>

      <Region n={3} anno={anno} className="bb-cta-wrap">
        <button type="button" className={"btn-atc" + (justAdded ? " is-done" : "")} onClick={addToCart}>
          {justAdded ? <>{Icon.check} Added to cart</> : ctaLabel}
        </button>
        <div className="cta-under">
          <span className="guar"><Img k="ic_guarantee" className="ic-guar" /> 14-Day Money Back Guarantee</span>
          <Img k="payments" alt="Accepted payment methods" className="payments" />
        </div>
      </Region>

      <Region n={4} anno={anno} className="bb-delivery">
        <div className={"trust" + (freeShip ? " is-free" : "")}>
          <Img k="ic_truck" className="trust-ic" />
          <div>
            {freeShip
              ? <><strong>FREE Shipping</strong> <span>{tier.freeShip && total < FREE_SHIP_THRESHOLD ? "included with the 2-bottle bundle" : "your order is over £75"}</span></>
              : <><strong>UK delivery {money(SHIPPING_FEE)}</strong> <span>FREE when you spend £75</span></>}
            {!freeShip && <button type="button" className="linkish" onClick={() => setTierId("2")}>Choose 2 bottles and shipping is free</button>}
          </div>
        </div>
        <div className="trust"><Img k="ic_orders" className="trust-ic" /><div><strong>Order before 2pm, arrives next day</strong> <span>same-day dispatch on working days</span></div></div>
        <div className="trust"><Img k="ic_warehouse" className="trust-ic" /><div><strong>In stock, ready to ship</strong> <span>UK only</span></div></div>
      </Region>

      <div className="bb-secondary">
        <Region n={1} anno={anno}>
          <MixBuilder context={context} />
        </Region>
        <div className="comp">
          <Img k="ic_ticket" className="comp-ic" />
          <p><strong>Every bottle enters the draw</strong> for two tickets to Ricky Gervais: Mortality at the London Palladium, 8 November. <a href="https://cdn.shopify.com/s/files/1/0637/9080/9224/files/Dutch_Barn_Promotion_Terms.pdf?v=1752056246" target="_blank" rel="noopener">More info</a></p>
        </div>
      </div>
    </div>
  );
}

function MixBuilder({ context }) {
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState([]);
  const bottles = FLAVOURS.filter((f) => picked.includes(f.id));
  const list = bottles.reduce((s, f) => s + f.price, 0);
  const price = mixPrice(bottles);
  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  return (
    <div className="mix">
      <button type="button" className="mix-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span><strong>Prefer to mix flavours?</strong><span>Build your own bundle from all six</span></span>
        <span className={"chev" + (open ? " up" : "")}>{Icon.chevron}</span>
      </button>
      {open && (
        <div className="mix-body">
          <ul className="mix-list">
            {FLAVOURS.map((f) => {
              const on = picked.includes(f.id);
              return (
                <li key={f.id} className={"flav" + (on ? " is-on" : "")}>
                  {f.best && <span className="badge badge-purple badge-sm">Bestseller</span>}
                  <Img k={f.img} alt={f.name} className="flav-img" />
                  <div className="flav-info"><strong>{f.name}</strong><span className="flav-price">{money(f.price)}</span><span className="flav-note">{f.note}</span></div>
                  <button type="button" className={"btn-add" + (on ? " on" : "")} aria-pressed={on} onClick={() => toggle(f.id)}>{on ? <>{Icon.check} Added</> : "Add +"}</button>
                </li>
              );
            })}
          </ul>
          <div className="mix-foot">
            <div className="mix-sum">
              <strong>{bottles.length ? money(price) : "£0.00"}</strong>
              {bottles.length > 1 && list > price && <s>{money(list)}</s>}
              <span>{bottles.length} {plural(bottles.length)} selected{list > price ? " · Save " + money(list - price) : ""}</span>
            </div>
            <button type="button" className="btn-outline" disabled={!bottles.length} onClick={() => {
              cart.add({ key: "mix-" + picked.slice().sort().join("-"), name: "Mix & match bundle", variant: bottles.map((b) => b.name.replace(" Vodka", "")).join(", "), bottles: bottles.length, price, freeShip: false, img: bottles[0].img, toast: "Added mix bundle · " + money(price) }, { drawer: context === "pdp" });
              setPicked([]);
            }}>{bottles.length ? "Add bundle to cart" : "Select at least 1 bottle"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   ORIGINAL BUY BOX — what a shopper actually sees today (Control A)
   Reconstructed from the rendered live page; hidden theme blocks are left out.
---------------------------------------------------------------- */
function OriginalBuyBox({ anno }) {
  return (
    <div className="obox" aria-label="Reconstruction of the current buy box">
      <div className="bb-rating"><Stars /> <span>845 reviews</span></div>
      <h3 className="bb-title o-title">Dutch Barn Vodka</h3>
      <Region n={2} anno={anno}><p className="bb-meta o-meta">40% ABV | 70cl <em className="o-flag">no price shown here</em></p></Region>
      <Region n={3} anno={anno}>
        <div className="o-atc-row">
          <div className="o-qty"><span>−</span><span>1</span><span>+</span></div>
          <div className="btn-atc o-atc">Add to cart £30.00</div>
        </div>
      </Region>
      <div className="cta-under o-under"><span className="guar"><Img k="ic_guarantee" className="ic-guar" /> 14-Day Money Back Guarantee</span><Img k="payments" className="payments" /></div>
      <Region n={1} anno={anno}>
        <span className="step-pill">Step 1</span>
        <div className="step-h o-step-h">Select your bottles</div>
        <ul className="mix-list o-list">
          {FLAVOURS.map((f) => (
            <li key={f.id} className="flav">
              {f.best && <span className="badge badge-purple badge-sm">Bestseller</span>}
              <Img k={f.img} className="flav-img" />
              <div className="flav-info"><strong>{f.name}</strong><span className="flav-price">{money(f.price)}</span><span className="flav-note">{f.note}</span></div>
              <span className="btn-add">Add +</span>
            </li>
          ))}
        </ul>
      </Region>
      <Region n={3} anno={anno}><div className="o-disabled">Select at least 1 bottle</div></Region>
      <Region n={4} anno={anno}>
        <div className="o-sub">
          <span className="o-switch" aria-hidden="true" />
          <div><strong>Subscribe &amp; Save – an extra 10% off</strong><span>Delivery every 3 months. Cancel anytime. <u>Find out more</u></span></div>
        </div>
      </Region>
      <Region n={4} anno={anno}>
        <div className="bb-delivery o-trust">
          <div className="trust"><Img k="ic_warehouse" className="trust-ic" /><div><strong>In stock, ready to ship</strong></div></div>
          <div className="trust"><Img k="ic_orders" className="trust-ic" /><div><strong>Order before 2pm, arrives next day</strong></div></div>
          <div className="trust"><Img k="ic_truck" className="trust-ic" /><div><strong>FREE Shipping When You Spend £75</strong></div></div>
        </div>
      </Region>
      <div className="acc o-acc"><div className="acc-btn"><span>Description</span><span className="chev">{Icon.chevron}</span></div></div>
      <div className="acc o-acc"><div className="acc-btn"><span>Shipping &amp; Return</span><span className="chev">{Icon.chevron}</span></div></div>
      <Region n={3} anno={anno} className="o-sticky">
        <div className="o-sticky-bar"><div><strong>£0.00</strong><span>0 bottles selected</span></div><span className="o-sticky-btn">Select at least 1 bottle</span></div>
      </Region>
    </div>
  );
}

/* ---------------------------------------------------------------
   PDP (View 1)
---------------------------------------------------------------- */
const GALLERY = [
  { k: "hero", alt: "Friends sharing Dutch Barn Vodka at a picnic table" },
  { k: "g_mummy", alt: "Halloween mummy-wrapped bottle" },
  { k: "g_1617", alt: "Dutch Barn Vodka serve" },
  { k: "g_img2", alt: "Dutch Barn Vodka lifestyle" },
  { k: "g_apples", alt: "Bottle among British apples" },
  { k: "g_1608", alt: "Ricky Gervais with Dutch Barn Vodka" },
  { k: "g_1659", alt: "Apple picking in the orchard" },
  { k: "g_2955", alt: "Cocktail with Dutch Barn" },
  { k: "g_spritz", alt: "Autumnal spritz" },
  { k: "g_1629", alt: "Dutch Barn serve" },
  { k: "g_video", alt: "Product video", video: true },
].filter((g) => A[g.k]);

function Gallery() {
  const [i, setI] = useState(0);
  const n = GALLERY.length;
  return (
    <div className="gallery">
      <div className="g-stage">
        <span className="badge badge-purple badge-lg g-best">Bestseller</span>
        <Img k="award" alt="Global Vodka Masters 2024 Gold" className="g-award" />
        <div className="g-slider">
          <Img k={GALLERY[i].k} alt={GALLERY[i].alt} className="g-main" />
          {GALLERY[i].video && <span className="g-play">{Icon.play}</span>}
        </div>
        <button type="button" className="g-arrow l" aria-label="Previous image" onClick={() => setI((i - 1 + n) % n)}>{Icon.arrowL}</button>
        <button type="button" className="g-arrow r" aria-label="Next image" onClick={() => setI((i + 1) % n)}>{Icon.arrowR}</button>
      </div>
      <div className="g-grid">
        {GALLERY.slice(1).map((g, k) => (
          <button key={g.k} type="button" className={"g-cell c" + (k + 1)} aria-label={"Show image " + (k + 2)} onClick={() => setI(k + 1)}>
            <Img k={g.k} alt="" />
            {g.video && <span className="g-play sm">{Icon.play}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Marquee() {
  const items = [["u_bcorp", "Certified B Corp & Eco-Friendly"], ["u_apples", "Made from British Apples"], ["u_flag", "Distilled in the UK"], ["u_batch", "Handcrafted in Small Batches"]];
  const row = items.concat(items);
  return (
    <div className="marquee" aria-label="Certified B Corp, made from British apples, distilled in the UK, handcrafted in small batches">
      <div className="marquee-track" aria-hidden="true">
        {row.concat(row).map(([k, t], i) => <span key={i} className="mq-item"><Img k={k} className="mq-ic" />{t}</span>)}
      </div>
    </div>
  );
}

function CartDrawer() {
  const c = useCart();
  const ref = useRef(null);
  useEffect(() => { if (c.open && ref.current) ref.current.focus(); }, [c.open]);
  useEffect(() => {
    const k = (e) => { if (e.key === "Escape") c.setOpen(false); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [c]);
  if (!c.open) return null;
  const ship = c.items.length === 0 ? 0 : c.freeShip ? 0 : SHIPPING_FEE;
  return (
    <div className="drawer-wrap" onClick={(e) => { if (e.target === e.currentTarget) c.setOpen(false); }}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Cart" tabIndex={-1} ref={ref}>
        <div className="drawer-head">
          <span>Cart {c.bottles} ({c.bottles} {c.bottles === 1 ? "item" : "items"})</span>
          <button type="button" className="x" aria-label="Close cart" onClick={() => c.setOpen(false)}>×</button>
        </div>
        <div className="sim-note">Prototype: this cart is simulated. Nothing is charged or reserved.</div>
        {c.items.length === 0 ? <p className="empty">Your cart is empty.</p> : (
          <ul className="lines">
            {c.items.map((it) => (
              <li key={it.key}>
                <Img k={it.img} className="line-img" />
                <div className="line-info"><strong>{it.name}</strong><span>{it.variant}</span>{it.count > 1 && <span>Qty {it.count}</span>}
                  <button type="button" className="linkish" onClick={() => c.remove(it.key)}>Remove</button></div>
                <div className="line-price">{money(round2(it.price * it.count))}</div>
              </li>
            ))}
          </ul>
        )}
        <div className="drawer-foot">
          <div className="sum"><span>Subtotal</span><span>{money(c.subtotal)}</span></div>
          <div className="sum"><span>Shipping</span><span>{c.items.length === 0 ? "—" : ship === 0 ? "FREE" : money(ship)}</span></div>
          <button type="button" className="btn-atc" disabled>Checkout · {money(round2(c.subtotal + ship))}</button>
          <span className="fineprint center">Checkout is disabled in this prototype.</span>
        </div>
      </aside>
    </div>
  );
}

function Toast() {
  const c = useCart();
  return <div className={"toast" + (c.toast ? " show" : "")} role="status" aria-live="polite">{c.toast ? <>{Icon.check} {c.toast}</> : null}</div>;
}

const FAQS = {
  "Ordering & Delivery": [
    ["Where do you deliver to?", "Currently we only ship to the UK, but hopefully soon we'll be in more countries."],
    ["How much is delivery?", "Standard delivery is free on all UK orders over £75. For orders below £75, standard shipping is £4.25."],
    ["How long will my order take?", "Orders placed by 2pm are dispatched the same day from the distillery. Orders after 2pm go out the next working day (excluding weekends and bank holidays), and should arrive the next working day after dispatch."],
    ["My order hasn't arrived, what should I do?", "If it hasn't arrived within 5 working days, check its status in your account, or contact info@dutchbarn.com if you checked out as a guest."],
  ],
  "Returns & Refunds": [
    ["What's your return policy?", "You have 14 days after receiving your item to request a return. Items must be unused, in their original packaging, with proof of purchase. Start a return by contacting info@dutchbarn.com."],
    ["My order arrived damaged, what should I do?", "Please inspect your order on arrival and contact the team straight away if anything is damaged, defective or wrong."],
    ["When will I get my refund?", "Once a return is accepted you're refunded to your original payment method. Banks can take a little while to post it; get in touch if it hasn't arrived within 14 days."],
  ],
};

function FAQ() {
  const tabs = Object.keys(FAQS);
  const [t, setT] = useState(tabs[0]);
  return (
    <section className="faq">
      <h2 className="sec-h center">Frequently Asked Questions</h2>
      <div className="faq-tabs" role="tablist">
        {tabs.map((x) => <button key={x} role="tab" aria-selected={t === x} className={t === x ? "on" : ""} onClick={() => setT(x)}>{x}</button>)}
      </div>
      <div className="faq-list">
        {FAQS[t].map(([q, a]) => <Accordion key={q} title={q} className="faq-acc"><p>{a}</p></Accordion>)}
      </div>
    </section>
  );
}

function PDP() {
  const c = useCart();
  return (
    <div className="pdp">
      <div className="announce"><strong>TRICK OR TREAT:</strong> THE BIGGER THE ORDER - THE BIGGER THE PRIZES… <strong>FIND OUT MORE</strong></div>
      <header className="site-head">
        <Img k="logo_light" alt="Dutch Barn Vodka" className="logo" />
        <nav className="site-nav" aria-label="Store (prototype)">
          <a>Alley Cats</a><a>Shop Now</a><a>Rewards</a><a>Recipes</a><a>Dutch Barn Comedy ▾</a><a>More ▾</a>
        </nav>
        <div className="site-tools">
          <span className="tool">{Icon.search}</span>
          <span className="tool hide-sm">{Icon.user} Login</span>
          <button type="button" className="cart-btn" onClick={() => c.setOpen(true)} aria-label={"Open cart, " + c.bottles + " bottles"}>{Icon.bag}<span>{c.bottles}</span></button>
        </div>
      </header>

      <main>
        <section className="pdp-hero wrap">
          <Gallery />
          <div className="pdp-info">
            <BuyBox />
            <div className="info-accs">
              <Accordion title="Description">
                <p>Handcrafted in small batches in North Yorkshire, this British apple vodka is blended with a hint of potato spirit and distilled through 70 plates for a crisp, clean, and exceptionally smooth finish. Naturally vegan, gluten-free, and with zero sugar.</p>
                <p>Dutch Barn Vodka is presented in a unique lightweight brown bottle and is co-owned by Ricky Gervais.</p>
                <p><strong>Ricky Gervais Mortality Competition.</strong> Win two seats for Ricky Gervais live at the London Palladium on the 8th of November, part of his sold-out Mortality tour. Travel not included. Winner drawn in the first week of next month.</p>
              </Accordion>
              <Accordion title="Shipping & Return">
                <p>Currently we only ship to the UK. Standard delivery is FREE on all UK orders over £75; below £75 it's £4.25.</p>
                <p>Order by 2pm for same-day dispatch from the distillery. Orders after 2pm are dispatched the next working day (excluding weekends and bank holidays). Your order should arrive the next working day from dispatch.</p>
              </Accordion>
            </div>
          </div>
        </section>

        <Marquee />

        <section className="reviews wrap" id="reviews">
          <div className="rev-card rev-head">
            <h2 className="sec-h center small">Customer Reviews</h2>
            <div className="rev-score"><Stars /> <u>{RATING.avg} out of 5</u></div>
            <span>Based on {RATING.count} reviews</span>
            <ul className="rev-bars">
              {RATING.dist.map((n, k) => (
                <li key={k}><Stars size={12} /><span className="bar"><i style={{ width: (n / RATING.count) * 100 + "%" }} /></span><span>{Math.round((n / RATING.count) * 100)}% ({n})</span></li>
              ))}
            </ul>
          </div>
          {[["N.", "06/09/26", "Yep, this works!", "So smooth, love this as a Martini. Ace bottle too, it has heft!"],
            ["M.", "", "Smooth and Delicious", "Smooth and Delicious, easily the best vodka on the market, massive fan. Every bottle is just good on the rocks."],
            ["Z.A.", "", "The best vodka", "The best vodka, so smooth, a favourite in our house."]].map(([who, d, t, b]) => (
            <article key={who} className="rev-card rev">
              <div className="rev-top"><Stars size={15} />{d && <span>{d}</span>}</div>
              <div className="rev-who">{who} <span className="verified">Verified</span></div>
              <strong>{t}</strong><p>{b}</p>
            </article>
          ))}
        </section>

        <section className="video">
          <Img k="video_poster" alt="Ricky Gervais with a bottle of Dutch Barn Vodka" className="video-img" />
          <span className="video-play">{Icon.play}</span>
          <div className="video-cap">Buying Dutch Barn will make a person rich &amp; happy</div>
        </section>

        <section className="process">
          <div className="process-inner wrap">
            <Img k="sig_bottle" alt="Our signature bottle" className="process-bottle" />
            <div className="process-copy">
              <span className="eyebrow">Our process</span>
              <h2 className="sec-h">We do things differently</h2>
              <p>No cheap ethanol. No mass production. Just premium spirit that's handcrafted in our very own distillery. Tasted every 20 minutes. And made with British apples.</p>
              <a className="text-link">Learn about our process ›</a>
            </div>
          </div>
          <div className="wrap cmp-table">
            <picture>
              <source media="(max-width: 700px)" srcSet={A.cmp_mobile} />
              <img src={A.cmp_desktop} alt="Comparison table: Dutch Barn vs others" loading="lazy" />
            </picture>
            <a className="btn-shop">Shop bestsellers now</a>
          </div>
        </section>

        <section className="details wrap">
          <h3 className="sec-h small">The Details</h3>
          <p className="sec-sub">Discover the difference, exceptional taste, born from passion and precision.</p>
          <div className="det-grid">
            {[["d_apples", "Fresh Apples", "Dutch Barn Vodka is expertly handcrafted from British apples in our North Yorkshire distillery."],
              ["d_pips", "Only the Good Pips", "Our spirit is distilled through 70 distillation plates, to create a crisp, clean and smooth flavour."],
              ["d_potato", "A Touch of Potato", "Adding a touch of potato spirit gives our vodka a luscious, creamy mouthfeel."],
              ["d_bcorp", "B Corp Certification", "We do it in the most sustainable way possible so that you get a top quality spirit with serious credentials."]].map(([k, h, p]) => (
              <div key={h} className="det"><Img k={k} alt="" /><h4>{h}</h4><p>{p}</p></div>
            ))}
          </div>
        </section>

        <FAQ />

        <section className="ig-grid">
          {["gal1", "gal2", "gal3", "gal4", "gal5", "gal6"].map((k) => <Img key={k} k={k} alt="" />)}
        </section>

        <section className="also wrap">
          <div className="also-head"><h2 className="sec-h">You may also like</h2><a className="text-link">View all</a></div>
          <div className="also-grid">
            {[["fl_raspberry", "British Raspberry"], ["fl_cherry", "Black Cherry"], ["fl_citrus", "Mediterranean Citrus"], ["fl_vanilla", "Balinese Vanilla"]].map(([k, n]) => (
              <div key={k} className="also-card">
                <div className="also-img"><Img k={k} alt={"Dutch Barn " + n + " Vodka"} /></div>
                <span className="also-vendor">Dutch Barn Vodka</span>
                <strong>Dutch Barn {n} Vodka</strong>
                <span className="also-price">From £27.50</span>
                <a className="btn-view">View product</a>
              </div>
            ))}
          </div>
        </section>

        <section className="banner" style={{ backgroundImage: "url(" + A.footer_banner + ")" }}>
          <div className="banner-copy wrap">
            <div className="banner-rating"><Stars size={13} /> Rated 4.9/5 by 300+ Customers</div>
            <h2 className="sec-h big">Why wait? Grab your orchard vodka now!</h2>
            <p>Expertly &amp; sustainably crafted with care.<br />Co-owned by <strong>Ricky Gervais.</strong></p>
            <a className="btn-shop">Shop bestsellers now</a>
            <span className="guar"><Img k="ic_guarantee" className="ic-guar" /> 14-Day Money-Back Guarantee</span>
          </div>
        </section>
        <Marquee />
      </main>

      <footer className="site-foot" style={{ backgroundImage: "url(" + A.footer_bg + ")" }}>
        <div className="foot-grid wrap">
          <div className="foot-brand"><Img k="logo_footer" alt="Dutch Barn Vodka, Certified B Corporation" /></div>
          <div><h5>Useful Info</h5><ul><li>About</li><li>Recipes</li><li>The Comedy Hub</li><li>Reviews</li><li>Subscribe &amp; Save</li><li>Where To Buy</li><li>FAQs</li><li>Contact</li></ul></div>
          <div><h5>Legal</h5><ul><li>Delivery Information</li><li>Returns &amp; Refunds</li><li>Privacy Policy</li><li>Terms of Service</li><li>Ticket Competition Terms</li></ul></div>
          <div className="foot-news"><h5>Want 10% off and a year's supply of Dutch Barn?</h5><p>Sign up to our mailing list and you could win a whole year's supply. We'll throw in a 10% discount code too.</p><div className="news-field">Email <span>→</span></div></div>
        </div>
        <p className="age">Please do not share with anyone under the legal purchase age for alcohol. Drink responsibly. Don't drink and drive.</p>
        <p className="fineprint center proto-legal">Prototype for a CRO design test. Not published by Dutch Barn Vodka.</p>
      </footer>
      <CartDrawer />
      <Toast />
    </div>
  );
}

/* ---------------------------------------------------------------
   CASE STUDY (View 2)
---------------------------------------------------------------- */
const ANNOS = {
  1: { title: "Purchase options", short: "Two buying paths and a sticky bar became one flow.",
       before: "A single-bottle Add to Cart sits right above a six-flavour bundle builder with its own button, and a sticky bundle bar follows you down the whole page.",
       after: "Pick how many bottles, pick one-time or subscribe, then one button. The mix & match builder is still there, folded away below the button for people who want it.",
       why: "Most shoppers on this page came for the Original. Asking them to read past six flavour cards to understand their options is work they didn't sign up for.",
       impact: "Fewer decisions before adding to cart. We'd look for a higher add-to-cart rate, especially on mobile where the builder is longest." },
  2: { title: "Pricing", short: "A live price with savings, where there was none.",
       before: "There's no price above the button, only “£30.00” inside it, and it stays £30.00 even at quantity 6. The 2-for-£56 and 6-for-£150 pricing is set up in the theme but hidden, so the Original's bulk savings are invisible.",
       after: "A headline price that follows your selection, with the original price struck through, per-bottle price and the saving on every card.",
       why: "People can't respond to a deal they can't see, and a button that doesn't change makes them doubt what they're adding.",
       impact: "Clearer value at the moment of choice. Watch multi-bottle share and AOV to see whether visible savings move people up to 2 or 6 bottles." },
  3: { title: "Add to cart", short: "Three cart buttons became one.",
       before: "“Add to cart £30.00”, the bundle button (which starts as “Select at least 1 bottle”), and the same button again in a sticky bar. Plus six orange “Add +” buttons that look like cart buttons too.",
       after: "One orange button that says exactly what you're getting, like “Add 2 bottles · £56.00”, and updates with every choice.",
       why: "When several buttons look like the main action, people hesitate over which one includes their choice.",
       impact: "Less hesitation and fewer wrong adds. This is the primary metric: add-to-cart rate." },
  4: { title: "Delivery & subscription terms", short: "Terms sit next to the choice they affect.",
       before: "The subscribe toggle says “Cancel anytime”, while the 60-day minimum is behind “Find out more”. Shipping only says free over £75, so a shopper can't tell what their order will cost.",
       after: "Delivery cost updates with the selection and says why it's free. Choosing Subscribe & Save opens the terms, 60-day minimum included.",
       why: "Surprises at checkout cause drop-off. Surprises after buying a subscription cause complaints and cancellations.",
       impact: "Fewer exits at checkout and a subscription take rate that reflects informed choices. Revenue per visitor is the guardrail." },
};

function CompareWidget() {
  const [view, setView] = useState("redesign");
  const [device, setDevice] = useState("desktop");
  const [active, setActive] = useState(1);
  const frameRef = useRef(null);
  const [heights, setHeights] = useState({});

  const pick = (n) => {
    setActive(n);
    requestAnimationFrame(() => {
      const fr = frameRef.current; if (!fr) return;
      const el = fr.querySelector('.cmp-pane.is-shown [data-anno="' + n + '"]');
      if (el) {
        const top = el.getBoundingClientRect().top - fr.getBoundingClientRect().top + fr.scrollTop - 24;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        fr.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
      }
    });
  };
  useEffect(() => { pick(active); }, [view, device]); // eslint-disable-line

  useEffect(() => {
    const fr = frameRef.current; if (!fr) return;
    const measure = () => { const h = {}; fr.querySelectorAll(".cmp-pane").forEach((p) => { h[p.dataset.v] = p.scrollHeight; }); setHeights(h); };
    measure();
    const ro = new ResizeObserver(measure); fr.querySelectorAll(".cmp-pane").forEach((p) => ro.observe(p));
    return () => ro.disconnect();
  }, [device]);

  const anno = { show: true, active, onPick: pick };
  const a = ANNOS[active];
  return (
    <div className="cmp">
      <div className="cmp-controls">
        <div className="seg" role="tablist" aria-label="Version">
          <button role="tab" aria-selected={view === "original"} className={view === "original" ? "on" : ""} onClick={() => setView("original")}>Original PDP</button>
          <button role="tab" aria-selected={view === "redesign"} className={view === "redesign" ? "on" : ""} onClick={() => setView("redesign")}>My Redesign</button>
        </div>
        <div className="seg seg-sm" role="tablist" aria-label="Device">
          <button role="tab" aria-selected={device === "desktop"} className={device === "desktop" ? "on" : ""} onClick={() => setDevice("desktop")}>Desktop</button>
          <button role="tab" aria-selected={device === "mobile"} className={device === "mobile" ? "on" : ""} onClick={() => setDevice("mobile")}>Mobile</button>
        </div>
      </div>
      <div className="cmp-body">
        <div className="cmp-stage">
          <div className={"cmp-device " + device}>
            <div className={"cmp-label " + view}>{view === "original" ? "Current experience" : "Proposed experience"}</div>
            <div className="cmp-frame pdp" ref={frameRef}>
              <div className={"cmp-pane" + (view === "original" ? " is-shown" : "")} data-v="original" aria-hidden={view !== "original"}><OriginalBuyBox anno={anno} /></div>
              <div className={"cmp-pane" + (view === "redesign" ? " is-shown" : "")} data-v="redesign" aria-hidden={view !== "redesign"}><BuyBox anno={anno} context="case" /></div>
            </div>
          </div>
          <div className="cmp-stats">
            <div><span>Buttons that add to cart</span><strong>{view === "original" ? "3 + six “Add +”" : "1"}</strong></div>
            <div><span>Price above the button</span><strong>{view === "original" ? "None" : "Live total"}</strong></div>
            <div><span>Buy box length</span><strong>{heights[view] ? Math.round(heights[view]).toLocaleString() + "px" : "—"}</strong></div>
          </div>
        </div>
        <aside className="cmp-notes">
          <ol className="anno-list">
            {[1, 2, 3, 4].map((n) => (
              <li key={n}>
                <button type="button" className={"anno-item" + (active === n ? " on" : "")} aria-pressed={active === n} onClick={() => pick(n)}>
                  <span className="anno-num">{n}</span>
                  <span><strong>{ANNOS[n].title}</strong><span>{ANNOS[n].short}</span></span>
                </button>
              </li>
            ))}
          </ol>
          <div className="anno-detail" aria-live="polite">
            <div className="ad-row"><span className="ad-k">{view === "original" ? "What's happening today" : "What changed"}</span><p>{view === "original" ? a.before : a.after}</p></div>
            <div className="ad-row"><span className="ad-k">Why it matters</span><p>{a.why}</p></div>
          </div>
          <p className="cs-note">The original is rebuilt from what renders on the live page (16 Oct 2026), using the site's own fonts, colours and images. The redesign is the working component from the prototype, so try it.</p>
        </aside>
      </div>
    </div>
  );
}

function zFor(p) {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - pl) { const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  const q = p - 0.5, r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}
function sampleSize(base, mdeRel, alpha = 0.05, power = 0.8) {
  const p1 = base, p2 = base * (1 + mdeRel), pb = (p1 + p2) / 2;
  const za = zFor(1 - alpha / 2), zb = zFor(power);
  return Math.ceil(Math.pow(za * Math.sqrt(2 * pb * (1 - pb)) + zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2) / Math.pow(p2 - p1, 2));
}

function SampleCalc() {
  const [base, setBase] = useState(9);
  const [mde, setMde] = useState(10);
  const [traffic, setTraffic] = useState(1000);
  const n = sampleSize(base / 100, mde / 100);
  const total = n * 2;
  const days = Math.ceil(total / Math.max(1, traffic));
  const weeks = Math.max(2, Math.ceil(days / 7));
  return (
    <div className="calc">
      <div className="calc-inputs">
        <label htmlFor="calc-base"><span>Baseline add-to-cart rate</span>
          <div className="calc-field"><input id="calc-base" type="number" min="1" max="60" step="0.5" value={base} onChange={(e) => setBase(Math.min(60, Math.max(1, +e.target.value || 1)))} /><em>%</em></div></label>
        <label htmlFor="calc-mde"><span>Smallest lift worth detecting (relative)</span>
          <div className="calc-field"><input id="calc-mde" type="number" min="2" max="50" step="1" value={mde} onChange={(e) => setMde(Math.min(50, Math.max(2, +e.target.value || 2)))} /><em>%</em></div></label>
        <label htmlFor="calc-traffic"><span>PDP sessions per day</span>
          <div className="calc-field"><input id="calc-traffic" type="number" min="50" step="50" value={traffic} onChange={(e) => setTraffic(Math.max(50, +e.target.value || 50))} /></div></label>
      </div>
      <div className="calc-out">
        <div><strong>{n.toLocaleString()}</strong><span>sessions per variant</span></div>
        <div><strong>{total.toLocaleString()}</strong><span>sessions in total</span></div>
        <div><strong>{weeks} weeks</strong><span>run time ({days} days, rounded up to full weeks)</span></div>
      </div>
      <p className="cs-note">Two-sided test, 95% confidence, 80% power, detecting {base}% → {(base * (1 + mde / 100)).toFixed(2)}%. These inputs are placeholders until I have the real analytics numbers. To read mobile and desktop separately at the same sensitivity, each device needs about {n.toLocaleString()} sessions per variant on its own.</p>
    </div>
  );
}

function CaseStudy({ onExplore }) {
  return (
    <div className="cs">
      <header className="cs-hero">
        <span className="cs-eyebrow">CRO design test · Dutch Barn Vodka PDP</span>
        <h1>One buy box. One decision.</h1>
        <p className="cs-lead">The vodka page has a lot going for it: 845 reviews, a gold medal, Ricky Gervais. But the buy box asks a simple question in a complicated way. The best deals are hidden, the button price never changes, and there are three different ways to add to cart. So that's what I'd test first.</p>
        <div className="cs-facts">
          <div><strong>3</strong><span>add-to-cart buttons, plus six “Add +”</span></div>
          <div><strong>£30.00</strong><span>button price, even with 6 bottles selected</span></div>
          <div><strong>Hidden</strong><span>2- and 6-bottle savings, set up but not shown</span></div>
          <div><strong>1 link</strong><span>between “cancel anytime” and a 60-day minimum</span></div>
        </div>
        <button type="button" className="cs-cta" onClick={onExplore}>Explore the Redesign →</button>
      </header>

      <section className="cs-sec">
        <div className="cs-num">01</div>
        <div className="cs-content">
          <h2>The user problem</h2>
          <p className="cs-p">Picture someone who just wants a bottle of the Original. Here's what the buy box gives them, top to bottom:</p>
          <ol className="friction">
            <li><span>Stars, title, “40% ABV | 70cl”, but <b>no price</b></span><em className="tag warn">price</em></li>
            <li><span>Quantity stepper and <b>Add to cart £30.00</b>. Set it to 6 and it still says £30.00</span><em className="tag warn">CTA 1 · price</em></li>
            <li><span>“Step 1: Select your bottles”, six flavour cards with orange <b>Add +</b> buttons</span><em className="tag">path 2</em></li>
            <li><span>A grey <b>Select at least 1 bottle</b> button that becomes “Add Bundle to Cart”</span><em className="tag warn">CTA 2</em></li>
            <li><span>Subscribe &amp; Save toggle: “Cancel anytime”, with the 60-day minimum behind a link</span><em className="tag warn">terms</em></li>
            <li><span>“FREE Shipping When You Spend £75”, with no hint of what their order costs to ship</span><em className="tag">terms</em></li>
            <li><span>And a sticky bar with the bundle button again, following them down the page</span><em className="tag warn">CTA 3</em></li>
          </ol>
          <p className="cs-p">Meanwhile, 2 bottles for £56 and 6 for £150 are already configured in the theme, with “Most popular” and “Best value” badges. They're just hidden. The only visible savings are in the builder, and only after you've picked bottles.</p>
        </div>
      </section>

      <section className="cs-sec">
        <div className="cs-num">02</div>
        <div className="cs-content">
          <h2>My hypothesis</h2>
          <blockquote className="hypo">
            <p><span>Because</span> the buy box shows two competing purchase paths, three add-to-cart buttons and no visible price or savings for the product people came for,</p>
            <p><span>we believe</span> one guided choice (how many bottles → one-time or subscribe → one button with a live price) will make value easier to judge and reduce hesitation.</p>
            <p><span>We'll know</span> if add-to-cart rate goes up for Variant B without revenue per visitor going down.</p>
          </blockquote>
          <p className="cs-p">Why this first? Every buyer has to get through the buy box. It's a contained change in one Shopify section, it doesn't touch the brand storytelling, and the pricing it needs already exists in the theme.</p>
        </div>
      </section>

      <section className="cs-sec cs-wide">
        <div className="cs-num">03</div>
        <div className="cs-content">
          <h2>Before vs after</h2>
          <p className="cs-p">Switch versions and click a number to see what changed. The redesign here is the live component, so you can use it.</p>
          <CompareWidget />
        </div>
      </section>

      <section className="cs-sec">
        <div className="cs-num">04</div>
        <div className="cs-content">
          <h2>Design decisions</h2>
          <div className="decisions">
            {[1, 2, 3, 4].map((n) => (
              <article key={n} className="dec">
                <div className="dec-head"><span className="anno-num">{n}</span><h3>{ANNOS[n].title}</h3></div>
                <dl>
                  <dt>Today</dt><dd>{ANNOS[n].before}</dd>
                  <dt>Change</dt><dd>{ANNOS[n].after}</dd>
                  <dt>Expected behaviour</dt><dd>{ANNOS[n].impact}</dd>
                </dl>
              </article>
            ))}
          </div>
          <p className="cs-p small">Everything else stays as it is: the Spooky headings, the orange pill buttons, the dark Halloween theme, the gallery and every section below the fold. Keeping the change to the buy box means a result can be traced back to it. One more deliberate non-change: the redesign defaults to 1 bottle, same as today. Pre-selecting the 2-bottle bundle could lift AOV, but it would muddy what this test measures, so it's a good follow-up test.</p>
        </div>
      </section>

      <section className="cs-sec">
        <div className="cs-num">05</div>
        <div className="cs-content">
          <h2>A/B testing plan</h2>
          <div className="plan">
            <div className="plan-card">
              <h3>Setup</h3>
              <ul>
                <li>50/50 split, randomised per visitor, on the vodka PDP only</li>
                <li><b>Control A</b>: current buy box. <b>Variant B</b>: redesigned buy box. Everything else identical.</li>
                <li>Run in full weeks to cover weekday and weekend buying, and start after Trick or Treat ends so the promo doesn't skew either side</li>
              </ul>
            </div>
            <div className="plan-card">
              <h3>Metrics</h3>
              <table className="metrics"><tbody>
                <tr><th>Primary</th><td>Add-to-cart rate (PDP sessions with an add to cart)</td></tr>
                <tr><th>Secondary</th><td>Checkout initiation, purchase conversion, AOV, multi-bottle share, subscription take rate</td></tr>
                <tr><th>Guardrail</th><td>Revenue per visitor. Showing the 2- and 6-bottle prices up front could move some mix-bundle buyers to the Original, so RPV has to hold</td></tr>
              </tbody></table>
            </div>
          </div>
          <h3 className="cs-h3">How long it needs to run</h3>
          <SampleCalc />
          <div className="plan two">
            <div className="plan-card">
              <h3>Reading the results</h3>
              <ul>
                <li>Report mobile and desktop separately. I'd expect a bigger effect on mobile, where the current buy box runs longest, but that's a prediction to check.</li>
                <li>Decide at the planned sample size, not when the graph looks good.</li>
                <li>If add-to-cart lifts but purchases don't, the friction has moved to the cart, and that's the next place to look.</li>
              </ul>
            </div>
            <div className="plan-card muted-card">
              <h3>What I'm not claiming</h3>
              <p>There are no results here. Every “expected” effect in this case study is a hypothesis until the test reaches its sample size.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cs-sec">
        <div className="cs-num">—</div>
        <div className="cs-content">
          <h2>Parked for later</h2>
          <ul className="parked">
            <li>A sticky add-to-cart on mobile, replacing today's sticky bundle bar</li>
            <li>Pre-selecting the 2-bottle bundle</li>
            <li>“Rated 4.9/5 by 300+ Customers” in the footer banner vs 845 reviews at the top</li>
            <li>The orange “Add +” buttons in the builder competing with the main button visually</li>
          </ul>
          <h3 className="cs-h3">Flagged, not verified</h3>
          <ul className="flags">
            <li>The 2-for-£56 and 6-for-£150 pricing, the badges and the free shipping on bundles come from blocks in the live theme that are currently hidden. Worth confirming they're still a valid offer before testing.</li>
            <li>“An extra 10% off” is applied to the bundle price. Worth confirming how the subscription app stacks it.</li>
            <li>In my check, toggling Subscribe &amp; Save didn't change the main button price. Worth confirming in a clean session.</li>
          </ul>
          <button type="button" className="cs-cta" onClick={onExplore}>Explore the Redesign →</button>
        </div>
      </section>
      <Toast />
    </div>
  );
}

/* ---------------------------------------------------------------
   APP SHELL — presentation nav, outside the store design
---------------------------------------------------------------- */
function App() {
  const initial = (() => { try { return location.hash === "#case-study" ? "case" : "proto"; } catch (e) { return "proto"; } })();
  const [view, setView] = useState(initial);
  const [device, setDevice] = useState("desktop");
  const go = (v) => {
    setView(v);
    try { history.replaceState(null, "", v === "case" ? "#case-study" : "#prototype"); } catch (e) {}
    window.scrollTo({ top: 0 });
  };
  return (
    <CartProvider>
      <div className="deck-nav">
        <div className="deck-who"><strong>Sabrina</strong><span>CRO design test</span></div>
        <div className="seg seg-deck" role="tablist" aria-label="Presentation view">
          <button role="tab" aria-selected={view === "proto"} className={view === "proto" ? "on" : ""} onClick={() => go("proto")}>Interactive Prototype</button>
          <button role="tab" aria-selected={view === "case"} className={view === "case" ? "on" : ""} onClick={() => go("case")}>CRO Case Study</button>
        </div>
        <div className="deck-right">
          {view === "proto" && (
            <div className="seg seg-sm seg-deck" role="tablist" aria-label="Preview size">
              <button role="tab" aria-selected={device === "desktop"} className={device === "desktop" ? "on" : ""} onClick={() => setDevice("desktop")}>Desktop</button>
              <button role="tab" aria-selected={device === "mobile"} className={device === "mobile" ? "on" : ""} onClick={() => setDevice("mobile")}>Mobile</button>
            </div>
          )}
        </div>
      </div>
      {view === "proto" ? (
        <div className={"proto-stage " + device}>
          <div className="proto-note">Variant B · only the buy box is redesigned · cart is simulated</div>
          <div className="proto-frame"><PDP /></div>
        </div>
      ) : (
        <CaseStudy onExplore={() => go("proto")} />
      )}
    </CartProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
