/**
 * Utility to export an SVG element or container to PNG
 */
export function exportSvgToPng(svgElementId: string, filename: string = 'chart-export.png') {
  const svg = document.getElementById(svgElementId);
  if (!svg) {
    console.error(`SVG element with ID "${svgElementId}" not found`);
    return;
  }

  try {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // High DPI
      const bbox = svg.getBoundingClientRect();
      canvas.width = (bbox.width || 800) * scale;
      canvas.height = (bbox.height || 450) * scale;

      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.scale(scale, scale);
        context.drawImage(image, 0, 0, bbox.width || 800, bbox.height || 450);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  } catch (err) {
    console.error('Failed to export chart as PNG:', err);
  }
}
