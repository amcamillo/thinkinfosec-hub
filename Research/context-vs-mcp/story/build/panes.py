"""Split the cover's stained glass into panes along its lead lines.
Outputs: atlas.webp (colour panes), atlas-grey.webp, lead.webp, panes.json"""
import json, sys, numpy as np
from PIL import Image
from scipy import ndimage as nd

src, out = sys.argv[1], sys.argv[2]
img = Image.open(src).convert('RGB')
im = np.asarray(img).astype(int)
H, W, _ = im.shape
r, g, b = im[..., 0], im[..., 1], im[..., 2]
mx = im.max(2)
bg = im.min(2) > 242
lead = (mx < 78) & ~bg
glass = ~lead & ~bg
lab, n = nd.label(glass)
sizes = np.bincount(lab.ravel())
objs = nd.find_objects(lab)

def group(cx, cy, mr, mg, mb):
    lum = (mr + mg + mb) / 3
    if mb > 140 and mg > 140 and mr < 150:
        return 'cup' if (cx > 880 and cy < 430) else 'water'
    if mr > 170 and mg < 120 and mb > 80:
        return 'ribbon'
    if 840 < cx < 970 and 170 < cy < 230 and abs(mr - mb) < 30:
        return 'tap'
    if mb > mr + 25 and lum < 140:
        if cx < 440 and cy < 760: return 'left'
        return 'stone'
    if 640 < cx < 880 and cy < 190: return 'stone'
    if 430 < cx < 890 and cy > 590: return 'scroll'
    return 'left' if cx < 690 else 'right'

panes, crops = [], []
small = np.zeros((H, W), bool)
for i, sl in enumerate(objs, start=1):
    if sl is None: continue
    if sizes[i] < 40:
        small |= (lab == i) if False else False
        continue
    ys, xs = sl
    m = lab[sl] == i
    m = nd.binary_dilation(m, iterations=1)  # bleed under the lead so no hairline gaps
    yy, xx = np.nonzero(lab[sl] == i)
    cy, cx = yy.mean() + ys.start, xx.mean() + xs.start
    px = im[sl][lab[sl] == i]
    mr, mg, mb = px.mean(0)
    panes.append(dict(id=len(panes), g=group(cx, cy, mr, mg, mb), x=xs.start, y=ys.start,
                      w=xs.stop - xs.start, h=ys.stop - ys.start, cx=round(cx, 1), cy=round(cy, 1),
                      a=int(sizes[i]), c=[int(mr), int(mg), int(mb)]))
    crops.append((sl, m))

# tiny regions fold into the lead layer so nothing is lost when panes move
tiny = glass & (sizes[lab] < 40)
lead_rgba = np.zeros((H, W, 4), np.uint8)
lm = lead | tiny
lead_rgba[lm, :3] = im[lm]; lead_rgba[lm, 3] = 255
# split the lead: what borders the water/scrolls fades with them; the rest stays with the stone and figures
wmask = np.zeros((H, W), bool)
for p, (sl, m) in zip(panes, crops):
    if p['g'] in ('water', 'scroll'): wmask[sl] |= m
wmask = nd.binary_dilation(wmask, iterations=4)
for name, sel in (('lead', ~wmask), ('lead-water', wmask)):
    l = lead_rgba.copy(); l[~sel] = 0
    Image.fromarray(l).save(f'{out}/{name}.webp', quality=82, method=6)

# shelf-pack atlas
order = sorted(range(len(panes)), key=lambda k: -panes[k]['h'])
AW, pad, x, y, rowh = 1600, 2, 0, 0, 0
for k in order:
    p = panes[k]
    if x + p['w'] + pad > AW: x, y, rowh = 0, y + rowh + pad, 0
    p['ax'], p['ay'] = x, y
    x += p['w'] + pad; rowh = max(rowh, p['h'])
AH = y + rowh
atlas = np.zeros((AH, AW, 4), np.uint8)
grey = np.zeros((AH, AW, 4), np.uint8)
gl = (im * [0.3, 0.59, 0.11]).sum(2)
for p, (sl, m) in zip(panes, crops):
    a = atlas[p['ay']:p['ay'] + p['h'], p['ax']:p['ax'] + p['w']]
    gg = grey[p['ay']:p['ay'] + p['h'], p['ax']:p['ax'] + p['w']]
    a[m, :3] = im[sl][m]; a[m, 3] = 255
    v = np.clip(gl[sl][m] * 0.85 + 20, 0, 255)
    gg[m, 0] = v; gg[m, 1] = v; gg[m, 2] = v; gg[m, 3] = 255
Image.fromarray(atlas).save(f'{out}/atlas.webp', quality=86, method=6)
Image.fromarray(grey).save(f'{out}/atlas-grey.webp', quality=80, method=6)
json.dump(dict(W=W, H=H, panes=panes), open(f'{out}/panes.json', 'w'), separators=(',', ':'))
from collections import Counter
print(len(panes), 'panes', Counter(p['g'] for p in panes), 'atlas', AW, AH)

# verification render
pal = dict(left=(230,120,120), right=(120,200,120), stone=(60,70,160), water=(0,200,220), scroll=(240,230,180),
           ribbon=(255,0,140), cup=(0,255,255), tap=(160,160,160))
v = np.full((H, W, 3), 255, np.uint8); v[lm] = 20
for p, (sl, m) in zip(panes, crops):
    reg = v[sl]; reg[lab[sl] == p['id'] * 0 + 0] = reg[lab[sl] == 0]  # no-op keep
    v[sl][lab[sl] == -1] = 0
for p, (sl, m) in zip(panes, crops):
    sub = v[sl]; mm = m & ~lm[sl]; sub[mm] = pal[p['g']]
Image.fromarray(v).resize((W // 2, H // 2)).save(f'{out}/_groups.png')
