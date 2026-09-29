// --- DATA ---
const platformPrices = {
    single: { name: 'Single App', tiers: { standard: { name: 'Standard', price: 11014.80 }, premium: { name: 'Premium', price: 22029.60 } } },
    multi: { name: 'Multi App', tiers: { standard: { name: 'Standard', price: 27536.88 }, premium: { name: 'Premium', price: 55073.88 } } }
};
const userTiers = {
    'internal-single': { name: 'Interne Users (Single)', tiers: [{ limit: 500, price: 137.04 }, { limit: 5000, price: 13.68 }, { limit: 50000, price: 1.44 }, { limit: 500000, price: 0.24 }, { limit: Infinity, price: 0.12 }] },
    'internal-multi': { name: 'Interne Users (Multi)', tiers: [{ limit: 500, price: 345.24 }, { limit: 5000, price: 207.60 }, { limit: 50000, price: 69.00 }, { limit: 500000, price: 26.40 }, { limit: Infinity, price: 13.20 }] },
    'external': { name: 'Externe Users', tiers: [{ limit: 500, price: 33.00 }, { limit: 5000, price: 8.16 }, { limit: 50000, price: 1.08 }, { limit: 500000, price: 0.24 }, { limit: Infinity, price: 0, capped: true, capLimit: 500000, capPrice: 203675.76 }] },
    'workstation': { name: 'Workstations', tiers: [{ limit: 50, price: 1006.08 }, { limit: 150, price: 804.84 }, { limit: 500, price: 603.60 }, { limit: 1500, price: 402.36 }, { limit: Infinity, price: 201.24 }] }
};
const cloudPacks = {
    standard: { name: 'Cloud Standard', sizes: { 'XS': 432, 'S': 864, 'M': 1728, 'L': 3456, 'XL': 6912, '2XL': 13824, '3XL': 27648, '4XL': 55296, '4XL-DB': 96786 } },
    premium: { name: 'Cloud Premium (HA)', sizes: { 'S': 1296, 'M': 2592, 'L': 5184, 'XL': 10368, '2XL': 20736, '3XL': 41472, '4XL': 82944, '4XL-DB': 145152 } },
    premiumPlus: { name: 'Cloud Premium Plus', sizes: { 'XL': 17280, '2XL': 34560, '3XL': 69120, '4XL': 138240, '4XL-DB': 241920 } }
};
const addons = { genai: { 'S': 1539.48, 'M': 3078.96, 'L': 6157.80 }, genaiKB: { 'standard': 2052.60 }, eventBroker: { 'S': 2605.20, 'M': 6512.88, 'L': 10854.84 }, auditTrail: { 'S': 3483.60, 'M': 6967.32, 'L': 11321.88 } };

// CORRECTED ACV Tiers
const acvTiers = [
    { limit: 80000, mta: 16650.12, mtaSize:'XS', qsm: 29169.24, qsmSize:'S' },
    { limit: 240000, mta: 33300.24, mtaSize:'S', qsm: 29169.24, qsmSize:'S' },
    { limit: 480000, mta: 66655.20, mtaSize:'M', qsm: 58338.36, qsmSize:'M' },
    { limit: 760000, mta: 100010.16, mtaSize:'L', qsm: 87507.60, qsmSize:'L' },
    { limit: 980000, mta: 133310.40, mtaSize:'XL', qsm: 116676.72, qsmSize:'XL' },
    { limit: 1500000, mta: 166720.20, mtaSize:'2XL', qsm: 145845.96, qsmSize:'2XL' },
    { limit: Infinity, mta: 186437.40, mtaSize:'3XL', qsm: 163164.72, qsmSize:'3XL' }
];

const pmpTiers = [
    { limit: 480000, price: 158760.36, size:'S' },
    { limit: 980000, price: 277830.60, size:'M' },
    { limit: 1500000, price: 396900.84, size:'L' },
    { limit: Infinity, price: 529201.08, size:'XL' }
];

// --- ELEMENTS ---
const els = {
    calcView: document.getElementById('calculator-view'), expView: document.getElementById('explanation-view'), resultCard: document.getElementById('result-card'),
    appType: document.getElementById('app-license-type'), tier: document.getElementById('platform-tier'),
    deployMode: document.getElementById('deployment-mode'),
    containers: { cloud: document.getElementById('deploy-cloud-container'), azure: document.getElementById('deploy-azure-container'), k8s: document.getElementById('deploy-k8s-container'), onprem: document.getElementById('deploy-onprem-container') },
    envContainer: document.getElementById('environments-container'), addEnvBtn: document.getElementById('add-env-btn'),
    total: document.getElementById('total-price'), breakdown: document.getElementById('calculation-breakdown'), 
    acvDisplay: document.getElementById('acv-indicator'), acvValue: document.getElementById('acv-value'),
    oneTimeCont: document.getElementById('onetime-container'), oneTimeVal: document.getElementById('onetime-price'), oneTimeDet: document.getElementById('onetime-details'),
    inputs: {
        intSingle: { c: document.getElementById('internal-single-count'), d: document.getElementById('internal-single-discount') },
        intMulti: { c: document.getElementById('internal-multi-count'), d: document.getElementById('internal-multi-discount') },
        ext: { c: document.getElementById('external-count'), d: document.getElementById('external-discount') },
        work: { c: document.getElementById('workstation-count'), d: document.getElementById('workstation-discount') },
        azureExtra: document.getElementById('azure-extra-envs'), k8sExtra: document.getElementById('k8s-extra-envs'), k8sUnl: document.getElementById('k8s-unlimited')
    },
    addons: { 
        genai: document.getElementById('genai-pack'), kb: document.getElementById('genai-kb'), broker: document.getElementById('event-broker'), audit: document.getElementById('audit-trail'), 
        mta: document.getElementById('addon-mta'), qsm: document.getElementById('addon-qsm'), qsmSelf: document.getElementById('addon-qsm-self'), pmp: document.getElementById('addon-pmp'),
        qsmSub: document.getElementById('qsm-sub-options')
    }
};

const formatMoney = (n) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);
const escapeHTML = (v) => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function init() {
    for(let k in platformPrices) els.appType.add(new Option(platformPrices[k].name, k));
    updatePlatformTiers();
    addEnvRow();
    renderExp();

    els.appType.onchange = updatePlatformTiers;
    els.deployMode.onchange = updateDeployUI;
    els.addEnvBtn.onclick = addEnvRow;
    document.getElementById('calculate-btn').onclick = calculate;
    
    // QSM Toggle Logic
    els.addons.qsm.addEventListener('change', (e) => {
        if(e.target.checked) els.addons.qsmSub.classList.remove('hidden');
        else {
            els.addons.qsmSub.classList.add('hidden');
            els.addons.qsmSelf.checked = false;
        }
    });

    document.getElementById('show-calculator-btn').onclick = () => setView('calc');
    document.getElementById('show-explanation-btn').onclick = () => setView('exp');
    document.querySelectorAll('.tab-btn').forEach(b => b.onclick = (e) => setTab(e.target));
    updateDeployUI();
}

function setView(v) {
    els.calcView.style.display = v==='calc'?'block':'none';
    els.resultCard.style.display = v==='calc'?'block':'none';
    els.expView.style.display = v==='exp'?'block':'none';
    document.getElementById('show-calculator-btn').className = `view-toggle-btn ${v==='calc'?'active':'inactive'} rounded-md`;
    document.getElementById('show-explanation-btn').className = `view-toggle-btn ${v==='exp'?'active':'inactive'} rounded-md`;
}

function setTab(target) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    target.classList.add('active');
    document.getElementById(target.dataset.tab).classList.remove('hidden');
}

function updateDeployUI() {
    const mode = els.deployMode.value;
    Object.values(els.containers).forEach(c => c.classList.add('hidden'));
    els.addEnvBtn.classList.add('hidden');
    document.getElementById('dedicated-banner').classList.add('hidden');

    if(mode === 'public_cloud' || mode === 'dedicated_cloud') {
        els.containers.cloud.classList.remove('hidden');
        els.addEnvBtn.classList.remove('hidden');
        if(mode === 'dedicated_cloud') document.getElementById('dedicated-banner').classList.remove('hidden');
    } else if (mode === 'azure') els.containers.azure.classList.remove('hidden');
    else if (mode === 'kubernetes') els.containers.k8s.classList.remove('hidden');
    else els.containers.onprem.classList.remove('hidden');
}

function updatePlatformTiers() {
    const type = els.appType.value;
    els.tier.innerHTML = '';
    for(let k in platformPrices[type].tiers) els.tier.add(new Option(`${platformPrices[type].tiers[k].name} (${formatMoney(platformPrices[type].tiers[k].price)})`, k));
}

function addEnvRow() {
    const div = document.createElement('div');
    div.className = 'grid grid-cols-12 gap-2 items-center mb-2';
    let typeSel = `<select class="input-field col-span-4 text-sm env-type">`;
    for(let k in cloudPacks) typeSel += `<option value="${k}">${cloudPacks[k].name}</option>`;
    typeSel += `</select>`;
    let sizeSel = `<select class="input-field col-span-4 text-sm env-size">`;
    for(let s in cloudPacks.standard.sizes) sizeSel += `<option value="${s}">${s} (${formatMoney(cloudPacks.standard.sizes[s])})</option>`;
    sizeSel += `</select>`;
    div.innerHTML = `${typeSel}${sizeSel}<div class="col-span-3"><input type="number" value="1" min="1" class="input-field text-sm env-qty"></div><button type="button" class="env-remove col-span-1 text-red-400 hover:text-red-600"><i class="fa-solid fa-trash"></i></button>`;
    div.querySelector('.env-type').addEventListener('change', (e) => updateSizeOptions(e.target));
    div.querySelector('.env-remove').addEventListener('click', () => div.remove());
    els.envContainer.appendChild(div);
}
function updateSizeOptions(el) {
    const sizeSel = el.nextElementSibling; sizeSel.innerHTML = '';
    const sizes = cloudPacks[el.value].sizes;
    for(let s in sizes) sizeSel.add(new Option(`${s} (${formatMoney(sizes[s])})`, s));
}

function calcTiered(count, tiers) {
    if(count<=0) return {cost:0, html:''};
    if(tiers.capped && count > tiers.capLimit) return { cost: tiers.capPrice, html: `<div class="flex justify-between text-xs text-yellow-600 bg-yellow-50 p-1 rounded"><span>Capped (> ${tiers.capLimit.toLocaleString()})</span><span>${formatMoney(tiers.capPrice)}</span></div>` };
    let rem = count, total = 0, lower = 1, html = '';
    for(let t of tiers.tiers) {
        if(rem<=0) break;
        let num = Math.min(rem, t.limit-lower+1);
        let cost = num * t.price;
        total += cost;
        html += `<div class="flex justify-between text-xs text-gray-500"><span>${num.toLocaleString()} x Staff ${t.limit===Infinity?'>'+(lower-1):'≤'+t.limit}</span><span>${formatMoney(cost)}</span></div>`;
        rem -= num; lower = t.limit+1;
    }
    return {cost: total, html};
}

function calculate() {
    let platformUsersTotal = 0; // ACV Base
    let cloudTotal = 0;
    let addonsTotal = 0;
    let oneTimeTotal = 0;
    let breakdownHTML = '';
    let oneTimeHTML = '';
    
    // 1. Platform (Part of ACV)
    const pt = platformPrices[els.appType.value].tiers[els.tier.value];
    platformUsersTotal += pt.price;
    breakdownHTML += itemHTML('Platform Licentie', `${platformPrices[els.appType.value].name} - ${pt.name}`, pt.price);

    // 2. Users (Part of ACV)
    let uTot = 0, uHtml = '';
    const uList = [
        {k:'internal-single', i:els.inputs.intSingle}, {k:'internal-multi', i:els.inputs.intMulti},
        {k:'external', i:els.inputs.ext}, {k:'workstation', i:els.inputs.work}
    ];
    uList.forEach(u => {
        let cnt = parseInt(u.i.c.value)||0;
        if(cnt>0) {
            let disc = parseFloat(u.i.d.value)||0;
            let res = calcTiered(cnt, userTiers[u.k]);
            let dCost = res.cost * (1 - disc/100);
            uTot += dCost;
            uHtml += `<div class="mt-2 border-l-2 border-indigo-100 pl-2"><div class="flex justify-between text-sm font-medium"><span>${userTiers[u.k].name} (${cnt})</span><span>${formatMoney(dCost)}</span></div>${res.html}${disc>0?`<div class="text-xs text-green-600 text-right">-${disc}% korting</div>`:''}</div>`;
        }
    });
    if(uTot>0) { platformUsersTotal += uTot; breakdownHTML += `<div class="py-2 border-b border-gray-100"><div class="font-semibold text-gray-800">Gebruikers</div>${uHtml}</div>`; }

    // CALC ACV BASE (Used for MTA/QSM/PMP Tiers)
    const acvBase = platformUsersTotal;
    els.acvDisplay.classList.remove('hidden'); els.acvValue.textContent = formatMoney(acvBase);

    // 3. Deployment (Excluded from ACV)
    const mode = els.deployMode.value;
    let dHtml = '';
    
    if(mode === 'public_cloud' || mode === 'dedicated_cloud') {
        if(mode === 'dedicated_cloud') { cloudTotal += 312612; dHtml += subItem('Dedicated Cloud Fee', 312612); }
        document.querySelectorAll('#environments-container > div').forEach(row => {
            let t = row.querySelector('.env-type').value, s = row.querySelector('.env-size').value, q = parseInt(row.querySelector('.env-qty').value)||0;
            if(q>0) { let c = cloudPacks[t].sizes[s]*q; cloudTotal += c; dHtml += subItem(`${q}x ${cloudPacks[t].name} (${s})`, c); }
        });
    } else if (mode === 'azure') {
        cloudTotal += 5566.32; dHtml += subItem('Azure Base Package', 5566.32);
        let ext = parseInt(els.inputs.azureExtra.value)||0;
        if(ext>0) { let c = ext*604.80; cloudTotal += c; dHtml += subItem(`${ext}x Extra Env`, c); }
    } else if (mode === 'kubernetes') {
        if(els.inputs.k8sUnl.checked) { cloudTotal += 58081.56; dHtml += subItem('K8s Unlimited Package', 58081.56); }
        else {
            cloudTotal += 5566.56; dHtml += subItem('K8s Base Package', 5566.56);
            let ext = parseInt(els.inputs.k8sExtra.value)||0;
            let envTiers = { tiers: [{limit:50, price:483.12}, {limit:100, price:357.12}, {limit:150, price:210.12}, {limit:Infinity, price:0}] };
            let res = calcTiered(ext, envTiers);
            if(res.cost>0) { cloudTotal += res.cost; dHtml += `<div class="mt-1 text-xs text-gray-600 pl-2 border-l border-gray-300"><div>Extra Envs (${ext})</div>${res.html}</div>`; }
        }
    } else if (mode === 'onprem') {
        let type = document.querySelector('input[name="onprem-type"]:checked').value;
        let c = type==='single'?5569.20:27833.28;
        cloudTotal += c; dHtml += subItem(`On-Prem (${type})`, c);
    }
    if(cloudTotal>0) { breakdownHTML += itemHTML('Deployment', dHtml, cloudTotal, true); }

    // 4. Addons
    let aHtml = '';
    const simpleAddons = [
        {el:els.addons.genai, data:addons.genai, n:'GenAI'}, {el:els.addons.kb, data:addons.genaiKB, n:'KB'},
        {el:els.addons.broker, data:addons.eventBroker, n:'Broker'}, {el:els.addons.audit, data:addons.auditTrail, n:'Audit'}
    ];
    simpleAddons.forEach(a => { if(a.el.value) { let c = a.data[a.el.value]; addonsTotal += c; aHtml += subItem(`${a.n} (${a.el.value})`, c); }});
    
    // ACV Addons
    if(els.addons.mta.checked) {
        let t = acvTiers.find(x=>acvBase<=x.limit)||acvTiers[acvTiers.length-1];
        addonsTotal += t.mta;
        aHtml += subItem(`MTA (${t.mtaSize})`, t.mta);
        oneTimeTotal += 8615;
        oneTimeHTML += `<div class="flex justify-between"><span>MTA Enablement Pkg</span><span>€8.615,00</span></div>`;
    }
    if(els.addons.qsm.checked) {
        let t = acvTiers.find(x=>acvBase<=x.limit)||acvTiers[acvTiers.length-1];
        addonsTotal += t.qsm;
        aHtml += subItem(`QSM (${t.qsmSize})`, t.qsm);
        oneTimeTotal += 8615;
        oneTimeHTML += `<div class="flex justify-between"><span>QSM Enablement Pkg</span><span>€8.615,00</span></div>`;

        // Handle QSM Self-Hosted
        if(els.addons.qsmSelf.checked) {
            if(acvBase <= 240000) {
                aHtml += `<div class="text-xs text-red-600 pl-2 italic">⚠️ Self-Hosted niet beschikbaar (ACV < €240k)</div>`;
            } else {
                addonsTotal += 52920;
                aHtml += subItem('QSM Self-Hosted Annual', 52920);
                oneTimeTotal += 20500;
                oneTimeHTML += `<div class="flex justify-between"><span>QSM Install Pkg</span><span>€20.500,00</span></div>`;
            }
        }
    }
    if(els.addons.pmp.checked) {
        let t = pmpTiers.find(x=>acvBase<=x.limit)||pmpTiers[pmpTiers.length-1];
        addonsTotal += t.price;
        aHtml += subItem(`PMP (${t.size})`, t.price);
        oneTimeHTML += `<div class="flex justify-between text-gray-500 italic"><span>PMP Implementation</span><span>(SoW)</span></div>`;
    }

    if(addonsTotal>0) { breakdownHTML += itemHTML('Add-ons (Jaarlijks)', aHtml, addonsTotal, true); }

    // Final Sum
    const grandTotal = platformUsersTotal + cloudTotal + addonsTotal;
    els.total.textContent = formatMoney(grandTotal);
    els.breakdown.innerHTML = breakdownHTML;

    // Handle One-Time
    if(oneTimeTotal > 0 || els.addons.pmp.checked) {
        els.oneTimeCont.classList.remove('hidden');
        els.oneTimeVal.textContent = formatMoney(oneTimeTotal);
        els.oneTimeDet.innerHTML = oneTimeHTML;
    } else {
        els.oneTimeCont.classList.add('hidden');
    }
}

function itemHTML(t,d,p,raw=false) { return `<div class="py-3 border-b border-gray-100 last:border-0"><div class="flex justify-between items-center mb-1"><span class="font-semibold text-gray-800">${escapeHTML(t)}</span><span class="font-bold text-gray-900">${formatMoney(p)}</span></div>${raw?d:`<div class="text-xs text-gray-500">${escapeHTML(d)}</div>`}</div>`; }
function subItem(n,p) { return `<div class="flex justify-between text-xs text-gray-600 mt-1"><span>${escapeHTML(n)}</span><span>${formatMoney(p)}</span></div>`; }

function renderExp() {
    let tbody = document.getElementById('table-users-body'), thead = document.getElementById('table-users-head');
    thead.innerHTML = `<tr><th>Staffel</th><th>Int. Single</th><th>Int. Multi</th><th>Extern</th></tr>`;
    let rows = '';
    userTiers['internal-single'].tiers.forEach((t,i) => {
        let lbl = t.limit===Infinity?`> ${userTiers['internal-single'].tiers[i-1].limit}`:`≤ ${t.limit}`;
        rows += `<tr><td>${lbl}</td><td>${formatMoney(t.price)}</td><td>${formatMoney(userTiers['internal-multi'].tiers[i].price)}</td><td>${formatMoney(userTiers['external'].tiers[i].price)}</td></tr>`;
    });
    tbody.innerHTML = rows;
    let cHtml = '';
    for(let k in cloudPacks) {
        cHtml += `<div class="rounded border border-gray-200"><div class="bg-gray-50 p-2 font-bold text-sm border-b">${cloudPacks[k].name}</div><table class="w-full pricing-table">`;
        for(let s in cloudPacks[k].sizes) cHtml += `<tr><td class="text-xs">${s}</td><td class="text-right text-xs">${formatMoney(cloudPacks[k].sizes[s])}</td></tr>`;
        cHtml += `</table></div>`;
    }
    document.getElementById('cloud-pricing-grid').innerHTML = cHtml;
}

init();
