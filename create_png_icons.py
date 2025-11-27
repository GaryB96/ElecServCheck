"""
Create simple PNG icons using PIL/Pillow
Run: pip install pillow
"""
try:
    from PIL import Image, ImageDraw, ImageFont
    
    def create_icon(size):
        # Create image with blue background
        img = Image.new('RGB', (size, size), color='#0078d4')
        draw = ImageDraw.Draw(img)
        
        # Draw lightning bolt shape (simplified)
        scale = size / 192
        points = [
            (int(96*scale), int(40*scale)),
            (int(70*scale), int(96*scale)),
            (int(100*scale), int(96*scale)),
            (int(80*scale), int(152*scale)),
            (int(122*scale), int(90*scale)),
            (int(92*scale), int(90*scale))
        ]
        
        draw.polygon(points, fill='white')
        
        return img
    
    # Generate icons
    icon192 = create_icon(192)
    icon192.save('icon-192.png')
    print("Created icon-192.png")
    
    icon512 = create_icon(512)
    icon512.save('icon-512.png')
    print("Created icon-512.png")
    
    print("\nIcons generated successfully!")
    
except ImportError:
    print("Pillow not installed. Install with: pip install pillow")
    print("\nAlternatively:")
    print("1. Open generate-icons.html in a web browser")
    print("2. Right-click each canvas and 'Save image as...'")
    print("3. Save as icon-192.png and icon-512.png")
