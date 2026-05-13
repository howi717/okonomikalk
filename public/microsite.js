const fmt = new Intl.NumberFormat("no-NO",{style:"currency",currency:"NOK",maximumFractionDigits:0});
const money = v => fmt.format(Math.round(Number(v)||0));
const nv = id => Number(document.getElementById(id)?.value || 0);

function setupStepper(render){
  let current = 0;
  const steps = [...document.querySelectorAll(".step")];
  const progress = document.getElementById("progressBar");
  const result = document.getElementById("resultCard");

  function show(i){
    steps.forEach((s,n)=>s.classList.toggle("active",n===i));
    progress.style.width = `${(i/steps.length)*100}%`;
  }

  document.querySelectorAll("[data-next]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      current++;
      if(current >= steps.length){
        progress.style.width = "100%";
        steps.forEach(s=>s.classList.remove("active"));
        render();
        result.classList.add("active");
        window.scrollTo({ top: result.offsetTop - 90, behavior: "smooth" });
        return;
      }
      show(current);
    });
  });

  document.querySelectorAll("[data-back]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      current = Math.max(0,current-1);
      show(current);
    });
  });

  show(0);
}

function attachRestart(){
  document.querySelectorAll("[data-restart]").forEach(btn=>btn.addEventListener("click",()=>location.reload()));
}

function teaserSummary(items){
  return `<div class="summary-grid">
    ${items.map(item=>`<div class="summary-item"><span>${item[0]}</span><strong>${item[1]}</strong></div>`).join("")}
  </div>`;
}

function genericCta(){
  return `<div class="cta-box">
    <h3>Sjekk resultat og juster tallene dine i Økonomikalk</h3>
    <p class="help">Svarene dine viser at dette bør beregnes mer nøyaktig. Gå videre til Økonomikalk for full kalkulator, utskrift, rapport og flere detaljer.</p>
    <a class="btn primary" href="/">Gå til Økonomikalk</a>
  </div>
  <div class="actions"><button class="btn ghost" type="button" data-restart>Start på nytt</button></div>`;
}

function initTimespris(){
  function render(){
    const desired=nv("desiredIncome"), software=nv("software"), equipment=nv("equipment"), rent=nv("rent"), travel=nv("travel");
    const marketing=nv("marketing"), pension=nv("pension"), insurance=nv("insurance"), sickpay=nv("sickpay");
    const costs=software+equipment+rent+travel+marketing+pension+insurance+sickpay;
    const hours=nv("hoursPerWeek");
    const risk = costs > desired * 0.25 || hours < 25 ? "Bør kontrolleres nøye" : "Ser ut som et godt grunnlag";

    document.getElementById("resultContent").innerHTML = `<p class="eyebrow">Oppsummering</p>
      <h2>Timesprisen din bør beregnes mer nøyaktig</h2>
      <p class="help">Du har lagt inn ønsket inntekt, kostnader, timer og ferie. For å finne riktig timespris bør dette regnes sammen med skatt, buffer og fakturerbare timer.</p>
      ${teaserSummary([
        ["Ønsket inntekt", money(desired)],
        ["Registrerte kostnader", money(costs)],
        ["Fakturerbare timer per uke", hours || "Ikke oppgitt"],
        ["Vurdering", risk]
      ])}
      ${genericCta()}`;
    attachRestart();
  }
  setupStepper(render);
}

function initSkattebuffer(){
  function render(){
    const revenue=nv("revenue"), software=nv("software"), equipment=nv("equipment"), rent=nv("rent"), travel=nv("travel");
    const marketing=nv("marketing"), pension=nv("pension"), insurance=nv("insurance"), sickpay=nv("sickpay");
    const costs=software+equipment+rent+travel+marketing+pension+insurance+sickpay;
    const result=Math.max(0,revenue-costs);
    const risk = result > 450000 ? "Skattebuffer bør beregnes nøye" : "Kan beregnes enkelt videre";

    document.getElementById("resultContent").innerHTML = `<p class="eyebrow">Oppsummering</p>
      <h2>Du bør sjekke hvor mye du må sette av til skatt</h2>
      <p class="help">Svarene dine gir et godt grunnlag, men nøyaktig skattebuffer krever beregning av næringsresultat, personinntekt, trygdeavgift og trinnskatt.</p>
      ${teaserSummary([
        ["Omsetning eks. mva", money(revenue)],
        ["Registrerte kostnader", money(costs)],
        ["Foreløpig næringsresultat", money(result)],
        ["Vurdering", risk]
      ])}
      ${genericCta()}`;
    attachRestart();
  }
  setupStepper(render);
}

function initBudget(){
  function render(){
    const income=nv("income"), housing=nv("housing"), food=nv("food"), electricity=nv("electricity"), loan=nv("loan"), car=nv("car"), subscriptions=nv("subscriptions"), other=nv("other");
    const total=housing+food+electricity+loan+car+subscriptions+other;
    const pressure = income > 0 && total / income > 0.85 ? "Budsjettet virker stramt" : "Budsjettet bør sjekkes videre";

    document.getElementById("resultContent").innerHTML = `<p class="eyebrow">Oppsummering</p>
      <h2>Privatbudsjettet ditt bør settes opp samlet</h2>
      <p class="help">Du har lagt inn inntekt og viktige utgiftsposter. I Økonomikalk kan du se fullt resultat, justere kategorier og lage en mer komplett oversikt.</p>
      ${teaserSummary([
        ["Månedlig inntekt", money(income)],
        ["Registrerte utgifter", money(total)],
        ["Antall poster", "8 spørsmål"],
        ["Vurdering", pressure]
      ])}
      ${genericCta()}`;
    attachRestart();
  }
  setupStepper(render);
}

function initLoan(){
  function render(){
    const amount=nv("loanAmount"), years=nv("years"), rate=nv("rate"), income=nv("income");
    const risk = income > 0 && amount / (income * 12) > 4 ? "Lånet bør vurderes nøye" : "Kan beregnes videre";

    document.getElementById("resultContent").innerHTML = `<p class="eyebrow">Oppsummering</p>
      <h2>Lånet ditt bør beregnes før du bestemmer deg</h2>
      <p class="help">Du har lagt inn lånebeløp, rente, løpetid og inntekt. I Økonomikalk kan du se månedskostnad, rentekostnad og hvordan endringer påvirker lånet.</p>
      ${teaserSummary([
        ["Lånebeløp", money(amount)],
        ["Løpetid", `${years} år`],
        ["Rente", `${rate} %`],
        ["Vurdering", risk]
      ])}
      ${genericCta()}`;
    attachRestart();
  }
  setupStepper(render);
}

function initFradrag(){
  function render(){
    const ids=["software","equipment","rent","travel","marketing","pension","insurance","sickpay"];
    const score=ids.map(id=>document.getElementById(id).value).filter(v=>v==="yes").length;
    let title="Du bør sjekke fradragene dine";
    if(score>=6) title="Du har flere områder som bør kontrolleres";
    else if(score<=2) title="Du har noen få områder å kontrollere";

    document.getElementById("resultContent").innerHTML = `<p class="eyebrow">Oppsummering</p>
      <h2>${title}</h2>
      <p class="help">Svarene dine viser hvilke områder som kan være relevante. I Økonomikalk kan du gå gjennom full fradragsoversikt og dokumentasjonsliste.</p>
      ${teaserSummary([
        ["Områder besvart ja", `${score} av 8`],
        ["Programvare", document.getElementById("software").value === "yes" ? "Aktuelt" : "Ikke valgt"],
        ["Utstyr / reise / lokaler", "Bør vurderes"],
        ["Pensjon / forsikring / sykepenger", "Bør vurderes"]
      ])}
      <ul class="checklist">
        <li>Programvare</li>
        <li>Verktøy / utstyr</li>
        <li>Leie lokaler</li>
        <li>Reisekostnader</li>
        <li>Markedsføring</li>
        <li>Pensjon</li>
        <li>Forsikring</li>
        <li>Sykepenger</li>
      </ul>
      <div class="cta-box">
        <h3>Få full fradragsoversikt og dokumentasjonsliste i Økonomikalk</h3>
        <p class="help">Gå videre til forsiden og velg næringsverktøy for full oversikt.</p>
        <a class="btn primary" href="/">Gå til Økonomikalk</a>
      </div>
      <div class="actions"><button class="btn ghost" type="button" data-restart>Start på nytt</button></div>`;
    attachRestart();
  }
  setupStepper(render);
}