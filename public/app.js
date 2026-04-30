// SmartKalk økonomiportal v7
const R={ordinaryTaxRate:.22,municipalRate:.1275,countyRate:.0265,stateCommonRate:.066,personDeduction:108550,salaryMinDeductionRate:.46,salaryMinDeductionMax:92000,employeeSocialSecurityRate:.077,socialSecurityBusinessRate:.109,socialSecurityLowerLimit:99650,socialSecurityRampRate:.25,stepTax:[{name:"Trinn 1",from:217400,to:306050,rate:.017},{name:"Trinn 2",from:306050,to:697150,rate:.04},{name:"Trinn 3",from:697150,to:942400,rate:.137},{name:"Trinn 4",from:942400,to:1410750,rate:.167},{name:"Trinn 5",from:1410750,to:Infinity,rate:.177}]};
const nok=new Intl.NumberFormat("no-NO",{style:"currency",currency:"NOK",maximumFractionDigits:0});const nf=new Intl.NumberFormat("no-NO",{maximumFractionDigits:1});const kr=v=>nok.format(Math.round(Number(v)||0));const pct=v=>`${nf.format((Number(v)||0)*100)} %`;const val=id=>Number(document.getElementById(id)?.value||0);const setVal=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v};const sum=(...a)=>a.reduce((x,y)=>x+(Number(y)||0),0);const minDed=s=>Math.min(Math.max(0,s)*R.salaryMinDeductionRate,R.salaryMinDeductionMax);
function stepTax(pi){let total=0,rows=[];for(const s of R.stepTax){const upper=s.to===Infinity?pi:Math.min(pi,s.to);const basis=Math.max(0,upper-s.from);const amount=basis*s.rate;if(basis>0){rows.push({label:s.name,basis,rate:s.rate,amount});total+=amount}}return{total,rows}}
function setToolMode(mode){const page=document.getElementById("kalkulatorer");if(!page)return;page.classList.toggle("private-mode",mode!=="business");page.classList.toggle("business-mode",mode==="business");const eyebrow=document.getElementById("toolPageEyebrow"),title=document.getElementById("toolPageTitle");if(eyebrow)eyebrow.textContent=mode==="business"?"Næring verktøy":"Private verktøy";if(title)title.textContent=mode==="business"?"Næring verktøy":"Private verktøy"}
function switchPage(id){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active-page",p.id===id));document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===id));location.hash=id;window.scrollTo({top:0,behavior:"smooth"})}
function switchTab(group,id){if(group==="calc")setToolMode(id==="selvstendig"?"business":"private");document.querySelectorAll(`[data-tab-group="${group}"]`).forEach(b=>b.classList.toggle("active",b.dataset.tab===id));document.querySelectorAll(`[data-tab-panel="${group}"]`).forEach(p=>p.classList.toggle("active-tab",p.id===`tab-${id}`));if(id==="selvstendig"&&!isPremium())setTimeout(openModal,120)}
function openPrivateTools(){setToolMode("private");switchPage("kalkulatorer");switchTab("calc","lonnskatt")}
function openBusinessTools(){setToolMode("business");switchPage("kalkulatorer");switchTab("calc","selvstendig")}
document.querySelectorAll("[data-page]").forEach(e=>e.addEventListener("click",()=>switchPage(e.dataset.page)));document.querySelectorAll("[data-tab-group]").forEach(e=>e.addEventListener("click",()=>switchTab(e.dataset.tabGroup,e.dataset.tab)));document.querySelectorAll("[data-page-link]").forEach(e=>e.addEventListener("click",ev=>{ev.preventDefault();switchPage(e.dataset.pageLink)}));document.querySelectorAll("[data-open-private]").forEach(e=>e.addEventListener("click",openPrivateTools));document.querySelectorAll("[data-open-business]").forEach(e=>e.addEventListener("click",openBusinessTools));document.querySelectorAll("[data-info-toggle]").forEach(btn=>btn.addEventListener("click",e=>{e.preventDefault();const wrap=btn.closest(".info-wrap");if(wrap)wrap.classList.toggle("open")}));
function empTax(){const gross=val("empGrossIncome"),cap=val("empCapitalIncome"),ded=sum(val("empTravelDeduction"),val("empInterestDeduction"),val("empIpsDeduction"),val("empUnionDeduction"),val("empChildcareDeduction"),val("empOtherDeduction")),md=minDed(gross),ord=Math.max(0,gross+cap-R.personDeduction-md-ded),mun=ord*R.municipalRate,cou=ord*R.countyRate,sta=ord*R.stateCommonRate,soc=gross*R.employeeSocialSecurityRate,st=stepTax(gross),tot=mun+cou+sta+soc+st.total,net=gross+cap-tot,eff=(gross+cap)>0?tot/(gross+cap):0;const rows=[["Skatt til kommune",ord,R.municipalRate,mun],["Skatt til fylkeskommune",ord,R.countyRate,cou],["Fellesskatt til staten",ord,R.stateCommonRate,sta],["Trygdeavgift lønn",gross,R.employeeSocialSecurityRate,soc],...st.rows.map(r=>[`Trinnskatt ${r.label}`,r.basis,r.rate,r.amount])];document.getElementById("employeeTaxResult").innerHTML=`<div class="kpi-grid"><div class="kpi"><span>Brutto inntekt</span><strong>${kr(gross)}</strong></div><div class="kpi"><span>Minstefradrag</span><strong>${kr(md)}</strong></div><div class="kpi"><span>Personfradrag</span><strong>${kr(R.personDeduction)}</strong></div><div class="kpi"><span>Skattbar alminnelig inntekt</span><strong>${kr(ord)}</strong></div><div class="kpi"><span>Trygdeavgift</span><strong>${kr(soc)}</strong></div><div class="kpi"><span>Trinnskatt</span><strong>${kr(st.total)}</strong></div><div class="kpi full"><span>Samlet skatt og avgifter</span><strong>${kr(tot)}</strong></div><div class="kpi"><span>Netto inntekt</span><strong>${kr(net)}</strong></div><div class="kpi"><span>Effektiv skatt</span><strong>${pct(eff)}</strong></div></div><div class="table-wrap"><table><thead><tr><th>Skatt / avgift</th><th>Grunnlag</th><th>Sats</th><th>Beløp</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td>${kr(r[1])}</td><td>${pct(r[2])}</td><td>${kr(r[3])}</td></tr>`).join("")}<tr><th>Total</th><th></th><th></th><th>${kr(tot)}</th></tr></tbody></table></div>`}
["empGrossIncome","empCapitalIncome","empTravelDeduction","empInterestDeduction","empIpsDeduction","empUnionDeduction","empChildcareDeduction","empOtherDeduction"].forEach(id=>document.getElementById(id).addEventListener("input",empTax));

const BIZ=["bizRevenue","bizSalary","bizCapitalIncome","bizCostEquipmentServices","bizCostPhoneInternet","bizCostRent","bizCostFoodTravel","bizCostRepresentation","bizCostTravelLodging","bizCostMileage","bizCostCarOther","bizCostSoftwareAds","bizCostEmployees","bizDedInterest","bizDedTravel","bizDedUnion","bizDedIps","bizDedChildcare","bizDedOther"];let latestBiz=null;function readBiz(){return Object.fromEntries(BIZ.map(id=>[id,val(id)]))}
function calcBiz(d){const costs=sum(d.bizCostEquipmentServices,d.bizCostPhoneInternet,d.bizCostRent,d.bizCostFoodTravel,d.bizCostRepresentation,d.bizCostTravelLodging,d.bizCostMileage,d.bizCostCarOther,d.bizCostSoftwareAds,d.bizCostEmployees),pDed=sum(d.bizDedInterest,d.bizDedTravel,d.bizDedUnion,d.bizDedIps,d.bizDedChildcare,d.bizDedOther),salMin=minDed(d.bizSalary),bizMin=0,result=Math.max(0,d.bizRevenue-costs),pi=Math.max(0,result+d.bizSalary),ord=Math.max(0,result+d.bizSalary+d.bizCapitalIncome-R.personDeduction-salMin-bizMin-pDed),mun=ord*R.municipalRate,cou=ord*R.countyRate,sta=ord*R.stateCommonRate,rawBizSoc=Math.max(0,result)*R.socialSecurityBusinessRate,rawSalarySoc=Math.max(0,d.bizSalary)*R.employeeSocialSecurityRate,rawSoc=rawBizSoc+rawSalarySoc,maxSoc=Math.max(0,(pi-R.socialSecurityLowerLimit)*R.socialSecurityRampRate),soc=rawSoc>0?Math.min(rawSoc,maxSoc):0,socFactor=rawSoc>0?soc/rawSoc:0,bizSoc=rawBizSoc*socFactor,salarySoc=rawSalarySoc*socFactor,st=stepTax(pi),total=mun+cou+sta+soc+st.total,income=result+d.bizSalary+d.bizCapitalIncome,net=income-total,eff=income>0?total/income:0,rows=[['Skatt til kommune',ord,R.municipalRate,mun],['Skatt til fylkeskommune',ord,R.countyRate,cou],['Fellesskatt til staten',ord,R.stateCommonRate,sta],['Trygdeavgift / folketrygd',result,R.socialSecurityBusinessRate,bizSoc],...(d.bizSalary>0?[['Trygdeavgift lønnsinntekt',d.bizSalary,R.employeeSocialSecurityRate,salarySoc]]:[]),...st.rows.map(r=>[`Trinnskatt ${r.label}`,r.basis,r.rate,r.amount])];return{input:d,costs,pDed,salMin,bizMin,result,pi,ord,mun,cou,sta,bizSoc,salarySoc,soc,step:st.total,total,income,net,eff,rows,createdAt:new Date().toISOString()}}
function renderBiz(){const r=latestBiz;document.getElementById("businessTaxResult").innerHTML=`<div class="kpi-grid"><div class="kpi"><span>Omsetning</span><strong>${kr(r.input.bizRevenue)}</strong></div><div class="kpi"><span>Minstefradrag lønn</span><strong>${kr(r.salMin)}</strong></div><div class="kpi"><span>Minstefradrag næring</span><strong>${kr(r.bizMin)}</strong></div><div class="kpi"><span>Skattbar alminnelig inntekt</span><strong>${kr(r.ord)}</strong></div><div class="kpi"><span>Trygdeavgift</span><strong>${kr(r.soc)}</strong></div><div class="kpi"><span>Trinnskatt</span><strong>${kr(r.step)}</strong></div><div class="kpi full"><span>Total estimert skatt</span><strong>${kr(r.total)}</strong></div><div class="kpi"><span>Personinntekt</span><strong>${kr(r.pi)}</strong></div><div class="kpi"><span>Netto etter skatt</span><strong>${kr(r.net)}</strong></div><div class="kpi"><span>Skattebuffer per måned</span><strong>${kr(r.total/12)}</strong></div></div>`;document.getElementById("businessPremiumReport").innerHTML=`<div class="report-grid"><div class="report-item"><span>Omsetning</span><strong>${kr(r.input.bizRevenue)}</strong></div><div class="report-item"><span>Næringskostnader</span><strong>− ${kr(r.costs)}</strong></div><div class="report-item"><span>Resultat næring</span><strong>${kr(r.result)}</strong></div><div class="report-item"><span>Personfradrag</span><strong>− ${kr(R.personDeduction)}</strong></div><div class="report-item"><span>Minstefradrag lønn</span><strong>− ${kr(r.salMin)}</strong></div><div class="report-item"><span>Minstefradrag næring</span><strong>− ${kr(r.bizMin)}</strong></div><div class="report-item"><span>Private fradrag</span><strong>− ${kr(r.pDed)}</strong></div><div class="report-item"><span>Total estimert skatt</span><strong>${kr(r.total)}</strong></div><div class="report-item"><span>Netto etter skatt</span><strong>${kr(r.net)}</strong></div></div><div class="table-wrap"><table><thead><tr><th>Skatt / mottaker</th><th>Grunnlag</th><th>Sats</th><th>Beløp</th></tr></thead><tbody>${r.rows.map(row=>`<tr><td>${row[0]}</td><td>${kr(row[1])}</td><td>${pct(row[2])}</td><td>${kr(row[3])}</td></tr>`).join("")}<tr><th>Total estimert skatt</th><th></th><th></th><th>${kr(r.total)}</th></tr></tbody></table></div>`;document.getElementById("businessDocChecklist").innerHTML=`<ul class="checklist"><li>Næringsoppstilling / oversikt over inntekter og kostnader</li><li>Fakturaer for inntekter</li><li>Kvitteringer og bilag for næringskostnader</li><li>Kontoutskrifter for næringskonto</li><li>Dokumentasjon for programvare, abonnement og regnskapskostnader</li>${r.input.bizDedInterest>0?"<li>Årsoppgave fra bank for renteutgifter</li>":""}${r.input.bizDedTravel>0?"<li>Oversikt over reiselengde, reisedager, bom og ferge</li>":""}${r.input.bizDedIps>0?"<li>Årsoppgave for IPS / pensjonssparing</li>":""}</ul>`}
function updateBiz(){latestBiz=calcBiz(readBiz());renderBiz()}BIZ.forEach(id=>document.getElementById(id).addEventListener("input",updateBiz));
function isPremium(){
  return localStorage.getItem("smartkalk_premium_199")==="true" || !!localStorage.getItem("smartkalk_premium_token");
}

function updatePremium(){
  document.body.classList.toggle("premium-unlocked",isPremium());
  const premiumStatus=document.getElementById("premiumStatus");
  if(premiumStatus){
    premiumStatus.textContent=isPremium()
      ? "Næringsverktøy er åpnet i denne nettleseren."
      : "Næringsverktøy er låst. Kjøp tilgang for å åpne næringsdelen.";
  }
}

function openModal(){document.getElementById("paywallModal").classList.remove("hidden")}
function closeModal(){document.getElementById("paywallModal").classList.add("hidden")}

async function startPremiumCheckout(){
  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ product: "okonomikalk_naering_199" })
    });

    if (!response.ok) {
      throw new Error("Kunne ikke starte betaling.");
    }

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
      return;
    }

    throw new Error("Mangler checkout-url.");
  } catch (error) {
    alert("Betaling er ikke konfigurert ennå. Start backend med Stripe-nøkler, eller bruk utviklermodus lokalt.");
  }
}

async function verifyCheckoutFromUrl(){
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");
  if (!sessionId) return;

  try {
    const response = await fetch(`/api/verify-session?session_id=${encodeURIComponent(sessionId)}`);
    if (!response.ok) throw new Error("Betaling kunne ikke verifiseres.");
    const data = await response.json();

    if (data.premium && data.token) {
      localStorage.setItem("smartkalk_premium_token", data.token);
      localStorage.setItem("smartkalk_premium_199", "true");
      if (data.licenseCode) localStorage.setItem("okonomikalk_license_code", data.licenseCode);
      updatePremium();
      closeModal();
      openBusinessTools();
      switchTab("biz", "bizskatt");

      params.delete("session_id");
      const cleanUrl = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}#kalkulatorer`;
      window.history.replaceState({}, document.title, cleanUrl);
      if (data.licenseCode) showLicenseNotice(data.licenseCode);
      else alert("Næringsverktøy er åpnet. Takk for kjøpet!");
    }
  } catch (error) {
    alert("Betaling ble gjennomført, men kunne ikke verifiseres automatisk. Prøv å laste siden på nytt.");
  }
}


function showLicenseNotice(licenseCode){
  let box=document.getElementById("licenseNotice");
  if(!box){
    box=document.createElement("div");
    box.id="licenseNotice";
    box.className="license-notice";
    document.body.appendChild(box);
  }
  box.innerHTML=`<div class="license-notice-card"><button class="modal-close" id="closeLicenseNotice" type="button">×</button><p class="eyebrow">Takk for kjøpet</p><h2>Næringsverktøy er åpnet</h2><p>Ta vare på lisenskoden. Den kan brukes for å åpne næringsverktøy på mobil, nettbrett eller en annen nettleser.</p><input class="license-code-output" readonly value="${licenseCode}"><div class="form-actions"><button class="btn primary" id="copyLicenseCode" type="button">Kopier lisenskode</button><button class="btn ghost" id="continueAfterLicense" type="button">Fortsett</button></div><p class="fineprint">Koden lagres også lokalt i denne nettleseren.</p></div>`;
  box.classList.remove("hidden");
  document.getElementById("closeLicenseNotice").addEventListener("click",()=>box.classList.add("hidden"));
  document.getElementById("continueAfterLicense").addEventListener("click",()=>box.classList.add("hidden"));
  document.getElementById("copyLicenseCode").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(licenseCode);alert("Lisenskoden er kopiert.")}catch{alert("Kopier lisenskoden manuelt.")}});
}

async function unlockWithLicense(){
  const input=document.getElementById("licenseCodeInput");
  const status=document.getElementById("licenseStatus");
  const licenseCode=(input?.value||"").trim();
  if(!licenseCode){if(status)status.textContent="Lim inn lisenskoden først.";return}
  try{
    const response=await fetch("/api/verify-license",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({licenseCode})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok||!data.premium||!data.token)throw new Error(data.error||"Ugyldig lisenskode.");
    localStorage.setItem("smartkalk_premium_token",data.token);
    localStorage.setItem("smartkalk_premium_199","true");
    localStorage.setItem("okonomikalk_license_code",licenseCode);
    updatePremium();
    closeModal();
    openBusinessTools();
    switchTab("biz","bizskatt");
  }catch(error){
    if(status)status.textContent="Lisenskoden ble ikke godkjent. Sjekk at hele koden er limt inn.";
  }
}

function devUnlockPremium(){
  localStorage.setItem("smartkalk_premium_199","true");
  updatePremium();
  closeModal();
}

const unlockPremiumBtn=document.getElementById("unlockPremium");
if(unlockPremiumBtn)unlockPremiumBtn.addEventListener("click",startPremiumCheckout);
document.getElementById("modalUnlock").addEventListener("click",startPremiumCheckout);
document.getElementById("licenseUnlock").addEventListener("click",unlockWithLicense);
document.getElementById("closeModal").addEventListener("click",closeModal);
document.getElementById("paywallModal").addEventListener("click",e=>{if(e.target.id==="paywallModal")closeModal()});
document.getElementById("tab-selvstendig").addEventListener("click",()=>{if(!isPremium())openModal()});
verifyCheckoutFromUrl();

function getScenarios(){try{return JSON.parse(localStorage.getItem("smartkalk_biz_scenarios")||"[]")}catch{return[]}}function setScenarios(i){localStorage.setItem("smartkalk_biz_scenarios",JSON.stringify(i))}function renderSaved(){const c=document.getElementById("savedBizScenarios"),items=getScenarios();if(!items.length){c.innerHTML="<p>Ingen lagrede scenarier ennå.</p>";return}c.innerHTML=items.map((x,i)=>`<div class="saved-item"><strong>${new Date(x.createdAt).toLocaleString("no-NO")}</strong><p>Resultat næring: ${kr(x.result)} · Estimert skatt: ${kr(x.total)} · Netto: ${kr(x.net)}</p><button class="btn ghost" data-delete="${i}" type="button">Slett</button></div>`).join("");c.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>{setScenarios(getScenarios().filter((_,i)=>i!=Number(b.dataset.delete)));renderSaved()}))}
function saveBizScenarioToBrowser(){if(!isPremium()){openModal();return}const it=getScenarios();it.unshift(latestBiz);setScenarios(it.slice(0,8));renderSaved()}function printBizPdf(){if(!isPremium()){openModal();return}document.body.classList.add("print-biz");window.print()}document.getElementById("saveBizScenario").addEventListener("click",saveBizScenarioToBrowser);const saveBizScenarioAlt=document.getElementById("saveBizScenarioAlt");if(saveBizScenarioAlt)saveBizScenarioAlt.addEventListener("click",saveBizScenarioToBrowser);const printBizMain=document.getElementById("printBizMain");if(printBizMain)printBizMain.addEventListener("click",printBizPdf);document.getElementById("printBizReport").addEventListener("click",printBizPdf);const downloadBizMain=document.getElementById("downloadBizMain");if(downloadBizMain)downloadBizMain.addEventListener("click",printBizPdf);const downloadBizPdf=document.getElementById("downloadBizPdf");if(downloadBizPdf)downloadBizPdf.addEventListener("click",printBizPdf);

const HIDS=["hourDesiredIncome","hourVacationDays","hourWeeklyHours","hourFuel","hourTravel","hourMeetings","hourPurchases","hourAssets","hourFinance","hourPension","hourSickPay","hourInsurance","hourOther"];function calcHourly(){const desired=val("hourDesiredIncome"),vac=val("hourVacationDays"),hours=val("hourWeeklyHours"),cost=sum(val("hourFuel"),val("hourTravel"),val("hourMeetings"),val("hourPurchases"),val("hourAssets"),val("hourFinance"),val("hourPension"),val("hourSickPay"),val("hourInsurance"),val("hourOther")),turnover=desired+cost,weeks=Math.max(0,52-vac/5),billable=weeks*hours,rate=billable>0?turnover/billable:0,costPct=desired>0?cost/desired:0;document.getElementById("hourlyResult").innerHTML=`<div class="kpi-grid"><div class="kpi"><span>Ønsket inntekt</span><strong>${kr(desired)}</strong></div><div class="kpi"><span>Sum driftskostnader</span><strong>${kr(cost)}</strong></div><div class="kpi"><span>Driftskostnader i prosent</span><strong>${pct(costPct)}</strong></div><div class="kpi full"><span>Omsetning for å nå ønsket inntekt</span><strong>${kr(turnover)}</strong></div><div class="kpi"><span>Fakturerbare timer per år</span><strong>${nf.format(billable)}</strong></div><div class="kpi full"><span>Anbefalt timespris eks. mva</span><strong>${kr(rate)}</strong></div></div>`}HIDS.forEach(id=>document.getElementById(id).addEventListener("input",calcHourly));

// Business budgets v37
const BUDGET_MONTHS=["Jan","Feb","Mar","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Des"];
const OPERATING_ROWS=[
  {id:"income",label:"Inntekter",kind:"input"},
  {id:"sumIncome",label:"Sum driftsinntekter",kind:"calc",calc:(m,d)=>d.income[m]},
  {id:"costs",label:"Kostnader",kind:"section"},
  {id:"variableCosts",label:"Variable kostnader",kind:"input"},
  {id:"productionCosts",label:"Produksjonskostnader",kind:"input"},
  {id:"otherVariableCosts",label:"Andre kostnader",kind:"input"},
  {id:"sumVariableCosts",label:"Sum variable kostnader",kind:"calc",calc:(m,d)=>d.variableCosts[m]+d.productionCosts[m]+d.otherVariableCosts[m]},
  {id:"contributionMargin",label:"Dekningsbidrag",kind:"calc",calc:(m,d)=>d.income[m]-(d.variableCosts[m]+d.productionCosts[m]+d.otherVariableCosts[m])},
  {id:"fixedCosts",label:"Faste kostnader",kind:"section"},
  {id:"insurance",label:"Forsikringer",kind:"input"},
  {id:"municipalFees",label:"Kommunale avgifter",kind:"input"},
  {id:"equipmentMaterials",label:"Utstyr / materiell",kind:"input"},
  {id:"salaryCosts",label:"Lønn (feriepenger + arbeidsgiveravgift)",kind:"input"},
  {id:"rentCosts",label:"Leieutgifter",kind:"input"},
  {id:"powerCosts",label:"Strøm",kind:"input"},
  {id:"auditCosts",label:"Revisjon",kind:"input"},
  {id:"mobileCosts",label:"Mobilutgifter",kind:"input"},
  {id:"cleaningCosts",label:"Renhold",kind:"input"},
  {id:"marketingCosts",label:"Markedsføring",kind:"input"},
  {id:"otherFixedCosts",label:"Andre utgifter",kind:"input"},
  {id:"depreciation",label:"Avskrivninger",kind:"input"},
  {id:"courses",label:"Kurs",kind:"input"},
  {id:"accounting",label:"Regnskap",kind:"input"},
  {id:"travelCosts",label:"Reisekostnader",kind:"input"},
  {id:"sumFixedCosts",label:"Sum faste kostnader",kind:"calc",calc:(m,d)=>["insurance","municipalFees","equipmentMaterials","salaryCosts","rentCosts","powerCosts","auditCosts","mobileCosts","cleaningCosts","marketingCosts","otherFixedCosts","depreciation","courses","accounting","travelCosts"].reduce((a,id)=>a+d[id][m],0)},
  {id:"operatingResult",label:"Driftsresultat",kind:"calc",calc:(m,d)=>d.income[m]-(d.variableCosts[m]+d.productionCosts[m]+d.otherVariableCosts[m])-["insurance","municipalFees","equipmentMaterials","salaryCosts","rentCosts","powerCosts","auditCosts","mobileCosts","cleaningCosts","marketingCosts","otherFixedCosts","depreciation","courses","accounting","travelCosts"].reduce((a,id)=>a+d[id][m],0)},
  {id:"interestIncome",label:"Renteinntekter",kind:"input"},
  {id:"interestCosts",label:"Rentekostnader",kind:"input"},
  {id:"netFinancialCosts",label:"Netto finanskostnader",kind:"calc",calc:(m,d)=>d.interestCosts[m]-d.interestIncome[m]},
  {id:"result",label:"RESULTAT",kind:"calc",calc:(m,d)=>d.income[m]-(d.variableCosts[m]+d.productionCosts[m]+d.otherVariableCosts[m])-["insurance","municipalFees","equipmentMaterials","salaryCosts","rentCosts","powerCosts","auditCosts","mobileCosts","cleaningCosts","marketingCosts","otherFixedCosts","depreciation","courses","accounting","travelCosts"].reduce((a,id)=>a+d[id][m],0)+d.interestIncome[m]-d.interestCosts[m]}
];
const LIQUIDITY_ROWS=[
  {id:"startCash",label:"Likvide midler ved starten av måneden",kind:"calcStart"},
  {id:"paymentsIn",label:"Innbetalinger",kind:"section"},
  {id:"salesPayments",label:"Salg av varer og tjenester",kind:"input"},
  {id:"otherPayments",label:"Andre innbetalinger (f.eks. renter, utbytte)",kind:"input"},
  {id:"loanPayments",label:"Innbetalinger fra nye lån",kind:"input"},
  {id:"sumPaymentsIn",label:"Sum innbetalinger",kind:"calc",calc:(m,d)=>d.salesPayments[m]+d.otherPayments[m]+d.loanPayments[m]},
  {id:"paymentsOut",label:"Utbetalinger",kind:"section"},
  {id:"supplierCosts",label:"Leverandørkostnader",kind:"input"},
  {id:"salary",label:"Lønn",kind:"input"},
  {id:"holidayPay",label:"Feriepenger",kind:"input"},
  {id:"taxDeduction",label:"Skattetrekk",kind:"input"},
  {id:"employerTax",label:"Arbeidsgiveravgift",kind:"input"},
  {id:"rent",label:"Husleie",kind:"input"},
  {id:"power",label:"Strøm",kind:"input"},
  {id:"phone",label:"Telefon",kind:"input"},
  {id:"insurance",label:"Forsikring",kind:"input"},
  {id:"accountant",label:"Regnskapsfører",kind:"input"},
  {id:"marketing",label:"Markedsføring og annonsering",kind:"input"},
  {id:"otherCosts",label:"Andre utgifter",kind:"input"},
  {id:"vat",label:"Merverdiavgift",kind:"input"},
  {id:"tax",label:"Skatt",kind:"input"},
  {id:"loanRepayment",label:"Nedbetaling lån og renter",kind:"input"},
  {id:"investments",label:"Investeringer",kind:"input"},
  {id:"sumPaymentsOut",label:"Sum utbetalinger",kind:"calc",calc:(m,d)=>["supplierCosts","salary","holidayPay","taxDeduction","employerTax","rent","power","phone","insurance","accountant","marketing","otherCosts","vat","tax","loanRepayment","investments"].reduce((a,id)=>a+d[id][m],0)},
  {id:"cashChange",label:"Endring i likvide midler for denne måneden (innbet. - utbet.)",kind:"calc",calc:(m,d)=>d.salesPayments[m]+d.otherPayments[m]+d.loanPayments[m]-["supplierCosts","salary","holidayPay","taxDeduction","employerTax","rent","power","phone","insurance","accountant","marketing","otherCosts","vat","tax","loanRepayment","investments"].reduce((a,id)=>a+d[id][m],0)},
  {id:"endCash",label:"Likvide midler ved slutten av måneden",kind:"calcEnd"}
];
function budgetRowValue(row,m,data,type){
  if(row.kind==="section")return null;
  if(type==="liquidity"&&row.kind==="calcStart"){
    if(m===0)return data.startCashInput?.[0]||0;
    return budgetRowValue(LIQUIDITY_ROWS.find(r=>r.id==="endCash"),m-1,data,type);
  }
  if(type==="liquidity"&&row.kind==="calcEnd")return budgetRowValue(LIQUIDITY_ROWS.find(r=>r.id==="startCash"),m,data,type)+budgetRowValue(LIQUIDITY_ROWS.find(r=>r.id==="cashChange"),m,data,type);
  if(row.kind==="calc")return row.calc(m,data);
  return data[row.id]?.[m]||0;
}
function readBudgetMatrix(rows,prefix,type){
  const data={};
  rows.filter(r=>r.kind==="input").forEach(row=>{data[row.id]=BUDGET_MONTHS.map((_,m)=>Number(document.querySelector(`[data-${prefix}-input="${row.id}-${m}"]`)?.value||0))});
  if(type==="liquidity")data.startCashInput=[Number(document.querySelector(`[data-${prefix}-input="startCash-0"]`)?.value||0)];
  return data;
}
function renderBusinessBudgetTable(containerId,summaryId,rows,prefix,type){
  const container=document.getElementById(containerId);
  if(!container)return;
  const existing=readBudgetMatrix(rows,prefix,type);
  const header=`<thead><tr><th>Post</th>${BUDGET_MONTHS.map(m=>`<th>${m}</th>`).join("")}<th>Sum år</th></tr></thead>`;
  const body=rows.map(row=>{
    if(row.kind==="section")return `<tr class="budget-section-row"><th colspan="14">${row.label}</th></tr>`;
    const cells=BUDGET_MONTHS.map((_,m)=>{
      const editable=row.kind==="input" || (type==="liquidity"&&row.kind==="calcStart"&&m===0);
      const value=budgetRowValue(row,m,existing,type);
      if(editable){
        const inputId=row.kind==="calcStart"?"startCash":row.id;
        return `<td><input type="number" step="100" value="${value}" data-${prefix}-input="${inputId}-${m}"></td>`;
      }
      return `<td class="budget-calc-cell">${Math.round(value).toLocaleString("no-NO")}</td>`;
    }).join("");
    const yearSum=BUDGET_MONTHS.reduce((a,_,m)=>a+budgetRowValue(row,m,existing,type),0);
    return `<tr class="${row.kind==="calc"||row.kind==="calcEnd"?"budget-total-row":""}"><th>${row.label}</th>${cells}<th>${Math.round(yearSum).toLocaleString("no-NO")}</th></tr>`;
  }).join("");
  container.innerHTML=`<table class="business-budget-table">${header}<tbody>${body}</tbody></table>`;
  container.querySelectorAll(`input[data-${prefix}-input]`).forEach(input=>input.addEventListener("change",()=>updateBusinessBudget(prefix,type)));
  updateBusinessBudget(prefix,type,false);
}
function updateBusinessBudget(prefix,type,rerender=true){
  const rows=type==="operating"?OPERATING_ROWS:LIQUIDITY_ROWS;
  const data=readBudgetMatrix(rows,prefix,type);
  document.querySelectorAll(`input[data-${prefix}-input]`).forEach(input=>{
    const [rowId,mStr]=input.getAttribute(`data-${prefix}-input`).split("-");
    const m=Number(mStr);if(rowId==="startCash")return;if(!data[rowId])data[rowId]=Array(12).fill(0);data[rowId][m]=Number(input.value||0);
  });
  rows.forEach(row=>{if(row.kind==="section")return;BUDGET_MONTHS.forEach((_,m)=>{const cell=document.querySelector(`#${type==="operating"?"operatingBudgetTable":"liquidityBudgetTable"} tr:nth-child(${rows.indexOf(row)+2}) td:nth-child(${m+2})`);});});
  if(rerender)renderBusinessBudgetTable(type==="operating"?"operatingBudgetTable":"liquidityBudgetTable",type==="operating"?"operatingBudgetSummary":"liquidityBudgetSummary",rows,prefix,type);
  const summary=document.getElementById(type==="operating"?"operatingBudgetSummary":"liquidityBudgetSummary");
  if(!summary)return;
  if(type==="operating"){
    const resultRow=rows.find(r=>r.id==="result"),incomeRow=rows.find(r=>r.id==="sumIncome"),fixedRow=rows.find(r=>r.id==="sumFixedCosts");
    const yearIncome=BUDGET_MONTHS.reduce((a,_,m)=>a+budgetRowValue(incomeRow,m,data,type),0);
    const yearFixed=BUDGET_MONTHS.reduce((a,_,m)=>a+budgetRowValue(fixedRow,m,data,type),0);
    const yearResult=BUDGET_MONTHS.reduce((a,_,m)=>a+budgetRowValue(resultRow,m,data,type),0);
    summary.innerHTML=`<div class="kpi"><span>Sum driftsinntekter</span><strong>${kr(yearIncome)}</strong></div><div class="kpi"><span>Sum faste kostnader</span><strong>${kr(yearFixed)}</strong></div><div class="kpi full"><span>RESULTAT</span><strong>${kr(yearResult)}</strong></div>`;
  } else {
    const start=budgetRowValue(rows.find(r=>r.id==="startCash"),0,data,type);
    const end=budgetRowValue(rows.find(r=>r.id==="endCash"),11,data,type);
    const change=BUDGET_MONTHS.reduce((a,_,m)=>a+budgetRowValue(rows.find(r=>r.id==="cashChange"),m,data,type),0);
    summary.innerHTML=`<div class="kpi"><span>Start likvide midler</span><strong>${kr(start)}</strong></div><div class="kpi"><span>Endring i året</span><strong>${kr(change)}</strong></div><div class="kpi full"><span>Likvide midler ved årets slutt</span><strong>${kr(end)}</strong></div>`;
  }
}
function collectBusinessBudgetCsv(rows,prefix,type){
  const data=readBudgetMatrix(rows,prefix,type);
  const csvRows=[["Post",...BUDGET_MONTHS,"Sum år"]];
  rows.forEach(row=>{
    if(row.kind==="section"){csvRows.push([row.label,...Array(13).fill("")]);return;}
    const vals=BUDGET_MONTHS.map((_,m)=>Math.round(budgetRowValue(row,m,data,type)));
    csvRows.push([row.label,...vals,vals.reduce((a,b)=>a+b,0)]);
  });
  return csvRows;
}
function downloadCsv(filename,rows){
  const csv="\ufeff"+rows.map(row=>row.map(cell=>`"${String(cell??"").replaceAll('"','""')}"`).join(";")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function initBusinessBudgets(){
  renderBusinessBudgetTable("operatingBudgetTable","operatingBudgetSummary",OPERATING_ROWS,"opbudget","operating");
  renderBusinessBudgetTable("liquidityBudgetTable","liquidityBudgetSummary",LIQUIDITY_ROWS,"liqbudget","liquidity");
  const opBtn=document.getElementById("exportOperatingBudgetCsv");if(opBtn)opBtn.addEventListener("click",()=>downloadCsv("okonomikalk-drifts-resultatbudsjett.csv",collectBusinessBudgetCsv(OPERATING_ROWS,"opbudget","operating")));
  const liqBtn=document.getElementById("exportLiquidityBudgetCsv");if(liqBtn)liqBtn.addEventListener("click",()=>downloadCsv("okonomikalk-likviditetsbudsjett.csv",collectBusinessBudgetCsv(LIQUIDITY_ROWS,"liqbudget","liquidity")));
}

// Simple mileage log v38
const MILEAGE_RATE=3.5;
let mileageRowCounter=0;
function mileageToday(){return new Date().toISOString().slice(0,10)}
function addMileageRow(row={}){
  const tbody=document.getElementById("mileageRows");
  if(!tbody)return;
  const tr=document.createElement("tr");
  tr.dataset.mileageRow=String(mileageRowCounter++);
  tr.innerHTML=`<td><input type="date" class="mileageDate" value="${esc(row.date||mileageToday())}"></td><td><input type="text" class="mileageFrom" value="${esc(row.from||"")}" placeholder="Fra"></td><td><input type="text" class="mileageTo" value="${esc(row.to||"")}" placeholder="Til"></td><td><input type="text" class="mileagePurpose" value="${esc(row.purpose||"")}" placeholder="Formål"></td><td><input type="number" class="mileageKm" min="0" step="1" value="${row.km??0}"></td><td><button class="btn ghost mileageDelete" type="button">Slett</button></td>`;
  tbody.appendChild(tr);
  tr.querySelectorAll("input").forEach(input=>input.addEventListener("input",updateMileageSummary));
  tr.querySelector(".mileageDelete").addEventListener("click",()=>{tr.remove();if(!document.querySelectorAll("#mileageRows tr").length)addMileageRow();updateMileageSummary()});
  updateMileageSummary();
}
function readMileageRows(){return [...document.querySelectorAll("#mileageRows tr")].map(tr=>({date:tr.querySelector(".mileageDate")?.value||"",from:tr.querySelector(".mileageFrom")?.value.trim()||"",to:tr.querySelector(".mileageTo")?.value.trim()||"",purpose:tr.querySelector(".mileagePurpose")?.value.trim()||"",km:Number(tr.querySelector(".mileageKm")?.value||0)}))}
function updateMileageSummary(){
  const rows=readMileageRows();
  const km=rows.reduce((a,r)=>a+r.km,0);
  const amount=km*MILEAGE_RATE;
  const summary=document.getElementById("mileageSummary");
  if(summary)summary.innerHTML=`<div class="kpi"><span>Sum kilometer</span><strong>${nf.format(km)} km</strong></div><div class="kpi"><span>Sats</span><strong>${kr(MILEAGE_RATE)} per km</strong></div><div class="kpi full"><span>Skattefritt beløp</span><strong>${kr(amount)}</strong></div>`;
}
function collectMileageCsv(){
  const rows=readMileageRows();
  const km=rows.reduce((a,r)=>a+r.km,0),amount=km*MILEAGE_RATE;
  return [["Firmanavn",document.getElementById("mileageCompany")?.value||""],["Navn eier bil",document.getElementById("mileageOwner")?.value||""],["Regnr.",document.getElementById("mileageReg")?.value||""],[],["Dato","Kjørt fra","Kjørt til","Formål","Antall km"],...rows.map(r=>[r.date,r.from,r.to,r.purpose,r.km]),[],["Sum kilometer",km],["Sats per km",MILEAGE_RATE],["Skattefritt beløp",Math.round(amount)]];
}
function initMileageLog(){
  if(!document.getElementById("mileageRows"))return;
  addMileageRow({purpose:"Kundemøte",km:0});
  ["mileageCompany","mileageOwner","mileageReg"].forEach(id=>document.getElementById(id)?.addEventListener("input",updateMileageSummary));
  document.getElementById("addMileageRow")?.addEventListener("click",()=>addMileageRow());
  document.getElementById("exportMileageCsv")?.addEventListener("click",()=>downloadCsv("okonomikalk-kjorebok.csv",collectMileageCsv()));
  updateMileageSummary();
}

// Invoice tools v16
const INV_COMPANY_IDS=["invCompanyName","invCompanyAddress","invCompanyEmail","invCompanyAccount"];
let invoiceLineCounter=0;
function esc(value){return String(value??"").replace(/[&<>'"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]))}
function todayIso(){return new Date().toISOString().slice(0,10)}
function addDaysIso(iso,days){const d=iso?new Date(`${iso}T12:00:00`):new Date();d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)}
function invoiceNumber(){const year=new Date().getFullYear();const next=Number(localStorage.getItem("smartkalk_invoice_next")||1);return `SK-${year}-${String(next).padStart(4,"0")}`}
function bumpInvoiceNumber(){const next=Number(localStorage.getItem("smartkalk_invoice_next")||1);localStorage.setItem("smartkalk_invoice_next",String(next+1));document.getElementById("invNumber").value=invoiceNumber()}
function getCompanyDefault(){try{return JSON.parse(localStorage.getItem("smartkalk_invoice_company_default")||"null")}catch{return null}}
function readCompany(){return {name:document.getElementById("invCompanyName").value.trim(),address:document.getElementById("invCompanyAddress").value.trim(),email:document.getElementById("invCompanyEmail").value.trim(),account:document.getElementById("invCompanyAccount").value.trim()}}
function readRecipient(){return {name:document.getElementById("invRecipientName").value.trim(),address:document.getElementById("invRecipientAddress").value.trim(),postal:document.getElementById("invRecipientPostal").value.trim(),email:document.getElementById("invRecipientEmail").value.trim()}}
function saveCompanyDefault(){localStorage.setItem("smartkalk_invoice_company_default",JSON.stringify(readCompany()))}
function loadCompanyDefault(){const c=getCompanyDefault();if(!c)return;document.getElementById("invCompanyName").value=c.name||"";document.getElementById("invCompanyAddress").value=c.address||"";document.getElementById("invCompanyEmail").value=c.email||"";document.getElementById("invCompanyAccount").value=c.account||"";document.getElementById("invCompanyDefault").checked=true}
function addInvoiceLine(line={}){const id=invoiceLineCounter++;const row=document.createElement("div");row.className="invoice-line";row.dataset.invoiceLine=String(id);row.innerHTML=`<input type="text" class="invLineDesc" placeholder="Beskrivelse" value="${esc(line.desc||"")}"><input type="number" class="invLineQty" min="0" step="0.01" value="${line.qty??1}"><input type="number" class="invLinePrice" min="0" step="1" value="${line.price??0}"><input type="number" class="invLineVat" min="0" step="1" value="${line.vat??line.vatRate??25}"><button class="btn ghost invLineDelete" type="button">Slett</button>`;document.getElementById("invoiceLines").appendChild(row);row.querySelectorAll("input").forEach(e=>e.addEventListener("input",updateInvoicePreview));row.querySelector(".invLineDelete").addEventListener("click",()=>{row.remove();if(!document.querySelectorAll(".invoice-line").length)addInvoiceLine();updateInvoicePreview()});updateInvoicePreview()}
function readInvoiceLines(){return [...document.querySelectorAll(".invoice-line")].map(row=>{const desc=row.querySelector(".invLineDesc").value.trim();const qty=Number(row.querySelector(".invLineQty").value||0);const price=Number(row.querySelector(".invLinePrice").value||0);const vatRate=Number(row.querySelector(".invLineVat").value||0);const ex=qty*price;const vat=ex*vatRate/100;return{desc,qty,price,vatRate,ex,vat,total:ex+vat}})}
function readInvoice(){const date=document.getElementById("invDate").value||todayIso();const due=document.getElementById("invDueDate").value||addDaysIso(date,10);const lines=readInvoiceLines();const ex=lines.reduce((a,l)=>a+l.ex,0);const vat=lines.reduce((a,l)=>a+l.vat,0);const recipient=readRecipient();return{company:readCompany(),recipient,recipientEmail:recipient.email,date,due,number:document.getElementById("invNumber").value||invoiceNumber(),lines,ex,vat,total:ex+vat,createdAt:new Date().toISOString()}}
function invoiceHtml(inv){
  const recipient=inv.recipient||{name:"",address:"",postal:"",email:inv.recipientEmail||""};
  const lineRows=inv.lines.map(l=>`<tr><td>${esc(l.desc||"Fakturalinje")}</td><td>${nf.format(l.qty)}</td><td>${kr(l.price)}</td><td>${nf.format(l.vatRate)} %</td><td>${kr(l.total)}</td></tr>`).join("");
  return `<div class="invoice-document" id="invoiceDocument"><h3>Faktura</h3><div class="invoice-party-grid"><div class="invoice-party-card"><span class="invoice-card-label">Avsender</span><strong>${esc(inv.company.name||"Firmanavn")}</strong><span>${esc(inv.company.address||"Adresse")}</span><span>${esc(inv.company.email||"E-post")}</span></div><div class="invoice-party-card"><span class="invoice-card-label">Mottaker</span><strong>${esc(recipient.name||"Mottaker navn")}</strong><span>${esc(recipient.address||"Mottaker adresse")}</span><span>${esc(recipient.postal||"Mottaker postnr")}</span><span>${esc(recipient.email||"Mottaker epost")}</span></div></div><div class="invoice-info-bar"><div><span>Fakturanr.</span><strong>${esc(inv.number)}</strong></div><div><span>Dato</span><strong>${esc(inv.date)}</strong></div><div><span>Betalingsfrist</span><strong>${esc(inv.due)}</strong></div></div><div class="invoice-account-bar"><span>Betal til kontonummer:</span><strong>${esc(inv.company.account||"Kontonummer")}</strong></div><div class="table-wrap invoice-table-wrap"><table class="invoice-table"><thead><tr><th>Beskrivelse</th><th>Antall</th><th>Pris eks. mva</th><th>Mva</th><th>Linjesum</th></tr></thead><tbody>${lineRows}</tbody></table></div><div class="invoice-totals"><div><span>Sum eks. mva</span><strong>${kr(inv.ex)}</strong></div><div><span>Mva</span><strong>${kr(inv.vat)}</strong></div><div><span>Total å betale</span><strong>${kr(inv.total)}</strong></div></div></div>`
}
function updateInvoicePreview(){const inv=readInvoice();document.getElementById("invoicePreview").innerHTML=invoiceHtml(inv);if(document.getElementById("invCompanyDefault").checked)saveCompanyDefault()}
function getSavedInvoices(){try{return JSON.parse(localStorage.getItem("smartkalk_saved_invoices")||"[]")}catch{return[]}}
function setSavedInvoices(items){localStorage.setItem("smartkalk_saved_invoices",JSON.stringify(items))}
function renderSavedInvoices(){const c=document.getElementById("savedInvoices"),items=getSavedInvoices();if(!items.length){c.innerHTML="<p>Ingen lagrede fakturaer ennå.</p>";return}c.innerHTML=items.map((x,i)=>`<div class="saved-item"><strong>${esc(x.number)} · ${esc(x.recipient?.name||x.recipientEmail||"Mottaker mangler")}</strong><p>${esc(x.date)} · Forfall ${esc(x.due)} · Total ${kr(x.total)}</p><button class="btn ghost" data-load-invoice="${i}" type="button">Hent opp</button> <button class="btn ghost" data-delete-invoice="${i}" type="button">Slett</button></div>`).join("");c.querySelectorAll("[data-delete-invoice]").forEach(b=>b.addEventListener("click",()=>{setSavedInvoices(getSavedInvoices().filter((_,i)=>i!=Number(b.dataset.deleteInvoice)));renderSavedInvoices()}));c.querySelectorAll("[data-load-invoice]").forEach(b=>b.addEventListener("click",()=>loadInvoice(getSavedInvoices()[Number(b.dataset.loadInvoice)])))}
function loadInvoice(inv){if(!inv)return;document.getElementById("invCompanyName").value=inv.company?.name||"";document.getElementById("invCompanyAddress").value=inv.company?.address||"";document.getElementById("invCompanyEmail").value=inv.company?.email||"";document.getElementById("invCompanyAccount").value=inv.company?.account||"";document.getElementById("invRecipientName").value=inv.recipient?.name||"";document.getElementById("invRecipientAddress").value=inv.recipient?.address||"";document.getElementById("invRecipientPostal").value=inv.recipient?.postal||"";document.getElementById("invRecipientEmail").value=inv.recipient?.email||inv.recipientEmail||"";document.getElementById("invDate").value=inv.date||todayIso();document.getElementById("invDueDate").value=inv.due||addDaysIso(document.getElementById("invDate").value,10);document.getElementById("invNumber").value=inv.number||invoiceNumber();document.getElementById("invoiceLines").innerHTML="";(inv.lines?.length?inv.lines:[{}]).forEach(addInvoiceLine);updateInvoicePreview();window.scrollTo({top:document.getElementById("tab-faktura").offsetTop-80,behavior:"smooth"})}
function invoiceDownloadHtml(inv){return `<!doctype html><html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(inv.number)}</title><style>@page{size:A4;margin:12mm}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;font-family:Inter,Arial,sans-serif;color:#10233d;font-size:12px;line-height:1.35}.wrap{width:100%;max-width:186mm;margin:0 auto}.invoice-document{width:100%;border:0;border-radius:0;background:#fff;padding:0}h3{margin:0 0 10mm;font-size:30px;line-height:1;letter-spacing:-.04em}.invoice-party-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10mm;margin-bottom:8mm}.invoice-party-card{display:grid;align-content:start;gap:3px;min-height:28mm;padding:6mm;border:1px solid #d7e0ea;border-radius:8px;background:#f7f9fc}.invoice-card-label{color:#66768a;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.invoice-party-card strong{font-size:13px}.invoice-info-bar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5mm;margin-bottom:5mm}.invoice-info-bar>div,.invoice-account-bar{padding:4mm;border:1px solid #d7e0ea;border-radius:8px;background:#fff}.invoice-info-bar span,.invoice-account-bar span{display:block;margin-bottom:2px;color:#66768a;font-size:10px;font-weight:800}.invoice-account-bar{display:flex;justify-content:space-between;align-items:center;gap:8mm;margin-bottom:8mm}.invoice-table-wrap{border:1px solid #d7e0ea;border-radius:8px;overflow:hidden;margin:0}.invoice-table{width:100%;min-width:0;border-collapse:collapse;table-layout:fixed;background:#fff}.invoice-table th,.invoice-table td{padding:3.2mm 2.4mm;border-bottom:1px solid #d7e0ea;text-align:left;vertical-align:top;font-size:11px}.invoice-table th{background:#f8fbff;color:#66768a;font-size:10px}.invoice-table th:first-child,.invoice-table td:first-child{width:42%}.invoice-table th:nth-child(2),.invoice-table td:nth-child(2){width:10%}.invoice-table th:nth-child(3),.invoice-table td:nth-child(3),.invoice-table th:nth-child(4),.invoice-table td:nth-child(4),.invoice-table th:nth-child(5),.invoice-table td:nth-child(5){width:16%}.invoice-table th:nth-child(n+2),.invoice-table td:nth-child(n+2){text-align:right;white-space:nowrap}.invoice-totals{display:grid;gap:3mm;margin-top:6mm;margin-left:auto;width:75mm}.invoice-totals>div{display:flex;justify-content:space-between;gap:8mm;padding:3.2mm 4mm;border:1px solid #d7e0ea;border-radius:8px;background:#f7f9fc}.invoice-totals>div:last-child{background:#eef7f5;border-color:rgba(15,118,110,.28);font-size:13px}@media print{.wrap{max-width:none}.invoice-document{break-inside:avoid;page-break-inside:avoid}}</style></head><body><div class="wrap">${invoiceHtml(inv)}</div></body></html>`}
function printInvoicePdf(){if(!isPremium()){openModal();return}const inv=readInvoice();const html=invoiceDownloadHtml(inv);const frame=document.createElement("iframe");frame.setAttribute("aria-hidden","true");frame.style.position="fixed";frame.style.right="0";frame.style.bottom="0";frame.style.width="0";frame.style.height="0";frame.style.border="0";document.body.appendChild(frame);const doc=frame.contentWindow.document;doc.open();doc.write(html);doc.close();setTimeout(()=>{try{frame.contentWindow.focus();frame.contentWindow.print()}finally{setTimeout(()=>frame.remove(),1500)}},250)}
function downloadInvoiceFile(){printInvoicePdf()}
function initInvoice(){loadCompanyDefault();document.getElementById("invDate").value=todayIso();document.getElementById("invDueDate").value=addDaysIso(todayIso(),10);document.getElementById("invNumber").value=invoiceNumber();addInvoiceLine({desc:"Utført arbeid",qty:1,price:0,vat:25});document.getElementById("invDate").addEventListener("input",()=>{document.getElementById("invDueDate").value=addDaysIso(document.getElementById("invDate").value,10);updateInvoicePreview()});[...INV_COMPANY_IDS,"invRecipientName","invRecipientAddress","invRecipientPostal","invRecipientEmail","invDueDate"].forEach(id=>document.getElementById(id).addEventListener("input",updateInvoicePreview));document.getElementById("invCompanyDefault").addEventListener("change",()=>{if(document.getElementById("invCompanyDefault").checked)saveCompanyDefault();updateInvoicePreview()});document.getElementById("addInvoiceLine").addEventListener("click",()=>addInvoiceLine());document.getElementById("printInvoice").addEventListener("click",printInvoicePdf);window.addEventListener("afterprint",()=>document.body.classList.remove("print-invoice"));window.addEventListener("afterprint",()=>document.body.classList.remove("print-budget"));window.addEventListener("afterprint",()=>document.body.classList.remove("print-biz"));document.getElementById("saveInvoice").addEventListener("click",()=>{if(!isPremium()){openModal();return}const inv=readInvoice();const items=getSavedInvoices();items.unshift(inv);setSavedInvoices(items.slice(0,20));bumpInvoiceNumber();renderSavedInvoices();updateInvoicePreview();alert("Faktura lagret i nettleseren.")});document.getElementById("downloadInvoice").addEventListener("click",downloadInvoiceFile);renderSavedInvoices();updateInvoicePreview()}

function calcPower(){const y=val("powerYearKwh"),p=val("powerPrice"),g=val("powerGridMonthly"),m=y*p/12+g;document.getElementById("powerResult").innerHTML=`<div class="kpi-grid"><div class="kpi"><span>Strøm per måned</span><strong>${kr(y*p/12)}</strong></div><div class="kpi"><span>Nettleie per måned</span><strong>${kr(g)}</strong></div><div class="kpi full"><span>Total per måned</span><strong>${kr(m)}</strong></div><div class="kpi"><span>Total per år</span><strong>${kr(m*12)}</strong></div></div>`}["powerYearKwh","powerPrice","powerGridMonthly"].forEach(id=>document.getElementById(id).addEventListener("input",calcPower));
function calcLoan(){const a=val("loanAmount"),y=val("loanYears"),r=val("loanRate")/100/12,n=y*12,m=r===0?a/n:a*r/(1-Math.pow(1+r,-n)),tot=m*n;document.getElementById("loanResult").innerHTML=`<div class="kpi-grid"><div class="kpi full"><span>Månedlig kostnad</span><strong>${kr(m)}</strong></div><div class="kpi"><span>Total tilbakebetaling</span><strong>${kr(tot)}</strong></div><div class="kpi"><span>Total rentekostnad</span><strong>${kr(tot-a)}</strong></div></div>`}["loanAmount","loanYears","loanRate"].forEach(id=>document.getElementById(id).addEventListener("input",calcLoan));
const budget=[["Utbetalt lønn","income",42000],["Utleieinntekt","income",0],["Annen inntekt","income",0],["Mat","expense",7500],["Strøm","expense",1800],["Lån/husleie","expense",15000],["Abonnement","expense",600],["TV/streaming","expense",500],["Mobil","expense",400],["Barnepass","expense",0],["Reise/kollektiv","expense",1000],["Drivstoff","expense",1500],["Bil","expense",3000],["Gaver","expense",600],["Ferie","expense",2500],["Annet","expense",1000]];
function getSavedBudget(){try{return JSON.parse(localStorage.getItem("smartkalk_private_budget")||"null")}catch{return null}}
function readBudgetValues(){return [...document.querySelectorAll("[data-budget]")].map(e=>Number(e.value||0))}
function printBudgetPdf(){document.body.classList.add("print-budget");window.print()}function initBudget(){const saved=getSavedBudget();document.getElementById("budgetRows").innerHTML=budget.map((x,i)=>`<tr><td>${x[0]}</td><td>${x[1]==="income"?"Inntekt":"Utgift"}</td><td><input type="number" min="0" step="100" value="${saved?.values?.[i]??x[2]}" data-budget="${i}"></td></tr>`).join("");document.querySelectorAll("[data-budget]").forEach(e=>e.addEventListener("input",calcBudget));const saveBtn=document.getElementById("saveBudget");if(saveBtn)saveBtn.addEventListener("click",saveBudget);const printBtn=document.getElementById("printBudget");if(printBtn)printBtn.addEventListener("click",printBudgetPdf);const downloadBudgetBtn=document.getElementById("downloadBudgetPdf");if(downloadBudgetBtn)downloadBudgetBtn.addEventListener("click",printBudgetPdf)}
function saveBudget(){localStorage.setItem("smartkalk_private_budget",JSON.stringify({values:readBudgetValues(),savedAt:new Date().toISOString()}));const status=document.getElementById("budgetSaveStatus");if(status)status.textContent="Budsjettet er lagret lokalt i denne nettleseren."}
function calcBudget(){let inc=0,exp=0;document.querySelectorAll("[data-budget]").forEach(e=>{const item=budget[Number(e.dataset.budget)],amt=Number(e.value||0);if(item[1]==="income")inc+=amt;else exp+=amt});const res=inc-exp;document.getElementById("budgetResult").innerHTML=`<div class="kpi-grid"><div class="kpi"><span>Inntekter per måned</span><strong>${kr(inc)}</strong></div><div class="kpi"><span>Utgifter per måned</span><strong>${kr(exp)}</strong></div><div class="kpi full"><span>Resultat per måned</span><strong>${kr(res)}</strong></div><div class="kpi"><span>Resultat per år</span><strong>${kr(res*12)}</strong></div></div>`}

// Salary search v10
function normalizeText(value){
  return String(value||"")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/æ/g,"ae")
    .replace(/ø/g,"o")
    .replace(/å/g,"a")
    .replace(/[^a-z0-9\s-]/g," ")
    .replace(/\s+/g," ")
    .trim();
}

function getSalaryData(){
  return Array.isArray(window.SMARTKALK_SALARY_DATA) ? window.SMARTKALK_SALARY_DATA : [];
}

function salaryAmount(item){
  return Number(item.salaryYearly || item.salary || 0);
}

function scoreSalaryMatch(item,query){
  const q=normalizeText(query);
  const title=normalizeText(item.title);
  const aliases=(item.aliases||[]).map(normalizeText);
  if(!q)return 0;

  if(title===q)return 100;
  if(title.startsWith(q+" ") || title.startsWith(q))return 80;

  for(const a of aliases){
    if(a===q)return 75;
    if(a.startsWith(q+" ") || a.startsWith(q))return 65;
  }

  if(title.split(/[\s-]+/).some(w=>w.startsWith(q)))return 55;

  for(const a of aliases){
    if(a.split(/[\s-]+/).some(w=>w.startsWith(q)))return 50;
  }

  if(q.length>=4){
    if(title.includes(q))return 35;
    if(aliases.some(a=>a.includes(q)))return 30;
  }

  return 0;
}

function salarySearch(){
  const query=document.getElementById("salarySearch").value.trim();
  const result=document.getElementById("salaryResult");

  if(!query){
    result.innerHTML="<p>Skriv inn et yrke og velg et konkret treff fra listen.</p>";
    return;
  }

  const q=normalizeText(query);
  if(q.length<2){
    result.innerHTML="<p>Skriv litt mer av yrket for å få relevante treff.</p>";
    return;
  }

  const matches=getSalaryData()
    .map(item=>({...item,score:scoreSalaryMatch(item,query)}))
    .filter(item=>item.score>0)
    .sort((a,b)=>b.score-a.score || a.title.localeCompare(b.title,"no"))
    .slice(0,12);

  if(!matches.length){
    result.innerHTML=`<p>Fant ingen treff i den lokale lønnstabellen.</p><p class="fineprint">Prøv et annet søkeord, for eksempel “frisør”, “drosje”, “taxi”, “bilmekaniker” eller “forsikring”.</p>`;
    return;
  }

  result.innerHTML=`<div class="salary-options">${matches.map(item=>`<button class="salary-option" type="button" data-salary-title="${item.title}"><span>${item.title}</span><small>Velg yrke</small></button>`).join("")}</div>`;

  result.querySelectorAll("[data-salary-title]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const selected=getSalaryData().find(item=>item.title===btn.dataset.salaryTitle);
      if(!selected)return;
      const yearly=salaryAmount(selected);
      result.innerHTML=`<div class="kpi-grid"><div class="kpi full"><span>Veiledende gjennomsnittlig årslønn</span><strong>${kr(yearly)}</strong></div></div><p class="fineprint">Evt individuelle tillegg kan påvirke lønnen.</p>`;
    });
  });
}

document.getElementById("salarySearch").addEventListener("input",salarySearch);

function handleInitialNavigation(){const params=new URLSearchParams(window.location.search);const tool=params.get("tool");const tab=params.get("tab");const bizTab=params.get("biz");setToolMode("private");if(location.hash){const h=location.hash.replace("#","");if(document.getElementById(h)?.classList.contains("page"))switchPage(h)}if(tool==="business"){openBusinessTools();if(bizTab)switchTab("biz",bizTab)}else if(tool==="private"){openPrivateTools();if(tab)switchTab("calc",tab)}}handleInitialNavigation();empTax();updateBiz();updatePremium();renderSaved();calcHourly();calcPower();calcLoan();initBudget();calcBudget();initBusinessBudgets();initMileageLog();initInvoice();salarySearch();
