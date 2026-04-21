'use client';

import { useState } from 'react';
import { saveContentAction } from './actions';
import ImagePicker from './ImagePicker';

/* ---------- Helpers ---------- */

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

type AnyObj = Record<string, any>;

/* ---------- UI primitives ---------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function Text({
  value,
  onChange,
  testid,
}: {
  value: string;
  onChange: (v: string) => void;
  testid?: string;
}) {
  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded px-3 py-2 text-sm"
      data-testid={testid}
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 3,
  testid,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  testid?: string;
}) {
  return (
    <textarea
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full border rounded px-3 py-2 text-sm font-mono"
      data-testid={testid}
    />
  );
}

function Num({
  value,
  onChange,
  testid,
}: {
  value: number;
  onChange: (v: number) => void;
  testid?: string;
}) {
  return (
    <input
      type="number"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="w-full border rounded px-3 py-2 text-sm"
      data-testid={testid}
    />
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <h3 className="font-bold text-lg">{title}</h3>
      {children}
    </div>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-red-600 hover:text-red-800 text-sm font-medium"
    >
      Eliminar
    </button>
  );
}

function AddBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-slate-200 hover:bg-slate-300 px-3 py-2 rounded text-sm font-medium"
    >
      {children}
    </button>
  );
}

/* ---------- Main Dashboard ---------- */

const TABS = [
  'header',
  'footer',
  'producto',
  'home',
  'reviews',
  'faq',
  'cupones',
  'imagenes',
] as const;
type Tab = (typeof TABS)[number];

export default function AdminDashboard({ initialContent }: { initialContent: any }) {
  const [content, setContent] = useState<AnyObj>(initialContent);
  const [tab, setTab] = useState<Tab>('header');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const sc = content.siteContent;

  const update = (mutator: (draft: AnyObj) => void) => {
    setContent((prev) => {
      const next = clone(prev);
      mutator(next);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    const res = await saveContentAction(content);
    setSaving(false);
    if (res.success) {
      setMsg({ type: 'ok', text: 'Guardado. Haz rebuild para ver los cambios en el sitio.' });
    } else {
      setMsg({ type: 'err', text: res.error || 'Error' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-1 bg-white rounded-lg border p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded capitalize transition-colors ${
                tab === t ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
              data-testid={`admin-tab-${t}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {msg && (
            <span
              className={`text-sm ${msg.type === 'ok' ? 'text-green-700' : 'text-red-700'}`}
              data-testid="admin-save-msg"
            >
              {msg.text}
            </span>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded font-semibold disabled:opacity-50"
            data-testid="admin-save-btn"
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {tab === 'header' && <HeaderTab sc={sc} update={update} />}
        {tab === 'footer' && <FooterTab sc={sc} update={update} />}
        {tab === 'producto' && <ProductTab sc={sc} update={update} />}
        {tab === 'home' && <HomeTab sc={sc} update={update} />}
        {tab === 'reviews' && <ReviewsTab sc={sc} update={update} />}
        {tab === 'faq' && <FaqTab sc={sc} update={update} />}
        {tab === 'cupones' && <CouponsTab sc={sc} update={update} />}
        {tab === 'imagenes' && <ImagesTab />}
      </div>
    </div>
  );
}

/* ---------- Tabs ---------- */

function HeaderTab({ sc, update }: { sc: AnyObj; update: (fn: (d: AnyObj) => void) => void }) {
  return (
    <Section title="Barra superior y logo">
      <Field label="Banner superior (mensaje que gira)">
        <Text
          value={sc.header.announcementBar}
          onChange={(v) => update((d) => (d.siteContent.header.announcementBar = v))}
          testid="header-announcement"
        />
      </Field>
      <Field label="Logo (imagen)">
        <ImagePicker
          value={sc.header.logo}
          onChange={(v) => update((d) => (d.siteContent.header.logo = v))}
        />
      </Field>
    </Section>
  );
}

function FooterTab({ sc, update }: { sc: AnyObj; update: (fn: (d: AnyObj) => void) => void }) {
  const f = sc.footer;
  return (
    <>
      <Section title="Marca y contacto">
        <Field label="Nombre de la marca">
          <Text
            value={f.brandName}
            onChange={(v) => update((d) => (d.siteContent.footer.brandName = v))}
          />
        </Field>
        <Field label="Eslogan">
          <Text
            value={f.brandSlogan}
            onChange={(v) => update((d) => (d.siteContent.footer.brandSlogan = v))}
          />
        </Field>
        <Field label="Número de WhatsApp (solo dígitos)">
          <Text
            value={f.whatsAppNumber}
            onChange={(v) => update((d) => (d.siteContent.footer.whatsAppNumber = v))}
          />
        </Field>
        <Field label="Título suscripción">
          <Text
            value={f.subscriptionTitle}
            onChange={(v) => update((d) => (d.siteContent.footer.subscriptionTitle = v))}
          />
        </Field>
        <Field label="Eslogan suscripción">
          <Text
            value={f.subscriptionSlogan}
            onChange={(v) => update((d) => (d.siteContent.footer.subscriptionSlogan = v))}
          />
        </Field>
      </Section>

      <Section title="Enlaces de políticas">
        {(f.policyLinks || []).map((link: AnyObj, i: number) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
            <Field label={`Texto ${i + 1}`}>
              <Text
                value={link.text}
                onChange={(v) =>
                  update((d) => (d.siteContent.footer.policyLinks[i].text = v))
                }
              />
            </Field>
            <Field label="URL">
              <Text
                value={link.href}
                onChange={(v) =>
                  update((d) => (d.siteContent.footer.policyLinks[i].href = v))
                }
              />
            </Field>
            <RemoveBtn
              onClick={() =>
                update((d) => d.siteContent.footer.policyLinks.splice(i, 1))
              }
            />
          </div>
        ))}
        <AddBtn
          onClick={() =>
            update((d) =>
              d.siteContent.footer.policyLinks.push({ text: 'Nuevo', href: '/' })
            )
          }
        >
          + Añadir enlace
        </AddBtn>
      </Section>

      <Section title="Redes sociales">
        {(f.socialLinks || []).map((link: AnyObj, i: number) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
            <Field label="Nombre">
              <Text
                value={link.name}
                onChange={(v) =>
                  update((d) => (d.siteContent.footer.socialLinks[i].name = v))
                }
              />
            </Field>
            <Field label="URL">
              <Text
                value={link.href}
                onChange={(v) =>
                  update((d) => (d.siteContent.footer.socialLinks[i].href = v))
                }
              />
            </Field>
            <Field label="Icono (lucide)">
              <Text
                value={link.icon}
                onChange={(v) =>
                  update((d) => (d.siteContent.footer.socialLinks[i].icon = v))
                }
              />
            </Field>
            <RemoveBtn
              onClick={() =>
                update((d) => d.siteContent.footer.socialLinks.splice(i, 1))
              }
            />
          </div>
        ))}
        <AddBtn
          onClick={() =>
            update((d) =>
              d.siteContent.footer.socialLinks.push({
                name: 'Nuevo',
                href: '#',
                icon: 'Facebook',
              })
            )
          }
        >
          + Añadir red social
        </AddBtn>
      </Section>
    </>
  );
}

function ProductTab({ sc, update }: { sc: AnyObj; update: (fn: (d: AnyObj) => void) => void }) {
  const p = sc.homePage.productSection.product;
  const setP = (mut: (p: AnyObj) => void) =>
    update((d) => mut(d.siteContent.homePage.productSection.product));

  return (
    <>
      <Section title="Datos básicos del producto">
        <div className="grid grid-cols-2 gap-4">
          <Field label="ID interno">
            <Text value={p.id} onChange={(v) => setP((p) => (p.id = v))} />
          </Field>
          <Field label="Nombre mostrado">
            <Text value={p.name} onChange={(v) => setP((p) => (p.name = v))} />
          </Field>
        </div>
        <Field label="Badge distribuidor">
          <Text value={p.distributorBadge} onChange={(v) => setP((p) => (p.distributorBadge = v))} />
        </Field>
        <Field label="Imagen del carrito">
          <ImagePicker value={p.cartImage} onChange={(v) => setP((p) => (p.cartImage = v))} />
        </Field>
      </Section>

      <Section title="Variantes (versiones y precios)">
        {(p.variants || []).map((v: AnyObj, i: number) => (
          <div key={i} className="border rounded p-3 space-y-2 bg-slate-50">
            <div className="grid grid-cols-4 gap-2">
              <Field label="ID">
                <Text
                  value={v.id}
                  onChange={(x) => setP((p) => (p.variants[i].id = x))}
                />
              </Field>
              <Field label="Nombre">
                <Text
                  value={v.name}
                  onChange={(x) => setP((p) => (p.variants[i].name = x))}
                />
              </Field>
              <Field label="Precio €">
                <Num
                  value={v.price}
                  onChange={(x) => setP((p) => (p.variants[i].price = x))}
                />
              </Field>
              <Field label="Precio original €">
                <Num
                  value={v.originalPrice}
                  onChange={(x) => setP((p) => (p.variants[i].originalPrice = x))}
                />
              </Field>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!v.isBestSeller}
                  onChange={(e) =>
                    setP((p) => (p.variants[i].isBestSeller = e.target.checked))
                  }
                />
                Es la más vendida (destacada)
              </label>
              <RemoveBtn onClick={() => setP((p) => p.variants.splice(i, 1))} />
            </div>
          </div>
        ))}
        <AddBtn
          onClick={() =>
            setP((p) =>
              p.variants.push({
                id: 'nuevo',
                name: 'Nueva variante',
                price: 0,
                originalPrice: 0,
              })
            )
          }
        >
          + Añadir variante
        </AddBtn>
      </Section>

      <Section title="Colores disponibles">
        {(p.selectionOptions?.colors?.options || []).map((c: AnyObj, i: number) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-2 items-end">
            <Field label="ID">
              <Text
                value={c.id}
                onChange={(v) =>
                  setP((p) => (p.selectionOptions.colors.options[i].id = v))
                }
              />
            </Field>
            <Field label="Nombre">
              <Text
                value={c.name}
                onChange={(v) =>
                  setP((p) => (p.selectionOptions.colors.options[i].name = v))
                }
              />
            </Field>
            <Field label="Imagen">
              <ImagePicker
                value={c.image}
                onChange={(v) =>
                  setP((p) => (p.selectionOptions.colors.options[i].image = v))
                }
              />
            </Field>
            <RemoveBtn
              onClick={() =>
                setP((p) => p.selectionOptions.colors.options.splice(i, 1))
              }
            />
          </div>
        ))}
        <AddBtn
          onClick={() =>
            setP((p) =>
              p.selectionOptions.colors.options.push({
                id: 'nuevo',
                name: 'Nuevo',
                image: '/images/aaa.png',
              })
            )
          }
        >
          + Añadir color
        </AddBtn>
      </Section>

      <Section title="Galería de imágenes del producto">
        {(p.images || []).map((img: AnyObj, i: number) => (
          <div key={i} className="grid grid-cols-[2fr_1fr_auto] gap-2 items-end">
            <Field label={`Imagen ${i + 1}`}>
              <ImagePicker
                value={img.src}
                onChange={(v) => setP((p) => (p.images[i].src = v))}
              />
            </Field>
            <Field label="Alt (accesibilidad)">
              <Text
                value={img.alt}
                onChange={(v) => setP((p) => (p.images[i].alt = v))}
              />
            </Field>
            <RemoveBtn onClick={() => setP((p) => p.images.splice(i, 1))} />
          </div>
        ))}
        <AddBtn
          onClick={() =>
            setP((p) =>
              p.images.push({
                id: `img-${Date.now()}`,
                src: '/images/aaa.png',
                alt: '',
                hint: '',
              })
            )
          }
        >
          + Añadir imagen
        </AddBtn>
      </Section>

      <Section title="Beneficios y Qué incluye la caja">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Regalos">
            <Text
              value={p.purchaseBenefits?.gifts || ''}
              onChange={(v) => setP((p) => (p.purchaseBenefits.gifts = v))}
            />
          </Field>
          <Field label="Juegos">
            <Text
              value={p.purchaseBenefits?.games || ''}
              onChange={(v) => setP((p) => (p.purchaseBenefits.games = v))}
            />
          </Field>
          <Field label="TV">
            <Text
              value={p.purchaseBenefits?.tv || ''}
              onChange={(v) => setP((p) => (p.purchaseBenefits.tv = v))}
            />
          </Field>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Qué incluye la caja</p>
          {(p.whatsInTheBox || []).map((item: string, i: number) => (
            <div key={i} className="flex gap-2 mb-2">
              <Text
                value={item}
                onChange={(v) => setP((p) => (p.whatsInTheBox[i] = v))}
              />
              <RemoveBtn onClick={() => setP((p) => p.whatsInTheBox.splice(i, 1))} />
            </div>
          ))}
          <AddBtn onClick={() => setP((p) => p.whatsInTheBox.push('Nuevo item'))}>
            + Añadir item
          </AddBtn>
        </div>
      </Section>

      <Section title="Acordeón de información (envío, garantía, extra)">
        {['shipping', 'warranty', 'extra'].map((key) => {
          const block = p.productInfoAccordion?.[key] || {};
          return (
            <div key={key} className="border rounded p-3 bg-slate-50 space-y-2">
              <p className="font-semibold capitalize">{key}</p>
              {Object.entries(block).map(([k, v]) => (
                <Field key={k} label={k}>
                  <TextArea
                    value={String(v)}
                    rows={2}
                    onChange={(val) =>
                      setP((p) => (p.productInfoAccordion[key][k] = val))
                    }
                  />
                </Field>
              ))}
            </div>
          );
        })}
      </Section>

      <Section title="Countdown de oferta">
        <Field label="Texto mientras está activa (usa {timer})">
          <TextArea
            value={p.countdownOffer?.activeText || ''}
            onChange={(v) => setP((p) => (p.countdownOffer.activeText = v))}
          />
        </Field>
        <Field label="Texto cuando expira">
          <TextArea
            value={p.countdownOffer?.expiredText || ''}
            onChange={(v) => setP((p) => (p.countdownOffer.expiredText = v))}
          />
        </Field>
      </Section>
    </>
  );
}

function HomeTab({ sc, update }: { sc: AnyObj; update: (fn: (d: AnyObj) => void) => void }) {
  const h = sc.homePage;
  const setH = (mut: (h: AnyObj) => void) => update((d) => mut(d.siteContent.homePage));
  return (
    <>
      <Section title="Hero (imagen superior)">
        <Field label="Imagen principal de arriba">
          <ImagePicker value={h.heroImage} onChange={(v) => setH((h) => (h.heroImage = v))} />
        </Field>
      </Section>

      {(['featureSection1', 'featureSection2'] as const).map((key) => (
        <Section key={key} title={`Sección: ${key}`}>
          <Field label="Título">
            <Text
              value={h[key]?.title || ''}
              onChange={(v) => setH((h) => (h[key].title = v))}
            />
          </Field>
          <Field label="Párrafos (uno por línea)">
            <TextArea
              rows={5}
              value={(h[key]?.paragraphs || []).join('\n\n')}
              onChange={(v) =>
                setH((h) => (h[key].paragraphs = v.split('\n\n').filter(Boolean)))
              }
            />
          </Field>
          <Field label="Items lista (uno por línea)">
            <TextArea
              rows={3}
              value={(h[key]?.listItems || []).join('\n')}
              onChange={(v) =>
                setH((h) => (h[key].listItems = v.split('\n').filter(Boolean)))
              }
            />
          </Field>
          <Field label="Imagen">
            <ImagePicker
              value={h[key]?.imageSrc || ''}
              onChange={(v) => setH((h) => (h[key].imageSrc = v))}
            />
          </Field>
        </Section>
      ))}

      <Section title="Sección comunidad (dentro del home)">
        <Field label="Título">
          <Text
            value={h.communitySection?.title || ''}
            onChange={(v) => setH((h) => (h.communitySection.title = v))}
          />
        </Field>
        <Field label="Descripción">
          <TextArea
            value={h.communitySection?.description || ''}
            onChange={(v) => setH((h) => (h.communitySection.description = v))}
          />
        </Field>
        <Field label="Texto del botón">
          <Text
            value={h.communitySection?.buttonText || ''}
            onChange={(v) => setH((h) => (h.communitySection.buttonText = v))}
          />
        </Field>
        <Field label="Enlace del botón">
          <Text
            value={h.communitySection?.buttonLink || ''}
            onChange={(v) => setH((h) => (h.communitySection.buttonLink = v))}
          />
        </Field>
        <Field label="Imagen upsell carrito">
          <ImagePicker
            value={h.communitySection?.cartImage || ''}
            onChange={(v) => setH((h) => (h.communitySection.cartImage = v))}
          />
        </Field>
      </Section>

      <Section title="Reviews carrusel (títulos)">
        <Field label="Título de la sección">
          <Text
            value={h.customerReviewsCarouselSection?.title || ''}
            onChange={(v) => setH((h) => (h.customerReviewsCarouselSection.title = v))}
          />
        </Field>
      </Section>
    </>
  );
}

function ReviewsTab({ sc, update }: { sc: AnyObj; update: (fn: (d: AnyObj) => void) => void }) {
  const reviews = sc.homePage.reviewsSection?.reviews || [];
  const setR = (mut: (arr: AnyObj[]) => void) =>
    update((d) => mut(d.siteContent.homePage.reviewsSection.reviews));

  return (
    <Section title={`Reviews (${reviews.length})`}>
      <Field label="Título de la sección">
        <Text
          value={sc.homePage.reviewsSection?.title || ''}
          onChange={(v) => update((d) => (d.siteContent.homePage.reviewsSection.title = v))}
        />
      </Field>
      <div className="space-y-3 mt-4">
        {reviews.map((r: AnyObj, i: number) => (
          <div key={i} className="border rounded p-3 bg-slate-50 space-y-2">
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
              <Field label="Nombre">
                <Text value={r.name} onChange={(v) => setR((a) => (a[i].name = v))} />
              </Field>
              <Field label="Fecha">
                <Text value={r.date} onChange={(v) => setR((a) => (a[i].date = v))} />
              </Field>
              <Field label="Rating (1-5)">
                <Num value={r.rating} onChange={(v) => setR((a) => (a[i].rating = v))} />
              </Field>
              <div className="flex items-end">
                <RemoveBtn onClick={() => setR((a) => a.splice(i, 1))} />
              </div>
            </div>
            <Field label="Texto">
              <TextArea value={r.text} onChange={(v) => setR((a) => (a[i].text = v))} />
            </Field>
            <div className="grid grid-cols-[2fr_auto] gap-2 items-end">
              <Field label="Imagen">
                <ImagePicker value={r.image} onChange={(v) => setR((a) => (a[i].image = v))} />
              </Field>
              <label className="flex items-center gap-2 text-sm pb-2">
                <input
                  type="checkbox"
                  checked={!!r.isVerified}
                  onChange={(e) => setR((a) => (a[i].isVerified = e.target.checked))}
                />
                Verificada
              </label>
            </div>
          </div>
        ))}
      </div>
      <AddBtn
        onClick={() =>
          setR((a) =>
            a.push({
              id: String(Date.now()),
              name: 'Cliente',
              date: new Date().toLocaleDateString('es-ES'),
              rating: 5,
              text: '',
              isVerified: true,
              image: '/images/aa.png',
            })
          )
        }
      >
        + Añadir review
      </AddBtn>
    </Section>
  );
}

function FaqTab({ sc, update }: { sc: AnyObj; update: (fn: (d: AnyObj) => void) => void }) {
  const faqs = sc.homePage.faqSection?.faqs || [];
  const setF = (mut: (arr: AnyObj[]) => void) =>
    update((d) => mut(d.siteContent.homePage.faqSection.faqs));

  return (
    <Section title={`Preguntas frecuentes (${faqs.length})`}>
      <Field label="Título de la sección">
        <Text
          value={sc.homePage.faqSection?.title || ''}
          onChange={(v) => update((d) => (d.siteContent.homePage.faqSection.title = v))}
        />
      </Field>
      <div className="space-y-3 mt-4">
        {faqs.map((q: AnyObj, i: number) => (
          <div key={i} className="border rounded p-3 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Pregunta {i + 1}</p>
              <RemoveBtn onClick={() => setF((a) => a.splice(i, 1))} />
            </div>
            <Field label="Pregunta">
              <Text
                value={q.question || q.q || ''}
                onChange={(v) =>
                  setF((a) => {
                    if ('question' in a[i]) a[i].question = v;
                    else a[i].q = v;
                  })
                }
              />
            </Field>
            <Field label="Respuesta">
              <TextArea
                rows={3}
                value={q.answer || q.a || ''}
                onChange={(v) =>
                  setF((a) => {
                    if ('answer' in a[i]) a[i].answer = v;
                    else a[i].a = v;
                  })
                }
              />
            </Field>
          </div>
        ))}
      </div>
      <AddBtn
        onClick={() =>
          setF((a) => a.push({ question: 'Nueva pregunta', answer: 'Respuesta' }))
        }
      >
        + Añadir pregunta
      </AddBtn>
    </Section>
  );
}

function CouponsTab({ sc, update }: { sc: AnyObj; update: (fn: (d: AnyObj) => void) => void }) {
  const coupons: AnyObj[] = sc.coupons || [];
  const setC = (mut: (arr: AnyObj[]) => void) =>
    update((d) => {
      if (!d.siteContent.coupons) d.siteContent.coupons = [];
      mut(d.siteContent.coupons);
    });

  return (
    <Section title={`Cupones de descuento (${coupons.length})`}>
      <p className="text-sm text-slate-600">
        <strong>Tipos disponibles:</strong>
        <br />
        • <code>finalPrice</code>: el total pasa a ser el valor indicado (ej. 1€)
        <br />
        • <code>amountOff</code>: resta el valor al total (ej. -10€)
        <br />• <code>free</code>: el pedido es gratis
      </p>
      <div className="space-y-3 mt-4">
        {coupons.map((c, i) => (
          <div key={i} className="border rounded p-3 bg-slate-50">
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
              <Field label="Código">
                <Text
                  value={c.code || ''}
                  onChange={(v) => setC((a) => (a[i].code = v.toLowerCase()))}
                />
              </Field>
              <Field label="Tipo">
                <select
                  value={c.type || 'amountOff'}
                  onChange={(e) => setC((a) => (a[i].type = e.target.value))}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="finalPrice">finalPrice</option>
                  <option value="amountOff">amountOff</option>
                  <option value="free">free</option>
                </select>
              </Field>
              <Field label="Valor €">
                <Num
                  value={c.value || 0}
                  onChange={(v) => setC((a) => (a[i].value = v))}
                />
              </Field>
              <div className="flex items-end">
                <RemoveBtn onClick={() => setC((a) => a.splice(i, 1))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Field label="Título del toast">
                <Text
                  value={c.title || ''}
                  onChange={(v) => setC((a) => (a[i].title = v))}
                />
              </Field>
              <Field label="Descripción del toast">
                <Text
                  value={c.description || ''}
                  onChange={(v) => setC((a) => (a[i].description = v))}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
      <AddBtn
        onClick={() =>
          setC((a) =>
            a.push({
              code: 'nuevo',
              type: 'amountOff',
              value: 10,
              title: '¡Cupón aplicado!',
              description: 'Has conseguido un descuento.',
            })
          )
        }
      >
        + Añadir cupón
      </AddBtn>
    </Section>
  );
}

function ImagesTab() {
  return (
    <Section title="Subir y explorar imágenes">
      <p className="text-sm text-slate-600">
        Todas las imágenes se guardan en <code>/public/images/</code>. Desde cualquier campo de
        imagen del admin puedes abrir el selector y subir nuevas. Aquí tienes una vista rápida:
      </p>
      <ImagePicker
        value=""
        onChange={() => {}}
        label="Abrir explorador de imágenes"
      />
    </Section>
  );
}
