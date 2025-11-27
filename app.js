// Application State
let appState = {
    policyName: '',
    inspectionDate: '',
    serviceSize: 200,
    mainFloorSqFt: 0,
    basementSqFt: 0,
    heatPumps: false,
    numHeatPumps: 1,
    electricRadiators: false,
    otherElectricHeat: false,
    electricWaterHeater: false,
    electricRange: false,
    poolHotTub: false,
    clothesDryer: false,
    potteryKiln: false,
    totalSqFt: 0,
    totalSqM: 0,
    baseWatts: 0,
    extraWatts: 0,
    totalWatts: 0,
    finalAmps: 0
};

// Fetch and display version from service worker
async function displayVersion() {
    try {
        const response = await fetch('service-worker.js');
        const text = await response.text();
        const match = text.match(/CACHE_NAME\s*=\s*['"].*?-v([\d.]+)['"]/i);
        if (match && match[1]) {
            document.getElementById('versionDisplay').textContent = `v${match[1]}`;
        }
    } catch (error) {
        console.log('Could not fetch version:', error);
    }
}

// DOM Elements
const screen1 = document.getElementById('screen1');
const screen2 = document.getElementById('screen2');
const screen3 = document.getElementById('screen3');

// Input Elements
const policyNameInput = document.getElementById('policyName');
const inspectionDateInput = document.getElementById('inspectionDate');
const serviceSizeRadios = document.querySelectorAll('input[name="serviceSize"]');
const mainFloorInput = document.getElementById('mainFloorSqFt');
const basementInput = document.getElementById('basementSqFt');
const heatPumpsCheckbox = document.getElementById('heatPumps');
const heatPumpsCountDiv = document.getElementById('heatPumpsCount');
const numHeatPumpsSelect = document.getElementById('numHeatPumps');
const electricRadiatorsCheckbox = document.getElementById('electricRadiators');
const otherElectricHeatCheckbox = document.getElementById('otherElectricHeat');
const electricWaterHeaterCheckbox = document.getElementById('electricWaterHeater');
const electricRangeCheckbox = document.getElementById('electricRange');
const poolHotTubCheckbox = document.getElementById('poolHotTub');
const clothesDryerCheckbox = document.getElementById('clothesDryer');
const potteryKilnCheckbox = document.getElementById('potteryKiln');

// Button Elements
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');
const backBtn = document.getElementById('backBtn');
const printSummaryBtn = document.getElementById('printSummaryBtn');

// Result Elements
const resultMessage = document.getElementById('resultMessage');
const contactMessage = document.getElementById('contactMessage');

// PWA Install Prompt
let deferredPrompt;

// Initialize App
function init() {
    // Set default inspection date to today
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    inspectionDateInput.value = dateStr;
    appState.inspectionDate = dateStr;

    // Capture the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        console.log('Install prompt available');
        // Show install button/banner if desired
        showInstallPromotion();
    });

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    }

    // Event Listeners
    policyNameInput.addEventListener('input', (e) => {
        appState.policyName = e.target.value;
    });

    inspectionDateInput.addEventListener('change', (e) => {
        appState.inspectionDate = e.target.value;
    });

    serviceSizeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            appState.serviceSize = parseInt(e.target.value);
        });
    });

    heatPumpsCheckbox.addEventListener('change', (e) => {
        appState.heatPumps = e.target.checked;
        heatPumpsCountDiv.style.display = e.target.checked ? 'flex' : 'none';
    });

    numHeatPumpsSelect.addEventListener('change', (e) => {
        appState.numHeatPumps = parseInt(e.target.value);
    });

    calculateBtn.addEventListener('click', calculateLoad);
    resetBtn.addEventListener('click', resetForm);
    backBtn.addEventListener('click', () => navigateToScreen(1));
    printSummaryBtn.addEventListener('click', () => {
        generateSummary();
        showPdfPreview();
    });
}

// Calculate Electrical Load
function calculateLoad() {
    // Validate inputs
    const mainFloor = parseFloat(mainFloorInput.value) || 0;
    const basement = parseFloat(basementInput.value) || 0;

    if (mainFloor === 0 && basement === 0) {
        alert('Please enter square footage values');
        return;
    }

    // Update state
    appState.mainFloorSqFt = mainFloor;
    appState.basementSqFt = basement;
    appState.electricRadiators = electricRadiatorsCheckbox.checked;
    appState.otherElectricHeat = otherElectricHeatCheckbox.checked;
    appState.electricWaterHeater = electricWaterHeaterCheckbox.checked;
    appState.electricRange = electricRangeCheckbox.checked;
    appState.poolHotTub = poolHotTubCheckbox.checked;
    appState.clothesDryer = clothesDryerCheckbox.checked;
    appState.potteryKiln = potteryKilnCheckbox.checked;

    // Calculate total square footage (basement counts as 75%)
    appState.totalSqFt = mainFloor + (basement * 0.75);
    appState.totalSqM = appState.totalSqFt / 10.7639;

    // Calculate base load according to Canadian Electrical Code
    const additionalBlocks = Math.max(0, Math.ceil((appState.totalSqM - 90) / 90));
    appState.baseWatts = 5000 + (additionalBlocks * 1000);

    // Calculate heat pump watts
    appState.extraWatts = 0;
    if (appState.heatPumps) {
        const heatPumpWatts = {
            1: 2880,
            2: 5760,
            3: 8640,
            4: 11520
        };
        appState.extraWatts = heatPumpWatts[appState.numHeatPumps] || 0;
    }

    // Add appliance loads
    appState.totalWatts = appState.baseWatts + appState.extraWatts;
    
    if (appState.electricWaterHeater) appState.totalWatts += 3500;
    if (appState.electricRange) appState.totalWatts += 6000;
    if (appState.poolHotTub) appState.totalWatts += 7680;
    if (appState.clothesDryer) appState.totalWatts += 1440;
    if (appState.potteryKiln) appState.totalWatts += 1440;

    // Calculate final amperage (240V)
    appState.finalAmps = appState.totalWatts / 240;

    // Display results
    displayResults();
    navigateToScreen(2);
}

// Display Results on Screen 2
function displayResults() {
    let message = '';
    let shouldContactSurveyor = false;
    let detailedMessage = '';

    // Check if multiple heat sources require surveyor contact
    if (appState.heatPumps && (appState.electricRadiators || appState.otherElectricHeat)) {
        message = 'Contact Safety Surveyor';
        shouldContactSurveyor = true;
        detailedMessage = `Based on the information provided, the approximate load is ${appState.finalAmps.toFixed(1)} amps. However, due to the multiple sources of electric heat, a safety survey is recommended.`;
    } else if ((appState.serviceSize === 100 || appState.serviceSize === 60) && 
               (appState.electricRadiators || appState.otherElectricHeat)) {
        message = 'Contact Safety Surveyor';
        shouldContactSurveyor = true;
        detailedMessage = `Based on the information provided, the approximate load is ${appState.finalAmps.toFixed(1)} amps. However, due to the multiple sources of electric heat, a safety survey is recommended.`;
    } else {
        // Calculate based on service size
        const ampsFormatted = appState.finalAmps.toFixed(1);
        if (appState.serviceSize === 200) {
            if (appState.finalAmps > 200) {
                message = 'Contact Safety Surveyor';
                shouldContactSurveyor = true;
                detailedMessage = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is required.`;
            } else if (appState.finalAmps > 170) {
                message = 'Safety Survey Recommended';
                shouldContactSurveyor = true;
                detailedMessage = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is recommended to confirm.`;
            } else {
                message = 'Load is less than 200 Amps.';
                detailedMessage = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is not required.`;
            }
        } else if (appState.serviceSize === 100) {
            if (appState.finalAmps > 100) {
                message = 'Contact Safety Surveyor';
                shouldContactSurveyor = true;
                detailedMessage = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is required.`;
            } else if (appState.finalAmps > 85) {
                message = 'Safety Survey Recommended';
                shouldContactSurveyor = true;
                detailedMessage = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is recommended to confirm.`;
            } else {
                message = 'Load is less than 100 Amps.';
                detailedMessage = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is not required.`;
            }
        } else if (appState.serviceSize === 60) {
            if (appState.finalAmps > 60) {
                message = 'Contact Safety Surveyor';
                shouldContactSurveyor = true;
                detailedMessage = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is required.`;
            } else if (appState.finalAmps > 50) {
                message = 'Safety Survey Recommended';
                shouldContactSurveyor = true;
                detailedMessage = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is recommended to confirm.`;
            } else {
                message = 'Load is less than 60 Amps.';
                detailedMessage = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is not required.`;
            }
        }
    }

    resultMessage.textContent = message;
    resultMessage.className = shouldContactSurveyor ? 'result-message error' : 'result-message success';
    contactMessage.style.display = shouldContactSurveyor ? 'block' : 'none';
    
    // Set detailed result message
    document.getElementById('detailedResult').textContent = detailedMessage;
    
    // Generate assessment details for screen 2
    generateAssessmentDetails();
}

// Generate assessment details for display on screen 2
function generateAssessmentDetails() {
    const resultSummaryDetails = document.getElementById('resultSummaryDetails');
    const displayServiceSize = document.getElementById('displayServiceSize');
    const displaySqFt = document.getElementById('displaySqFt');
    
    // Safety check
    if (!resultSummaryDetails || !displayServiceSize || !displaySqFt) {
        console.error('Assessment detail elements not found');
        return;
    }
    
    const fullSqFt = appState.mainFloorSqFt + appState.basementSqFt;
    
    // Update service size and square footage
    displayServiceSize.textContent = `${appState.serviceSize} Amps`;
    displaySqFt.textContent = `${fullSqFt} sq ft`;
    
    let detailsHTML = '<div style="display: flex; flex-direction: column; gap: 12px;">';

    if (appState.heatPumps) {
        detailsHTML += `<div style="padding: 12px; background: white; border-radius: 8px;"><strong>Heat pumps:</strong> ${appState.numHeatPumps} unit(s)</div>`;
    }

    if (appState.electricRadiators || appState.otherElectricHeat) {
        detailsHTML += `<div style="padding: 12px; background: white; border-radius: 8px;"><strong>Additional electric heaters:</strong> Yes</div>`;
    }

    if (appState.electricWaterHeater) {
        detailsHTML += `<div style="padding: 12px; background: white; border-radius: 8px;"><strong>Electric water heater:</strong> Yes</div>`;
    }

    if (appState.electricRange) {
        detailsHTML += `<div style="padding: 12px; background: white; border-radius: 8px;"><strong>Electric range:</strong> Yes</div>`;
    }

    if (appState.poolHotTub) {
        detailsHTML += `<div style="padding: 12px; background: white; border-radius: 8px;"><strong>Pool/Hot tub/Sauna/Vehicle charger:</strong> Yes</div>`;
    }

    if (appState.clothesDryer) {
        detailsHTML += `<div style="padding: 12px; background: white; border-radius: 8px;"><strong>Electric clothes dryer:</strong> Yes</div>`;
    }

    if (appState.potteryKiln) {
        detailsHTML += `<div style="padding: 12px; background: white; border-radius: 8px;"><strong>Electric pottery kiln:</strong> Yes</div>`;
    }
    
    detailsHTML += `<div style="padding: 16px; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 8px; border: 2px solid var(--primary-color);"><strong style="font-size: 17px;">Calculated Load:</strong> <span style="font-size: 20px; color: var(--primary-color); font-weight: 700;">${appState.finalAmps.toFixed(1)} Amps</span></div>`;
    
    detailsHTML += '</div>';
    
    resultSummaryDetails.innerHTML = detailsHTML;
    
    console.log('Assessment details generated successfully');
}

// Generate Summary for Screen 3
function generateSummary() {
    const summaryService = document.getElementById('summaryService');
    const summaryDetails = document.getElementById('summaryDetails');
    const summaryResult = document.getElementById('summaryResult');

    // Policy Name
    const summaryPolicy = document.getElementById('summaryPolicy');
    if (appState.policyName) {
        summaryPolicy.textContent = `Policy # or Name: ${appState.policyName}`;
        summaryPolicy.style.display = 'block';
    } else {
        summaryPolicy.style.display = 'none';
    }

    // Inspection Date
    const summaryInspectionDate = document.getElementById('summaryInspectionDate');
    if (appState.inspectionDate) {
        const inspDate = new Date(appState.inspectionDate + 'T00:00:00');
        const inspDateStr = inspDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        summaryInspectionDate.textContent = `Inspection Date: ${inspDateStr}`;
        summaryInspectionDate.style.display = 'block';
    } else {
        summaryInspectionDate.style.display = 'none';
    }

    // Hide Date Generated field
    const summaryDateElement = document.getElementById('summaryDate');
    if (summaryDateElement) {
        summaryDateElement.style.display = 'none';
    }

    // Service Size
    summaryService.textContent = `Service Size: ${appState.serviceSize} Amps`;

    // Details
    let detailsHTML = '';
    const fullSqFt = appState.mainFloorSqFt + appState.basementSqFt;
    detailsHTML += `<div class="summary-item"><strong>Total square footage:</strong> ${fullSqFt} sq ft</div>`;

    if (appState.heatPumps) {
        detailsHTML += `<div class="summary-item"><strong>Heat pumps:</strong> ${appState.numHeatPumps} unit(s)</div>`;
    }

    if (appState.electricRadiators || appState.otherElectricHeat) {
        detailsHTML += `<div class="summary-item"><strong>Additional electric heaters:</strong> Yes</div>`;
    }

    if (appState.electricWaterHeater) {
        detailsHTML += `<div class="summary-item"><strong>Electric water heater:</strong> Yes</div>`;
    }

    if (appState.electricRange) {
        detailsHTML += `<div class="summary-item"><strong>Electric range:</strong> Yes</div>`;
    }

    if (appState.poolHotTub) {
        detailsHTML += `<div class="summary-item"><strong>Pool/Hot tub/Sauna/Vehicle charger:</strong> Yes</div>`;
    }

    if (appState.clothesDryer) {
        detailsHTML += `<div class="summary-item"><strong>Electric clothes dryer:</strong> Yes</div>`;
    }

    if (appState.potteryKiln) {
        detailsHTML += `<div class="summary-item"><strong>Electric pottery kiln:</strong> Yes</div>`;
    }

    summaryDetails.innerHTML = detailsHTML;

    // Result Message
    let resultText = '';
    const ampsFormatted = appState.finalAmps.toFixed(1);

    if (appState.heatPumps && (appState.electricRadiators || appState.otherElectricHeat)) {
        resultText = `Based on the information provided, the approximate load is ${ampsFormatted} amps. However, due to the multiple sources of electric heat, a safety survey is recommended.`;
    } else if ((appState.serviceSize === 100 || appState.serviceSize === 60) && 
               (appState.electricRadiators || appState.otherElectricHeat)) {
        resultText = `Based on the information provided, the approximate load is ${ampsFormatted} amps. However, due to the multiple sources of electric heat, a safety survey is recommended.`;
    } else {
        if (appState.serviceSize === 200) {
            if (appState.finalAmps > 200) {
                resultText = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is required.`;
            } else if (appState.finalAmps > 170) {
                resultText = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is recommended to confirm.`;
            } else {
                resultText = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is not required.`;
            }
        } else if (appState.serviceSize === 100) {
            if (appState.finalAmps > 100) {
                resultText = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is required.`;
            } else if (appState.finalAmps > 85) {
                resultText = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is recommended to confirm.`;
            } else {
                resultText = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is not required.`;
            }
        } else if (appState.serviceSize === 60) {
            if (appState.finalAmps > 60) {
                resultText = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is required.`;
            } else if (appState.finalAmps > 50) {
                resultText = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is recommended to confirm.`;
            } else {
                resultText = `Based on the information provided, the calculated load is ${ampsFormatted} amps, a safety survey is not required.`;
            }
        }
    }

    summaryResult.textContent = resultText;
}

// Print Summary
function printSummary() {
    window.print();
}

// Reset Form
function resetForm() {
    // Reset text and date inputs
    policyNameInput.value = '';
    inspectionDateInput.value = '';

    // Reset radio buttons
    serviceSizeRadios[0].checked = true;
    appState.serviceSize = 200;

    // Reset inputs
    mainFloorInput.value = '';
    basementInput.value = '';

    // Reset checkboxes
    heatPumpsCheckbox.checked = false;
    electricRadiatorsCheckbox.checked = false;
    otherElectricHeatCheckbox.checked = false;
    electricWaterHeaterCheckbox.checked = false;
    electricRangeCheckbox.checked = false;
    poolHotTubCheckbox.checked = false;
    clothesDryerCheckbox.checked = false;
    potteryKilnCheckbox.checked = false;

    // Reset dropdown
    numHeatPumpsSelect.value = '1';

    // Hide heat pumps count
    heatPumpsCountDiv.style.display = 'none';

    // Reset state
    appState = {
        policyName: '',
        inspectionDate: '',
        serviceSize: 200,
        mainFloorSqFt: 0,
        basementSqFt: 0,
        heatPumps: false,
        numHeatPumps: 1,
        electricRadiators: false,
        otherElectricHeat: false,
        electricWaterHeater: false,
        electricRange: false,
        poolHotTub: false,
        clothesDryer: false,
        potteryKiln: false,
        totalSqFt: 0,
        totalSqM: 0,
        baseWatts: 0,
        extraWatts: 0,
        totalWatts: 0,
        finalAmps: 0
    };
}

// Show install promotion
function showInstallPromotion() {
    // Create install banner if it doesn't exist
    if (document.getElementById('installBanner')) return;
    
    const banner = document.createElement('div');
    banner.id = 'installBanner';
    banner.innerHTML = `
        <div class="install-banner-content">
            <button id="dismissInstallBtn" class="dismiss-btn">×</button>
            <div class="install-text">
                <p class="install-title">⚡ Install App</p>
                <p class="install-subtitle">Add to home screen for quick access</p>
            </div>
            <button id="installBtn" class="btn btn-primary install-action-btn">Install</button>
        </div>
    `;
    document.body.appendChild(banner);
    
    // Add click handler for install button
    document.getElementById('installBtn').addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        
        // Clear the deferredPrompt
        deferredPrompt = null;
        
        // Hide the banner
        banner.remove();
    });
    
    // Dismiss button
    document.getElementById('dismissInstallBtn').addEventListener('click', () => {
        banner.remove();
    });
}

// Global variable to store PDF blob
let currentPdfBlob = null;

// Show PDF Preview
async function showPdfPreview() {
    const screen3 = document.getElementById('screen3');
    const previewScreen = document.getElementById('pdfPreviewScreen');
    const embed = document.getElementById('pdfPreviewEmbed');
    
    // Show loading state
    previewScreen.style.display = 'flex';
    embed.style.display = 'none';
    
    try {
        // Generate PDF using html2canvas and jsPDF
        const { jsPDF } = window.jspdf;
        
        // Temporarily show screen3 for capture
        screen3.style.display = 'block';
        screen3.style.position = 'absolute';
        screen3.style.left = '-9999px';
        
        // Capture the content
        const canvas = await html2canvas(screen3, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        // Hide screen3 again
        screen3.style.display = 'none';
        screen3.style.position = '';
        screen3.style.left = '';
        
        // Create PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'letter'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Get PDF as blob
        currentPdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(currentPdfBlob);
        
        // Display PDF in embed
        embed.src = pdfUrl;
        embed.style.display = 'block';
        
        // Setup button listeners
        document.getElementById('closePdfBtn').onclick = closePdfPreview;
        document.getElementById('savePdfBtn').onclick = savePdf;
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF preview');
        closePdfPreview();
    }
}

// Close PDF Preview
function closePdfPreview() {
    const previewScreen = document.getElementById('pdfPreviewScreen');
    const embed = document.getElementById('pdfPreviewEmbed');
    
    previewScreen.style.display = 'none';
    
    // Clean up
    if (embed.src) {
        URL.revokeObjectURL(embed.src);
        embed.src = '';
    }
    currentPdfBlob = null;
}

// Save/Share PDF
async function savePdf() {
    if (!currentPdfBlob) return;
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const fileName = `Electrical_Service_Checklist_${appState.policyName || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    try {
        if (isMobile && navigator.share && navigator.canShare) {
            // Mobile: Use Web Share API
            const file = new File([currentPdfBlob], fileName, { type: 'application/pdf' });
            
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Electrical Service Checklist',
                    text: 'Electrical Service Assessment Report'
                });
                return;
            }
        }
        
        // Desktop or fallback: Direct download
        const url = URL.createObjectURL(currentPdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Error saving PDF:', error);
        // Fallback to download
        const url = URL.createObjectURL(currentPdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Navigate Between Screens
function navigateToScreen(screenNumber) {
    screen1.classList.remove('active');
    screen2.classList.remove('active');
    screen3.classList.remove('active');

    if (screenNumber === 1) {
        screen1.classList.add('active');
    } else if (screenNumber === 2) {
        screen2.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (screenNumber === 3) {
        generateSummary();
        screen3.classList.add('active');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    init();
    displayVersion();
});
