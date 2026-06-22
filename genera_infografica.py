# -*- coding: utf-8 -*-
# Infografica del progetto - presentazione direzionale
from PIL import Image, ImageDraw, ImageFont

RED=(163,23,59); DARK=(125,15,44); INK=(31,36,48); GREY=(107,114,128)
LIGHT=(244,245,247); LINE=(225,228,232); WHITE=(255,255,255)
GREEN=(30,142,78); GREEN_BG=(233,247,238); AMBER=(184,134,11); AMBER_BG=(253,243,223)
BLUE=(26,115,232); BLUE_BG=(231,241,253); REDBG=(252,236,236)

W,H=1400,2050
img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)

def F(sz,bold=True):
    p = r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf"
    try: return ImageFont.truetype(p,sz)
    except: return ImageFont.load_default()

def tw(t,f): return d.textbbox((0,0),t,font=f)[2]
def ctext(cx,y,t,f,fill):
    d.text((cx-tw(t,f)/2,y),t,font=f,fill=fill)
def ltext(x,y,t,f,fill): d.text((x,y),t,font=f,fill=fill)
def rrect(x0,y0,x1,y1,r,fill=None,outline=None,width=1):
    d.rounded_rectangle([x0,y0,x1,y1],radius=r,fill=fill,outline=outline,width=width)

# ---------------- HEADER ----------------
d.rectangle([0,0,W,250],fill=RED)
d.rectangle([0,250,W,258],fill=DARK)
ctext(W/2,46,"SEGNALAZIONE ANOMALIE DI FLOTTA",F(58),WHITE)
ctext(W/2,128,"Freccialink & The Mall",F(40,False),(255,225,232))
ctext(W/2,182,"Sistema digitale sviluppato internamente",F(30,False),(255,205,218))

# ---------------- HERO: COSTO ZERO ----------------
hy=300
rrect(70,hy,W-70,hy+330,28,fill=DARK)
ctext(W/2,hy+34,"SVILUPPO IN-HOUSE",F(34),(255,205,218))
ctext(W/2,hy+78,"0 €",F(170),WHITE)
ctext(W/2,hy+262,"zero fornitori   ·   zero licenze   ·   zero canoni   ·   zero server",F(28,False),(255,225,232))

# ---------------- SEZIONE: COSA MISURA ----------------
sy=690
ctext(W/2,sy,"Cosa rende misurabile il lavoro",F(46),DARK)
d.rectangle([W/2-120,sy+64,W/2+120,sy+70],fill=RED)

# icone disegnate
def icon_chart(cx,cy,col):
    bars=[(-46,18,-18,55),(-14,-6,14,55),(18,-30,46,55)]
    for x0,y0,x1,y1 in bars:
        d.rounded_rectangle([cx+x0,cy+y0,cx+x1,cy+y1],radius=6,fill=col)
def icon_clock(cx,cy,col):
    d.ellipse([cx-50,cy-50,cx+50,cy+50],outline=col,width=11)
    d.line([cx,cy,cx,cy-30],fill=col,width=11)
    d.line([cx,cy,cx+26,cy+8],fill=col,width=11)
def icon_bolt(cx,cy,col):
    d.polygon([(cx+8,cy-52),(cx-30,cy+8),(cx-2,cy+8),(cx-12,cy+54),(cx+30,cy-8),(cx+2,cy-8)],fill=col)

cards=[
 (icon_chart, GREEN, GREEN_BG, "Carico di lavoro",
   ["Quante segnalazioni arrivano,","per stato e per periodo","(settimana / mese / anno)."]),
 (icon_clock, AMBER, AMBER_BG, "Tempi di risoluzione",
   ["Tempo medio dalla","segnalazione alla chiusura","dell'intervento."]),
 (icon_bolt, BLUE, BLUE_BG, "Reattività",
   ["Quanto rapidamente viene","presa in carico","ogni segnalazione."]),
]
cy0=sy+110; ch=470; gap=34; cw=(W-140-2*gap)//3
for i,(ic,col,bg,title,lines) in enumerate(cards):
    x0=70+i*(cw+gap); x1=x0+cw
    rrect(x0,cy0,x1,cy0+ch,22,fill=WHITE,outline=LINE,width=3)
    d.rectangle([x0,cy0,x1,cy0+12],fill=col)
    cx=(x0+x1)//2
    d.ellipse([cx-66,cy0+50,cx+66,cy0+182],fill=bg)
    ic(cx,cy0+116,col)
    ctext(cx,cy0+210,title,F(34),INK)
    for j,ln in enumerate(lines):
        ctext(cx,cy0+270+j*40,ln,F(25,False),GREY)

# ---------------- FLUSSO / TIMELINE ----------------
fy=cy0+ch+90
ctext(W/2,fy,"Dal problema alla soluzione: ogni passo è tracciato",F(40),DARK)
ty=fy+110
steps=[("1","Segnalazione","stato: Pending",GREY),
       ("2","Presa in carico","stato: In lavorazione",AMBER),
       ("3","Chiusura","stato: Chiuso",GREEN)]
n=len(steps); seg=(W-220)//(n);
cxs=[110+seg//2+i*seg for i in range(n)]
# linea
d.line([cxs[0],ty+60,cxs[-1],ty+60],fill=LINE,width=8)
for i,(num,t1,t2,col) in enumerate(steps):
    cx=cxs[i]
    d.ellipse([cx-60,ty,cx+60,ty+120],fill=col)
    ctext(cx,ty+24,num,F(64),WHITE)
    ctext(cx,ty+140,t1,F(32),INK)
    ctext(cx,ty+184,t2,F(25,False),col)
# etichette tempo tra i nodi
for i in range(n-1):
    mx=(cxs[i]+cxs[i+1])//2
    rrect(mx-105,ty+34,mx+105,ty+86,26,fill=WHITE,outline=LINE,width=3)
    lbl="tempo di reazione" if i==0 else "tempo di lavorazione"
    # piccolo orologio disegnato
    ox=mx-tw(lbl,F(22,False))//2-22
    d.ellipse([ox-12,ty+48,ox+12,ty+72],outline=DARK,width=3)
    d.line([ox,ty+60,ox,ty+52],fill=DARK,width=3); d.line([ox,ty+60,ox+7,ty+63],fill=DARK,width=3)
    ltext(ox+22,ty+47,lbl,F(22,False),DARK)

# ---------------- IMPATTO / DASHBOARD MINI ----------------
iy=ty+260
rrect(70,iy,W-70,iy+250,24,fill=LIGHT,outline=LINE,width=2)
ctext(W/2,iy+30,"Un cruscotto sempre aggiornato per la direzione",F(34),DARK)
mini=[("Segnalazioni","per stato e periodo"),
      ("Tempo medio","di risoluzione"),
      ("Storico completo","consultabile"),
      ("Notifiche","ad ogni cambio stato")]
mw=(W-180)//4
for i,(a,b) in enumerate(mini):
    x0=90+i*mw; cx=x0+mw//2
    d.ellipse([cx-9,iy+108,cx+9,iy+126],fill=RED)
    ctext(cx,iy+140,a,F(28),INK)
    ctext(cx,iy+178,b,F(23,False),GREY)

# ---------------- FOOTER TECH ----------------
fty=iy+300
ctext(W/2,fty,"Costruito con strumenti gratuiti, senza alcun canone",F(30,False),GREY)
chips=["GitHub Pages","Google Sheet","Apps Script","Gmail"]
chf=F(28); pad=26; gap2=22
widths=[tw(c,chf)+2*pad for c in chips]
total=sum(widths)+gap2*(len(chips)-1); x=(W-total)//2; cyc=fty+58
for c,wd in zip(chips,widths):
    rrect(x,cyc,x+wd,cyc+66,33,fill=REDBG,outline=(244,182,182),width=2)
    ltext(x+pad,cyc+16,c,chf,DARK)
    x+=wd+gap2

# barra finale
d.rectangle([0,H-70,W,H],fill=RED)
ctext(W/2,H-54,"gvasta62.github.io/segnalazioni-flotta   ·   progetto in produzione",F(26),WHITE)

img.save("infografica-progetto.png")
print("OK infografica", img.size)
