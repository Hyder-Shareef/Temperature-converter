/**
 * Temperature Converter
 * Pure Vanilla JavaScript (ES6) Implementation
 */

// --- Constants & Configuration ---
const UNIT_SYMBOLS = {
  celsius: '°C',
  fahrenheit: '°F',
  kelvin: 'K'
};

const UNIT_NAMES = {
  celsius: 'Celsius',
  fahrenheit: 'Fahrenheit',
  kelvin: 'Kelvin'
};

// Physical lower bounds (Absolute Zero)
const MIN_TEMPERATURES = {
  celsius: -273.15,
  fahrenheit: -459.67,
  kelvin: 0
};

// Mathematical conversion strategies
const CONVERSIONS = {
  celsius: {
    celsius: (c) => c,
    fahrenheit: (c) => (c * 9) / 5 + 32,
    kelvin: (c) => c + 273.15
  },
  fahrenheit: {
    celsius: (f) => ((f - 32) * 5) / 9,
    fahrenheit: (f) => f,
    kelvin: (f) => ((f - 32) * 5) / 9 + 273.15
  },
  kelvin: {
    celsius: (k) => k - 273.15,
    fahrenheit: (k) => ((k - 273.15) * 9) / 5 + 32,
    kelvin: (k) => k
  }
};

// --- DOM Element References ---
const form = document.getElementById('converter-form');
const tempInput = document.getElementById('temperature-input');
const sourceSelect = document.getElementById('source-unit');
const targetSelect = document.getElementById('target-unit');
const swapBtn = document.getElementById('swap-units-btn');
const convertBtn = document.getElementById('convert-btn');
const inputUnitIndicator = document.getElementById('input-unit-indicator');
const errorMessage = document.getElementById('error-message');

const resultSection = document.getElementById('result-section');
const resultCard = resultSection.querySelector('.result-card');
const resultValue = document.getElementById('result-value');
const resultUnitSymbol = document.getElementById('result-unit-symbol');
const originalDisplay = document.getElementById('original-display');
const convertedDisplay = document.getElementById('converted-display');
const formulaDisplay = document.getElementById('formula-display');

// --- Helper Functions ---

/**
 * Format a numeric value to a clean representation with at most maxDecimals places.
 * Avoids floating-point precision artifacts (e.g. 0.30000000000000004).
 * @param {number} num
 * @param {number} maxDecimals
 * @returns {string}
 */
const formatNumber = (num, maxDecimals = 2) => {
  if (!Number.isFinite(num)) return '';
  const factor = 10 ** maxDecimals;
  const rounded = Math.round((num + Number.EPSILON) * factor) / factor;
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals
  });
};

/**
 * Generate human-readable formula string showing the step-by-step conversion.
 * @param {number} val
 * @param {string} from
 * @param {string} to
 * @param {number} result
 * @returns {string}
 */
const getFormulaText = (val, from, to, result) => {
  const fromSym = UNIT_SYMBOLS[from];
  const toSym = UNIT_SYMBOLS[to];
  const fVal = formatNumber(val);
  const fRes = formatNumber(result);

  if (from === to) {
    return `${fVal} ${fromSym} = ${fRes} ${toSym} (Identical units)`;
  }

  switch (`${from}->${to}`) {
    case 'celsius->fahrenheit':
      return `(${fVal}°C × 9/5) + 32 = ${fRes}°F`;
    case 'celsius->kelvin':
      return `${fVal}°C + 273.15 = ${fRes} K`;
    case 'fahrenheit->celsius':
      return `(${fVal}°F − 32) × 5/9 = ${fRes}°C`;
    case 'fahrenheit->kelvin':
      return `((${fVal}°F − 32) × 5/9) + 273.15 = ${fRes} K`;
    case 'kelvin->celsius':
      return `${fVal} K − 273.15 = ${fRes}°C`;
    case 'kelvin->fahrenheit':
      return `((${fVal} K − 273.15) × 9/5) + 32 = ${fRes}°F`;
    default:
      return '';
  }
};

/**
 * Show error message and mark input field invalid
 * @param {string} message
 */
const showError = (message) => {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
  tempInput.classList.add('input-invalid');
};

/**
 * Clear error message and reset input field invalid state
 */
const clearError = () => {
  errorMessage.textContent = '';
  errorMessage.classList.add('hidden');
  tempInput.classList.remove('input-invalid');
};

/**
 * Hide the result display section
 */
const hideResult = () => {
  resultSection.classList.add('hidden');
};

/**
 * Update the source unit indicator badge beside the input field
 */
const updateUnitIndicator = () => {
  const sourceUnit = sourceSelect.value;
  inputUnitIndicator.textContent = UNIT_SYMBOLS[sourceUnit] || '°C';
};

/**
 * Validate user input and update the Convert button state.
 * Returns true if valid, false otherwise.
 * @returns {boolean}
 */
const validateInput = () => {
  const rawValue = tempInput.value.trim();
  const sourceUnit = sourceSelect.value;

  // Empty input -> button remains disabled, no error displayed until user types
  if (rawValue === '') {
    clearError();
    convertBtn.disabled = true;
    return false;
  }

  const numValue = Number(rawValue);

  // Check if input is a valid finite number
  if (Number.isNaN(numValue) || !Number.isFinite(numValue)) {
    showError('Please enter a valid numeric temperature.');
    convertBtn.disabled = true;
    return false;
  }

  // Physical validation: Temperature cannot be lower than absolute zero
  const minAllowed = MIN_TEMPERATURES[sourceUnit];
  if (numValue < minAllowed) {
    showError(`Temperature cannot be lower than absolute zero (${minAllowed} ${UNIT_SYMBOLS[sourceUnit]}).`);
    convertBtn.disabled = true;
    return false;
  }

  // Input is valid
  clearError();
  convertBtn.disabled = false;
  return true;
};

/**
 * Perform conversion and render results with smooth animation
 */
const handleConvert = () => {
  if (!validateInput()) return;

  const rawValue = tempInput.value.trim();
  const numValue = Number(rawValue);
  const sourceUnit = sourceSelect.value;
  const targetUnit = targetSelect.value;

  const conversionFn = CONVERSIONS[sourceUnit]?.[targetUnit];
  if (typeof conversionFn !== 'function') {
    showError('Unsupported unit conversion.');
    return;
  }

  const convertedNumber = conversionFn(numValue);

  // Format values
  const formattedConverted = formatNumber(convertedNumber);
  const formattedOriginal = formatNumber(numValue);
  const sourceSymbol = UNIT_SYMBOLS[sourceUnit];
  const targetSymbol = UNIT_SYMBOLS[targetUnit];

  // Populate UI
  resultValue.textContent = formattedConverted;
  resultUnitSymbol.textContent = targetSymbol;
  originalDisplay.textContent = `${formattedOriginal} ${sourceSymbol}`;
  convertedDisplay.textContent = `${formattedConverted} ${targetSymbol}`;
  formulaDisplay.textContent = getFormulaText(numValue, sourceUnit, targetUnit, convertedNumber);

  // Trigger smooth fade-in animation
  resultSection.classList.remove('hidden');
  resultCard.style.animation = 'none';
  // Force reflow to replay CSS keyframe animation
  void resultCard.offsetWidth;
  resultCard.style.animation = '';
};

/**
 * Swap source and target units
 */
const handleSwapUnits = () => {
  const currentSource = sourceSelect.value;
  const currentTarget = targetSelect.value;

  sourceSelect.value = currentTarget;
  targetSelect.value = currentSource;

  updateUnitIndicator();
  hideResult();
  validateInput();
};

// --- Event Listeners ---

// Real-time input validation & result clearing
tempInput.addEventListener('input', () => {
  hideResult();
  validateInput();
});

// Dropdown change listeners
sourceSelect.addEventListener('change', () => {
  updateUnitIndicator();
  hideResult();
  validateInput();
});

targetSelect.addEventListener('change', () => {
  hideResult();
  validateInput();
});

// Swap units button click
swapBtn.addEventListener('click', handleSwapUnits);

// Form submit event (handles Convert button click and Enter key press)
form.addEventListener('submit', (event) => {
  event.preventDefault();
  handleConvert();
});

// --- Initial Setup on Page Load ---
document.addEventListener('DOMContentLoaded', () => {
  updateUnitIndicator();
  validateInput(); // Ensures button starts in disabled state when input is empty
});

