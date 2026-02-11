# Task: Gerar Visual

## Metadata
- **id**: generate-visual
- **agent**: designer
- **type**: generative
- **api**: AISTUDIO

## Objetivo
Criar imagem/visual para o conteúdo de marketing usando a API AISTUDIO.

## Inputs Necessários

```yaml
inputs:
  - name: content_idea
    type: object
    required: true
    description: "Ideia de conteúdo já aprovada"

  - name: copy
    type: object
    required: true
    description: "Copy escrito pelo agente de produção"

  - name: visual_style
    type: enum
    options: [minimal, bold, photo_overlay, illustration, gradient]
    default: minimal
    prompt: "Qual estilo visual?"
```

## Formatos por Plataforma

| Plataforma | Formato | Dimensões | Aspect Ratio |
|------------|---------|-----------|--------------|
| Instagram | Feed (Quadrado) | 1080x1080 | 1:1 |
| Instagram | Portrait/Carrossel | 1080x1350 | 4:5 |
| Instagram | Stories/Reels | 1080x1920 | 9:16 |
| YouTube | Thumbnail | 1280x720 | 16:9 |
| LinkedIn | Post | 1200x1200 | 1:1 |
| LinkedIn | Article Header | 1200x628 | ~1.91:1 |

## Diretrizes Visuais SPFP

### Cores
```yaml
colors:
  primary: "#3B82F6"      # Azul SPFP
  secondary: "#1E40AF"    # Azul escuro
  background: "#0F172A"   # Preto azulado
  accent: "#60A5FA"       # Azul claro
  text_light: "#FFFFFF"
  text_muted: "#94A3B8"
```

### Tipografia
```yaml
typography:
  headings: "Playfair Display"
  body: "Inter"
  accent: "SF Pro Display"  # Para números/dados
```

### Elementos
- Gráficos financeiros estilizados
- Ícones modernos (Lucide style)
- Glassmorphism sutil
- Gradientes suaves
- Formas geométricas clean

## Processo

1. **Determinar formato**
   ```javascript
   const format = getFormatByPlatform(content_idea.platform, content_idea.format);
   // Retorna: { width: 1080, height: 1350, name: "instagram_portrait" }
   ```

2. **Construir prompt AISTUDIO**
   ```javascript
   const prompt = buildAIStudioPrompt({
     style: visual_style,
     theme: content_idea.topic,
     text_overlay: copy.headline,
     brand_colors: SPFP_COLORS,
     mood: "professional, modern, trustworthy"
   });
   ```

3. **Gerar imagem**
   ```javascript
   const image = await aistudio.generate({
     prompt: prompt,
     width: format.width,
     height: format.height,
     style: "digital_art",
     quality: "high"
   });
   ```

4. **Adicionar elementos de marca**
   - Logo SPFP (canto inferior direito)
   - Text overlay com headline
   - CTA se aplicável

## Output Esperado

```yaml
output:
  visual:
    id: "uuid"
    format: "instagram_portrait"
    dimensions: "1080x1350"
    file_url: "https://storage.spfp.app/marketing/..."
    thumbnail_url: "https://storage.spfp.app/marketing/.../thumb"
    prompt_used: "string"
    elements:
      - type: "background"
        description: "Gradient blue to dark"
      - type: "graphic"
        description: "Financial chart going up"
      - type: "text"
        content: "Headline text"
        position: "center"
      - type: "logo"
        position: "bottom-right"
    metadata:
      created_at: "timestamp"
      platform: "instagram"
      content_id: "ref to content idea"
```

## Templates de Prompt AISTUDIO

### Minimal
```
Professional financial dashboard interface, dark blue gradient background (#0F172A to #1E40AF),
clean minimalist design, subtle glassmorphism effect, geometric shapes,
modern typography placeholder, high quality 4K, digital art style
```

### Bold
```
Bold vibrant financial success imagery, striking blue (#3B82F6) accent colors,
dynamic composition, upward trending elements, confident business aesthetic,
premium quality, contemporary design
```

### Photo Overlay
```
Professional entrepreneur working, modern office setting,
blue overlay tint, cinematic lighting, confident pose,
space for text overlay, premium stock photo style
```

## Checklist de Qualidade

- [ ] Dimensões corretas para a plataforma
- [ ] Cores alinhadas com brand guide
- [ ] Texto legível se houver overlay
- [ ] Logo posicionado corretamente
- [ ] Sem elementos cortados nas bordas
- [ ] Resolução adequada (mínimo 1080p)
- [ ] Estilo consistente com posts anteriores
