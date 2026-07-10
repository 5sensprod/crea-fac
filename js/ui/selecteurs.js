// Rôle : initialise les listes déroulantes clients et produits.
function populateSelect(select, items, getLabel) {
  select.innerHTML = "";

  items.forEach((item) => {
    const option = document.createElement("option");

    option.value = item.id;
    option.textContent = getLabel(item);

    select.appendChild(option);
  });
}

export function initSelecteurs({
  clients,
  produits,
  onClientSelect,
  onProduitAdd,
}) {
  const clientSelect = document.getElementById("clientSelect");
  const produitSelect = document.getElementById("produitSelect");
  const produitDescriptionInput = document.getElementById(
    "produitDescriptionInput",
  );

  const applyClientBtn = document.getElementById("applyClientBtn");
  const addProductBtn = document.getElementById("addProductBtn");

  populateSelect(
    clientSelect,
    clients,
    (client) => `${client.code} — ${client.nom}`,
  );

  populateSelect(
    produitSelect,
    produits,
    (produit) => `${produit.code} — ${produit.description}`,
  );

  function ajouterProduitSelectionne() {
    const descriptionComplementaire =
      produitDescriptionInput?.value.trim() || "";

    onProduitAdd(produitSelect.value, descriptionComplementaire);

    if (produitDescriptionInput) {
      produitDescriptionInput.value = "";
      produitDescriptionInput.focus();
    }
  }

  applyClientBtn.addEventListener("click", () => {
    const client = clients.find((item) => item.id === clientSelect.value);

    onClientSelect(client);
  });

  addProductBtn.addEventListener("click", ajouterProduitSelectionne);

  produitDescriptionInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    ajouterProduitSelectionne();
  });

  if (clients.length) {
    onClientSelect(clients[0]);
  }
}
