# -*- coding: utf-8 -*-
# Infografica direzionale - formato orizzontale 16:9 (slide) con logo Busitalia
import os
from PIL import Image, ImageDraw, ImageFont

RED=(163,23,59); DARK=(125,15,44); INK=(31,36,48); GREY=(107,114,128)
LIGHT=(244,245,247); LINE=(225,228,232); WHITE=(255,255,255)
GREEN=(30,142,78); GREEN_BG=(233,247,238); AMBER=(184,134,11); AMBER_BG=(253,243,223)
BLUE=(26,115,232); BLUE_BG=(231,241,253); REDBG=(252,236,236); TEAL=(0,110,99)

W,H=1920,1080
img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)

def F(sz,bold=True):
    p = r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf"
    try: return ImageFont.truetype(p,sz)
    except: return ImageFont.load_default()
def tw(t,f): return d.textbbox((0,0),t,font=f)[2]
def ctext(cx,y,t,f,fill): d.text((cx-tw(t,f)/2,y),t,font=f,fill=fill)
def ltext(x,y,t,f,fill): d.text((x,y),t,font=f,fill=fill)
def rrect(x0,y0,x1,y1,r,fill=None,outline=None,width=1):
    d.rounded_rectangle([x0,y0,x1,y1],radius=r,fill=fill,outline=outline,width=width)

# ---------------- HEADER + LOGO ----------------
HH=180
d.rectangle([0,HH-6,W,HH],fill=RED)
# logo
lx,ly,lmaxw,lmaxh=60,34,420,112
if os.path.exists("logo-busitalia.png"):
    logo=Image.open("logo-busitalia.png").convert("RGBA")
    sc=min(lmaxw/logo.width, lmaxh/logo.height); nw,nh=int(logo.width*sc),int(logo.height*sc)
    logo=logo.resize((nw,nh))
    bg=Image.new("RGBA",(nw,nh),(255,255,255,255)); bg.alpha_composite(logo)
    img.paste(bg.convert("RGB"),(lx,ly+(lmaxh-nh)//2))
    tx=lx+lmaxw+50
else:
    rrect(lx,ly,lx+lmaxw,ly+lmaxh,10,fill=LIGHT,outline=LINE,width=2)
    ctext(lx+lmaxw/2,ly+30,"[ logo Busitalia ]",F(26,False),GREY)
    ctext(lx+lmaxw/2,ly+64,"da inserire",F(22,False),GREY)
    tx=lx+lmaxw+50
ltext(tx,52,"Segnalazione anomalie di flotta",F(54),DARK)
ltext(tx,120,"Freccialink & The Mall   ·   sistema digitale sviluppato internamente",F(30,False),GREY)

# ================= COLONNA SINISTRA =================
LX0,LX1=60,640
# Hero 0 euro
hy0,hy1=210,584
rrect(LX0,hy0,LX1,hy1,26,fill=DARK)
ctext((LX0+LX1)/2,hy0+30,"SVILUPPO IN-HOUSE",F(32),(255,205,218))
ctext((LX0+LX1)/2,hy0+86,"0 €",F(184),WHITE)
ctext((LX0+LX1)/2,hy1-116,"zero fornitori   ·   zero licenze",F(27,False),(255,225,232))
ctext((LX0+LX1)/2,hy1-74,"zero canoni   ·   zero server",F(27,False),(255,225,232))

# Cruscotto direzione
cy0,cy1=606,1000
rrect(LX0,cy0,LX1,cy1,26,fill=LIGHT,outline=LINE,width=2)
ctext((LX0+LX1)/2,cy0+24,"Un cruscotto per la direzione",F(32),DARK)
items=[("Volumi","segnalazioni per stato e periodo"),
       ("Tempi medi","di risoluzione, sempre aggiornati"),
       ("Storico","completo e consultabile"),
       ("Notifiche","automatiche ad ogni cambio stato")]
iy=cy0+86
for a,b in items:
    d.ellipse([LX0+44,iy+8,LX0+64,iy+28],fill=RED)
    ltext(LX0+84,iy,a,F(27),INK)
    ltext(LX0+84,iy+36,b,F(22,False),GREY)
    iy+=76

# ================= COLONNA DESTRA =================
RX0,RX1=690,1860
# --- pilastri ---
ltext(RX0,205,"Cosa rende misurabile il lavoro",F(44),DARK)
d.rectangle([RX0,262,RX0+150,268],fill=RED)

def icon_chart(cx,cy,col):
    for x0,y0,x1,y1 in [(-46,18,-18,55),(-14,-6,14,55),(18,-30,46,55)]:
        d.rounded_rectangle([cx+x0,cy+y0,cx+x1,cy+y1],radius=6,fill=col)
def icon_clock(cx,cy,col):
    d.ellipse([cx-50,cy-50,cx+50,cy+50],outline=col,width=11)
    d.line([cx,cy,cx,cy-30],fill=col,width=11); d.line([cx,cy,cx+26,cy+8],fill=col,width=11)
def icon_bolt(cx,cy,col):
    d.polygon([(cx+8,cy-52),(cx-30,cy+8),(cx-2,cy+8),(cx-12,cy+54),(cx+30,cy-8),(cx+2,cy-8)],fill=col)

cards=[
 (icon_chart,GREEN,GREEN_BG,"Carico di lavoro",
   ["Quante segnalazioni arrivano,","per stato e per periodo","(settimana / mese / anno)."]),
 (icon_clock,AMBER,AMBER_BG,"Tempi di risoluzione",
   ["Tempo medio dalla","segnalazione alla chiusura","dell'intervento."]),
 (icon_bolt,BLUE,BLUE_BG,"Reattività",
   ["Quanto rapidamente viene","presa in carico","ogni segnalazione."]),
]
py0=288; ph=348; pg=34; pw=(RX1-RX0-2*pg)//3
for i,(ic,col,bg,title,lines) in enumerate(cards):
    x0=RX0+i*(pw+pg); x1=x0+pw; cx=(x0+x1)//2
    rrect(x0,py0,x1,py0+ph,22,fill=WHITE,outline=LINE,width=3)
    d.rectangle([x0,py0,x1,py0+12],fill=col)
    d.ellipse([cx-62,py0+44,cx+62,py0+168],fill=bg)
    ic(cx,py0+106,col)
    ctext(cx,py0+188,title,F(33),INK)
    for j,ln in enumerate(lines):
        ctext(cx,py0+242+j*38,ln,F(24,False),GREY)

# --- timeline ---
ty_h=py0+ph+42
ltext(RX0,ty_h,"Dal problema alla soluzione: ogni passo è tracciato",F(40),DARK)
ty=ty_h+82
steps=[("1","Segnalazione","stato: Pending",GREY),
       ("2","Presa in carico","stato: In lavorazione",AMBER),
       ("3","Chiusura","stato: Chiuso",GREEN)]
n=len(steps); seg=(RX1-RX0)//n
cxs=[RX0+seg//2+i*seg for i in range(n)]
d.line([cxs[0],ty+58,cxs[-1],ty+58],fill=LINE,width=8)
for i,(num,t1,t2,col) in enumerate(steps):
    cx=cxs[i]
    d.ellipse([cx-58,ty,cx+58,ty+116],fill=col)
    ctext(cx,ty+22,num,F(62),WHITE)
    ctext(cx,ty+132,t1,F(31),INK)
    ctext(cx,ty+174,t2,F(24,False),col)
for i in range(n-1):
    mx=(cxs[i]+cxs[i+1])//2
    lbl="tempo di reazione" if i==0 else "tempo di lavorazione"
    bw=tw(lbl,F(22,False))+74
    rrect(mx-bw//2,ty+32,mx+bw//2,ty+86,26,fill=WHITE,outline=LINE,width=3)
    ox=mx-bw//2+30
    d.ellipse([ox-12,ty+47,ox+12,ty+71],outline=DARK,width=3)
    d.line([ox,ty+59,ox,ty+51],fill=DARK,width=3); d.line([ox,ty+59,ox+7,ty+62],fill=DARK,width=3)
    ltext(ox+22,ty+47,lbl,F(22,False),DARK)

# ---------------- FOOTER ----------------
d.rectangle([0,H-66,W,H],fill=RED)
ctext(W/2,H-50,"gvasta62.github.io/segnalazioni-flotta      ·      progetto in produzione, a costo zero",F(26),WHITE)

img.save("infografica-progetto-orizzontale.png")
print("OK", img.size, "logo:", os.path.exists("logo-busitalia.png"))
