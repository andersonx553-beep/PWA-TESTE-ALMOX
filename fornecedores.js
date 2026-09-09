(()=>{
  const supplierSection=document.getElementById('fornecedores');
  if(!supplierSection||typeof db==='undefined') return;

  function supplierName(s){return String(s?.name||s?.razao||'').trim()}
  function suppliers(){return Array.isArray(db.suppliers)?db.suppliers:[]}
  function linkedCount(s){const n=supplierName(s).toLowerCase();return db.materials.filter(m=>String(m.supplier||'').trim().toLowerCase()===n).length}
  function supplierById(id){return suppliers().find(s=>String(s.id)===String(id))}
  function uid(){return 's'+Date.now()+Math.random().toString(36).slice(2,7)}
  function field(label,name,value='',type='text',full=false){return `<div class="field${full?' full':''}"><label>${label}</label><input name="${name}" type="${type}" value="${esc(value)}"></div>`}

  function addSupplierNav(){
    const side=document.getElementById('sideNav');
    if(side && !side.querySelector('[data-go="fornecedores"]')){
      const b=document.createElement('button');b.dataset.go='fornecedores';b.innerHTML='<span>🏭</span>Fornecedores';side.appendChild(b)
    }
    const bottom=document.getElementById('bottomNav');
    if(bottom && !bottom.querySelector('[data-go="fornecedores"]')){
      const b=document.createElement('button');b.dataset.go='fornecedores';b.innerHTML='<span>🏭</span>Fornecedores';bottom.appendChild(b)
    }
  }

  function renderFornecedores(){
    const q=(document.getElementById('supplierSearch')?.value||'').toLowerCase().trim();
    const arr=suppliers().filter(s=>`${supplierName(s)} ${s.cnpj||''} ${s.telefone||''} ${s.whatsapp||''} ${s.email||''} ${s.finalidade||''}`.toLowerCase().includes(q));
    supplierSection.innerHTML=`
      <div class="section-title"><div><h2>Fornecedores</h2><span class="muted">Cadastro e relacionamento com materiais</span></div><button class="primary" id="newSupplier">＋ Novo fornecedor</button></div>
      <div class="card">
        <div class="toolbar"><input id="supplierSearch" class="search" value="${esc(q)}" placeholder="🔍 Pesquisar fornecedor, CNPJ ou finalidade..."></div>
        <div class="summary">
          <div class="summary-box"><small>Fornecedores</small><b>${arr.length}</b></div>
          <div class="summary-box"><small>Materiais vinculados</small><b>${arr.reduce((a,s)=>a+linkedCount(s),0)}</b></div>
          <div class="summary-box"><small>Sem cadastro</small><b>${db.materials.filter(m=>!String(m.supplier||'').trim()).length}</b></div>
        </div>
        <div class="list">${arr.map(s=>`<div class="item">
          <div class="item-img">${esc(s.image)||'🏭'}</div>
          <div class="item-info"><small>${esc(s.cnpj||'CNPJ não informado')} · ${esc(s.finalidade||'Finalidade não informada')}</small><strong>${esc(supplierName(s))}</strong><small>${esc(s.telefone||s.whatsapp||s.email||'Contato não informado')} · ${linkedCount(s)} material(is)</small></div>
          <div class="actions"><button class="secondary supplier-edit" data-id="${esc(s.id)}">Editar</button><button class="danger supplier-delete" data-id="${esc(s.id)}">Excluir</button></div>
        </div>`).join('')||'<div class="empty">Nenhum fornecedor cadastrado.</div>'}</div>
      </div>`;
  }

  function supplierForm(s=null){
    const x=s||{};
    supplierSection.innerHTML=`
      <div class="section-title"><div><h2>${s?'Editar fornecedor':'Novo fornecedor'}</h2><span class="muted">Dados do fornecedor</span></div></div>
      <div class="card"><form id="supplierForm"><div class="form-grid">
        ${field('Nome / Razão Social *','name',x.name||x.razao||'')}
        ${field('CNPJ','cnpj',x.cnpj||'')}
        ${field('Telefone','telefone',x.telefone||'')}
        ${field('WhatsApp','whatsapp',x.whatsapp||'')}
        ${field('E-mail','email',x.email||'','email')}
        ${field('Contato responsável','responsavel',x.responsavel||'')}
        ${field('Endereço','endereco',x.endereco||'','text',true)}
        <div class="field"><label>Finalidade</label><input name="finalidade" list="supplierPurposeList" value="${esc(x.finalidade||'')}" placeholder="Ex.: Material de limpeza"><datalist id="supplierPurposeList"><option value="Limpeza"><option value="Elétrica"><option value="Hidráulica"><option value="Ferramentas"><option value="EPI"><option value="Construção"><option value="Pintura"><option value="Jardinagem"><option value="Piscina"><option value="Escritório"><option value="Manutenção"><option value="Peças de Reposição"><option value="Diversos"></datalist></div>
        ${field('Imagem / logo','image',x.image||'🏭')}
        <div class="field full"><label>Observações</label><textarea name="observacoes">${esc(x.observacoes||x.notes||'')}</textarea></div>
      </div><div class="actions" style="margin-top:15px"><button class="primary">Salvar fornecedor</button><button type="button" class="secondary" id="cancelSupplier">Cancelar</button></div><input type="hidden" name="id" value="${esc(x.id||'')}"></form></div>`;
  }

  function saveSupplier(e){
    e.preventDefault();const f=new FormData(e.target);const name=String(f.get('name')||'').trim();if(!name){toast('Nome do fornecedor é obrigatório');return}
    const id=String(f.get('id')||'').trim();let s=id?supplierById(id):null;
    if(!s){s={id:uid()};db.suppliers.push(s)}
    Object.assign(s,{name,cnpj:String(f.get('cnpj')||'').trim(),telefone:String(f.get('telefone')||'').trim(),whatsapp:String(f.get('whatsapp')||'').trim(),email:String(f.get('email')||'').trim(),responsavel:String(f.get('responsavel')||'').trim(),endereco:String(f.get('endereco')||'').trim(),finalidade:String(f.get('finalidade')||'').trim(),image:String(f.get('image')||'').trim()||'🏭',observacoes:String(f.get('observacoes')||'').trim()});
    save();renderFornecedores();toast(id?'Fornecedor atualizado':'Fornecedor cadastrado')
  }

  function editSupplier(id){const s=supplierById(id);if(s)supplierForm(s)}
  function deleteSupplier(id){const s=supplierById(id);if(!s)return;const n=linkedCount(s);const msg=n?`O fornecedor "${supplierName(s)}" está vinculado a ${n} material(is). Excluir apenas o cadastro do fornecedor e preservar os materiais?`:`Excluir o fornecedor "${supplierName(s)}"?`;if(!confirm(msg))return;db.suppliers=db.suppliers.filter(x=>String(x.id)!==String(id));save();renderFornecedores();toast('Fornecedor excluído; materiais preservados')}

  function supplierOptions(current=''){
    const list=suppliers().slice().sort((a,b)=>supplierName(a).localeCompare(supplierName(b),'pt-BR'));
    return `<option value="">Sem fornecedor</option>`+list.map(s=>`<option value="${esc(supplierName(s))}" ${supplierName(s)===String(current)?'selected':''}>${esc(supplierName(s))}</option>`).join('')
  }

  const originalRenderCadastro=window.renderCadastro;
  window.renderCadastro=function(){
    if(!document.getElementById('cadastro')) return;
    const old=window.__materialCadastroOriginal;
    if(typeof originalRenderCadastro==='function') originalRenderCadastro();
    const form=document.getElementById('materialForm');if(!form)return;
    const supplierInput=form.querySelector('[name="supplier"]');
    if(supplierInput){const wrap=supplierInput.closest('.field');if(wrap){wrap.innerHTML='<label>Fornecedor</label><select name="supplier">'+supplierOptions(supplierInput.value)+'</select>'}}
  }

  const originalRenderCompras=window.renderCompras;
  window.renderCompras=function(){
    const arr=db.materials.filter(m=>buy(m)>0);
    compras.innerHTML=`<div class="section-title"><h2>Reposição</h2><span class="muted">Ideal − estoque atual</span></div><div class="card"><div class="list">${arr.map(m=>{const s=String(m.supplier||'').trim();return `<div class="item"><div class="item-img">${esc(m.image)||'📦'}</div><div class="item-info"><small>${esc(m.code)} · ${esc(m.area)}</small><strong>${esc(m.name)}</strong><small>Atual: ${m.stock} · Ideal: ${m.ideal} · Fornecedor: ${esc(s||'Não definido')}</small></div><span class="stock ${status(m)}">Comprar ${buy(m)}</span></div>`}).join('')||'<div class="empty">Nenhum material precisa de reposição.</div>'}</div></div>`
  }

  addSupplierNav();
  document.addEventListener('click',e=>{
    if(e.target.closest('#newSupplier')){supplierForm();return}
    if(e.target.closest('#cancelSupplier')){renderFornecedores();return}
    const ed=e.target.closest('.supplier-edit');if(ed){editSupplier(ed.dataset.id);return}
    const del=e.target.closest('.supplier-delete');if(del){deleteSupplier(del.dataset.id);return}
  });
  document.addEventListener('input',e=>{if(e.target.id==='supplierSearch')renderFornecedores()});
  document.addEventListener('submit',e=>{if(e.target.id==='supplierForm')saveSupplier(e)});
  const oldGo=window.go;
  window.go=function(id){if(id==='fornecedores'){renderFornecedores()}return oldGo(id)};
  renderFornecedores();
  if(typeof renderAll==='function') renderAll();
  if(typeof go==='function') go('inicio');
})();