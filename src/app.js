let web3;
let votingContract;
let contractAddress = "ENDEREÇO_DO_CONTRATO"; // Atualize com o endereço do contrato implantado
let contractAbi = [
  /* Cole aqui o ABI do contrato */
];

window.addEventListener("load", async () => {
  if (typeof window.ethereum !== "undefined") {
    web3 = new Web3(window.ethereum);
    await ethereum.request({ method: "eth_requestAccounts" });
    initContract();
  } else {
    alert("Por favor, instale o Metamask para usar esta DApp.");
  }
});

function initContract() {
  votingContract = new web3.eth.Contract(contractAbi, contractAddress);
  displayCandidates();
}

async function displayCandidates() {
  const numCandidates = await votingContract.methods.getNumCandidates().call();
  const candidateList = document.getElementById("candidate-list");
  candidateList.innerHTML = "";

  for (let i = 0; i < numCandidates; i++) {
    const candidate = await votingContract.methods.candidates(i).call();
    candidateList.innerHTML += `<p>ID: ${candidate.id} | Nome: ${candidate.name} | Votos: ${candidate.voteCount}</p>`;
  }
}

async function vote() {
  const candidateId = document.getElementById("candidate-id").value;
  const accounts = await web3.eth.getAccounts();

  try {
    await votingContract.methods.vote(candidateId).send({ from: accounts[0] });
    alert("Voto computado com sucesso!");
    displayCandidates();
  } catch (error) {
    alert(`Erro ao votar: ${error.message}`);
  }
}
