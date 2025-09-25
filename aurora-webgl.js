// Modern WebGL Aurora Effect
class AuroraWebGL {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      colorStops: ['#3A29FF', '#FF94B4', '#FF3232'],
      blend: 0.5,
      amplitude: 1.0,
      speed: 0.5,
      ...options
    };
    
    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.mesh = null;
    this.animationId = null;
    this.startTime = Date.now();
    
    this.init();
  }
  
  init() {
    this.createCanvas();
    this.setupWebGL();
    this.createGeometry();
    this.createProgram();
    this.createMesh();
    this.startAnimation();
    this.setupResize();
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';
    this.container.appendChild(this.canvas);
  }
  
  setupWebGL() {
    this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
    if (!this.gl) {
      console.error('WebGL not supported');
      return;
    }
    
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clearColor(0, 0, 0, 0);
  }
  
  createGeometry() {
    // Full screen quad geometry
    const vertices = new Float32Array([
      -1, -1,  // bottom left
       1, -1,  // bottom right
      -1,  1,  // top left
       1,  1   // top right
    ]);
    
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
  }
  
  createProgram() {
    const vertexShaderSource = `#version 300 es
      in vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;
    
    const fragmentShaderSource = `#version 300 es
      precision highp float;
      
      uniform float uTime;
      uniform float uAmplitude;
      uniform vec3 uColorStops[3];
      uniform vec2 uResolution;
      uniform float uBlend;
      
      out vec4 fragColor;
      
      vec3 permute(vec3 x) {
        return mod(((x * 34.0) + 1.0) * x, 289.0);
      }
      
      float snoise(vec2 v){
        const vec4 C = vec4(
            0.211324865405187, 0.366025403784439,
            -0.577350269189626, 0.024390243902439
        );
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        
        vec3 p = permute(
            permute(i.y + vec3(0.0, i1.y, 1.0))
          + i.x + vec3(0.0, i1.x, 1.0)
        );
        
        vec3 m = max(
            0.5 - vec3(
                dot(x0, x0),
                dot(x12.xy, x12.xy),
                dot(x12.zw, x12.zw)
            ), 
            0.0
        );
        m = m * m;
        m = m * m;
        
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        
        vec3 color1 = uColorStops[0];
        vec3 color2 = uColorStops[1];
        vec3 color3 = uColorStops[2];
        
        // Create smooth horizontal gradient
        vec3 rampColor;
        if (uv.x < 0.5) {
          rampColor = mix(color1, color2, uv.x * 2.0);
        } else {
          rampColor = mix(color2, color3, (uv.x - 0.5) * 2.0);
        }
        
        // Create moving aurora waves across the entire screen
        float time = uTime;
        
        // Multiple wave layers for full screen coverage
        float wave1 = snoise(vec2(uv.x * 1.5 + time * 0.1, uv.y * 1.2 + time * 0.15)) * 0.3;
        float wave2 = snoise(vec2(uv.x * 2.5 + time * 0.08, uv.y * 0.8 + time * 0.12)) * 0.25;
        float wave3 = snoise(vec2(uv.x * 0.8 + time * 0.05, uv.y * 2.0 + time * 0.18)) * 0.2;
        float wave4 = snoise(vec2(uv.x * 3.2 + time * 0.12, uv.y * 1.5 + time * 0.1)) * 0.15;
        
        // Vertical flowing waves across the screen
        float verticalWave1 = sin(uv.y * 1.5 + time * 0.2) * 0.2;
        float verticalWave2 = cos(uv.y * 2.5 + time * 0.15) * 0.15;
        float horizontalWave1 = sin(uv.x * 2.0 + time * 0.1) * 0.1;
        float horizontalWave2 = cos(uv.x * 1.8 + time * 0.08) * 0.1;
        
        // Combine all waves for full screen effect
        float combinedWave = wave1 + wave2 + wave3 + wave4 + 
                           verticalWave1 + verticalWave2 + 
                           horizontalWave1 + horizontalWave2;
        
        // Create height field for aurora (use amplitude parameter)
        float height = combinedWave * 0.4 * uAmplitude;
        height = exp(height * 1.5) - 1.0;
        
        // Create aurora intensity - stronger in center, fading to edges
        float centerDistance = distance(uv, vec2(0.5, 0.5));
        float centerIntensity = 1.0 - smoothstep(0.0, 0.7, centerDistance);
        
        float auroraIntensity = height * centerIntensity;
        
        // Add flowing motion across the entire screen
        float flowMotion = sin(uv.x * 2.5 + time * 0.3) * 0.08 + 
                          cos(uv.y * 2.0 + time * 0.25) * 0.08 +
                          sin(uv.x * 0.5 + uv.y * 1.5 + time * 0.2) * 0.06;
        auroraIntensity += flowMotion;
        
        // Use blend parameter for edge softness (like React Bits)
        float midPoint = 0.15;
        float alpha = smoothstep(midPoint - uBlend * 0.3, midPoint + uBlend * 0.3, auroraIntensity);
        
        // Add gentle pulsing effect
        float pulse = sin(time * 0.3) * 0.05 + 0.95;
        alpha *= pulse;
        
        // Create color variation based on position and time
        float colorVariation = sin(uv.x * 1.5 + time * 0.15) * 0.08 + 
                              cos(uv.y * 1.2 + time * 0.12) * 0.08;
        vec3 finalColor = rampColor * (0.6 + auroraIntensity * 0.8 + colorVariation);
        
        // Add subtle sparkle effect across the screen
        float sparkle = snoise(vec2(uv.x * 8.0 + time * 1.5, uv.y * 8.0 + time * 1.2)) * 0.1;
        sparkle = smoothstep(0.85, 1.0, sparkle);
        finalColor += vec3(sparkle * 0.2);
        
        fragColor = vec4(finalColor * alpha, alpha * 0.7);
      }
    `;
    
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);
    
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error('Program linking failed:', this.gl.getProgramInfoLog(this.program));
    }
    
    this.gl.deleteShader(vertexShader);
    this.gl.deleteShader(fragmentShader);
  }
  
  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation failed:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }
  
  createMesh() {
    this.positionLocation = this.gl.getAttribLocation(this.program, 'position');
    this.timeLocation = this.gl.getUniformLocation(this.program, 'uTime');
    this.amplitudeLocation = this.gl.getUniformLocation(this.program, 'uAmplitude');
    this.colorStopsLocation = this.gl.getUniformLocation(this.program, 'uColorStops');
    this.resolutionLocation = this.gl.getUniformLocation(this.program, 'uResolution');
    this.blendLocation = this.gl.getUniformLocation(this.program, 'uBlend');
  }
  
  startAnimation() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.render();
    };
    animate();
  }
  
  render() {
    if (!this.gl || !this.program) return;
    
    this.gl.useProgram(this.program);
    
    // Set uniforms
    const time = (Date.now() - this.startTime) * 0.001;
    this.gl.uniform1f(this.timeLocation, time * this.options.speed);
    this.gl.uniform1f(this.amplitudeLocation, this.options.amplitude);
    this.gl.uniform1f(this.blendLocation, this.options.blend);
    this.gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
    
    // Convert hex colors to RGB
    const colorStops = this.options.colorStops.map(hex => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return [r, g, b];
    });
    
    this.gl.uniform3fv(this.colorStopsLocation, colorStops.flat());
    
    // Draw
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.enableVertexAttribArray(this.positionLocation);
    this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
  
  setupResize() {
    const resize = () => {
      const rect = this.container.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    };
    
    resize();
    window.addEventListener('resize', resize);
  }
  
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    if (this.gl) {
      this.gl.deleteProgram(this.program);
      this.gl.deleteBuffer(this.vertexBuffer);
    }
  }
}

// Initialize aurora for hero section in modern theme
function initAuroraHero() {
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;
  
  // Only show for modern theme
  if (document.body.getAttribute('data-theme') !== 'moderni') {
    return;
  }
  
  // Create aurora container for hero section with full viewport width
  const auroraContainer = document.createElement('div');
  auroraContainer.style.position = 'fixed';
  auroraContainer.style.top = '0';
  auroraContainer.style.left = '0';
  auroraContainer.style.width = '100vw';
  auroraContainer.style.height = '100vh';
  auroraContainer.style.pointerEvents = 'none';
  auroraContainer.style.zIndex = '1';
  auroraContainer.id = 'aurora-container';
  
  // Calculate hero section position and clip the aurora to hero bounds
  const heroRect = heroSection.getBoundingClientRect();
  auroraContainer.style.clipPath = `polygon(0% 0%, 100% 0%, 100% ${(heroRect.bottom / window.innerHeight) * 100}%, 0% ${(heroRect.bottom / window.innerHeight) * 100}%)`;
  
  document.body.appendChild(auroraContainer);
  
  // Initialize aurora
  const aurora = new AuroraWebGL(auroraContainer, {
    colorStops: ['#7CFC00', '#B19CD9', '#4169E1'],
    blend: 0.5,
    amplitude: 1.0,
    speed: 1.0
  });
  
  // Store reference for cleanup
  heroSection._aurora = aurora;
  
  // Update clip path on resize
  const updateClipPath = () => {
    const heroRect = heroSection.getBoundingClientRect();
    auroraContainer.style.clipPath = `polygon(0% 0%, 100% 0%, 100% ${(heroRect.bottom / window.innerHeight) * 100}%, 0% ${(heroRect.bottom / window.innerHeight) * 100}%)`;
  };
  
  window.addEventListener('resize', updateClipPath);
  window.addEventListener('scroll', updateClipPath);
  
  // Store cleanup function
  aurora._cleanup = () => {
    window.removeEventListener('resize', updateClipPath);
    window.removeEventListener('scroll', updateClipPath);
  };
  
  return aurora;
}

// Listen for theme changes
function handleThemeChange() {
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;
  
  const theme = document.body.getAttribute('data-theme');
  
  if (theme === 'moderni') {
    // Initialize aurora if not already present
    if (!heroSection._aurora) {
      initAuroraHero();
    }
  } else {
    // Clean up aurora
    if (heroSection._aurora) {
      if (heroSection._aurora._cleanup) {
        heroSection._aurora._cleanup();
      }
      heroSection._aurora.destroy();
      heroSection._aurora = null;
    }
    // Remove aurora container if it exists
    const existingContainer = document.getElementById('aurora-container');
    if (existingContainer) {
      existingContainer.remove();
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  handleThemeChange();
  
  // Listen for theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        handleThemeChange();
      }
    });
  });
  
  observer.observe(document.body, { attributes: true });
});

// Export for global use
window.AuroraWebGL = AuroraWebGL;
window.initAuroraHero = initAuroraHero;
