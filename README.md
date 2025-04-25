# Complex Function Analyzer

An interactive web application for visualizing and analyzing complex functions, specifically focusing on determining where functions are analytic in the complex plane.

## Features

- **Function Input**: Enter complex functions using standard mathematical notation
- **Point-wise Analysis**: Check if a function is analytic at a specific point
- **Region Analysis**: Visualize where a function is analytic in the complex plane
- **Interactive Visualization**:
  - Pan and zoom functionality
  - Real-time hover coordinates
  - Color-coded regions (green for analytic, red for non-analytic)
- **Built-in Examples**:
  - Basic analytic functions (polynomials, exponentials)
  - Non-analytic functions (complex conjugate, absolute value)
  - Piecewise analytic functions (half-plane, unit circle, strip, wedge)

## Usage

1. **Enter a Function**:
   - Use the text input field or the on-screen keyboard
   - Available functions: z (variable), exp(), conj(), abs()
   - Operators: +, -, *, /, ^

2. **Check at a Point**:
   - Enter real and imaginary parts
   - Click "Check" to determine if the function is analytic at that point

3. **Analyze a Region**:
   - Click "Check Region" to visualize where the function is analytic
   - Green regions indicate where the function is analytic
   - Red regions indicate where the function is not analytic

4. **Interactive Features**:
   - Drag to pan the view
   - Use mouse wheel to zoom in/out
   - Hover over the plot to see coordinates and analytic status

## Examples

1. **Fully Analytic Functions**:
   - z² + 2z + 1 (polynomial)
   - exp(z) (exponential)

2. **Non-analytic Functions**:
   - conj(z) (complex conjugate)
   - abs(z) (absolute value)

3. **Piecewise Analytic Functions**:
   - Right Half-Plane
   - Unit Circle
   - Horizontal Strip
   - First Quadrant

## Technical Details

The application uses:
- HTML5 Canvas for visualization
- Math.js library for complex number operations
- Cauchy-Riemann equations to check analyticity
- Numerical differentiation for derivative calculations

## Implementation

The analyticity check is performed using the Cauchy-Riemann equations:
- ∂u/∂x = ∂v/∂y
- ∂u/∂y = -∂v/∂x

where u and v are the real and imaginary parts of the function respectively.

## Browser Compatibility

Works best in modern browsers that support:
- HTML5 Canvas
- ES6+ JavaScript
- CSS Grid and Flexbox

## License

This project is open source and available for educational and research purposes.