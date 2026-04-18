# Q7 — Colour samples: one per brand-colour, or one per brand-colour-finish?

## What we need to decide

When a shopper taps "Buy Sample" on a colour page, what do we actually send them? A single brand-level sample of the colour (one sample pot / colour card per brand per colour), or a sample specifically matched to the finish they're considering (matte vs eggshell vs satin vs gloss)?

## Why we're asking

The "Buy Sample" button is a feature you asked for specifically, and it directly feeds the Google Merchant Center ads we want to run. Before we build the SKUs and the ad feed, we need to know what structure you want.

This is also a supplier-agreement question: your wholesale terms with BM, F&B, and LG probably already settle it. If you can share the sample pricing sheets from each, we can answer this ourselves.

## The three options

### Option A — One sample SKU per brand, per colour (finish-agnostic)

One sample exists for BM Hale Navy, one for F&B Railings, one for LG Juniper Ash — regardless of what finish the shopper eventually buys the litre in.

- Simplest catalogue. ~5,500 sample SKUs total.
- Simplest Merchant Center feed — one ad per colour per brand.
- Shopper doesn't see the real finish in their sample; they extrapolate.

### Option B — One sample SKU per brand × colour × finish

BM Hale Navy in Eggshell is a different sample from BM Hale Navy in Satin. The shopper sees exactly what they'll buy.

- Very large catalogue. ~60,000 sample SKUs.
- Very large Merchant Center feed — tens of thousands of ad variants.
- Rich shopper experience, but operationally heavy and probably not how the brands actually supply you.

### Option C — Follow each brand's real sampling practice

- **Benjamin Moore** supplies two samples per colour out of the box: a wet sample (pint-sized tin of real paint) and a dry sample (peel-and-stick colour card). We use BM's own sample references; the button on a BM colour page offers both options.
- **Farrow & Ball** sells colour cards and sample pots — two separate products per colour, not per finish. Same structure as BM.
- **Little Greene** sells sample pots only (no cards). One option per colour.

## What we'd do if you said "just pick"

**Option C** — follow each brand's real sampling practice.

Reasons:
- Each brand already has sample pricing and packaging worked out. We match what they supply, not what we invent.
- Shoppers choose between "colour card" (cheap, flat paper) and "sample pot" (real paint, small tin) because both are legitimate — flattening loses a useful choice.
- The Google Merchant feed matches real supplier-side SKUs, so reconciling orders with the supplier is clean.

**Cost:** the "Buy Sample" button reads slightly differently per brand (BM and F&B show "Card or pot?"; LG shows just "Buy sample pot"). Small UI difference, much closer to how these brands actually trade.

## What we're really asking

1. **Do you already have supplier agreements or pricing sheets** from BM / F&B / LG that specify how samples are priced (per brand, per finish, per card / pot)? If yes, please share — the agreements settle this.
2. **If no agreement yet:** do you have a preferred margin model for samples (e.g. flat €5 fee credited toward the eventual litre purchase)?

## Decision

**Your answer:** _(write here)_

---

# Q7 — Пробники цвета: один на бренд × цвет или один на бренд × цвет × финиш? (Русская версия)

## Что нужно решить

Когда покупатель нажимает "Купить пробник" на странице цвета — что реально отправляется? Один общий пробник на уровне бренда (одна банка / карточка на бренд на цвет) или пробник, привязанный к конкретному финишу (matte, eggshell, satin, gloss), который покупатель рассматривает?

## Почему спрашиваем

Кнопка "Купить пробник" — ваша явная просьба, и напрямую влияет на Google Merchant Center feed (откуда пойдут объявления Shopping). Прежде чем создавать SKU и feed, нужно понимать структуру.

Это ещё и вопрос supplier-соглашений: ваши оптовые условия с BM, F&B и LG, вероятно, уже всё решают. Если вы можете прислать прайсы на пробники от каждого бренда — мы ответим на вопрос сами.

## Три варианта

### Вариант A — один SKU пробника на бренд × цвет (финиш не важен)

Один пробник для BM Hale Navy, один для F&B Railings, один для LG Juniper Ash — независимо от того, в каком финише покупатель потом возьмёт литр.

- Самый простой каталог. ~5,500 SKU всего.
- Самый простой Merchant feed — одно объявление на цвет на бренд.
- Покупатель не видит реальный финиш в пробнике; додумывает сам.

### Вариант B — один SKU на бренд × цвет × финиш

BM Hale Navy в Eggshell — это отдельный SKU от BM Hale Navy в Satin. Покупатель видит ровно то, что купит.

- Очень большой каталог. ~60,000 SKU.
- Очень большой Merchant feed — десятки тысяч вариантов объявлений.
- Богатый опыт покупателя, но тяжёлый операционно и, скорее всего, не соответствует тому, как бренды реально поставляют пробники.

### Вариант C — по практике каждого бренда

- **Benjamin Moore** по каждому цвету выпускает два пробника: wet sample (реальная краска в банке размером с пинту) и dry sample (карточка-самоклейка). Берём SKU BM как есть; на странице цвета BM две опции выбора пробника.
- **Farrow & Ball** продаёт colour cards и sample pots — два отдельных продукта на цвет, не на финиш. Структура как у BM.
- **Little Greene** продаёт только sample pots (без карточек). Одна опция на цвет.

## Что бы мы сделали сами

**Вариант C** — следуем реальной практике каждого бренда.

Причины:
- У каждого бренда уже проработаны цены и упаковка пробников. Мы берём то, что поставляется, а не изобретаем.
- Покупатели выбирают между "colour card" (дёшево, бумажный) и "sample pot" (реальная краска в маленькой банке), потому что оба востребованы — объединить их = потерять полезный выбор.
- Google Merchant feed совпадает с реальными поставщическими SKU, что упрощает сверку с поставщиком.

**Цена:** кнопка "Купить пробник" немного по-разному выглядит у разных брендов (BM и F&B показывают "Карточка или банка?", LG — просто "Купить пробник"). Небольшая разница в UI, зато ближе к реальной торговле брендов.

## На самом деле мы спрашиваем

1. **Есть ли у вас supplier-соглашения или прайсы** от BM / F&B / LG, где зафиксирована цена на пробники (на бренд, на финиш, на карточку / банку)? Если да — пришлите, соглашения решают вопрос.
2. **Если соглашения ещё нет:** есть ли предпочтительная модель маржи по пробникам (например, фиксированный сбор €5, зачитываемый в счёт покупки литра)?

## Решение

**Ваш ответ:** _(напишите здесь)_
