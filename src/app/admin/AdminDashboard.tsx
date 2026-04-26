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
  'menu',
  'footer',
  'productos',
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
        {tab === 'menu' && <MenuTab sc={sc} update={update} />}
        {tab === 'footer' && <FooterTab sc={sc} update={update} />}
        {tab === 'productos' && <ProductsTab sc={sc} update={update} />}
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

function ProductsTab({ sc, update }: { sc: AnyObj; update: (fn: (d: AnyObj) => void) => void }) {
  const products: AnyObj[] = sc.products || [];
  const [editing, setEditing] = useState<number | null>(null);

  const setProducts = (mut: (arr: AnyObj[]) => void) =>
    update((d) => {
      if (!d.siteContent.products) d.siteContent.products = [];
      mut(d.siteContent.products);
    });

  const addProduct = () => {
    const base: AnyObj = {
      id: `prod-${Date.now()}`,
      slug: `nuevo-producto-${Date.now()}`,
      name: 'Nuevo producto',
      shortDescription: 'Descripción breve del producto',
      cartImage: '/images/aa.png',
      variants: [
        { id: 'v1', name: 'Única', price: 0, originalPrice: 0, isBestSeller: true },
      ],
      images: [
        { id: 'img1', src: '/images/aa.png', alt: '', hint: '' },
      ],
      whatsInTheBox: [],
      productInfoAccordion: {
        shipping: {
          title: 'Envío y seguimiento',
          freeShippingTitle: '📦 Envío Gratis',
          freeShippingContent: '',
          trackingTitle: '🚚 Seguimiento',
          trackingContent: '',
          contactInfo: '',
        },
        warranty: {
          title: 'Garantía y Devoluciones',
          satisfactionGuarantee: '',
          returnsPolicy: '',
        },
        extra: { title: 'Extra', content: '' },
      },
      distributorBadge: '',
      purchaseBenefits: { gifts: '', games: '', tv: '' },
      countdownOffer: { activeText: '', expiredText: '' },
      selectionOptions: { colors: { label: 'COLOR', options: [] } },
    };
    setProducts((arr) => arr.push(base));
    setEditing(products.length);
  };

  const duplicateProduct = (i: number) => {
    const copy: AnyObj = clone(products[i]);
    copy.id = `prod-${Date.now()}`;
    copy.slug = `${copy.slug || 'producto'}-copia-${Date.now()}`;
    copy.name = `${copy.name} (copia)`;
    setProducts((arr) => arr.push(copy));
  };

  if (editing !== null && products[editing]) {
    return (
      <>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setEditing(null)}
            className="text-sm text-slate-600 hover:text-slate-900"
            data-testid="back-to-products-list"
          >
            ← Volver al listado
          </button>
          <span className="text-sm text-slate-500">
            Editando: <strong>{products[editing].name}</strong>
          </span>
        </div>
        <ProductEditor
          product={products[editing]}
          allProducts={products}
          editingIndex={editing}
          onChange={(mut) => setProducts((arr) => mut(arr[editing]))}
        />
      </>
    );
  }

  return (
    <Section title={`Productos (${products.length})`}>
      <p className="text-sm text-slate-600">
        Aquí gestionas todos los productos del catálogo. Cada uno tiene su propia página en{' '}
        <code>/producto/[slug]</code>. La home muestra todos en cuadrícula automáticamente.
      </p>
      <Field label="Producto destacado (por slug)">
        <select
          value={sc.featuredProductSlug || ''}
          onChange={(e) => update((d) => (d.siteContent.featuredProductSlug = e.target.value))}
          className="w-full border rounded px-3 py-2 text-sm"
          data-testid="featured-product-select"
        >
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name} ({p.slug})
            </option>
          ))}
        </select>
      </Field>
      <div className="space-y-2 mt-4">
        {products.map((p, i) => (
          <div
            key={p.slug || i}
            className="flex items-center gap-3 bg-slate-50 border rounded p-3"
            data-testid={`product-row-${p.slug}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.cartImage || '/images/aa.png'}
              alt=""
              className="w-14 h-14 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{p.name}</p>
              <p className="text-xs text-slate-500">
                /producto/{p.slug} · {(p.variants || []).length} variantes
              </p>
            </div>
            <button
              onClick={() => setEditing(i)}
              className="bg-slate-900 text-white px-3 py-1.5 rounded text-sm font-medium"
              data-testid={`edit-product-${p.slug}`}
            >
              Editar
            </button>
            <button
              onClick={() => duplicateProduct(i)}
              className="bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded text-sm"
              data-testid={`duplicate-product-${p.slug}`}
            >
              Duplicar
            </button>
            <button
              onClick={() => {
                if (confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) {
                  setProducts((arr) => arr.splice(i, 1));
                }
              }}
              className="text-red-600 hover:text-red-800 text-sm font-medium px-2"
              data-testid={`delete-product-${p.slug}`}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
      <AddBtn onClick={addProduct}>+ Añadir producto nuevo</AddBtn>
    </Section>
  );
}

function ProductEditor({
  product,
  allProducts,
  editingIndex,
  onChange,
}: {
  product: AnyObj;
  allProducts: AnyObj[];
  editingIndex: number;
  onChange: (mut: (p: AnyObj) => void) => void;
}) {
  const p = product;
  const setP = onChange;

  return (
    <>
      <Section title="Datos básicos">
        <div className="grid grid-cols-2 gap-4">
          <Field label="ID interno">
            <Text value={p.id} onChange={(v) => setP((p) => (p.id = v))} />
          </Field>
          <Field label="Slug (URL)">
            <Text
              value={p.slug || ''}
              onChange={(v) =>
                setP((p) => (p.slug = v.toLowerCase().replace(/[^a-z0-9-]/g, '-')))
              }
            />
          </Field>
        </div>
        <Field label="Nombre">
          <Text value={p.name} onChange={(v) => setP((p) => (p.name = v))} />
        </Field>
        <Field label="Descripción corta (se muestra en la cuadrícula de la home)">
          <TextArea
            value={p.shortDescription || ''}
            rows={2}
            onChange={(v) => setP((p) => (p.shortDescription = v))}
          />
        </Field>
        <Field label="Badge distribuidor">
          <Text
            value={p.distributorBadge || ''}
            onChange={(v) => setP((p) => (p.distributorBadge = v))}
          />
        </Field>
        <Field label="Imagen principal (miniatura y carrito)">
          <ImagePicker value={p.cartImage} onChange={(v) => setP((p) => (p.cartImage = v))} />
        </Field>
      </Section>

      <Section title="Variantes (versiones y precios)">
        {(p.variants || []).map((v: AnyObj, i: number) => (
          <div key={i} className="border rounded p-3 space-y-2 bg-slate-50">
            <div className="grid grid-cols-4 gap-2">
              <Field label="ID">
                <Text value={v.id} onChange={(x) => setP((p) => (p.variants[i].id = x))} />
              </Field>
              <Field label="Nombre">
                <Text value={v.name} onChange={(x) => setP((p) => (p.variants[i].name = x))} />
              </Field>
              <Field label="Precio €">
                <Num value={v.price} onChange={(x) => setP((p) => (p.variants[i].price = x))} />
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
                  onChange={(e) => setP((p) => (p.variants[i].isBestSeller = e.target.checked))}
                />
                Más vendida
              </label>
              <RemoveBtn onClick={() => setP((p) => p.variants.splice(i, 1))} />
            </div>
          </div>
        ))}
        <AddBtn
          onClick={() =>
            setP((p) => {
              if (!p.variants) p.variants = [];
              p.variants.push({ id: 'nuevo', name: 'Nueva', price: 0, originalPrice: 0 });
            })
          }
        >
          + Añadir variante
        </AddBtn>
      </Section>

      <Section title="Colores">
        {(p.selectionOptions?.colors?.options || []).map((c: AnyObj, i: number) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-2 items-end">
            <Field label="ID">
              <Text
                value={c.id}
                onChange={(v) => setP((p) => (p.selectionOptions.colors.options[i].id = v))}
              />
            </Field>
            <Field label="Nombre">
              <Text
                value={c.name}
                onChange={(v) => setP((p) => (p.selectionOptions.colors.options[i].name = v))}
              />
            </Field>
            <Field label="Imagen">
              <ImagePicker
                value={c.image}
                onChange={(v) => setP((p) => (p.selectionOptions.colors.options[i].image = v))}
              />
            </Field>
            <RemoveBtn onClick={() => setP((p) => p.selectionOptions.colors.options.splice(i, 1))} />
          </div>
        ))}
        <AddBtn
          onClick={() =>
            setP((p) => {
              if (!p.selectionOptions) p.selectionOptions = { colors: { label: 'COLOR', options: [] } };
              if (!p.selectionOptions.colors) p.selectionOptions.colors = { label: 'COLOR', options: [] };
              if (!p.selectionOptions.colors.options) p.selectionOptions.colors.options = [];
              p.selectionOptions.colors.options.push({
                id: 'nuevo',
                name: 'Nuevo',
                image: '/images/aa.png',
              });
            })
          }
        >
          + Añadir color
        </AddBtn>
      </Section>

      <Section title="Galería de imágenes">
        {(p.images || []).map((img: AnyObj, i: number) => (
          <div key={i} className="grid grid-cols-[2fr_1fr_auto] gap-2 items-end">
            <Field label={`Imagen ${i + 1}`}>
              <ImagePicker
                value={img.src}
                onChange={(v) => setP((p) => (p.images[i].src = v))}
              />
            </Field>
            <Field label="Alt">
              <Text value={img.alt} onChange={(v) => setP((p) => (p.images[i].alt = v))} />
            </Field>
            <RemoveBtn onClick={() => setP((p) => p.images.splice(i, 1))} />
          </div>
        ))}
        <AddBtn
          onClick={() =>
            setP((p) => {
              if (!p.images) p.images = [];
              p.images.push({
                id: `img-${Date.now()}`,
                src: '/images/aa.png',
                alt: '',
                hint: '',
              });
            })
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
              onChange={(v) =>
                setP((p) => {
                  if (!p.purchaseBenefits) p.purchaseBenefits = {};
                  p.purchaseBenefits.gifts = v;
                })
              }
            />
          </Field>
          <Field label="Juegos">
            <Text
              value={p.purchaseBenefits?.games || ''}
              onChange={(v) =>
                setP((p) => {
                  if (!p.purchaseBenefits) p.purchaseBenefits = {};
                  p.purchaseBenefits.games = v;
                })
              }
            />
          </Field>
          <Field label="TV">
            <Text
              value={p.purchaseBenefits?.tv || ''}
              onChange={(v) =>
                setP((p) => {
                  if (!p.purchaseBenefits) p.purchaseBenefits = {};
                  p.purchaseBenefits.tv = v;
                })
              }
            />
          </Field>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Qué incluye la caja</p>
          {(p.whatsInTheBox || []).map((item: string, i: number) => (
            <div key={i} className="flex gap-2 mb-2">
              <Text value={item} onChange={(v) => setP((p) => (p.whatsInTheBox[i] = v))} />
              <RemoveBtn onClick={() => setP((p) => p.whatsInTheBox.splice(i, 1))} />
            </div>
          ))}
          <AddBtn
            onClick={() =>
              setP((p) => {
                if (!p.whatsInTheBox) p.whatsInTheBox = [];
                p.whatsInTheBox.push('Nuevo item');
              })
            }
          >
            + Añadir item
          </AddBtn>
        </div>
      </Section>

      <Section title="Acordeón de información">
        {(['shipping', 'warranty', 'extra'] as const).map((key) => {
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
                      setP((p) => {
                        if (!p.productInfoAccordion) p.productInfoAccordion = {};
                        if (!p.productInfoAccordion[key]) p.productInfoAccordion[key] = {};
                        p.productInfoAccordion[key][k] = val;
                      })
                    }
                  />
                </Field>
              ))}
            </div>
          );
        })}
      </Section>

      <Section title="Countdown de oferta">
        <Field label="Texto activo (usa {timer})">
          <TextArea
            value={p.countdownOffer?.activeText || ''}
            onChange={(v) =>
              setP((p) => {
                if (!p.countdownOffer) p.countdownOffer = {};
                p.countdownOffer.activeText = v;
              })
            }
          />
        </Field>
        <Field label="Texto al expirar">
          <TextArea
            value={p.countdownOffer?.expiredText || ''}
            onChange={(v) =>
              setP((p) => {
                if (!p.countdownOffer) p.countdownOffer = {};
                p.countdownOffer.expiredText = v;
              })
            }
          />
        </Field>
      </Section>

      <CopyFeatureSectionsBlock product={p} setP={setP} allProducts={allProducts} editingIndex={editingIndex} />

      {(['featureSection1', 'featureSection2'] as const).map((key, idx) => (
        <Section key={key} title={`Sección destacada ${idx + 1} (página de producto)`}>
          <p className="text-xs text-slate-500 -mt-2">
            Acepta imagen (.webp/.png/.jpg) o vídeo (.mp4/.webm). Para subir un vídeo,
            pega manualmente la ruta <code>/images/tuvideo.mp4</code>.
          </p>
          <Field label="Título">
            <Text
              value={p[key]?.title || ''}
              onChange={(v) =>
                setP((p) => {
                  if (!p[key]) p[key] = {};
                  p[key].title = v;
                })
              }
            />
          </Field>
          <Field label="Párrafos (separados por línea en blanco)">
            <TextArea
              rows={5}
              value={(p[key]?.paragraphs || []).join('\n\n')}
              onChange={(v) =>
                setP((p) => {
                  if (!p[key]) p[key] = {};
                  p[key].paragraphs = v.split('\n\n').filter(Boolean);
                })
              }
            />
          </Field>
          <Field label="Items lista (uno por línea)">
            <TextArea
              rows={3}
              value={(p[key]?.listItems || []).join('\n')}
              onChange={(v) =>
                setP((p) => {
                  if (!p[key]) p[key] = {};
                  p[key].listItems = v.split('\n').filter(Boolean);
                })
              }
            />
          </Field>
          <Field label="Imagen o vídeo">
            <ImagePicker
              value={p[key]?.imageSrc || ''}
              onChange={(v) =>
                setP((p) => {
                  if (!p[key]) p[key] = {};
                  p[key].imageSrc = v;
                })
              }
            />
            <input
              type="text"
              placeholder="O pega aquí una ruta de vídeo: /images/video1.mp4"
              value={p[key]?.imageSrc || ''}
              onChange={(e) =>
                setP((p) => {
                  if (!p[key]) p[key] = {};
                  p[key].imageSrc = e.target.value;
                })
              }
              className="mt-2 w-full border rounded px-3 py-2 text-sm"
            />
          </Field>
        </Section>
      ))}
    </>
  );
}

function CopyFeatureSectionsBlock({
  product,
  setP,
  allProducts,
  editingIndex,
}: {
  product: AnyObj;
  setP: (mut: (p: AnyObj) => void) => void;
  allProducts: AnyObj[];
  editingIndex: number;
}) {
  const others = allProducts.filter((_, i) => i !== editingIndex);

  const [source, setSource] = useState<string>(others[0]?.id || '');

  if (others.length === 0) return null;

  const apply = (which: 'fs1' | 'fs2' | 'both') => {
    const src = others.find((o) => o.id === source) || others[0];
    if (!src) return;
    if (which === 'both') {
      if (!confirm(`¿Copiar AMBAS secciones desde "${src.name}"? Se sobreescribirán las actuales.`))
        return;
    }
    setP((p) => {
      if (which === 'fs1' || which === 'both') {
        p.featureSection1 = src.featureSection1 ? clone(src.featureSection1) : p.featureSection1;
      }
      if (which === 'fs2' || which === 'both') {
        p.featureSection2 = src.featureSection2 ? clone(src.featureSection2) : p.featureSection2;
      }
    });
  };

  return (
    <Section title="↪ Copiar secciones destacadas desde otro producto">
      <p className="text-sm text-slate-600 -mt-2">
        Útil cuando creas un producto nuevo: clona los textos e imagen/vídeo de otro y luego
        edítalos. La copia es independiente (no afecta al producto origen).
      </p>
      <div className="grid grid-cols-1 md:grid-cols-[2fr_auto_auto_auto] gap-2 items-end">
        <Field label="Producto origen">
          <select
            value={source || others[0]?.id}
            onChange={(e) => setSource(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            {others.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </Field>
        <button
          type="button"
          onClick={() => apply('fs1')}
          className="bg-slate-900 text-white px-3 py-2 rounded text-sm font-medium"
        >
          Copiar Sección 1
        </button>
        <button
          type="button"
          onClick={() => apply('fs2')}
          className="bg-slate-900 text-white px-3 py-2 rounded text-sm font-medium"
        >
          Copiar Sección 2
        </button>
        <button
          type="button"
          onClick={() => apply('both')}
          className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium"
        >
          Copiar ambas
        </button>
      </div>
    </Section>
  );
}

function MenuTab({ sc, update }: { sc: AnyObj; update: (fn: (d: AnyObj) => void) => void }) {
  const menu: AnyObj[] = sc.menu || [];
  const setM = (mut: (arr: AnyObj[]) => void) =>
    update((d) => {
      if (!d.siteContent.menu) d.siteContent.menu = [];
      mut(d.siteContent.menu);
    });

  const products: AnyObj[] = sc.products || [];

  return (
    <Section title={`Menú de navegación (${menu.length})`}>
      <p className="text-sm text-slate-600">
        Estos enlaces aparecen en el header (y en el menú móvil). Puedes enlazar a páginas
        internas o a productos concretos (<code>/producto/slug</code>).
      </p>
      <div className="space-y-2 mt-4">
        {menu.map((item, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end bg-slate-50 border rounded p-3">
            <Field label={`Texto ${i + 1}`}>
              <Text value={item.text} onChange={(v) => setM((a) => (a[i].text = v))} />
            </Field>
            <Field label="URL / Ruta">
              <Text value={item.href} onChange={(v) => setM((a) => (a[i].href = v))} />
            </Field>
            <RemoveBtn onClick={() => setM((a) => a.splice(i, 1))} />
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap mt-3">
        <AddBtn onClick={() => setM((a) => a.push({ text: 'Nuevo', href: '/' }))}>
          + Añadir enlace
        </AddBtn>
        {products.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() =>
              setM((a) => a.push({ text: p.name, href: `/producto/${p.slug}` }))
            }
            className="bg-blue-100 hover:bg-blue-200 text-blue-900 px-3 py-2 rounded text-sm"
            data-testid={`add-menu-product-${p.slug}`}
          >
            + {p.name}
          </button>
        ))}
      </div>
    </Section>
  );
}


function HomeTab({ sc, update }: { sc: AnyObj; update: (fn: (d: AnyObj) => void) => void }) {
  const h = sc.homePage;
  const setH = (mut: (h: AnyObj) => void) => update((d) => mut(d.siteContent.homePage));
  const banner = sc.heroBanner || {};
  const setB = (mut: (b: AnyObj) => void) =>
    update((d) => {
      if (!d.siteContent.heroBanner) d.siteContent.heroBanner = {};
      mut(d.siteContent.heroBanner);
    });
  return (
    <>
      <Section title="Banner principal de la home (hero)">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={banner.enabled !== false}
            onChange={(e) => setB((b) => (b.enabled = e.target.checked))}
            data-testid="hero-banner-enabled"
          />
          Mostrar banner en la home
        </label>
        <Field label="Imagen del banner (fondo)">
          <ImagePicker
            value={banner.image || ''}
            onChange={(v) => setB((b) => (b.image = v))}
          />
        </Field>
        <Field label="Título grande (opcional)">
          <Text
            value={banner.title || ''}
            onChange={(v) => setB((b) => (b.title = v))}
          />
        </Field>
        <Field label="Subtítulo (opcional)">
          <Text
            value={banner.subtitle || ''}
            onChange={(v) => setB((b) => (b.subtitle = v))}
          />
        </Field>
      </Section>

      <Section title="Hero interno (imagen entre secciones)">
        <Field label="Imagen (emuladores etc.)">
          <ImagePicker value={h.heroImage} onChange={(v) => setH((h) => (h.heroImage = v))} />
        </Field>
      </Section>

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
