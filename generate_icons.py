"""
Simple icon generator for PWA
Creates placeholder icons with lightning bolt symbol
"""

def create_svg_icon(size):
    """Create SVG icon with lightning bolt"""
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="{size}" height="{size}" fill="#0078d4"/>
  <g transform="translate({size/2}, {size/2})">
    <path d="M-20,-60 L-40,0 L-10,0 L-30,60 L30,-5 L0,-5 Z" fill="#ffffff" transform="scale({size/192})"/>
  </g>
  <text x="{size/2}" y="{size - 20}" font-family="Arial" font-size="{size/15}" fill="#ffffff" text-anchor="middle" font-weight="bold">⚡</text>
</svg>'''
    return svg

# Create icons
with open('icon-192.svg', 'w', encoding='utf-8') as f:
    f.write(create_svg_icon(192))

with open('icon-512.svg', 'w', encoding='utf-8') as f:
    f.write(create_svg_icon(512))

print("SVG icons generated successfully!")
print("To convert to PNG, use an online converter or ImageMagick:")
print("  convert icon-192.svg icon-192.png")
print("  convert icon-512.svg icon-512.png")
