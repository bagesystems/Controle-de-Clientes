import { useState, useEffect } from "react";

const initialClients = [
  { id: 1, name: "Agência Nova Era", platform: "Instagram Ads", plan: "Pro", dueDate: "2026-05-10", paid: false, accessActive: false, email: "contato@novaera.com", value: 297 },
  { id: 2, name: "Loja Bella Moda", platform: "Google Ads", plan: "Starter", dueDate: "2026-05-18", paid: true, accessActive: true, email: "bella@modafashion.com", value: 149 },
  { id: 3, name: "Clínica Viva Bem", platform: "Meta Business", plan: "Pro", dueDate: "2026-05-20", paid: true, accessActive: true, email: "admin@vivabem.com.br", value: 297 },
  { id: 4, name: "Auto Peças Rápido", platform: "Google Ads", plan: "Enterprise", dueDate: "2026-05-05", paid: false, accessActive: false, email: "financeiro@rapido.com", value: 597 },
  { id: 5, name: "Studio Fit", platform: "Instagram Ads", plan: "Starter", dueDate: "2026-05-25", paid: true, accessActive: true, email: "studio@fit.com.br", value: 149 },
  { id: 6, name: "Construtora Apex", platform: "Meta Business", plan: "Enterprise", dueDate: "2026-05-12", paid: false, accessActive: false, email: "apex@construtora.com", value: 597 },
];

const platforms = ["Todos", "Instagram Ads", "Google Ads", "Meta Business"];
const statusFilters = ["Todos", "Ativo", "Bloqueado", "Em atraso"];

const planColors = {
  Starter: "#6ee7b7",
  Pro: "#818cf8",
  Enterprise: "#fb923c",
};

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function isOverdue(dueDate, paid) {
  if (paid) return false;
  return new Date(dueDate) < new Date();
}

export default function App() {
  const [clients, setClients] = useState(initialClients);
  const [filter, setFilter] = useState("Todos");
  const [platformFilter, setPlatformFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", platform: "Instagram Ads", plan: "Starter", dueDate: "", email: "", value: "" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleAccess = (id) => {
    setClients(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (!c.paid && !c.accessActive) {
        showToast(`Pagamento pendente para "${c.name}". Confirme o pagamento primeiro.`, "error");
        return c;
      }
      const next = { ...c, accessActive: !c.accessActive };
      showToast(next.accessActive ? `Acesso liberado para ${c.name}` : `Acesso bloqueado para ${c.name}`, next.accessActive ? "success" : "warn");
      return next;
    }));
  };

  const confirmPayment = (id) => {
    setClients(prev => prev.map(c => {
      if (c.id !== id) return c;
      return { ...c, paid: true, accessActive: true };
    }));
    showToast("Pagamento confirmado! Acesso liberado automaticamente.", "success");
    setModal(null);
  };

  const revokePayment = (id) => {
    setClients(prev => prev.map(c => {
      if (c.id !== id) return c;
      return { ...c, paid: false, accessActive: false };
    }));
    showToast("Pagamento revertido. Acesso bloqueado.", "warn");
    setModal(null);
  };

  const addClient = () => {
    if (!newClient.name || !newClient.dueDate || !newClient.email) {
      showToast("Preencha todos os campos obrigatórios.", "error");
      return;
    }
    const id = Date.now();
    setClients(prev => [...prev, { ...newClient, id, paid: false, accessActive: false, value: Number(newClient.value) || 0 }]);
    setNewClient({ name: "", platform: "Instagram Ads", plan: "Starter", dueDate: "", email: "", value: "" });
    setAddModal(false);
    showToast("Cliente cadastrado com sucesso!", "success");
  };

  const removeClient = (id) => {
    setClients(prev => prev.filter(c => c.id !== id));
    setModal(null);
    showToast("Cliente removido.", "warn");
  };

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = platformFilter === "Todos" || c.platform === platformFilter;
    const overdue = isOverdue(c.dueDate, c.paid);
    const matchStatus =
      filter === "Todos" ? true :
      filter === "Ativo" ? c.accessActive :
      filter === "Bloqueado" ? !c.accessActive :
      filter === "Em atraso" ? overdue : true;
    return matchSearch && matchPlatform && matchStatus;
  });

  const totalActive = clients.filter(c => c.accessActive).length;
  const totalBlocked = clients.filter(c => !c.accessActive).length;
  const totalRevenue = clients.filter(c => c.paid).reduce((s, c) => s + c.value, 0);
  const totalOverdue = clients.filter(c => isOverdue(c.dueDate, c.paid)).length;

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <div style={styles.logo}>
              <span style={styles.logoIcon}>⬡</span>
              <span style={styles.logoText}>AccessFlow</span>
            </div>
            <p style={styles.logoSub}>Gestão de Acesso para Plataformas Digitais</p>
          </div>
          <button style={styles.addBtn} onClick={() => setAddModal(true)}>+ Novo Cliente</button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Stats */}
        <div style={styles.stats}>
          {[
            { label: "Acessos Ativos", value: totalActive, color: "#6ee7b7", icon: "✓" },
            { label: "Bloqueados", value: totalBlocked, color: "#f87171", icon: "✕" },
            { label: "Em Atraso", value: totalOverdue, color: "#fb923c", icon: "!" },
            { label: "Receita Confirmada", value: `R$ ${totalRevenue.toLocaleString("pt-BR")}`, color: "#818cf8", icon: "$" },
          ].map(s => (
            <div key={s.label} style={{ ...styles.statCard, borderTop: `3px solid ${s.color}` }}>
              <span style={{ ...styles.statIcon, color: s.color }}>{s.icon}</span>
              <div>
                <div style={styles.statValue}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={styles.filtersRow}>
          <input
            style={styles.search}
            placeholder="Buscar cliente ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={styles.filterGroup}>
            {statusFilters.map(f => (
              <button key={f} style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <select style={styles.select} value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
            {platforms.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Cliente</th>
                <th style={styles.th}>Plataforma</th>
                <th style={styles.th}>Plano</th>
                <th style={styles.th}>Vencimento</th>
                <th style={styles.th}>Pagamento</th>
                <th style={styles.th}>Acesso</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={styles.empty}>Nenhum cliente encontrado.</td></tr>
              )}
              {filtered.map(c => {
                const overdue = isOverdue(c.dueDate, c.paid);
                return (
                  <tr key={c.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.clientName}>{c.name}</div>
                      <div style={styles.clientEmail}>{c.email}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.platform}>{c.platform}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.planBadge, background: planColors[c.plan] + "22", color: planColors[c.plan], border: `1px solid ${planColors[c.plan]}44` }}>
                        {c.plan}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: overdue ? "#f87171" : "#94a3b8", fontWeight: overdue ? 700 : 400 }}>
                        {formatDate(c.dueDate)}
                        {overdue && <span style={styles.overdueTag}> VENCIDO</span>}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, background: c.paid ? "#6ee7b722" : "#f8717122", color: c.paid ? "#6ee7b7" : "#f87171", border: `1px solid ${c.paid ? "#6ee7b744" : "#f8717144"}` }}>
                        {c.paid ? "✓ Pago" : "✕ Pendente"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={{ ...styles.toggleBtn, background: c.accessActive ? "#6ee7b7" : "#334155", color: c.accessActive ? "#0f172a" : "#94a3b8" }}
                        onClick={() => toggleAccess(c.id)}
                        title={c.accessActive ? "Bloquear acesso" : "Liberar acesso"}
                      >
                        {c.accessActive ? "● Ativo" : "○ Bloqueado"}
                      </button>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        {!c.paid
                          ? <button style={styles.actionBtn} onClick={() => setModal({ type: "confirm", client: c })}>Confirmar Pgto</button>
                          : <button style={{ ...styles.actionBtn, ...styles.actionBtnGray }} onClick={() => setModal({ type: "revoke", client: c })}>Reverter</button>
                        }
                        <button style={{ ...styles.actionBtn, ...styles.actionBtnDanger }} onClick={() => setModal({ type: "remove", client: c })}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {modal && (
        <div style={styles.overlay} onClick={() => setModal(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            {modal.type === "confirm" && <>
              <div style={styles.modalTitle}>Confirmar Pagamento</div>
              <p style={styles.modalText}>Confirmar pagamento de <strong style={{ color: "#6ee7b7" }}>{modal.client.name}</strong>?<br />O acesso será liberado automaticamente.</p>
              <div style={styles.modalValue}>R$ {modal.client.value.toLocaleString("pt-BR")}</div>
              <div style={styles.modalBtns}>
                <button style={styles.modalCancel} onClick={() => setModal(null)}>Cancelar</button>
                <button style={styles.modalConfirm} onClick={() => confirmPayment(modal.client.id)}>Confirmar</button>
              </div>
            </>}
            {modal.type === "revoke" && <>
              <div style={styles.modalTitle}>Reverter Pagamento</div>
              <p style={styles.modalText}>Deseja marcar <strong style={{ color: "#fb923c" }}>{modal.client.name}</strong> como pagamento pendente?<br />O acesso será bloqueado.</p>
              <div style={styles.modalBtns}>
                <button style={styles.modalCancel} onClick={() => setModal(null)}>Cancelar</button>
                <button style={{ ...styles.modalConfirm, background: "#fb923c" }} onClick={() => revokePayment(modal.client.id)}>Reverter</button>
              </div>
            </>}
            {modal.type === "remove" && <>
              <div style={styles.modalTitle}>Remover Cliente</div>
              <p style={styles.modalText}>Tem certeza que deseja remover <strong style={{ color: "#f87171" }}>{modal.client.name}</strong>? Esta ação não pode ser desfeita.</p>
              <div style={styles.modalBtns}>
                <button style={styles.modalCancel} onClick={() => setModal(null)}>Cancelar</button>
                <button style={{ ...styles.modalConfirm, background: "#f87171" }} onClick={() => removeClient(modal.client.id)}>Remover</button>
              </div>
            </>}
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {addModal && (
        <div style={styles.overlay} onClick={() => setAddModal(false)}>
          <div style={{ ...styles.modal, width: 420 }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>Novo Cliente</div>
            <div style={styles.formGrid}>
              {[
                { label: "Nome *", key: "name", type: "text", placeholder: "Nome do cliente" },
                { label: "E-mail *", key: "email", type: "email", placeholder: "email@cliente.com" },
                { label: "Vencimento *", key: "dueDate", type: "date" },
                { label: "Valor (R$)", key: "value", type: "number", placeholder: "0" },
              ].map(f => (
                <div key={f.key} style={styles.formField}>
                  <label style={styles.formLabel}>{f.label}</label>
                  <input
                    style={styles.formInput}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={newClient[f.key]}
                    onChange={e => setNewClient(p => ({ ...p, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
              <div style={styles.formField}>
                <label style={styles.formLabel}>Plataforma</label>
                <select style={styles.formInput} value={newClient.platform} onChange={e => setNewClient(p => ({ ...p, platform: e.target.value }))}>
                  {["Instagram Ads", "Google Ads", "Meta Business"].map(x => <option key={x}>{x}</option>)}
                </select>
              </div>
              <div style={styles.formField}>
                <label style={styles.formLabel}>Plano</label>
                <select style={styles.formInput} value={newClient.plan} onChange={e => setNewClient(p => ({ ...p, plan: e.target.value }))}>
                  {["Starter", "Pro", "Enterprise"].map(x => <option key={x}>{x}</option>)}
                </select>
              </div>
            </div>
            <div style={styles.modalBtns}>
              <button style={styles.modalCancel} onClick={() => setAddModal(false)}>Cancelar</button>
              <button style={styles.modalConfirm} onClick={addClient}>Cadastrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ ...styles.toast, background: toast.type === "success" ? "#6ee7b7" : toast.type === "error" ? "#f87171" : "#fb923c", color: "#0f172a" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#0f172a", fontFamily: "'DM Mono', 'Fira Code', monospace", color: "#e2e8f0" },
  header: { borderBottom: "1px solid #1e293b", background: "#0f172a", position: "sticky", top: 0, zIndex: 50 },
  headerInner: { maxWidth: 1200, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { fontSize: 24, color: "#6ee7b7" },
  logoText: { fontSize: 22, fontWeight: 700, letterSpacing: "0.08em", color: "#f1f5f9" },
  logoSub: { fontSize: 12, color: "#475569", marginTop: 2, letterSpacing: "0.05em" },
  addBtn: { background: "#6ee7b7", color: "#0f172a", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: "0.04em", fontFamily: "inherit" },
  main: { maxWidth: 1200, margin: "0 auto", padding: "32px 24px" },
  stats: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 },
  statCard: { background: "#1e293b", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 },
  statIcon: { fontSize: 28, fontWeight: 900 },
  statValue: { fontSize: 26, fontWeight: 700, color: "#f1f5f9" },
  statLabel: { fontSize: 12, color: "#64748b", marginTop: 2, letterSpacing: "0.05em" },
  filtersRow: { display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" },
  search: { flex: 1, minWidth: 200, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none" },
  filterGroup: { display: "flex", gap: 6 },
  filterBtn: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "8px 14px", color: "#64748b", fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" },
  filterBtnActive: { background: "#6ee7b722", border: "1px solid #6ee7b7", color: "#6ee7b7" },
  select: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "8px 14px", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", cursor: "pointer", outline: "none" },
  tableWrap: { background: "#1e293b", borderRadius: 16, overflow: "hidden", border: "1px solid #1e293b" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#0f172a" },
  th: { padding: "14px 16px", textAlign: "left", fontSize: 11, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 },
  tr: { borderBottom: "1px solid #0f172a" },
  td: { padding: "14px 16px", fontSize: 14, verticalAlign: "middle" },
  clientName: { fontWeight: 600, color: "#f1f5f9", marginBottom: 2 },
  clientEmail: { fontSize: 12, color: "#64748b" },
  platform: { fontSize: 12, color: "#94a3b8" },
  planBadge: { borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 },
  overdueTag: { fontSize: 10, letterSpacing: "0.06em", fontWeight: 700 },
  statusBadge: { borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 600 },
  toggleBtn: { borderRadius: 999, padding: "5px 14px", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" },
  actions: { display: "flex", gap: 8 },
  actionBtn: { background: "#6ee7b722", border: "1px solid #6ee7b744", color: "#6ee7b7", borderRadius: 7, padding: "5px 11px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },
  actionBtnGray: { background: "#33415511", border: "1px solid #33415588", color: "#94a3b8" },
  actionBtnDanger: { background: "#f8717122", border: "1px solid #f8717144", color: "#f87171" },
  empty: { textAlign: "center", color: "#475569", padding: "40px 0" },
  overlay: { position: "fixed", inset: 0, background: "#0008", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "#1e293b", borderRadius: 16, padding: 32, minWidth: 340, border: "1px solid #334155" },
  modalTitle: { fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 },
  modalText: { color: "#94a3b8", fontSize: 14, lineHeight: 1.6, marginBottom: 16 },
  modalValue: { fontSize: 32, fontWeight: 800, color: "#6ee7b7", marginBottom: 24 },
  modalBtns: { display: "flex", gap: 12, justifyContent: "flex-end" },
  modalCancel: { background: "#0f172a", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "9px 20px", cursor: "pointer", fontFamily: "inherit", fontSize: 14 },
  modalConfirm: { background: "#6ee7b7", border: "none", color: "#0f172a", borderRadius: 8, padding: "9px 20px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: 14 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 },
  formField: { display: "flex", flexDirection: "column", gap: 5 },
  formLabel: { fontSize: 11, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase" },
  formInput: { background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none" },
  toast: { position: "fixed", bottom: 28, right: 28, borderRadius: 10, padding: "13px 22px", fontSize: 14, fontWeight: 700, zIndex: 200, boxShadow: "0 4px 24px #0006", animation: "fadeIn .2s" },
};