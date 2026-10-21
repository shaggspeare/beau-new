#!/usr/bin/env python3
"""Rebuild assets/barb-data.json from the crawler output.

Usage:
    python3 tools/build_data.py <barb-crawler>/src/data/crawledMasters.ts assets/barb-data.json

Input:  the CRAWLED_MASTERS array the barb-crawler repo exports (30 rows, Aug 2026 crawl).
Output: the single JSON file both apps fetch at runtime (places, deals, categories, map labels).

What it does
- de-duplicates profiles that appear in several categories (30 rows -> 22 places)
- groups services by barb.ua category, splits "від 1000 грн / 1 г" into price + duration
- computes "from" prices (min >= 150 грн overall, >= 100 грн per category) so add-ons
  like "Дизайн нігтів від 25 грн" don't become the headline price
- projects lat/lng onto the stylized Kyiv map (same projection as tools/mapgen.py)
- adds hand-checked facts from live barb.ua pages (Oct 2026): deals, category counts,
  reviews/hours for two profiles, a corrected location for «Майстерня краси Юлії Юдіної»
"""
import json, math, re, sys

src_path, out_path = sys.argv[1], sys.argv[2]
ts = open(src_path, encoding='utf-8').read()
start = ts.index('export const CRAWLED_MASTERS')
src = json.loads(ts[ts.index('= [', start) + 2: ts.rindex(']') + 1])

# ---------------------------------------------------------------- categories
GROUP_MAP = {
    'hair': ['Стрижка та укладка волосся', 'Фарбування волосся', 'Реконструкція волосся', 'Нарощування волосся', 'Трихологія', 'Завивка волосся', 'Вирівнювання волосся'],
    'nails': ['Догляд за нігтями рук', 'Догляд за ногами'],
    'brows': ['Оформлення брів та вій'],
    'face': ['Косметологія обличчя', 'Пластика обличчя'],
    'removal': ['Видалення волосся'],
    'body': ['Масаж і SPA', 'Косметологія тіла', 'Корекція фігури'],
    'makeup': ['Макіяж'],
    'tattoo': ['Тату та пірсинг'],
    'pmu': ['Перманентный макияж', 'Перманентний макіяж'],
    'fitness': ['Тренування'],
}
G2K = {g: k for k, gs in GROUP_MAP.items() for g in gs}
RENAME = {'Перманентный макияж': 'Перманентний макіяж'}
DROP = {'Оренда робочого місця'}


def clean_group(c):
    return re.sub(r'\s*\(\d+\)\s*$', '', c).strip()


def parse_price(p):
    t = p.strip().rstrip('.').replace('грн.', 'грн').replace(' .', '.')
    t = re.sub(r'\s+', ' ', t)
    m = re.search(r'(\d[\d\s]*)', t)
    return t, (int(m.group(1).replace(' ', '')) if m else 0)


def split_price(pt):
    """'від 1000 грн / 1 г 30 хв' -> ('від 1 000 грн', 1000, '1 год 30 хв', 90)"""
    if '✔' in pt or not re.search(r'\d', pt):
        return ('за запитом', 0, '', 0)
    parts = [x.strip() for x in pt.split('/')]
    price = parts[0]
    m = re.search(r'(\d[\d\s]*)', price)
    val = int(m.group(1).replace(' ', '')) if m else 0
    price = re.sub(r'(\d)(\d{3})(?!\d)', r'\1 \2', price)
    dur = parts[1] if len(parts) > 1 else ''
    h = re.search(r'(\d+)\s*г', dur)
    mi = re.search(r'(\d+)\s*хв', dur)
    dm = (int(h.group(1)) * 60 if h else 0) + (int(mi.group(1)) if mi else 0)
    if dm:
        hh, mm = divmod(dm, 60)
        dt = (f'{hh} год' if hh else '') + (' ' if hh and mm else '') + (f'{mm} хв' if mm else '')
    else:
        dt = ''
    if len(parts) > 1 and not dm:
        price = pt  # unknown suffix, keep raw
    return (price, val, dt, dm)


# ------------------------------------------- facts checked on barb.ua (Oct 2026)
FIX = {
    'yuliayudina': {'lat': 50.4668, 'lng': 30.6385, 'reviews': 80, 'rating': 9.7, 'metro': 'м. Чернігівська', 'district': 'Деснянський'},
}
EXTRA = {
    'vshevchyk': {
        'title': 'Перукар-колорист', 'work': 'Салон краси «Luck Beauty Studio»', 'exp': '23 роки досвіду',
        'hours': [['Графік', 'за домовленістю']],
        'about': 'Майстер-універсал. Перед фарбуванням консультую з урахуванням типу волосся та підказую домашній догляд після процедури. У салоні є генератор — відсутність світла не завадить.',
        'photos': 47,
        'revs': [['Женя', '08.07.2026', 'Дякую за настрій і нову зачіску)'], ['Марина', '09.04.2026', 'Прекрасна завивка, дуже задоволена!'], ['Анастасія', '14.06.2025', 'Валентина зробила мені класні кучері. Все сподобалось. Дякую, прийду ще!']],
    },
    'yuliayudina': {
        'title': 'Салон краси · студія лазерної епіляції', 'work': '', 'exp': '',
        'hours': [['Пн', '10:00–21:00'], ['Вт', '10:00–21:30'], ['Ср', '10:30–21:30'], ['Чт', '10:00–21:00'], ['Пт', '10:00–22:00'], ['Сб', '10:00–22:00'], ['Нд', '10:30–21:30']],
        'about': 'Нагорода «Вибір клієнтів 2021». Працюємо з Olaplex, ItalWax, Zemits, HydraFacial MD, BingoSpa.',
        'photos': 24,
        'revs': [['Марина', '28.09.2026', 'Обожнюю цю студію за чесність і високий професіоналізм майстрів'], ['Валентина', '03.07.2026', 'Майстер уважно ставилась до кожної ділянки, не поспішала.']],
    },
}
TITLES = {'master': {'hair': 'Перукар', 'nails': 'Майстер манікюру', 'laser': 'Майстер епіляції'}, 'salon': 'Салон краси'}
TINTS = ['#ffe1e8', '#dceaf7', '#e4ebf3', '#ffeef2', '#e8f0f8']

# ---------------------------------------------------------- geography helpers
YOU = (50.4474, 30.5225)  # "you are here": Khreshchatyk
LNG0, LNG1, LAT0 = 30.30, 30.70, 50.56
KX = 1000 / ((LNG1 - LNG0) * 111.32 * math.cos(math.radians(50.45)))


def dist_km(lat, lng):
    p1, p2 = math.radians(YOU[0]), math.radians(lat)
    dp, dl = p2 - p1, math.radians(lng - YOU[1])
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(a))


def proj(lat, lng):
    return (lng - LNG0) / (LNG1 - LNG0) * 1000, (LAT0 - lat) * 110.57 * KX


# ------------------------------------------------------------ merge profiles
places, order = {}, []
for m in src:
    slug = m['slug']
    svcs = [s for s in m['services'] if clean_group(s['category']) not in DROP]
    if slug in places:
        p = places[slug]
        if len(svcs) > len(p['_svcs']):
            p['_svcs'] = svcs
        p['reviews'] = max(p['reviews'], m['reviewsCount'])
        p['_cats'].add(m['category'])
        continue
    places[slug] = {'id': slug, 'name': m['name'], 'type': m['type'], 'rating': m['rawRating'], 'reviews': m['reviewsCount'],
                    'addr': m['cleanStreet'], 'district': m['district'], 'metro': m['metro'], 'lat': m['lat'], 'lng': m['lng'],
                    'ini': m['initials'], 'url': m['url'], 'ig': (m.get('socials') or {}).get('instagram') or '',
                    '_svcs': svcs, '_cats': {m['category']}}
    order.append(slug)

out = []
for i, slug in enumerate(order):
    p = places[slug]
    p.update(FIX.get(slug, {}))
    raw_groups, gi, keys = [], {}, []
    for s in p['_svcs']:
        g = RENAME.get(clean_group(s['category']), clean_group(s['category']))
        k = G2K.get(clean_group(s['category'])) or G2K.get(g)
        if k and k not in keys:
            keys.append(k)
        txt, val = parse_price(s['price'])
        if g not in gi:
            gi[g] = len(raw_groups)
            raw_groups.append([g, []])
        raw_groups[gi[g]][1].append([s['name'].strip(), txt, val])
    if not keys:
        keys = [{'hair': 'hair', 'nails': 'nails', 'laser': 'removal'}[c] for c in sorted(p['_cats'])]

    groups, catmin = [], {}
    for gname, items in raw_groups:
        k = G2K.get(gname, '')
        seen, rows = set(), []
        for n, pt, _v in items:
            key = n.strip().lower()
            if key in seen:
                continue
            seen.add(key)
            price, val, dt, dm = split_price(pt)
            rows.append([n.strip(), price, val, dt, dm])
            if k and val >= 100:
                catmin[k] = min(catmin.get(k, 10 ** 9), val)
        groups.append([gname, k, rows])
    vals = [r[2] for g in groups for r in g[2] if r[2] >= 150]

    x, y = proj(p['lat'], p['lng'])
    title = TITLES['salon'] if p['type'] == 'salon' else TITLES['master'].get(sorted(p['_cats'])[0], 'Майстер')
    ex = EXTRA.get(slug, {})
    igh = ''
    if p['ig']:
        mm = re.search(r'instagram\.com/([^/?#]+)', p['ig'])
        igh = ('@' + mm.group(1)) if mm else ''
    rec = {'id': slug, 'name': p['name'], 'type': p['type'], 'title': ex.get('title') or title, 'rating': p['rating'], 'reviews': p['reviews'],
           'addr': p['addr'], 'district': p['district'], 'metro': p['metro'], 'ini': p['ini'], 'tint': TINTS[i % len(TINTS)],
           'x': round(x / 10, 2), 'y': round(y / 8, 2), 'km': round(dist_km(p['lat'], p['lng']), 1),
           'min': min(vals) if vals else 0, 'cmin': catmin, 'cats': keys, 'ig': igh, 'url': p['url'],
           'nsvc': sum(len(g[2]) for g in groups), 'groups': groups}
    for k in ('work', 'exp', 'hours', 'about', 'photos', 'revs'):
        if k in ex:
            rec[k] = ex[k]
    out.append(rec)

# ------------------------------------------------- deals from barb.ua/uk/skidka
U = 'https://barb.ua/uk/skidka/'
deals = [
    dict(id='d1', t='5 послуг за ціною однієї', who='Лілія Істомина', role='Перукар-колорист', dist='Печерський р-н', old=11000, now=5500, off=50, till='08.11', cat='hair', url=U + 'promo-4406'),
    dict(id='d2', t='SOS для волосся: пілінг, трихоскопія та нанореконструкція', who='Лілія Істомина', role='Перукар-колорист', dist='Печерський р-н', old=6000, now=2000, off=67, till='31.10', cat='hair', url=U + 'promo-5605'),
    dict(id='d9', t='Армування та ліфтинг обличчя нитками', who='Нелли', role='Дерматолог-косметолог', dist='Шевченківський р-н', old=18500, now=12500, off=32, till='22.10', cat='face', url=U + 'promo-22041'),
    dict(id='d3', t='Кератинове вирівнювання волосся', who='Ольга Ластівка', role='Перукар', dist='Голосіївський р-н', old=4000, now=2500, off=37, till='30.11', cat='hair', url=U + 'promo-12585'),
    dict(id='d6', t='Комплекс: зняття, манікюр, однотонне покриття', who='Healthy & beauty club', role='Косметологія', dist='Шевченківський р-н', old=1200, now=900, off=25, till='31.10', cat='nails', url=U + 'promo-10531'),
    dict(id='d7', t='Бікіні + ноги + пахви', who='Dali Deluxe', role='Салон краси', dist='Печерський р-н', old=1900, now=1500, off=21, till='01.12', cat='removal', url=U + 'promo-10022'),
    dict(id='d8', t='Спа-програма «Шоколадна казка»', who='Перлина СПА', role='СПА-салон', dist='Голосіївський р-н', old=3235, now=2899, off=10, till='30.11', cat='body', url=U + 'promo-22043'),
    dict(id='d4', t='Мікроголковий RF-ліфтинг обличчя та шиї', who='Healthy & beauty club', role='Косметологія', dist='Шевченківський р-н', old=5000, now=4000, off=20, till='31.10', cat='face', url=U + 'promo-13757'),
    dict(id='d5', t='Комплекс: зняття, педикюр, однотонне покриття', who='Healthy & beauty club', role='Косметологія', dist='Шевченківський р-н', old=1500, now=1200, off=20, till='31.10', cat='nails', url=U + 'promo-10694'),
    dict(id='d10', t='RF-ліфтинг рук у подарунок до RF-ліфтингу обличчя', who='Сфера Плюс', role='Косметологія', dist='Святошинський р-н', gift=1, till='', cat='face', pid='sfplus', svc='Мікроголчастий RF ліфтинг', url=U + 'promo-21247'),
    dict(id='d11', t='Біозавивка + −10% на засоби домашнього догляду', who='Валентина Шевчук', role='Перукар-колорист', dist='Печерський р-н', off=10, till='31.10', cat='hair', pid='vshevchyk', svc='Біозавивка волосся', url=U + 'promo-21505'),
    dict(id='d12', t='Знижка 200 грн на прийом подолога', who='Подологічний центр Лаури Токаренко', role='Подологічний кабінет', dist='Деснянський р-н', old=2000, now=1800, off=10, till='10.11', cat='nails', url='https://barb.ua/uk/med/skidka/promo-21590'),
    dict(id='d13', t='Чоловіча стрижка від 500 грн', who='Леся Чижук', role='Чоловічий перукар', dist='Оболонь, Поділ, Печерськ', now=500, frm=1, till='', cat='hair', url=U + 'promo-21955'),
]
# ------------------------------- category names + procedure counts from barb.ua
cats = [
    dict(k='hair', n='Волосся', full='Перукарські послуги', sub=[['Стрижка та укладка', 17356], ['Фарбування волосся', 13746], ['Випрямлення волосся', 1267], ['Завивка волосся', 975], ['Нарощування волосся', 721]]),
    dict(k='nails', n='Нігті', full='Нігтьовий сервіс', sub=[['Манікюр', 7493], ['Педикюр', 5077], ['Покриття гель-лаком', 3806], ['Нарощування нігтів', 3210], ['Подологія', 2021]]),
    dict(k='brows', n='Брови та вії', full='Брови / вії', sub=[['Нарощування вій', 5641], ['Корекція брів', 3909], ['Фарбування брів', 3113], ['Фарбування вій', 1464], ['Ламінування вій', 1459]]),
    dict(k='face', n='Обличчя', full='Догляд за обличчям', sub=[['Пілінг обличчя', 6630], ['Чистка обличчя', 5637], ['Хімічний пілінг', 5621], ['Масаж обличчя', 4715], ['Ультразвукова чистка', 1228]]),
    dict(k='removal', n='Епіляція', full='Видалення волосся', sub=[['Лазерна епіляція', 5479], ['Воскова депіляція', 4165], ['Шугарінг', 3617], ['Видалення волосся на обличчі', 349], ['Елос епіляція', 206]]),
    dict(k='body', n='Тіло і SPA', full='Догляд за тілом', sub=[['Масаж тіла', 4986], ['Корекція фігури', 3158], ['Обгортання', 1595], ['Антицелюлітний масаж', 1201], ['Пілінг для тіла', 894]]),
    dict(k='makeup', n='Макіяж', full='Візаж та макіяж', sub=[['Вечірній', 1298], ['Діловий', 1243], ['Весільний', 1168], ['Випускний', 618], ['Для фотосесій', 460]]),
    dict(k='pmu', n='Татуаж', full='Татуаж', sub=[['Татуаж брів', 3783], ['Татуаж очей', 2825], ['Татуаж губ', 2474], ['Видалення татуажу', 821]]),
]
popular = [['Стрижка', 'Стрижка та укладка', 17356], ['Фарбування', 'Фарбування волосся', 13746], ['Манікюр', 'Манікюр', 7493], ['Пілінг', 'Пілінг обличчя', 6630], ['Нарощування вій', 'Нарощування вій', 5641], ['Лазерна епіляція', 'Лазерна епіляція', 5479], ['Педикюр', 'Педикюр', 5077], ['Масаж', 'Масаж тіла', 4986]]
labels = [['ОБОЛОНЬ', 42.5, 25.35], ['ПОДІЛ', 53.12, 45.58], ['ШЕВЧЕНКІВСЬКИЙ', 42.0, 48.26], ['ПЕЧЕРСЬК', 59.62, 62.64], ['ГОЛОСІЇВ', 50.5, 84.33], ['СОЛОМʼЯНКА', 39.0, 63.37], ['СВЯТОШИН', 22.0, 43.63], ['ДАРНИЦЯ', 87.5, 71.41], ['ДНІПРОВСЬКИЙ', 80.75, 43.87], ['ДЕСНЯНСЬКИЙ', 80.0, 17.06]]

data = dict(places=out, deals=deals, cats=cats, popular=popular, labels=labels, you=[55.63, 54.89],
            stats=dict(pros='18 876', procs='910 329', kyivDeals=129))
s = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
open(out_path, 'w', encoding='utf-8').write(s)
print(f'wrote {out_path}: {len(out)} places, {len(deals)} deals, {len(s.encode())} bytes')
