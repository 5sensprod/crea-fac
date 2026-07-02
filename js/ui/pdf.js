// Rôle : branche les actions impression et export PDF via html2pdf.
export function initPdfActions({ getNumeroComplet, beforeExport, afterExport }){
  const printBtn = document.getElementById('printBtn');
  const pdfBtn = document.getElementById('pdfBtn');
  const page = document.getElementById('page');

  printBtn.addEventListener('click', ()=>{
    beforeExport();
    window.print();
    setTimeout(afterExport, 300);
  });

  pdfBtn.addEventListener('click', ()=>{
    if(!window.html2pdf){
      alert("La librairie html2pdf n'est pas chargée. Vérifiez votre connexion internet, puis réessayez.");
      return;
    }

    document.body.classList.add('exporting');
    beforeExport();

    const opt = {
      margin:8,
      filename:`${getNumeroComplet()}.pdf`,
      image:{ type:'jpeg', quality:0.98 },
      html2canvas:{ scale:2, useCORS:true, backgroundColor:'#ffffff' },
      jsPDF:{ unit:'mm', format:'a4', orientation:'portrait' },
      pagebreak:{ mode:['avoid-all', 'css', 'legacy'] }
    };

    window.html2pdf().set(opt).from(page).save()
      .then(()=>{
        document.body.classList.remove('exporting');
        afterExport();
      })
      .catch(err=>{
        document.body.classList.remove('exporting');
        afterExport();
        alert("La génération du PDF a échoué. Vérifiez votre connexion internet, puis réessayez.");
        console.error(err);
      });
  });
}
