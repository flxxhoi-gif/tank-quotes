// --- VERSION CONTROL ---
const cv = "V103";
if(localStorage.getItem("winkoAppVersion") !== cv) {
    localStorage.setItem("winkoAppVersion", cv);
    for(let i=13; i<=102; i++) localStorage.removeItem("winkoProDataV" + i);
    window.location.reload(true);
}

// --- UTILITY FUNCTIONS ---
const getVal = (id) => { let e = document.getElementById(id); return e ? e.value : ''; };
const getNum = (id) => { let v = parseFloat(getVal(id)); return isNaN(v) ? 0 : v; };
const setTxt = (id, v) => { let e = document.getElementById(id); if(e) e.innerText = v; };
const setVal = (id, v) => { let e = document.getElementById(id); if(e) e.value = v; };
const setHtml = (id, v) => { let e = document.getElementById(id); if(e) e.innerHTML = v; };
const setDisp = (id, show) => { let e = document.getElementById(id); if(e) e.style.display = show ? 'block' : 'none'; };
const setBox = (id, show) => { let e = document.getElementById(id); if(e) e.innerHTML = show ? '&#10003;' : '&nbsp;'; };

const SECRET_PASSWORD = "winko2026";
const ADMIN_PASSWORD = "adminmaster99";

const systemBaseStructure = [
    { category: "Panels", items: [{name: "Manhole Panel", def: 450, wt: 55}, {name: "Roof Panel", def: 220, wt: 26}, {name: "Base Panel", def: 350, wt: 68}, {name: "Wall Panel (L1)", def: 350, wt: 68}, {name: "Wall Panel (L2)", def: 280, wt: 48}, {name: "Wall Panel (L3)", def: 280, wt: 48}, {name: "Wall Panel (L4)", def: 220, wt: 26}, {name: "Partition Panel", def: 280, wt: 48}] },
    { category: "Cleat & Trusses", items: [{name: "Type A Cleat", def: 25, wt: 1.2}, {name: "Type B Cleat", def: 28, wt: 1.8}, {name: "Type C Cleat", def: 30, wt: 2.5}, {name: "Ø1\" Pipe", def: 12, wt: 1.6}, {name: "2\" x 2\" angle", def: 15, wt: 2.2}] },
    { category: "Angle Stay", items: [{name: "44 1/4\" (L1 Stay)", def: 45, wt: 4.5}, {name: "67\" (L2 Stay)", def: 65, wt: 7.2}, {name: "11' 3\" (L3 Stay)", def: 95, wt: 14.5}, {name: "15' 8.5\" (L4 Stay)", def: 125, wt: 19.8}] },
    { category: "Accessories", items: [{name: "Ext. Ladder", def: 55, wt: 3.5, selectId: "extLadMat", options: ["HDG", "SS 304", "SS 316"]}, {name: "Int. Ladder", def: 75, wt: 3.5, selectId: "intLadMat", options: ["HDG", "SS 304", "SS 316"]}, {name: "Water Level Indicator", def: 220, wt: 2.5, selectId: "wliType", options: ["Ball Float", "Tube Type"]}, {name: "Air Vent", def: 85, wt: 1.5, selectId: "ventType", options: ["HDG Steel", "ABS Plastic"]}, {name: "Mastic Sealant (Rolls)", def: 38, wt: 0.8}, {name: "Bolt & Nut Sets", def: 1.60, wt: 0.15}] },
    { category: "Services", items: [{name: "Installation & Labor", def: 3500, wt: 0}, {name: "Transport", def: 850, wt: 0}] }
];

try { let md = JSON.parse(localStorage.getItem('winkoMasterDefaults')); if(md) md.forEach((sec, sIdx) => { sec.items.forEach((it, iIdx) => { if(systemBaseStructure[sIdx] && systemBaseStructure[sIdx].items[iIdx]) { systemBaseStructure[sIdx].items[iIdx].name = it.name; systemBaseStructure[sIdx].items[iIdx].def = it.def; systemBaseStructure[sIdx].items[iIdx].wt = it.wt; } }); }); } catch(e) {}
systemBaseStructure.forEach(sec => sec.items.forEach(it => { if(it.selectId && !it.selVal) it.selVal = it.options[0]; }));

let appTanks = [];
let appCustomItems = [];
const configIDs = ['quoteIdInput', 'custPoNo', 'custDelDate', 'marketChoice', 'unitChoice', 'markupPct','discountPct','sstPct', 'shortExclusions', 'fullTermsNotes', 'custCompany', 'custAttn', 'custAddr', 'tcValidity', 'tcLead', 'tcDelivery', 'tcPayment', 'signName', 'signPhone'];

function defaultTank() {
    return {
        id: Date.now() + Math.random(),
        std: "SANS 10329:2020 Approved by SIRIM & SPAN", coat: "Hot Dipped Galvanised",
        L: 12, W: 4, H: 4, override: "",
        tRoof: "1.5mm", tBase: "4.5mm", tW1: "4.5mm", tW2: "3.0mm", tW3: "3.0mm", tW4: "1.5mm",
        partChoice: "no", partQty: 0, partL: 0, partH: 0, partPos: 1, partType: "Divider",
        bom: JSON.parse(JSON.stringify(systemBaseStructure)),
        baseCost: 0, finalPrice: 0, totalPanels: 0, weight: 0
    };
}

function defaultCustomItem() {
    return { id: Date.now() + Math.random(), desc: "Custom Structure / Pump Room", cost: 0, qty: 1, finalPrice: 0 };
}

function updateTankField(tIdx, field, val, isNum = false) { appTanks[tIdx][field] = isNum ? (parseFloat(val) || 0) : val; safeProcess(); }
function updateBomField(tIdx, sIdx, iIdx, field, val, isNum = false) { appTanks[tIdx].bom[sIdx].items[iIdx][field] = isNum ? (parseFloat(val) || 0) : val; safeProcess(); }
function updateCustomField(cIdx, field, val, isNum = false) { appCustomItems[cIdx][field] = isNum ? (parseFloat(val) || 0) : val; safeProcess(); }
function handleUnitChange() { safeProcess(); }

function addNewTank() { appTanks.push(defaultTank()); renderAllDynamicUI(); processTankData(); }
function removeTank(idx) { if(confirm("Remove this tank?")) { appTanks.splice(idx, 1); renderAllDynamicUI(); processTankData(); } }
function addNewCustomItem() { appCustomItems.push(defaultCustomItem()); renderAllDynamicUI(); processTankData(); }
function removeCustomItem(idx) { appCustomItems.splice(idx, 1); renderAllDynamicUI(); processTankData(); }
function addBomRow(tIdx, sIdx) { appTanks[tIdx].bom[sIdx].items.push({name: "Custom Item", qty: 0, wt: 0, def: 0}); renderAllDynamicUI(); processTankData(); }
function removeBomRow(tIdx, sIdx) { let minLen = systemBaseStructure[sIdx].items.length; if(appTanks[tIdx].bom[sIdx].items.length > minLen) { appTanks[tIdx].bom[sIdx].items.pop(); renderAllDynamicUI(); processTankData(); } }

function safeProcess() { processTankData(); savePrices(); }

function checkPassword() {
    let p = getVal('passInput').trim().toLowerCase();
    if(p === SECRET_PASSWORD) {
        setDisp('securityOverlay', false); setDisp('topNav', true); setDisp('mainContent', true);
        if(!getVal('quoteIdInput')) setVal('quoteIdInput', "QP-" + new Date().getFullYear().toString().substr(-2) + "-00" + Math.floor(Math.random() * 9 + 1));
        refreshMemoryDropdown(); initInventory(); loadPrices();
    } else if (p === ADMIN_PASSWORD) {
        setDisp('securityOverlay', false); setDisp('topNav', true); setDisp('adminContent', true); buildAdminTable();
    } else { alert("Incorrect Password!"); }
}

function switchTab(tabId) {
    setDisp('mainContent', false); setDisp('inventoryContent', false); setDisp('adminContent', false); setDisp('customerPreviewContainer', false);
    ['btnTabQuote', 'btnTabInv', 'btnTabAdmin', 'btnTabPreview'].forEach(id => document.getElementById(id).classList.remove('active'));
    if(tabId === 'quote') { setDisp('mainContent', true); document.getElementById('btnTabQuote').classList.add('active'); }
    else if(tabId === 'preview') { syncPrintHeader(window.currentUnit||'ft'); document.getElementById('customerPreviewContainer').style.display='flex'; document.getElementById('btnTabPreview').classList.add('active'); }
    else if(tabId === 'inventory') { setDisp('inventoryContent', true); document.getElementById('btnTabInv').classList.add('active'); renderInventoryTable(); }
    else if(tabId === 'admin') { setDisp('adminContent', true); document.getElementById('btnTabAdmin').classList.add('active'); buildAdminTable(); }
}

function renderAllDynamicUI() {
    let tanksHtml = "", bomHtml = "", screenVisHtml = "", printVisHtml = "", chkVisHtml = "";
    appTanks.forEach((t, i) => {
        tanksHtml += `<div class="tank-block" style="border-top:2px dashed #cbd5e1; margin-top:20px; padding-top:15px;">
            <div class="tank-section-title" style="background:#e0f2fe; display:flex; justify-content:space-between;">
                <span>Tank ${i+1} Specs</span> <button class="del-btn no-print" onclick="removeTank(${i})">X REMOVE</button>
            </div>
            <div class="config-grid">
                <div class="form-group"><label>Standard</label><select onchange="updateTankField(${i}, 'std', this.value)"><option ${t.std.includes('SANS')?'selected':''}>SANS 10329:2020 Approved by SIRIM & SPAN</option><option ${t.std.includes('SS 22')?'selected':''}>SS 22: 1979</option></select></div>
                <div class="form-group"><label>Material</label><select onchange="updateTankField(${i}, 'coat', this.value)"><option ${t.coat==='Hot Dipped Galvanised'?'selected':''}>Hot Dipped Galvanised</option><option ${t.coat==='Painted Steel'?'selected':''}>Painted Steel</option><option ${t.coat==='Stainless Steel (SS 304)'?'selected':''}>Stainless Steel (SS 304)</option><option ${t.coat==='Stainless Steel (SS 316)'?'selected':''}>Stainless Steel (SS 316)</option></select></div>
            </div>
            <div class="dim-grid">
                <div class="form-group"><label>Length</label><input type="number" value="${t.L}" step="0.01" oninput="updateTankField(${i}, 'L', this.value, true)"></div>
                <div class="form-group"><label>Width</label><input type="number" value="${t.W}" step="0.01" oninput="updateTankField(${i}, 'W', this.value, true)"></div>
                <div class="form-group"><label>Height</label><input type="number" value="${t.H}" step="0.01" oninput="updateTankField(${i}, 'H', this.value, true)"></div>
                <div class="form-group" style="grid-column: span 3;"><label style="color:#0ea5e9;">Custom Size Override Text</label><input type="text" value="${t.override}" style="border:1px dashed #0ea5e9;" oninput="updateTankField(${i}, 'override', this.value)"></div>
            </div>
            
            <div class="tank-section-title" style="margin-top:10px; background:#f1f5f9;">Tank ${i+1} Panel Thicknesses</div>
            <div class="dim-grid" style="padding:10px; border:1px solid #e2e8f0; margin-bottom:15px; border-radius:6px;">
                <div class="form-group"><label>Roof</label><input type="text" value="${t.tRoof}" oninput="updateTankField(${i}, 'tRoof', this.value)"></div>
                <div class="form-group"><label>Base</label><input type="text" value="${t.tBase}" oninput="updateTankField(${i}, 'tBase', this.value)"></div>
                <div class="form-group"><label>Wall L1</label><input type="text" value="${t.tW1}" oninput="updateTankField(${i}, 'tW1', this.value)"></div>
                <div class="form-group"><label>Wall L2</label><input type="text" value="${t.tW2}" oninput="updateTankField(${i}, 'tW2', this.value)"></div>
                <div class="form-group"><label>Wall L3</label><input type="text" value="${t.tW3}" oninput="updateTankField(${i}, 'tW3', this.value)"></div>
                <div class="form-group"><label>Wall L4</label><input type="text" value="${t.tW4}" oninput="updateTankField(${i}, 'tW4', this.value)"></div>
            </div>

            <div class="config-grid">
                <div class="form-group" style="grid-column:span 2;"><label>Partition Choice</label><select onchange="updateTankField(${i}, 'partChoice', this.value); document.getElementById('partDet_${i}').style.display=this.value==='yes'?'flex':'none';">
                    <option value="no" ${t.partChoice==='no'?'selected':''}>No</option>
                    <option value="yes" ${t.partChoice==='yes'?'selected':''}>Yes</option>
                </select></div>
            </div>
            <div id="partDet_${i}" style="display:${t.partChoice==='yes'?'flex':'none'}; background:#fff7ed; padding:15px; border-radius:8px; margin-bottom:15px; gap:10px; flex-wrap:wrap;">
                <div class="form-group"><label>Qty</label><input type="number" value="${t.partQty}" oninput="updateTankField(${i}, 'partQty', this.value, true)"></div>
                <div class="form-group"><label>L/W (Size)</label><input type="number" value="${t.partL}" step="0.01" oninput="updateTankField(${i}, 'partL', this.value, true)"></div>
                <div class="form-group"><label>Height</label><input type="number" value="${t.partH}" step="0.01" oninput="updateTankField(${i}, 'partH', this.value, true)"></div>
                <div class="form-group"><label>Position</label><input type="number" value="${t.partPos}" oninput="updateTankField(${i}, 'partPos', this.value, true)"></div>
                <div class="form-group" style="flex:1.5;"><label>Type</label><input type="text" value="${t.partType}" oninput="updateTankField(${i}, 'partType', this.value)"></div>
            </div>
        </div>`;

        let bRows = "";
        t.bom.forEach((sec, sIdx) => {
            let isSvc = (sec.category === "Services");
            bRows += `<tr class="section-header-row"><td colspan="5" class="section-header" style="padding:0;"><div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; font-weight:800; background:#f1f5f9;"><span>${sec.category}</span><div class="no-print"><button type="button" onclick="addBomRow(${i}, ${sIdx})" style="padding:4px 8px; font-size:11px; background:#fff; border:1px solid #ea580c; color:#ea580c; border-radius:4px; cursor:pointer; font-weight:700;">+ Row</button> <button type="button" onclick="removeBomRow(${i}, ${sIdx})" style="padding:4px 8px; font-size:11px; background:#fff; border:1px solid #e11d48; color:#e11d48; border-radius:4px; cursor:pointer; font-weight:700;">- Row</button></div></div></td></tr>`;
            sec.items.forEach((it, iIdx) => {
                let selHtml = it.selectId ? `<select id="t_${i}_sel_${sIdx}_${iIdx}" class="bom-inline-select" onchange="updateBomField(${i}, ${sIdx}, ${iIdx}, 'selVal', this.value)">${it.options.map(o=>`<option value="${o}" ${it.selVal===o?'selected':''}>${o}</option>`).join('')}</select>` : '';
                let qtyHtml = isSvc ? `<input type="hidden" id="t_${i}_q_${sIdx}_${iIdx}" value="1">` : `<input type="number" id="t_${i}_q_${sIdx}_${iIdx}" value="${it.qty||0}" oninput="updateBomField(${i}, ${sIdx}, ${iIdx}, 'qty', this.value, true)">`;
                bRows += `<tr><td class="col-item"><div style="display:flex; align-items:center; gap:4px;"><input type="text" class="desc-input" id="t_${i}_n_${sIdx}_${iIdx}" value="${it.name}" oninput="updateBomField(${i}, ${sIdx}, ${iIdx}, 'name', this.value)">${selHtml}</div></td><td class="col-input col-qty">${qtyHtml}</td><td class="col-input"><input type="number" step="0.1" id="t_${i}_w_${sIdx}_${iIdx}" value="${it.wt||0}" oninput="updateBomField(${i}, ${sIdx}, ${iIdx}, 'wt', this.value, true)"></td><td class="col-input"><input type="number" step="0.01" id="t_${i}_p_${sIdx}_${iIdx}" value="${(it.def||0).toFixed(2)}" oninput="updateBomField(${i}, ${sIdx}, ${iIdx}, 'def', this.value, true)"></td><td class="col-total" id="tot_${i}_${sIdx}_${iIdx}">0.00</td></tr>`;
            });
        });
        bomHtml += `<div class="module-card"><div class="card-header"><div><span>⚙️</span> BOM - TANK ${i+1}</div></div><table><thead><tr><th>Description</th><th class="text-center">Qty</th><th class="text-center">Wt(kg)</th><th class="text-right">Price</th><th class="text-right">Total</th></tr></thead><tbody>${bRows}</tbody></table></div>`;

        screenVisHtml += `<div class="module-card no-print"><div class="card-header">Tank ${i+1} Visuals</div><div class="visual-container"><div class="view-box"><div class="view-title">Top</div><div id="grid_top_s_${i}" class="grid-draft"></div></div><div class="view-box"><div class="view-title">Bottom</div><div id="grid_bot_s_${i}" class="grid-draft"></div></div><div class="view-box"><div class="view-title">Front</div><div id="grid_fr_s_${i}" class="grid-draft"></div></div><div class="view-box"><div class="view-title">Back</div><div id="grid_bk_s_${i}" class="grid-draft"></div></div><div class="view-box"><div class="view-title">Left</div><div id="grid_lt_s_${i}" class="grid-draft"></div></div><div class="view-box"><div class="view-title">Right</div><div id="grid_rt_s_${i}" class="grid-draft"></div></div></div></div>`;
        printVisHtml += `<div class="avoid-break"><div class="tank-section-title avoid-break" style="margin-top:20px; font-size:11pt; border-bottom:2px solid #000;">TANK ${i+1} EXTERIOR DRAWINGS</div><div class="visual-container avoid-break"><div class="view-box"><div class="view-title">1. TOP VIEW</div><div id="grid_top_p_${i}" class="grid-draft"></div></div><div class="view-box"><div class="view-title">2. BOTTOM VIEW</div><div id="grid_bot_p_${i}" class="grid-draft"></div></div><div class="view-box"><div class="view-title">3. FRONT ELEVATION</div><div id="grid_fr_p_${i}" class="grid-draft"></div></div><div class="view-box"><div class="view-title">4. BACK ELEVATION</div><div id="grid_bk_p_${i}" class="grid-draft"></div></div><div class="view-box"><div class="view-title">5. LEFT ELEVATION</div><div id="grid_lt_p_${i}" class="grid-draft"></div></div><div class="view-box"><div class="view-title">6. RIGHT ELEVATION</div><div id="grid_rt_p_${i}" class="grid-draft"></div></div></div></div>`;
        chkVisHtml += `<div><div class="tank-section-title avoid-break" style="margin-top:20px; font-size:14pt; border-bottom:2px solid #000; text-transform:uppercase;">TANK ${i+1} FACTORY DRAWINGS</div><div class="visual-container"><div class="view-box"><div class="view-title">1. TOP VIEW</div><div id="grid_top_c_${i}" class="grid-draft"></div></div><div class="view-box"><div class="view-title">2. BOTTOM VIEW</div><div id="grid_bot_c_${i}" class="grid-draft"></div></div><div class="view-box"><div class="view-title">3. FRONT ELEVATION</div><div id="grid_fr_c_${i}" class="grid-draft"></div></div><div class="view-box"><div class="view-title">4. BACK ELEVATION</div><div id="grid_bk_c_${i}" class="grid-draft"></div></div><div class="view-box"><div class="view-title">5. LEFT ELEVATION</div><div id="grid_lt_c_${i}" class="grid-draft"></div></div><div class="view-box"><div class="view-title">6. RIGHT ELEVATION</div><div id="grid_rt_c_${i}" class="grid-draft"></div></div></div></div>`;
    });

    let customHtml = "";
    appCustomItems.forEach((c, i) => {
        customHtml += `<div class="tank-block" style="background:#f5f3ff; padding:15px; border-radius:6px; border:1px solid #ddd6fe; margin-top:10px;"><div style="display:flex; justify-content:space-between; font-weight:bold; color:#4c1d95; margin-bottom:10px;">Custom Item ${i+1} <button class="del-btn" onclick="removeCustomItem(${i})">X REMOVE</button></div><div style="display:flex; gap:10px;"><div class="form-group" style="flex:2;"><label>Description</label><input type="text" value="${c.desc}" oninput="updateCustomField(${i}, 'desc', this.value)"></div><div class="form-group" style="flex:1;"><label>Qty</label><input type="number" value="${c.qty}" oninput="updateCustomField(${i}, 'qty', this.value, true)"></div><div class="form-group" style="flex:1;"><label>Base Price (Unit)</label><input type="number" value="${c.cost}" oninput="updateCustomField(${i}, 'cost', this.value, true)"></div></div></div>`;
    });

    setHtml('dynamicTanksContainer', tanksHtml);
    setHtml('dynamicBomContainer', bomHtml);
    setHtml('dynamicVisualsScreenContainer', screenVisHtml);
    setHtml('dynamicVisualsPrintContainer', printVisHtml);
    setHtml('dynamicChecklistDrawingsContainer', chkVisHtml);
    setHtml('dynamicCustomContainer', customHtml);
}

function drawGrid(id, c, r, maxDim, pType = null, pPos = -1) {
    let el = document.getElementById(id); if (!el) return;
    c = Math.max(0, isNaN(c)?0:c); r = Math.max(0, isNaN(r)?0:r); maxDim = isNaN(maxDim)?0:maxDim;
    if ((c * r) > 2500) { el.style.display = 'block'; el.innerHTML = '<div style="padding: 10px; font-size:12px; color:#ef4444; font-weight:bold; border:1px dashed #ef4444; width:100%;">Too large to draw.</div>'; return; }
    let wp = maxDim > 0 ? (c / maxDim) * 100 : 100; let html = '';
    for(let i=0; i<(c*r); i++) {
        let ex = ''; if (pType === 'v' && (i%c) === pPos) ex += 'border-right: 3px solid #ef4444 !important; z-index: 10; '; else if (pType === 'h' && Math.floor(i/c) === pPos) ex += 'border-bottom: 3px solid #ef4444 !important; z-index: 10; ';
        html += `<div class="panel" style="${ex}"></div>`;
    }
    el.style.display='grid'; el.style.gridTemplateColumns=`repeat(${Math.max(1,c)}, 1fr)`; el.style.width=`${wp}%`; el.innerHTML=html;
}

function processTankData() {
    try {
        let u = getVal('unitChoice') || 'ft'; let factor = u === 'ft' ? 4 : (u === 'm_122' ? 1.22 : 1);
        window.currentUnit = u;
        let pSfx = u === 'ft' ? " (4'x4')" : (u === 'm_122' ? " (1.22x1.22m)" : " (1x1m)");
        let totalC = 0, totalP = 0, totalW = 0, totalBase = 0;
        let soTableHtml = "";
        let soIdx = 1;

        appTanks.forEach((t, i) => {
            t.effLiters = ((u === 'ft') ? (t.L * t.W * t.H * 28.3168) : (t.L * t.W * t.H * 1000)) * 0.9; 
            totalC += t.effLiters;
            const L = Math.round(t.L / factor); const W = Math.round(t.W / factor); const H = Math.round(t.H / factor);
            const pL = Math.round(t.partL / factor); const pH = Math.round(t.partH / factor); const pPosIdx = Math.max(0, t.partPos - 1);
            let r=L*W, b=L*W, pm=(L+W)*2, s=pm*H, pp=(t.partChoice==='yes'&&t.partQty>0)?(pL*pH*t.partQty):0;
            t.totalPanels = r + b + s + pp; totalP += t.totalPanels;

            let walls = `L1 : ${t.tW1}`; if (H >= 2) walls += ` | L2 : ${t.tW2}`; if (H >= 3) walls += ` | L3 : ${t.tW3}`; if (H >= 4) walls += ` | L4 : ${t.tW4}`;
            let extLadStr = t.bom[3] && t.bom[3].items[0] && t.bom[3].items[0].qty > 0 ? t.bom[3].items[0].qty : 0;
            let intLadStr = t.bom[3] && t.bom[3].items[1] && t.bom[3].items[1].qty > 0 ? t.bom[3].items[1].qty : 0;
            let wliStr = t.bom[3] && t.bom[3].items[2] && t.bom[3].items[2].qty > 0 ? t.bom[3].items[2].qty : 0;
            let partStr = (t.partChoice === 'yes' && t.partQty > 0) ? `<tr><td style="width:140px; padding:0;">Partition</td><td style="padding:0;">: ${t.partQty}x ${t.partType} (${t.partL}${u} x ${t.partH}${u})</td></tr>` : '';

            soTableHtml += `<tr class="avoid-break"><td style="border:1px solid #000; text-align:center; padding:8px 5px;">${soIdx++}</td><td style="border:1px solid #000; padding:8px 5px;"><strong>Tank Size: ${t.override || t.L+u+'(L)x'+t.W+u+'(W)x'+t.H+u+'(H)'}</strong><br><div style="margin-left: 5px; margin-top: 5px;"><table style="border:none; width:100%; font-size:9pt; line-height: 1.4;"><tr><td style="width:140px; padding:0;">Roof</td><td style="padding:0;">: ${t.tRoof}</td></tr><tr><td style="padding:0;">Base</td><td style="padding:0;">: ${t.tBase}</td></tr><tr><td style="padding:0;">Wall</td><td style="padding:0;">: ${walls}</td></tr>${partStr}<tr><td style="padding:0;">Ladder</td><td style="padding:0;">: Int - ${intLadStr} / Ext - ${extLadStr}</td></tr><tr><td style="padding:0;">WLI</td><td style="padding:0;">: ${wliStr} set</td></tr><tr><td style="padding:0;">Accessories</td><td style="padding:0;">: Foam Tape, Bolts, Nuts, Washers</td></tr></table></div></td><td style="border:1px solid #000; text-align:center;">set</td><td style="border:1px solid #000; text-align:center;">1</td></tr>`;

            let pTT=null, pPT=-1, pTF=null, pPF=-1, pTS=null, pPS=-1;
            if (t.partChoice==='yes' && t.partQty>0) { if (pL===W) { pTT='v'; pPT=Math.min(L-2,pPosIdx); pTF='v'; pPF=Math.min(L-2,pPosIdx); } else if (pL===L) { pTT='h'; pPT=Math.min(W-2,pPosIdx); pTS='v'; pPS=Math.min(W-2,pPosIdx); } else { pTT='v'; pPT=Math.min(L-2,pPosIdx); pTF='v'; pPF=Math.min(L-2,pPosIdx); } }
            const mx = Math.max(L, W, H);
            drawGrid(`grid_top_s_${i}`,L,W,mx,pTT,pPT); drawGrid(`grid_top_p_${i}`,L,W,mx,pTT,pPT); drawGrid(`grid_top_c_${i}`,L,W,mx,pTT,pPT);
            drawGrid(`grid_bot_s_${i}`,L,W,mx,pTT,pPT); drawGrid(`grid_bot_p_${i}`,L,W,mx,pTT,pPT); drawGrid(`grid_bot_c_${i}`,L,W,mx,pTT,pPT);
            drawGrid(`grid_fr_s_${i}`,L,H,mx,pTF,pPF); drawGrid(`grid_fr_p_${i}`,L,H,mx,pTF,pPF); drawGrid(`grid_fr_c_${i}`,L,H,mx,pTF,pPF);
            drawGrid(`grid_bk_s_${i}`,L,H,mx,pTF,pPF); drawGrid(`grid_bk_p_${i}`,L,H,mx,pTF,pPF); drawGrid(`grid_bk_c_${i}`,L,H,mx,pTF,pPF);
            drawGrid(`grid_lt_s_${i}`,W,H,mx,pTS,pPS); drawGrid(`grid_lt_p_${i}`,W,H,mx,pTS,pPS); drawGrid(`grid_lt_c_${i}`,W,H,mx,pTS,pPS);
            drawGrid(`grid_rt_s_${i}`,W,H,mx,pTS,pPS); drawGrid(`grid_rt_p_${i}`,W,H,mx,pTS,pPS); drawGrid(`grid_rt_c_${i}`,W,H,mx,pTS,pPS);

            let bQ=(sI,iI,v)=>t.bom[sI].items[iI].qty=isNaN(v)?0:v;
            let bD=(sI,iI,v)=>t.bom[sI].items[iI].name=v;
            if(t.bom[0]) {
                bD(0,0,"Manhole Panel"+pSfx); bD(0,1,t.tRoof+" Roof Panel"+pSfx); bD(0,2,t.tBase+" Base Panel"+pSfx); bD(0,3,t.tW1+" Wall Panel (L1)"+pSfx); bD(0,4,t.tW2+" Wall Panel (L2)"+pSfx); bD(0,5,t.tW3+" Wall Panel (L3)"+pSfx); bD(0,6,t.tW4+" Wall Panel (L4)"+pSfx); bD(0,7,"Partition Panel"+pSfx);
                bQ(0,0,r>0?1:0); bQ(0,1,Math.max(0,r-1)); bQ(0,2,b); bQ(0,3,H>=1?pm:0); bQ(0,4,H>=2?pm:0); bQ(0,5,H>=3?pm:0); bQ(0,6,H>=4?pm*(H-3):0); bQ(0,7,pp);
            }
            if(t.bom[1]) { bQ(1,0,H*4); bQ(1,1,pm); bQ(1,2,pm); bQ(1,3,t.L); bQ(1,4,t.L); }
            if(t.bom[2]) { bQ(2,0,H>=1?pm:0); bQ(2,1,H>=2?pm:0); bQ(2,2,H>=3?pm:0); bQ(2,3,H>=4?pm*(H-3):0); }
            if(t.bom[3]) { bQ(3,0,t.H); bQ(3,1,t.H); bQ(3,2,(u!=='ft')?t.H:1); bQ(3,3,1); let sP=(u==='ft')?4.88:4.0; let bP=(u==='ft')?16:12; bQ(3,4,Math.ceil(((r+b+s+pp)*sP)/15)); bQ(3,5,Math.ceil((r+b+s+pp)*bP*1.05)); }
            
            t.baseCost=0; t.weight=0;
            t.bom.forEach((sec, sIdx) => sec.items.forEach((it, iIdx) => { 
                let isSvc=(sec.category==="Services"); 
                
                // THIS IS THE RESTORED SYNC LOGIC
                let qEl = document.getElementById(`t_${i}_q_${sIdx}_${iIdx}`);
                if(qEl && document.activeElement !== qEl && !isSvc) qEl.value = it.qty;
                let nEl = document.getElementById(`t_${i}_n_${sIdx}_${iIdx}`);
                if(nEl && document.activeElement !== nEl) nEl.value = it.name;
                // END SYNC LOGIC

                let calcQty=isSvc?1:it.qty; let lTot=calcQty*(it.def||0); 
                t.baseCost+=lTot; t.weight+=isSvc?0:(calcQty*(it.wt||0));
                let te=document.getElementById(`tot_${i}_${sIdx}_${iIdx}`); if(te) te.innerText=lTot.toLocaleString('en-MY',{minimumFractionDigits:2});
            }));
            totalW+=t.weight; totalBase+=t.baseCost;
        });

        appCustomItems.forEach(c => { 
            totalBase+=(c.cost*(c.qty||0)); 
            soTableHtml+=`<tr class="avoid-break"><td style="border:1px solid #000; text-align:center;">${soIdx++}</td><td style="border:1px solid #000; padding:8px 5px;"><strong>${c.desc}</strong></td><td style="border:1px solid #000; text-align:center;">unit</td><td style="border:1px solid #000; text-align:center;">${c.qty||0}</td></tr>`;
        });
        setHtml('so_table_body', soTableHtml);

        let mkp=getNum('markupPct'); let mkAmt=totalBase*(mkp/100); let sub=totalBase+mkAmt; 
        let dsc=getNum('discountPct'); let dscAmt=sub*(dsc/100); let net=sub-dscAmt;
        let sst=getNum('sstPct'); let sstAmt=net*(sst/100); let grand=net+sstAmt;

        const setM=(ids,v)=>ids.forEach(id=>setTxt(id,v));
        setM(['sumPanels_screen','sumPanels_print'],totalP); setM(['sumCapacity_screen','sumCapacity_print'],isNaN(totalC)?"0 L":totalC.toLocaleString('en-MY',{maximumFractionDigits:0})+" L");
        setM(['sumBaseCost_screen','sumBaseCost_print'],totalBase.toLocaleString('en-MY',{minimumFractionDigits:2}));
        setM(['sumMarkup_screen','sumMarkup_print'],mkAmt.toLocaleString('en-MY',{minimumFractionDigits:2}));
        setM(['sumSubtotal_screen','sumSubtotal_print'],sub.toLocaleString('en-MY',{minimumFractionDigits:2}));
        setM(['sumDiscount_screen','sumDiscount_print'],dscAmt.toLocaleString('en-MY',{minimumFractionDigits:2}));
        setM(['sumSST_screen','sumSST_print'],sstAmt.toLocaleString('en-MY',{minimumFractionDigits:2}));
        setM(['grandTotal_screen','grandTotal_print','cpGrandTotal'],grand.toLocaleString('en-MY',{minimumFractionDigits:2}));
        setM(['sumWeight_screen','sumWeight_print'],totalW.toLocaleString('en-MY',{maximumFractionDigits:1})+" kg");

        let globalRef=totalBase===0?1:totalBase; let cpRows=""; let cpIdx=1;
        appTanks.forEach((t, i) => {
            let trPct=t.baseCost/globalRef; let trFinal=net*trPct; t.finalPrice=trFinal;
            let dStr=t.override||`${t.L}${u}(L)x${t.W}${u}(W)x${t.H}${u}(H)`;
            let pStr=(t.partChoice==='yes'&&t.partQty>0)?`<tr style="border:none;"><td style="border:none; vertical-align:top;">d)</td><td style="border:none; vertical-align:top;" colspan="3">Partition: ${t.partQty}x ${t.partType} (${t.partL}${u}x${t.partH}${u})</td></tr>`:'';
            let extLadStr=t.bom[3]&&t.bom[3].items[0]?`${t.bom[3].items[0].selVal} External - ${t.bom[3].items[0].qty} sets`:'';
            let intLadStr=t.bom[3]&&t.bom[3].items[1]?`${t.bom[3].items[1].selVal} Internal - ${t.bom[3].items[1].qty} sets`:'';
            let wliStr=t.bom[3]&&t.bom[3].items[2]?`${t.bom[3].items[2].selVal} - ${t.bom[3].items[2].qty} sets`:'';
            cpRows += `<tr class="avoid-break"><td style="text-align:center; border:1px solid #000;">${cpIdx++}</td><td style="border:1px solid #000; padding:6px; vertical-align:top;"><strong>Supply and Install ${t.coat} Tank Size:<br>${dStr} (Total: ${t.totalPanels} Pcs)</strong><br>Comply to ${t.std}<br><table style="border:none; width:100%; font-size:8.5pt;"><tr style="border:none;"><td style="width:20px; border:none; vertical-align:top;">a)</td><td style="width:75px; border:none; vertical-align:top;">Thickness:</td><td style="width:50px; border:none; vertical-align:top;">Roof</td><td style="border:none; vertical-align:top;">: ${t.tRoof}</td></tr><tr style="border:none;"><td style="border:none; vertical-align:top;"></td><td style="border:none; vertical-align:top;"></td><td style="border:none; vertical-align:top;">Base</td><td style="border:none; vertical-align:top;">: ${t.tBase}</td></tr><tr style="border:none;"><td style="border:none; vertical-align:top;"></td><td style="border:none; vertical-align:top;"></td><td style="border:none; vertical-align:top;">Wall</td><td style="border:none; vertical-align:top;">: L1:${t.tW1}|L2:${t.tW2}|L3:${t.tW3}|L4:${t.tW4}</td></tr><tr style="border:none;"><td style="border:none; vertical-align:top;">b)</td><td style="border:none; vertical-align:top;" colspan="3">Ladders: ${intLadStr}<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${extLadStr}</td></tr><tr style="border:none;"><td style="border:none; vertical-align:top;">c)</td><td style="border:none; vertical-align:top;" colspan="3">WLI: ${wliStr}</td></tr>${pStr}<tr style="border:none;"><td style="border:none; vertical-align:top;">${pStr?'e)':'d)'}</td><td style="border:none; vertical-align:top;" colspan="3">Tank to sit on existing Beam/RC plinths</td></tr></table></td><td style="text-align:center; border:1px solid #000;">1</td><td style="text-align:right; border:1px solid #000; padding:6px;">${trFinal.toLocaleString('en-MY',{minimumFractionDigits:2})}</td></tr>`;
        });
        appCustomItems.forEach(c => {
            let trPct=(c.cost*(c.qty||0))/globalRef; let trFinal=net*trPct;
            cpRows += `<tr class="avoid-break"><td style="text-align:center; border:1px solid #000;">${cpIdx++}</td><td style="border:1px solid #000; padding:6px; vertical-align:top;"><strong>${c.desc}</strong></td><td style="text-align:center; border:1px solid #000;">${c.qty||0}</td><td style="text-align:right; border:1px solid #000; padding:6px;">${trFinal.toLocaleString('en-MY',{minimumFractionDigits:2})}</td></tr>`;
        });
        setHtml('cpDynamicTanksBody', cpRows);
        setTxt('cpSstPct', sst||0); setTxt('cpSstAmt', sstAmt.toLocaleString('en-MY',{minimumFractionDigits:2}));
        
        let chkBomHtml = ``;
        appTanks.forEach((t, i) => {
            chkBomHtml += `<div class="avoid-break"><div style="font-weight:bold; background:#e2e8f0; padding:4px 8px; margin-top:10px; border:1px solid #000; border-bottom:none;">TANK ${i+1} : ${t.override || t.L+u+'x'+t.W+u+'x'+t.H+u}</div><table style="width:100%; border-collapse:collapse; font-size:8.5pt; border:1px solid #000; margin-bottom:15px;"><thead><tr style="background:#d1d5db;"><th style="border:1px solid #000; padding:4px; text-align:center; width:8%;">Item</th><th style="border:1px solid #000; padding:4px; text-align:left; width:72%;">Description</th><th style="border:1px solid #000; padding:4px; text-align:center; width:20%;">Qty</th></tr></thead><tbody>`;
            let idx = 1; t.bom.forEach((sec) => { if (sec.category === "Services") return; let hasItems = false; let rows = ''; sec.items.forEach((it) => { let q = it.qty || 0; if (q > 0) { hasItems = true; let desc = it.name; if (it.selectId && it.selVal) desc += ` (${it.selVal})`; rows += `<tr class="avoid-break"><td style="border:1px solid #000; padding:4px; text-align:center;">${idx++}</td><td style="border:1px solid #000; padding:4px;"><strong>[${sec.category}]</strong> ${desc}</td><td style="border:1px solid #000; padding:4px; text-align:center; font-weight:bold;">${q}</td></tr>`; } }); if (hasItems) chkBomHtml += rows; }); chkBomHtml += `</tbody></table></div>`;
        });
        if (appCustomItems.length > 0) {
            chkBomHtml += `<div class="avoid-break"><div style="font-weight:bold; background:#e2e8f0; padding:4px 8px; margin-top:10px; border:1px solid #000; border-bottom:none;">CUSTOM ITEMS</div><table style="width:100%; border-collapse:collapse; font-size:8.5pt; border:1px solid #000; margin-bottom:15px;"><thead><tr style="background:#d1d5db;"><th style="border:1px solid #000; padding:4px; text-align:center; width:8%;">Item</th><th style="border:1px solid #000; padding:4px; text-align:left; width:72%;">Description</th><th style="border:1px solid #000; padding:4px; text-align:center; width:20%;">Qty</th></tr></thead><tbody>`;
            let idx = 1; appCustomItems.forEach((c) => { chkBomHtml += `<tr class="avoid-break"><td style="border:1px solid #000; padding:4px; text-align:center;">${idx++}</td><td style="border:1px solid #000; padding:4px;">${c.desc}</td><td style="border:1px solid #000; padding:4px; text-align:center; font-weight:bold;">${c.qty || 0}</td></tr>`; }); chkBomHtml += `</tbody></table></div>`;
        }
        setHtml('dynamicChecklistBomContainer', chkBomHtml);
        syncPrintHeader(u);
        setTxt('so_customer', getVal('custCompany') || getVal('projectName')); setTxt('so_project', getVal('projectName')); setTxt('so_custpo', getVal('custPoNo')); setTxt('so_projno', getVal('quoteIdInput')); setTxt('so_deldate', getVal('custDelDate'));
        setTxt('so_std', [...new Set(appTanks.map(t=>t.std))].join(', ') || '-'); setTxt('so_part', appTanks.some(t => t.partChoice === 'yes') ? 'YES' : 'NO'); setTxt('so_material', [...new Set(appTanks.map(t=>t.coat))].join(', ')); setTxt('so_totpanels', totalP);
    } catch(e) { console.error(e); }
}

function syncPrintHeader(u) {
    setTxt('metaQuoteId', getVal('quoteIdInput') || "N/A"); setTxt('metaProject', getVal('projectName') || "_____________________"); 
    setTxt('metaDims', appTanks.map((t,i) => `T${i+1}: ${t.override || t.L+u+'x'+t.W+u+'x'+t.H+u}`).join(' | ')); 
    setTxt('metaCoat', [...new Set(appTanks.map(t=>t.coat))].join(', ')); setTxt('metaStd', appTanks.length>0 ? appTanks[0].std : '-'); 
    setTxt('metaPart', appTanks.filter(t=>t.partChoice==='yes').map((t,i)=>`T${i+1}: ${t.partQty}x${t.partType}`).join(' | ') || 'None');
    setTxt('cpCustName', getVal('custCompany') || getVal('projectName') || "Client"); document.getElementById('cpCustAddress').innerHTML = (getVal('custAddr') || '').replace(/\n/g, '<br>'); setTxt('cpAttention', getVal('custAttn')); setTxt('cpProject', getVal('projectName')); setTxt('cpRef', getVal('quoteIdInput'));
    document.getElementById('cpShortExclusionsText').innerHTML = (getVal('shortExclusions') || '').replace(/\n/g, '<br>'); document.getElementById('cpFullTermsText').innerHTML = getVal('fullTermsNotes') || '';
    let ls = (v) => `<span style="border-bottom: 1px solid #000; display: inline-block; width: 100%; margin-bottom: 3px;">${v}</span>`;
    document.getElementById('cpValidity').innerHTML = ls(getVal('tcValidity')); document.getElementById('cpPayment').innerHTML = (getVal('tcPayment')||'').split('\n').filter(l=>l.trim()!=='').map(l=>ls(l)).join(''); document.getElementById('cpDeliveryTerm').innerHTML = ls(getVal('tcDelivery')); document.getElementById('cpLeadTime').innerHTML = ls(getVal('tcLead')); setTxt('cpSignName', getVal('signName')); setTxt('intSigSales', getVal('signName')); setTxt('cpSignPhone', getVal('signPhone')); 
    setBox('box_local', getVal('marketChoice') === 'local'); setBox('box_export', getVal('marketChoice') === 'export'); 
}

function initInventory() {
    systemBaseStructure.forEach(sec => sec.items.forEach(it => { let bn = it.name.replace(/ \(1x1m\)| \(1\.22x1\.22m\)| \(4'x4'\)/g, ''); if(!winkoInventory[bn]) winkoInventory[bn] = { stock: 0, alert: 10 }; }));
    const presets = { "Base Panel":344, "Wall Panel (L1)":344, "Wall Panel (L2)":407, "Wall Panel (L3)":407, "Wall Panel (L4)":119, "Manhole Panel":200, "Roof Panel":186, "Partition Panel":50, "Type A Cleat":297, "Type B Cleat":130, "Type C Cleat":500, "44 1/4\" (L1 Stay)":76, "67\" (L2 Stay)":262, "11' 3\" (L3 Stay)":96, "15' 8.5\" (L4 Stay)":40, "Air Vent":48, "Mastic Sealant (Rolls)":89, "Bolt & Nut Sets":72, "Water Level Indicator":25, "Ext. Ladder":15, "Int. Ladder":15 }; let updated = false; Object.keys(presets).forEach(k => { if(winkoInventory[k] && winkoInventory[k].stock === 0) { winkoInventory[k].stock = presets[k]; updated = true; } }); if(updated) localStorage.setItem('winkoInventoryDB', JSON.stringify(winkoInventory));
}
let winkoInventory = {}; try { winkoInventory = JSON.parse(localStorage.getItem('winkoInventoryDB')) || {}; } catch(e) { winkoInventory = {}; }
function renderInventoryTable() { let html = ''; Object.keys(winkoInventory).sort().forEach(k => { let d = winkoInventory[k]; let st = ''; let rc = ''; if(d.stock <= 0) st = '<span class="inv-status inv-out">OUT</span>'; else if (d.stock <= d.alert) st = '<span class="inv-status inv-low">LOW</span>'; else st = '<span class="inv-status inv-ok">OK</span>'; let sId = k.replace(/[^a-zA-Z0-9]/g, ''); html += `<tr class="${rc}"><td style="font-weight:700;">${k} ${st}</td><td class="text-center"><input type="number" class="inv-input" id="inv_stock_${sId}" value="${d.stock}"></td><td class="text-center"><input type="number" class="inv-input" id="inv_alert_${sId}" value="${d.alert}"></td></tr>`; }); setHtml('invBody', html); }
function saveInventory() { Object.keys(winkoInventory).forEach(k => { let sId = k.replace(/[^a-zA-Z0-9]/g, ''); winkoInventory[k].stock = getNum(`inv_stock_${sId}`); winkoInventory[k].alert = getNum(`inv_alert_${sId}`); }); localStorage.setItem('winkoInventoryDB', JSON.stringify(winkoInventory)); alert("Stock updated."); renderInventoryTable(); }
function deductInventoryFromSO() { if(!confirm("Deduct stock?")) return; appTanks.forEach(t => { t.bom.forEach(s => s.items.forEach(it => { if(s.category === "Services") return; if(it.qty > 0) { let bn = it.name.replace(/ \(1x1m\)| \(1\.22x1\.22m\)| \(4'x4'\)/g, ''); if(winkoInventory[bn]) winkoInventory[bn].stock -= it.qty; } })); }); localStorage.setItem('winkoInventoryDB', JSON.stringify(winkoInventory)); alert(`Deducted.`); }

function buildAdminTable() { let h = ''; systemBaseStructure.forEach((sec, sIdx) => { sec.items.forEach((it, iIdx) => { h += `<tr><td style="font-weight:800; background:#f1f5f9; text-align:left;">${sec.category}</td><td><input type="text" class="admin-input text-left" id="adm_name_${sIdx}_${iIdx}" value="${it.name}"></td><td><input type="number" step="0.1" class="admin-input" id="adm_wt_${sIdx}_${iIdx}" value="${it.wt || 0}"></td><td><input type="number" step="0.01" class="admin-input" id="adm_price_${sIdx}_${iIdx}" value="${it.def.toFixed(2)}"></td></tr>`; }); }); setHtml('adminBody', h); }
function saveAdminDefaults() { let nd = JSON.parse(JSON.stringify(systemBaseStructure)); nd.forEach((sec, sIdx) => { sec.items.forEach((it, iIdx) => { it.name = getVal(`adm_name_${sIdx}_${iIdx}`); it.wt = getNum(`adm_wt_${sIdx}_${iIdx}`); it.def = getNum(`adm_price_${sIdx}_${iIdx}`); }); }); localStorage.setItem('winkoMasterDefaults', JSON.stringify(nd)); alert("Success!"); location.reload(); }

function savePrices() { let d = { tanks: appTanks, custom: appCustomItems }; configIDs.forEach(id => d[id] = getVal(id)); localStorage.setItem('winkoProDataV103', JSON.stringify(d)); }
function loadPrices() { let s = localStorage.getItem('winkoProDataV103'); if(s) { let d = JSON.parse(s); configIDs.forEach(id => { if(d[id]!==undefined) setVal(id, d[id]); }); appTanks = d.tanks || []; appCustomItems = d.custom || []; } else appTanks = [defaultTank()]; renderAllDynamicUI(); processTankData(); }

function refreshMemoryDropdown() { let m = JSON.parse(localStorage.getItem('winkoMemoryBank')) || {}; let s = document.getElementById('memoryDropdown'); if(s) { s.innerHTML = '<option value="">-- Load Saved Project --</option>'; Object.keys(m).forEach(k => { s.innerHTML += `<option value="${k}">${k}</option>`; }); } }
function saveToMemory() { let p = getVal('projectName').trim(); if(!p) return; let d = { tanks: appTanks, custom: appCustomItems }; configIDs.forEach(id => d[id] = getVal(id)); let m = JSON.parse(localStorage.getItem('winkoMemoryBank')) || {}; m[p] = d; localStorage.setItem('winkoMemoryBank', JSON.stringify(m)); alert("Saved."); refreshMemoryDropdown(); }
function loadFromMemory() { let p = getVal('memoryDropdown'); if(!p) return; let m = JSON.parse(localStorage.getItem('winkoMemoryBank')) || {}; let d = m[p]; if (d) { appTanks = d.tanks || []; appCustomItems = d.custom || []; configIDs.forEach(id => { if (d[id] !== undefined) setVal(id, d[id]); }); renderAllDynamicUI(); processTankData(); } }
function deleteFromMemory() { let p = getVal('memoryDropdown'); if(p && confirm("Delete?")) { let m = JSON.parse(localStorage.getItem('winkoMemoryBank')) || {}; delete m[p]; localStorage.setItem('winkoMemoryBank', JSON.stringify(m)); refreshMemoryDropdown(); } }

function printInternal() { document.body.className = 'print-internal'; syncPrintHeader(window.currentUnit||'ft'); setTimeout(() => window.print(), 300); }
function printCustomer() { document.body.className = 'print-customer'; syncPrintHeader(window.currentUnit||'ft'); setTimeout(() => window.print(), 300); }
function printCustomerFromPreview() { document.body.className = 'print-customer'; setTimeout(() => window.print(), 300); }
function printChecklist() { document.body.className = 'print-checklist'; syncPrintHeader(window.currentUnit||'ft'); setTimeout(() => { window.print(); setTimeout(deductInventoryFromSO, 1000); }, 300); }

window.addEventListener('afterprint', () => { document.body.className = ''; });
setInterval(() => { let d = new Date(); let s = d.toLocaleDateString('en-MY').replace(/\//g, '-'); setTxt('liveClock', s + " " + d.toLocaleTimeString('en-MY')); setTxt('metaDate', s); setTxt('cpDate', s); }, 1000);

function exportCSV() {
    let csv = "\uFEFFWINKO ERP EXPORT\n\n";
    csv += `"Quote No:","${getVal('quoteIdInput')}"\n"Project:","${getVal('projectName')}"\n\n`;
    appTanks.forEach((t, i) => {
        csv += `TANK ${i+1}\nCategory,Description,Qty,Wt,Price,Total\n`;
        t.bom.forEach((s) => s.items.forEach((it) => { let q = (s.category==="Services")?1:it.qty; if(q>0) csv += `"${s.category}","${it.name}",${q},${it.wt},${it.def},${(q*(it.def||0))}\n`; }));
    });
    const a = document.createElement('a'); a.href = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); a.download = `Winko_Quote_${getVal('quoteIdInput')}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
