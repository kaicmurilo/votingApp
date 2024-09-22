let web3;
let votingContract;
let currentAccount;
let ownerAddress;

window.addEventListener("load", async () => {
  if (typeof window.ethereum !== "undefined") {
    web3 = new Web3(window.ethereum);
    await ethereum.request({ method: "eth_requestAccounts" });
    await initContract();
  } else {
    showErrorModal("Por favor, instale o Metamask para usar esta DApp.");
  }
});

async function initContract() {
  try {
    // Carrega o arquivo Voting.json
    const response = await fetch("contracts/Voting.json");
    const contractData = await response.json();

    // Obtém o ABI e o endereço do contrato
    const contractAbi = contractData.abi;
    const networkId = await web3.eth.net.getId();
    const networkData = contractData.networks[networkId];

    if (networkData) {
      const contractAddress = networkData.address;

      votingContract = new web3.eth.Contract(contractAbi, contractAddress);

      const accounts = await web3.eth.getAccounts();
      currentAccount = accounts[0];

      ownerAddress = await votingContract.methods.owner().call();

      // Verifica se o elemento de adicionar candidatos existe
      const addCandidateSection = document.getElementById(
        "add-candidate-section"
      );

      if (addCandidateSection) {
        if (currentAccount.toLowerCase() === ownerAddress.toLowerCase()) {
          addCandidateSection.style.display = "block";
        } else {
          addCandidateSection.style.display = "none";
        }
      } else {
        showErrorModal("Elemento de adicionar candidatos não encontrado.");
      }

      displayCandidates();
    } else {
      showErrorModal("O contrato não está implantado na rede atual.");
    }
  } catch (error) {
    showErrorModal(`Erro ao inicializar o contrato: ${error}`);
  }
}

async function displayCandidates() {
  const numCandidates = await votingContract.methods.getNumCandidates().call();
  const candidateList = document.getElementById("candidate-list");
  candidateList.innerHTML = "<h2>Lista de Candidatos</h2>";

  for (let i = 0; i < numCandidates; i++) {
    const candidate = await votingContract.methods.candidates(i).call();
    candidateList.innerHTML += `<p>ID: ${candidate.id} | Nome: ${candidate.name} | Votos: ${candidate.voteCount}</p>`;
  }
}

async function addCandidate() {
  if (currentAccount.toLowerCase() !== ownerAddress.toLowerCase()) {
    showErrorModal(
      "Apenas o proprietário do contrato pode adicionar candidatos."
    );
    return;
  }

  const candidateName = document.getElementById("candidate-name").value;

  if (!candidateName) {
    showErrorModal("Por favor, insira o nome do candidato.");
    return;
  }

  try {
    const statusMessage = document.getElementById("status-message");

    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await votingContract.methods
      .addCandidate(candidateName)
      .estimateGas({ from: currentAccount });

    // Informar ao usuário que a transação está sendo enviada
    statusMessage.innerText = "Aguardando confirmação no MetaMask...";

    // Enviar a transação e utilizar os eventos para atualizar o status
    votingContract.methods
      .addCandidate(candidateName)
      .send({
        from: currentAccount,
        gasPrice: gasPrice,
        gas: gasEstimate,
        type: "0x0",
      })
      .on("transactionHash", function (hash) {
        statusMessage.innerText =
          "Transação enviada. Aguardando confirmação...";
      })
      .on("receipt", function (receipt) {
        statusMessage.innerText = "";
        showErrorModal(`Candidato "${candidateName}" adicionado com sucesso!`);
        displayCandidates();
        document.getElementById("candidate-name").value = "";
      })
      .on("error", function (error) {
        console.error("Detalhes do erro:", error);
        statusMessage.innerText = "";
        showErrorModal(`Erro ao adicionar candidato: ${error.message}`);
      });
  } catch (error) {
    showErrorModal(`Erro ao adicionar candidato: ${error}`);
  }
}
async function vote() {
  const candidateId = document.getElementById("candidate-id").value;

  if (candidateId === "") {
    showErrorModal("Por favor, insira o ID do candidato.");
    return;
  }

  try {
    const statusMessage = document.getElementById("status-message");
    const gasPrice = await web3.eth.getGasPrice();

    // Tentar estimar o gás e capturar erros
    let gasEstimate;
    try {
      gasEstimate = await votingContract.methods
        .vote(candidateId)
        .estimateGas({ from: currentAccount });
    } catch (error) {
      console.error("Erro ao estimar o gás:", error);

      // Verificar se há informações detalhadas no objeto de erro
      if (error && error.data) {
        const errorData = error.data;
        const errorMessage = errorData.message || JSON.stringify(errorData);
        showErrorModal(`Erro ao estimar o gás: ${errorMessage}`);
      } else if (error && error.message) {
        showErrorModal(`Erro ao estimar o gás: ${error.message}`);
      } else {
        showErrorModal(
          "Erro ao estimar o gás. Verifique o console para mais detalhes."
        );
      }
      return;
    }

    // Informar ao usuário que a transação está sendo enviada
    statusMessage.innerText = "Aguardando confirmação no MetaMask...";

    // Enviar a transação
    votingContract.methods
      .vote(candidateId)
      .send({
        from: currentAccount,
        gasPrice: gasPrice,
        gas: gasEstimate,
        type: "0x0",
      })
      .on("transactionHash", function (hash) {
        console.log("Transaction hash:", hash);
        statusMessage.innerText =
          "Transação enviada. Aguardando confirmação...";
      })
      .on("receipt", function (receipt) {
        console.log("Voto computado com sucesso:", receipt);
        statusMessage.innerText = "";
        showErrorModal("Voto computado com sucesso!");
        displayCandidates();
      })
      .on("error", function (error) {
        console.error("Erro ao votar:", error);
        statusMessage.innerText = "";
        if (error && error.message) {
          showErrorModal(`Erro ao votar: ${error.message}`);
        } else {
          showErrorModal(
            "Erro ao votar. Verifique o console para mais detalhes."
          );
        }
      });
  } catch (error) {
    showErrorModal(`Erro ao votar: ${error}`);
  }
}
