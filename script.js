// scales-chords plugin - NotePlan plugin for rendering guitar chord and scale diagrams
// Converted from the Obsidian plugin: https://github.com/egradman/scales-chords

const pluginID = "scales-chords";

// Default settings that mirror the original Obsidian plugin
const DEFAULT_SETTINGS = {
  stringCount: 6,
  fretCount: 5,
  showDots: true,
  showFingers: true,
  lefty: false,
  fretWidth: 30,
  stringSpacing: 20,
  fontFamily: "Arial, sans-serif",
  dotSize: 16,
  strokeWidth: 2,
  backgroundColor: "#ffffff",
  foregroundColor: "#000000",
  dotColor: "#4287f5"
};

// Guitar class to handle chord and scale rendering
class Guitar {
  constructor(settings) {
    this.settings = settings || DEFAULT_SETTINGS;
    this.stringCount = this.settings.stringCount;
    this.fretCount = this.settings.fretCount;
    this.fretWidth = this.settings.fretWidth;
    this.stringSpacing = this.settings.stringSpacing;
  }

  // Creates an SVG element
  createSVG() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    
    const width = this.stringCount * this.stringSpacing;
    const height = (this.fretCount + 1) * this.fretWidth;
    
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "scales-chords-diagram");
    
    // Set background color
    svg.style.backgroundColor = this.settings.backgroundColor;
    
    return svg;
  }

  // Draw the guitar neck grid
  drawGrid(svg) {
    const ns = "http://www.w3.org/2000/svg";
    
    // Draw horizontal lines (frets)
    for (let i = 0; i <= this.fretCount; i++) {
      const line = document.createElementNS(ns, "line");
      line.setAttribute("x1", "0");
      line.setAttribute("y1", i * this.fretWidth);
      line.setAttribute("x2", (this.stringCount - 1) * this.stringSpacing);
      line.setAttribute("y2", i * this.fretWidth);
      line.setAttribute("stroke", this.settings.foregroundColor);
      line.setAttribute("stroke-width", this.settings.strokeWidth);
      svg.appendChild(line);
    }
    
    // Draw vertical lines (strings)
    for (let i = 0; i < this.stringCount; i++) {
      const line = document.createElementNS(ns, "line");
      const x = i * this.stringSpacing;
      line.setAttribute("x1", x);
      line.setAttribute("y1", "0");
      line.setAttribute("x2", x);
      line.setAttribute("y2", this.fretCount * this.fretWidth);
      line.setAttribute("stroke", this.settings.foregroundColor);
      line.setAttribute("stroke-width", this.settings.strokeWidth);
      svg.appendChild(line);
    }
    
    return svg;
  }

  // Add a dot at a specific position
  addDot(svg, string, fret, finger = null) {
    const ns = "http://www.w3.org/2000/svg";
    
    // Apply lefty conversion if needed
    if (this.settings.lefty) {
      string = this.stringCount - 1 - string;
    }
    
    const x = string * this.stringSpacing;
    const y = (fret - 0.5) * this.fretWidth;
    
    // Create the dot
    if (this.settings.showDots) {
      const circle = document.createElementNS(ns, "circle");
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);
      circle.setAttribute("r", this.settings.dotSize / 2);
      circle.setAttribute("fill", this.settings.dotColor);
      svg.appendChild(circle);
    }
    
    // Add finger number if specified
    if (finger && this.settings.showFingers) {
      const text = document.createElementNS(ns, "text");
      text.setAttribute("x", x);
      text.setAttribute("y", y);
      text.setAttribute("font-family", this.settings.fontFamily);
      text.setAttribute("font-size", this.settings.dotSize * 0.8);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("fill", "white");
      text.textContent = finger;
      svg.appendChild(text);
    }
    
    return svg;
  }

  // Parse a chord definition and render it
  renderChord(chordDef) {
    const svg = this.drawGrid(this.createSVG());
    
    const lines = chordDef.trim().split('\n');
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      // Format: string fret [finger]
      // Example: "1 0" or "3 2 3" (string 3, fret 2, finger 3)
      const parts = line.trim().split(' ');
      
      if (parts.length >= 2) {
        const string = parseInt(parts[0]) - 1; // 0-indexed
        const fret = parseInt(parts[1]);
        const finger = parts.length > 2 ? parts[2] : null;
        
        if (fret > 0) {
          this.addDot(svg, string, fret, finger);
        }
      }
    }
    
    return svg;
  }

  // Parse a scale definition and render it
  renderScale(scaleDef) {
    const svg = this.drawGrid(this.createSVG());
    
    const lines = scaleDef.trim().split('\n');
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      // Format similar to chord but for scales
      // Often has additional label for the note
      const parts = line.trim().split(' ');
      
      if (parts.length >= 2) {
        const string = parseInt(parts[0]) - 1; // 0-indexed
        const fret = parseInt(parts[1]);
        const finger = parts.length > 2 ? parts[2] : null;
        
        if (fret >= 0) {
          this.addDot(svg, string, fret, finger);
        }
      }
    }
    
    return svg;
  }
}

// Create a guitar instance with default settings
let scalesChordGuitar = null;

var plugin = {
  // Plugin metadata
  name: "Scales & Chords",
  description: "Render guitar chord and scale diagrams in your notes",
  author: "Eric Gradman (converted for NotePlan)",
  version: "1.0.0",
  
  // Plugin initialization
  async init() {
    try {
      console.log(`Initializing ${this.name} plugin`);
      // Initialize the guitar renderer with default settings
      scalesChordGuitar = new Guitar(DEFAULT_SETTINGS);
      return true; // Success
    } catch (error) {
      console.error(`Error initializing ${this.name} plugin:`, error);
      return false; // Failure
    }
  },
  
  // Plugin markdown processing
  onProcessMarkdown(markdown, noteUUID) {
    // Find all code blocks with chord or scale language
    const chordRegex = /```chord\n([\s\S]*?)```/g;
    const scaleRegex = /```scale\n([\s\S]*?)```/g;
    
    // Mark chord blocks with a unique identifier
    let result = markdown.replace(chordRegex, (match, content) => {
      const id = `chord-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return `<div class="chord-placeholder" data-id="${id}" data-content="${encodeURIComponent(content)}"></div>`;
    });
    
    // Mark scale blocks with a unique identifier
    result = result.replace(scaleRegex, (match, content) => {
      const id = `scale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return `<div class="scale-placeholder" data-id="${id}" data-content="${encodeURIComponent(content)}"></div>`;
    });
    
    return result;
  },
  
  // Plugin HTML rendering
  onRenderMarkdown(html, noteUUID) {
    // Create temporary DOM to manipulate the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Ensure guitar instance is created
    if (!scalesChordGuitar) {
      scalesChordGuitar = new Guitar(DEFAULT_SETTINGS);
    }
    
    // Process chord placeholders
    const chordPlaceholders = tempDiv.querySelectorAll('.chord-placeholder');
    chordPlaceholders.forEach(placeholder => {
      const content = decodeURIComponent(placeholder.getAttribute('data-content'));
      const svg = scalesChordGuitar.renderChord(content);
      
      // Replace the placeholder with the SVG
      placeholder.parentNode.replaceChild(svg, placeholder);
    });
    
    // Process scale placeholders
    const scalePlaceholders = tempDiv.querySelectorAll('.scale-placeholder');
    scalePlaceholders.forEach(placeholder => {
      const content = decodeURIComponent(placeholder.getAttribute('data-content'));
      const svg = scalesChordGuitar.renderScale(content);
      
      // Replace the placeholder with the SVG
      placeholder.parentNode.replaceChild(svg, placeholder);
    });
    
    return tempDiv.innerHTML;
  },
  
  // Command to insert a chord diagram template
  insertChordDiagram() {
    // Get the current editor
    try {
      const editor = NotePlan.editors.activeNoteEditor;
      if (editor) {
        // Insert a chord diagram template
        const template = "```chord\n1 0\n2 1 1\n3 2 2\n4 2 3\n5 0\n6 0\n```";
        editor.insertTextAtCursor(template);
      }
    } catch (error) {
      console.error("Error inserting chord diagram:", error);
    }
  },
  
  // Command to insert a scale diagram template
  insertScaleDiagram() {
    try {
      // Get the current editor
      const editor = NotePlan.editors.activeNoteEditor;
      if (editor) {
        // Insert a scale diagram template
        const template = "```scale\n1 0\n1 2\n1 3\n1 5\n2 0\n2 2\n2 3\n2 5\n```";
        editor.insertTextAtCursor(template);
      }
    } catch (error) {
      console.error("Error inserting scale diagram:", error);
    }
  },
  
  // Clean up resources when plugin is deactivated
  deactivate() {
    console.log(`Deactivating ${this.name} plugin`);
    scalesChordGuitar = null;
  }
};

module.exports = plugin;