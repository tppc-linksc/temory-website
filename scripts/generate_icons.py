from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"


def optimize_app_icon(path: Path) -> None:
    with Image.open(path) as source:
        icon = source.convert("RGB").resize((512, 512), Image.Resampling.LANCZOS)
        icon.save(path, optimize=True)


def make_favicon(source_path: Path, output_path: Path) -> None:
    canvas_size = 128
    icon_size = 112
    inset = (canvas_size - icon_size) // 2
    radius = 25
    scale = 4

    with Image.open(source_path) as source:
        icon = source.convert("RGBA").resize((icon_size * scale, icon_size * scale), Image.Resampling.LANCZOS)

    mask = Image.new("L", icon.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, icon.width - 1, icon.height - 1), radius=radius * scale, fill=255)
    icon.putalpha(mask)

    canvas = Image.new("RGBA", (canvas_size * scale, canvas_size * scale), (0, 0, 0, 0))
    canvas.alpha_composite(icon, (inset * scale, inset * scale))
    canvas = canvas.resize((canvas_size, canvas_size), Image.Resampling.LANCZOS)
    canvas.save(output_path, optimize=True)


optimize_app_icon(ASSETS / "app-icon-dark.png")
make_favicon(ASSETS / "app-icon.png", ASSETS / "favicon-light.png")
make_favicon(ASSETS / "app-icon-dark.png", ASSETS / "favicon-dark.png")
