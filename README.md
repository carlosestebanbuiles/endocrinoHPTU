# Endocrino HPTU

Sitio de la rotación de Endocrinología del Hospital Pablo Tobón Uribe, hecho con [Quarto](https://quarto.org) y publicado en GitHub Pages.

## Cómo editar

Todo se edita desde GitHub en el navegador (ícono del lápiz). Al guardar, el sitio se publica solo en 1–2 minutos.

| Quiero cambiar… | Archivo |
|---|---|
| Página de inicio | `index.qmd` |
| Organización, horario, distribución | `rotacion.qmd` |
| Contenido por especialidad | `residentes.qmd` |
| Pregrado (cronograma, bibliografía, notas) | `pregrado.qmd` |
| Texto del club de revistas | `club.qmd` |
| **Sesiones del club de revistas** | `club/sesiones.yml` |
| Enlaces externos | `recursos.qmd` |
| Menú, pie de página | `_quarto.yml` |
| Colores | `styles/custom.scss` |

### Agregar una sesión del club

Abre `club/sesiones.yml`, copia un bloque, cambia la fecha, el artículo y el aula, y guarda. La sesión futura más cercana aparece sola en el inicio.

## Configuración inicial (una sola vez)

1. Después del primer push, espera a que termine la acción **Publicar sitio** (pestaña *Actions*).
2. En *Settings → Pages*, elige **Deploy from a branch**, rama `gh-pages`, carpeta `/ (root)`.
3. El sitio queda en `https://carlosestebanbuiles.github.io/endocrinoHPTU/`.
