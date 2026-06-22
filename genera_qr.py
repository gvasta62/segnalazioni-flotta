# -*- coding: utf-8 -*-
# Genera il QR (con logo Busitalia al centro) e il volantino A4
import qrcode
from qrcode.constants import ERROR_CORRECT_H
from PIL import Image, ImageDraw, ImageFont

URL='https://gvasta62.github.io/segnalazioni-flotta/'
RED=(163,23,59); DARK=(125,15,44); INK=(31,36,48); GREY=(107,114,128)

def font(sz,bold=True):
    p=r'C:\Windows\Fonts\arialbd.ttf' if bold else r'C:\Windows\Fonts\arial.ttf'
    try: return ImageFont.truetype(p,sz)
    except: return ImageFont.load_default()

logo=Image.open('logo-busitalia.png').convert('RGBA')

# ---------- QR con logo al centro (correzione errori alta = H) ----------
qr=qrcode.QRCode(error_correction=ERROR_CORRECT_H, box_size=16, border=3)
qr.add_data(URL); qr.make(fit=True)
qrimg=qr.make_image(fill_color=DARK, back_color='white').convert('RGBA')
QW,QH=qrimg.size
lw=int(QW*0.30); lh=int(logo.height*lw/logo.width)
lg=logo.resize((lw,lh))
pad=int(QW*0.028); pw,ph=lw+2*pad, lh+2*pad
placard=Image.new('RGBA',(pw,ph),(0,0,0,0))
ImageDraw.Draw(placard).rounded_rectangle([0,0,pw-1,ph-1],radius=int(pad*1.3),
    fill=(255,255,255,255), outline=(225,228,232,255), width=3)
placard.alpha_composite(lg,(pad,pad))
qrimg.alpha_composite(placard,((QW-pw)//2,(QH-ph)//2))
qrimg.convert('RGB').save('qr-form-segnalazioni.png')
print('QR ok', qrimg.size)

# ---------- Volantino A4 ----------
W,H=1240,1900
img=Image.new('RGB',(W,H),'white'); d=ImageDraw.Draw(img)
def tw(t,f): return d.textbbox((0,0),t,font=f)[2]
def ctext(cx,y,t,f,fill): d.text((cx-tw(t,f)/2,y),t,font=f,fill=fill)

# logo in alto
lw2=520; lh2=int(logo.height*lw2/logo.width); lg2=logo.resize((lw2,lh2))
img.paste(lg2,((W-lw2)//2,40),lg2)
yb=40+lh2+40

# fascia rossa titolo
d.rectangle([0,yb,W,yb+230],fill=RED)
ctext(W/2,yb+50,"SEGNALA UN'ANOMALIA",font(70),'white')
ctext(W/2,yb+150,"Flotta Freccialink & The Mall",font(38,False),(255,225,232))

# QR
qs=680; q=Image.open('qr-form-segnalazioni.png').resize((qs,qs))
qx=(W-qs)//2; qy=yb+280
d.rounded_rectangle([qx-24,qy-24,qx+qs+24,qy+qs+24],radius=20,outline=RED,width=6)
img.paste(q,(qx,qy))

ctext(W/2,qy+qs+60,"Inquadra il QR con la fotocamera",font(48),INK)
ctext(W/2,qy+qs+128,"oppure vai su:",font(34,False),GREY)
ctext(W/2,qy+qs+180,"gvasta62.github.io/segnalazioni-flotta",font(32),RED)

sy=qy+qs+260
for i,s in enumerate(['1.  Numero sociale del mezzo','2.  Dove si trova','3.  Descrivi il guasto + foto']):
    d.text((180,sy+i*58),s,font=font(33,False),fill=INK)

img.save('volantino-qr-segnalazioni.png')
print('Volantino ok', img.size)
