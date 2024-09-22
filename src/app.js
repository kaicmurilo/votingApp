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

    console.log("networkData", networkId);

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
        gasPrice: gasPrice.toString(), // Certifique-se de que está como string
        gas: gasEstimate.toString(), // Certifique-se de que está como string
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

  if (candidateId === "" || isNaN(candidateId)) {
    showErrorModal("Por favor, insira um ID de candidato válido.");
    return;
  }

  try {
    const statusMessage = document.getElementById("status-message");

    const gasPrice = await web3.eth.getGasPrice();

    if (!gasPrice || isNaN(Number(gasPrice))) {
      showErrorModal("Erro ao obter o preço do gás.");
      return;
    }

    let gasEstimate;
    // try {
    //   console.log("Candidato válido:", candidateId);

    //   const balance = await web3.eth.getBalance(currentAccount);
    //   console.log("Saldo da conta:", balance);
    //   if (balance === "0") {
    //     showErrorModal("Saldo insuficiente.");
    //     return;
    //   }

    //   gasEstimate = await votingContract.methods.vote(candidateId).estimateGas({
    //     from: currentAccount,
    //   });
    // } catch (error) {
    //   console.error("Erro ao estimar o gás:", error);
    //   showErrorModal("Erro ao estimar o gás. Detalhes no console.");
    //   return;
    // }

    // if (!gasEstimate || isNaN(Number(gasEstimate))) {
    //   showErrorModal("Erro ao estimar o gás.");
    //   return;
    // }

    const adjustedGasLimit = Math.floor(gasEstimate * 1.2); // Aumentar em 20%

    // Informar ao usuário que a transação está sendo enviada
    statusMessage.innerText = "Aguardando confirmação no MetaMask...";

    console.log("Candidato selecionado:", candidateId);

    votingContract.methods
      .vote(candidateId)
      .send({
        from: currentAccount,
        gasPrice: "2000000000", // Certifique-se de que está como string
        gas: "500000", // Certifique-se de que está como string
      })
      .on("transactionHash", function (hash) {
        statusMessage.innerText =
          "Transação enviada. Aguardando confirmação...";
      })
      .on("receipt", function (receipt) {
        statusMessage.innerText = "Voto computado com sucesso!";
        displayCandidates();
      })
      .on("error", function (error) {
        console.error("Erro ao votar:", error);
        statusMessage.innerText = "";
        // Captura a mensagem de erro revertida pelo contrato
        if (error && error.message.includes("revert")) {
          // A razão de "Você já votou" deve estar na mensagem de erro
          showErrorModal(`Erro ao votar: ${parseRevertReason(error.message)}`);
        } else if (error && error.message) {
          showErrorModal(`Erro ao votar: ${error.message}`);
        } else {
          showErrorModal(
            "Erro ao votar. Verifique o console para mais detalhes."
          );
        }
      });
  } catch (error) {
    showErrorModal(`Erro ao votar: ${error}`);
    console.log("Erro ao votar:", error.message);
  }
}

function parseRevertReason(errorMessage) {
  const revertMessage = errorMessage.match(/revert (.*)/);
  return revertMessage ? revertMessage[1] : "Erro desconhecido";
}
