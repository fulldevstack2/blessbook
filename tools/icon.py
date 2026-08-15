import math

def leaf(ax, ay, bx, by, w, bow, belly=0.30, taper=0.70):
    dx, dy = bx - ax, by - ay
    L = math.hypot(dx, dy)
    ux, uy = dx / L, dy / L
    nx, ny = -uy, ux
    def P(t, s):
        o = bow * math.sin(math.pi * t)
        return (ax + ux * L * t + nx * (w * s + o), ay + uy * L * t + ny * (w * s + o))
    f = lambda p: f"{p[0]:.2f} {p[1]:.2f}"
    return ("M" + f(P(0, 0)) + "C" + f(P(belly, 1.0)) + " " + f(P(taper, 0.78)) + " " + f(P(1, 0)) +
            "C" + f(P(taper, -0.78)) + " " + f(P(belly, -1.0)) + " " + f(P(0, 0)) + "Z")

# Optically centred in the tile: the drawn mark ran low and right, which left a
# corner of dead lacquer at the top left.
SHIFT_X, SHIFT_Y = -0.9, -2.4
THREE = [(6.4, 10.4, 28.4, 15.0, 3.55, -1.60),
         (6.0, 13.6, 25.4, 23.2, 3.55, -1.25),
         (6.4, 17.0, 18.0, 28.0, 2.85, -0.85)]
paths = "".join(
    f'\n    <path d="{leaf(ax + SHIFT_X, ay + SHIFT_Y, bx + SHIFT_X, by + SHIFT_Y, w, bow)}"/>'
    for ax, ay, bx, by, w, bow in THREE)

MARK = f'''  <g fill="url(#dl-gold)" stroke="#17110a" stroke-width="1.05" stroke-linejoin="round">{paths}
  </g>'''

DEFS = '''  <defs>
    <linearGradient id="dl-gold" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stop-color="#f9e2ac"/>
      <stop offset="40%" stop-color="#e3b155"/>
      <stop offset="100%" stop-color="#9c6a1b"/>
    </linearGradient>
  </defs>'''

HEAD = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Dennis Lau">
  <!-- Three feathers off one shoulder: the Phoenix, his six-string violin, is
       carved as a bird's wing, so the wing is the mark.

       Three and not five. Five is a better drawing at 128px and unreadable at
       16, where every feather gets two pixels and the gaps between them get
       one; three broad ones survive the browser tab, which is the only size
       this file is ever seen at. Filled leaves rather than strokes, because an
       SVG stroke cannot taper and an untapered fan reads as a comb. Each is
       separated by a hairline of the lacquer behind it so the overlaps still
       read when it is four pixels wide. -->'''

open("icon.svg", "w").write(f'{HEAD}\n{DEFS}\n  <rect width="32" height="32" rx="7" fill="#17110a"/>\n{MARK}\n</svg>\n')
# The tab icon is masked square by some browsers, so the rounding lives here;
# the touch icon is rounded by the OS and must bleed to its own edges.
open("icon-touch.svg", "w").write(
    f'{HEAD}\n{DEFS}\n  <rect width="32" height="32" fill="#17110a"/>\n'
    f'  <g transform="translate(16 16) scale(0.84) translate(-16 -16)">\n{MARK}\n  </g>\n</svg>\n')
print("wrote icon.svg + icon-touch.svg")
