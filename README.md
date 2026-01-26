# FotoPronto — Padrão de Imagens (qualidade, tamanho e nomes)

Este site usa **JPG como fallback** e **WEBP responsivo** (srcset) para carregar rápido no mobile.

> Importante: no `vercel.json` os arquivos em `/assets/img/*` estão com cache **1 ano + immutable**.  
> Se você substituir uma imagem com o mesmo nome, alguns visitantes podem continuar vendo a versão antiga.  
> Solução: **mude o nome do arquivo** (ou adicione sufixo de versão) quando atualizar imagens.

---

## 1) Formato recomendado (fluxo simples e seguro)

- **Master (arquivo fonte):** JPG (ou PNG se precisar, mas evite)
- **Para o site:** gerar **WEBP** em 2–3 tamanhos + manter **JPG** original como fallback

✅ Por quê:
- JPG mantém compatibilidade total.
- WEBP reduz peso e melhora PageSpeed.

---

## 2) Tamanhos (padrão prático que já combina com o seu HTML)

### A) Fotos verticais dos cards de estilo (Antes/Depois)
Seu HTML já está apontando para estes tamanhos:
- **360w**, **540w**, **1080w** (webp)
- **1080px** (jpg fallback)

**Recomendação de export:**
- `*.jpg` (fallback): **1080px de largura** (ou lado maior 1080), qualidade **80–85**
- `*.webp`: 360 / 540 / 1080, qualidade **75–82**

### B) Prints / depoimentos
Se o print for “paisagem” (ex.: 1200×900), mantenha:
- fallback JPG: **1200px** no lado maior
- webp: **540w** e **1080w** (ou 1200w, se você preferir)

---

## 3) Nomes ideais (SEO + organização)

### Regras de nomeação (sempre)
- usar **kebab-case** (tudo minúsculo, com hífen)
- sem acento, sem espaço
- incluir **antes/depois** e o **tamanho** no webp
- manter consistente (isso ajuda você e ajuda “organização mental” do projeto)

### Padrão (recomendado)
**JPG (fallback / master):**
- `{slug}-antes.jpg`
- `{slug}-depois.jpg`

**WEBP responsivo:**
- `{slug}-antes-360.webp`
- `{slug}-antes-540.webp`
- `{slug}-antes-1080.webp`
- `{slug}-depois-360.webp`
- `{slug}-depois-540.webp`
- `{slug}-depois-1080.webp`

> `slug` = nome do estilo/uso (ex.: `natural`, `profissional`, `produto`, `cinema`, `arte`, `3d`, `natureza`, `restauracao`, `print1`, etc.)

---

## 4) Lista atual de arquivos que o site espera (comparadores Antes/Depois)

### Estilos (cards principais)
1. **Natural Vivo**
- `natural-antes.jpg`
- `natural-depois.jpg`
- `natural-antes-360.webp` / `540.webp` / `1080.webp`
- `natural-depois-360.webp` / `540.webp` / `1080.webp`

2. **Perfil Profissional**
- `profissional-antes.jpg`
- `profissional-depois.jpg`
- `profissional-antes-360.webp` / `540.webp` / `1080.webp`
- `profissional-depois-360.webp` / `540.webp` / `1080.webp`

3. **Produto de Catálogo**
- `produto-antes.jpg`
- `produto-depois.jpg`
- `produto-antes-360.webp` / `540.webp` / `1080.webp`
- `produto-depois-360.webp` / `540.webp` / `1080.webp`

4. **Cinema / Dramático**
- `cinema-antes.jpg`
- `cinema-depois.jpg`
- `cinema-antes-360.webp` / `540.webp` / `1080.webp`
- `cinema-depois-360.webp` / `540.webp` / `1080.webp`

5. **Arte & Ilustração**
- `arte-antes.jpg`
- `arte-depois.jpg`
- `arte-antes-360.webp` / `540.webp` / `1080.webp`
- `arte-depois-360.webp` / `540.webp` / `1080.webp`

6. **3D / Estilizado**
- `3d-antes.jpg`
- `3d-depois.jpg`
- `3d-antes-360.webp` / `540.webp` / `1080.webp`
- `3d-depois-360.webp` / `540.webp` / `1080.webp`

7. **Natureza | Vida Máxima**
- `natureza-antes.jpg`
- `natureza-depois.jpg`
- `natureza-antes-360.webp` / `540.webp` / `1080.webp`
- `natureza-depois-360.webp` / `540.webp` / `1080.webp`

8. **Restauração**
- `restauracao-ex7-antes.jpg`
- `restauracao-ex7-depois.jpg`
- `restauracao-ex2-antes.jpg`
- `restauracao-ex2-depois.jpg`
- e seus respectivos webp em 360/540/1080 quando existirem

### Prova social (prints)
- `print1.jpg` + `print1-540.webp` + `print1-1080.webp`
(Repita o padrão para `print2`, `print3` etc.)

---

## 5) Como converter (comandos prontos)

### Opção 1 — ImageMagick + cwebp (recomendado)
1) Redimensionar (gerar JPG fallback já otimizado):
```bash
magick input.jpg -resize 1080x1080\> -quality 82 output.jpg
```

2) Gerar WEBP (exemplo 3 tamanhos):
```bash
cwebp -q 80 -resize 360 0 input.jpg -o output-360.webp
cwebp -q 80 -resize 540 0 input.jpg -o output-540.webp
cwebp -q 80 -resize 1080 0 input.jpg -o output-1080.webp
```

### Opção 2 — Squoosh (manual, rápido)
- exportar WEBP com qualidade ~80
- exportar 360 / 540 / 1080 (ou só 540 / 1080 se quiser simplificar)

---

## 6) Checklist rápido antes de subir
- [ ] Todos os `srcset` existem de verdade em `/assets/img/`
- [ ] JPG fallback tem tamanho controlado (não jogue 4000px)
- [ ] Se atualizou uma imagem, **troque o nome** para “furar” o cache do Vercel
