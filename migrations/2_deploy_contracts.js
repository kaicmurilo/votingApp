const Voting = artifacts.require("Voting");

module.exports = function (deployer) {
  // Defina a duração da eleição em segundos (por exemplo, 1 dia = 86400 segundos)
  const electionDuration = 86400; // 1 dia

  deployer.deploy(Voting, "Eleição Estudantil", electionDuration);
};
