// Scales and Chords plugin for NotePlan
// Renders guitar chord and scale diagrams in your notes

// Default settings
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
  dotColor: "#4287f5",
  chordNameColor: "#ff0000"
};

// Common chord definitions
const CHORD_LIBRARY = {
  // Major chords
  "G": [
    "3 0",
    "2 0",
    "1 0",
    "6 3 3",
    "5 2 2",
    "4 0"
  ],
  "C": [
    "5 3 3",
    "4 2 2",
    "3 0",
    "2 1 1",
    "1 0"
  ],
  "D": [
    "4 0",
    "3 2 3",
    "2 3 2", 
    "1 2 1"
  ],
  "A": [
    "5 0",
    "4 2 2",
    "3 2 3",
    "2 2 4",
    "1 0"
  ],
  "E": [
    "6 0",
    "5 2 2",
    "4 2 3",
    "3 1 1",
    "2 0",
    "1 0"
  ],
  "F": [
    "6 1 1",
    "5 3 3", 
    "4 3 4",
    "3 2 2",
    "2 1 1",
    "1 1 1"
  ],
  "B": [
    "5 2 1",
    "4 4 3",
    "3 4 4",
    "2 4 4",
    "1 2 2"
  ],
  
  // Minor chords
  "Em": [
    "6 0",
    "5 2 2",
    "4 2 3",
    "3 0",
    "2 0",
    "1 0"
  ],
  "Am": [
    "5 0",
    "4 2 2",
    "3 2 3",
    "2 1 1",
    "1 0"
  ],
  "Dm": [
    "4 0",
    "3 2 3",
    "2 3 2",
    "1 1 1"
  ],
  "Bm": [
    "5 2 1",
    "4 4 3",
    "3 4 4",
    "2 3 2",
    "1 2 2"
  ],
  
  // 7th chords
  "G7": [
    "6 3 3",
    "5 2 2",
    "4 0",
    "3 0",
    "2 0",
    "1 1 1"
  ],
  "C7": [
    "5 3 3",
    "4 2 2",
    "3 3 4",
    "2 1 1",
    "1 0"
  ],
  "D7": [
    "4 0",
    "3 2 3",
    "2 1 1",
    "1 2 2"
  ],
  "A7": [
    "5 0",
    "4 2 2",
    "3 0",
    "2 2 3",
    "1 0"
  ],
  "E7": [
    "6 0",
    "5 2 2",
    "4 0",
    "3 1 1",
    "2 0",
    "1 0"
  ],
  
  // Minor 7th chords
  "Am7": [
    "5 0",
    "4 2 2",
    "3 0",
    "2 1 1",
    "1 0"
  ],
  "Em7": [
    "6 0",
    "5 2 2",
    "4 0",
    "3 0",
    "2 0", 
    "1 0"
  ],
  "Dm7": [
    "4 0",
    "3 2 3",
    "2 1 1",
    "1 1 2"
  ],
  
  // Other common chords
  "G/B": [
    "5 2 2",
    "4 0",
    "3 0",
    "2 0",
    "1 3 4"
  ],
  "Cadd9": [
    "5 3 3",
    "4 2 2",
    "3 0",
    "2 3 4",
    "1 0"
  ],
  "Dsus2": [
    "4 0",
    "3 2 3",
    "2 3 4",
    "1 0"
  ],
  "Asus2": [
    "5 0",
    "4 0", 
    "3 2 2",
    "2 2 3",
    "1 0"
  ]
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
  createSVG(chordName = null) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    
    const width = this.stringCount * this.stringSpacing;
    // Add extra space at the top for the chord name if needed
    const nameHeight = chordName ? 20 : 0;
    const height = (this.fretCount + 1) * this.fretWidth + nameHeight;
    
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "scales-chords-diagram");
    
    // Set background color
    svg.style.backgroundColor = this.settings.backgroundColor;
    
    // Add chord name if provided
    if (chordName) {
      const text = document.createElementNS(ns, "text");
      text.setAttribute("x", width / 2);
      text.setAttribute("y", 15); // Position at top
      text.setAttribute("font-family", this.settings.fontFamily);
      text.setAttribute("font-size", "16");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", this.settings.chordNameColor);
      text.setAttribute("font-weight", "bold");
      text.textContent = chordName;
      svg.appendChild(text);
    }
    
    return svg;
  }

  // Draw the guitar neck grid
  drawGrid(svg, startingY = 0) {
    const ns = "http://www.w3.org/2000/svg";
    
    // Draw horizontal lines (frets)
    for (let i = 0; i <= this.fretCount; i++) {
      const line = document.createElementNS(ns, "line");
      line.setAttribute("x1", "0");
      line.setAttribute("y1", startingY + (i * this.fretWidth));
      line.setAttribute("x2", (this.stringCount - 1) * this.stringSpacing);
      line.setAttribute("y2", startingY + (i * this.fretWidth));
      line.setAttribute("stroke", this.settings.foregroundColor);
      line.setAttribute("stroke-width", this.settings.strokeWidth);
      svg.appendChild(line);
    }
    
    // Draw vertical lines (strings)
    for (let i = 0; i < this.stringCount; i++) {
      const line = document.createElementNS(ns, "line");
      const x = i * this.stringSpacing;
      line.setAttribute("x1", x);
      line.setAttribute("y1", startingY);
      line.setAttribute("x2", x);
      line.setAttribute("y2", startingY + (this.fretCount * this.fretWidth));
      line.setAttribute("stroke", this.settings.foregroundColor);
      line.setAttribute("stroke-width", this.settings.strokeWidth);
      svg.appendChild(line);
    }
    
    return svg;
  }

  // Add a dot at a specific position
  addDot(svg, string, fret, finger = null, startingY = 0) {
    const ns = "http://www.w3.org/2000/svg";
    
    // Apply lefty conversion if needed
    if (this.settings.lefty) {
      string = this.stringCount - 1 - string;
    }
    
    const x = string * this.stringSpacing;
    const y = startingY + ((fret - 0.5) * this.fretWidth);
    
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

  // Add open/muted string indicators
  addStringState(svg, string, state, startingY = 0) {
    const ns = "http://www.w3.org/2000/svg";
    
    // Apply lefty conversion if needed
    if (this.settings.lefty) {
      string = this.stringCount - 1 - string;
    }
    
    const x = string * this.stringSpacing;
    const y = startingY - 10; // Above the grid
    
    if (state === "open") {
      // Draw an O for open strings
      const circle = document.createElementNS(ns, "circle");
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);
      circle.setAttribute("r", 5);
      circle.setAttribute("stroke", this.settings.foregroundColor);
      circle.setAttribute("stroke-width", 1);
      circle.setAttribute("fill", "none");
      svg.appendChild(circle);
    } else if (state === "muted") {
      // Draw an X for muted strings
      const text = document.createElementNS(ns, "text");
      text.setAttribute("x", x);
      text.setAttribute("y", y);
      text.setAttribute("font-family", this.settings.fontFamily);
      text.setAttribute("font-size", 12);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("fill", this.settings.foregroundColor);
      text.textContent = "X";
      svg.appendChild(text);
    }
    
    return svg;
  }

  // Add fret numbers at the side
  addFretNumbers(svg, startFret = 1, startingY = 0) {
    const ns = "http://www.w3.org/2000/svg";
    
    // Only show numbers if starting above the 1st fret
    if (startFret > 1) {
      const text = document.createElementNS(ns, "text");
      text.setAttribute("x", -15); // Position to the left of the grid
      text.setAttribute("y", startingY + 15); // Position at the first fret
      text.setAttribute("font-family", this.settings.fontFamily);
      text.setAttribute("font-size", 12);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", this.settings.foregroundColor);
      text.textContent = startFret;
      svg.appendChild(text);
    }
    
    return svg;
  }

  // Parse a chord definition and render it
  renderChord(chordDef, chordName = null) {
    // Check if we have a named chord
    if (typeof chordDef === 'string' && CHORD_LIBRARY[chordDef]) {
      chordName = chordDef;
      chordDef = CHORD_LIBRARY[chordDef].join('\n');
    }
    
    // Extra height for chord name
    const nameHeight = chordName ? 20 : 0;
    
    const svg = this.createSVG(chordName);
    this.drawGrid(svg, nameHeight);
    
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
        
        if (fret === 0) {
          // Open string
          this.addStringState(svg, string, "open", nameHeight);
        } else if (fret === -1) {
          // Muted string
          this.addStringState(svg, string, "muted", nameHeight);
        } else if (fret > 0) {
          // Normal fretted note
          this.addDot(svg, string, fret, finger, nameHeight);
        }
      }
    }
    
    return svg;
  }

  // Parse a scale definition and render it
  renderScale(scaleDef, scaleName = null) {
    // Extra height for scale name
    const nameHeight = scaleName ? 20 : 0;
    
    const svg = this.createSVG(scaleName);
    this.drawGrid(svg, nameHeight);
    
    const lines = scaleDef.trim().split('\n');
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      // Format similar to chord but for scales
      const parts = line.trim().split(' ');
      
      if (parts.length >= 2) {
        const string = parseInt(parts[0]) - 1; // 0-indexed
        const fret = parseInt(parts[1]);
        const finger = parts.length > 2 ? parts[2] : null;
        
        if (fret === 0) {
          // Open string note
          this.addStringState(svg, string, "open", nameHeight);
        } else if (fret > 0) {
          // Fretted note
          this.addDot(svg, string, fret, finger, nameHeight);
        }
      }
    }
    
    return svg;
  }
}

// Create a guitar instance with default settings
let scalesChordGuitar = null;

// Get plugin settings - merges default and user settings
function getSettings() {
  // Get user settings if available
  let settings = {};
  try {
    // Try to get user settings
    const userStringCount = DataStore.settings.stringCount;
    const userFretCount = DataStore.settings.fretCount;
    const userLefty = DataStore.settings.lefty;
    const userDotColor = DataStore.settings.dotColor;
    
    // Apply user settings if they exist
    settings = {
      ...DEFAULT_SETTINGS,
      stringCount: userStringCount || DEFAULT_SETTINGS.stringCount,
      fretCount: userFretCount || DEFAULT_SETTINGS.fretCount,
      lefty: userLefty !== undefined ? userLefty : DEFAULT_SETTINGS.lefty,
      dotColor: userDotColor || DEFAULT_SETTINGS.dotColor
    };
  } catch (error) {
    console.error("Error loading settings, using defaults:", error);
    settings = DEFAULT_SETTINGS;
  }
  
  return settings;
}

// Initialize the plugin
function init() {
  try {
    console.log("Initializing Scales and Chords plugin");
    const settings = getSettings();
    scalesChordGuitar = new Guitar(settings);
    return true;
  } catch (error) {
    console.error("Error initializing Scales and Chords plugin:", error);
    return false;
  }
}

// Process markdown to find chord names and chord/scale blocks
function onProcessMarkdown(markdown, noteUUID) {
  // Find code blocks with chord or scale language
  const chordRegex = /```chord\n([\s\S]*?)```/g;
  const scaleRegex = /```scale\n([\s\S]*?)```/g;
  
  // Find inline chord references like "G", "Am7", etc. 
  // They must be on their own line to be converted to diagrams
  const chordNameRegex = /^([A-G][b#]?(?:m|maj|min|aug|dim|sus|add)?(?:\d+)?(?:\/[A-G][b#]?)?)$/gm;
  
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
  
  // Mark chord names with a unique identifier
  result = result.replace(chordNameRegex, (match, chordName) => {
    if (CHORD_LIBRARY[chordName]) {
      const id = `chord-name-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return `<div class="chord-name-placeholder" data-id="${id}" data-chord="${encodeURIComponent(chordName)}">${chordName}</div>`;
    }
    return match; // If chord not found in library, leave it unchanged
  });
  
  return result;
}

// Process HTML to render the chord/scale diagrams
function onRenderMarkdown(html, noteUUID) {
  try {
    // Create temporary DOM to manipulate the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Ensure guitar instance is created
    if (!scalesChordGuitar) {
      const settings = getSettings();
      scalesChordGuitar = new Guitar(settings);
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
    
    // Process chord name placeholders
    const chordNamePlaceholders = tempDiv.querySelectorAll('.chord-name-placeholder');
    chordNamePlaceholders.forEach(placeholder => {
      const chordName = decodeURIComponent(placeholder.getAttribute('data-chord'));
      const svg = scalesChordGuitar.renderChord(chordName, chordName);
      
      // Replace the placeholder with the SVG but keep the chord name text
      const wrapper = document.createElement('div');
      wrapper.classList.add('chord-with-name');
      wrapper.style.display = 'inline-block';
      wrapper.style.textAlign = 'center';
      wrapper.style.marginRight = '10px';
      
      const nameDiv = document.createElement('div');
      nameDiv.style.color = scalesChordGuitar.settings.chordNameColor;
      nameDiv.style.fontWeight = 'bold';
      nameDiv.textContent = chordName;
      
      wrapper.appendChild(svg);
      wrapper.appendChild(nameDiv);
      
      placeholder.parentNode.replaceChild(wrapper, placeholder);
    });
    
    return tempDiv.innerHTML;
  } catch (error) {
    console.error("Error rendering diagrams:", error);
    return html; // Return original HTML if there's an error
  }
}

// Command to insert a chord diagram template
function insertChordDiagram() {
  try {
    console.log("Insert chord diagram called");
    const editor = Editor;
    if (editor) {
      const template = "```chord\n1 0\n2 1 1\n3 2 2\n4 2 3\n5 0\n6 0\n```";
      editor.insertTextAtCursor(template);
    }
  } catch (error) {
    console.error("Error inserting chord diagram:", error);
  }
}

// Command to insert a specific named chord
function insertNamedChord() {
  try {
    console.log("Insert named chord called");
    const editor = Editor;
    if (editor) {
      // Show chord selection dialog
      CommandBar.showOptions(Object.keys(CHORD_LIBRARY), "Select a chord").then(result => {
        if (result && result.value) {
          editor.insertTextAtCursor(result.value);
        }
      });
    }
  } catch (error) {
    console.error("Error inserting named chord:", error);
  }
}

// Command to insert a scale diagram template
function insertScaleDiagram() {
  try {
    console.log("Insert scale diagram called");
    const editor = Editor;
    if (editor) {
      const template = "```scale\n1 0\n1 2\n1 3\n1 5\n2 0\n2 2\n2 3\n2 5\n```";
      editor.insertTextAtCursor(template);
    }
  } catch (error) {
    console.error("Error inserting scale diagram:", error);
  }
}

// Clean up resources when plugin is deactivated
function deactivate() {
  console.log("Deactivating Scales and Chords plugin");
  scalesChordGuitar = null;
}
